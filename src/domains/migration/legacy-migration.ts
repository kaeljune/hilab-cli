import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { ManifestWriter } from "@/services/file-operations/manifest-writer.js";
import { OwnershipChecker } from "@/services/file-operations/ownership-checker.js";
import { mapWithLimit } from "@/shared/concurrent-file-ops.js";
import { getOptimalConcurrency } from "@/shared/environment.js";
import { logger } from "@/shared/logger.js";
import { createSpinner } from "@/shared/safe-spinner.js";
import { SKIP_DIRS_ALL, hasSkippedDirectorySegment } from "@/shared/skip-directories.js";
import type { Metadata, TrackedFile } from "@/types";
import { writeFile } from "fs-extra";
import { type ReleaseManifest, ReleaseManifestLoader } from "./release-manifest.js";

// Per-file checksum timeout (ms). Guards against hangs on FIFOs, network
// mounts, or other special files that block on read. SHA-256 of a 100 MB
// file on a normal SSD is < 1 s, so 30 s is generous.
const CHECKSUM_TIMEOUT_MS = 30_000;

/**
 * Calculate SHA-256 with a per-file timeout. Returns null if the file errors
 * or exceeds the timeout — caller can decide to skip vs fail. We log at
 * debug level so a single bad file doesn't pollute the install output.
 */
async function safeChecksum(filePath: string, relativePath: string): Promise<string | null> {
	try {
		return await Promise.race([
			OwnershipChecker.calculateChecksum(filePath),
			new Promise<string>((_, reject) =>
				setTimeout(
					() => reject(new Error(`checksum timeout after ${CHECKSUM_TIMEOUT_MS}ms`)),
					CHECKSUM_TIMEOUT_MS,
				),
			),
		]);
	} catch (err) {
		logger.debug(`Skipping ${relativePath}: ${(err as Error).message}`);
		return null;
	}
}

export interface LegacyDetectionResult {
	isLegacy: boolean;
	reason: "no-metadata" | "old-format" | "current";
	confidence: "high" | "medium" | "low";
}

export interface MigrationPreview {
	ckPristine: string[]; // CK files unmodified
	ckModified: string[]; // CK files user edited
	userCreated: string[]; // User's custom files
	totalFiles: number;
}

/**
 * LegacyMigration - Migrate legacy installs to ownership tracking system
 */
export class LegacyMigration {
	/**
	 * Detect if installation is legacy (needs migration)
	 */
	static async detectLegacy(claudeDir: string): Promise<LegacyDetectionResult> {
		const metadata = await ManifestWriter.readManifest(claudeDir);

		if (!metadata) {
			return { isLegacy: true, reason: "no-metadata", confidence: "high" };
		}

		if (!metadata.files || metadata.files.length === 0) {
			return { isLegacy: true, reason: "old-format", confidence: "high" };
		}

		return { isLegacy: false, reason: "current", confidence: "high" };
	}

	/**
	 * Scan directory recursively and collect all files
	 * @param dir Directory to scan
	 * @returns Array of absolute file paths
	 */
	static async scanFiles(dir: string): Promise<string[]> {
		const files: string[] = [];

		let entries: string[];
		try {
			entries = await readdir(dir);
		} catch (err) {
			const error = err as NodeJS.ErrnoException;
			if (error.code === "ENOENT") {
				logger.debug(`Directory does not exist: ${dir}`);
			} else if (error.code === "EACCES") {
				logger.debug(`Permission denied reading directory: ${dir}`);
			} else {
				logger.debug(`Failed to read directory "${dir}": ${error.message}`);
			}
			return files;
		}

		for (const entry of entries) {
			// Skip metadata.json itself
			if (entry === "metadata.json") continue;
			// Skip build artifacts, venvs, and Claude Code internal dirs
			if (SKIP_DIRS_ALL.includes(entry)) continue;

			const fullPath = join(dir, entry);
			let stats;
			try {
				stats = await stat(fullPath);
			} catch (err) {
				const error = err as NodeJS.ErrnoException;
				if (error.code === "ENOENT") {
					logger.debug(`File removed during scan: ${fullPath}`);
				} else if (error.code === "EACCES") {
					logger.debug(`Permission denied accessing: ${fullPath}`);
				} else {
					logger.debug(`Failed to stat "${fullPath}": ${error.message}`);
				}
				continue;
			}

			if (stats.isDirectory()) {
				files.push(...(await LegacyMigration.scanFiles(fullPath)));
			} else if (stats.isFile()) {
				files.push(fullPath);
			}
		}

		return files;
	}

	/**
	 * Classify files based on release manifest
	 * Uses parallel checksum calculation for better performance with large file sets
	 */
	static async classifyFiles(
		claudeDir: string,
		manifest: ReleaseManifest,
	): Promise<MigrationPreview> {
		const files = await LegacyMigration.scanFiles(claudeDir);
		const relevantFiles = files.filter((file) => {
			const relativePath = relative(claudeDir, file);
			return !hasSkippedDirectorySegment(relativePath);
		});
		const skippedRuntimeArtifacts = files.length - relevantFiles.length;

		if (skippedRuntimeArtifacts > 0) {
			logger.debug(
				`Legacy migration ignored ${skippedRuntimeArtifacts} runtime artifact file(s) after scan`,
			);
		}

		const preview: MigrationPreview = {
			ckPristine: [],
			ckModified: [],
			userCreated: [],
			totalFiles: relevantFiles.length,
		};

		// Separate files by whether they're in manifest (need checksum) or not
		const filesInManifest: Array<{
			file: string;
			relativePath: string;
			manifestChecksum: string;
		}> = [];

		for (const file of relevantFiles) {
			const relativePath = relative(claudeDir, file).replace(/\\/g, "/");
			const manifestEntry = ReleaseManifestLoader.findFile(manifest, relativePath);

			if (!manifestEntry) {
				// Not in manifest → user created (no checksum needed)
				preview.userCreated.push(relativePath);
			} else {
				filesInManifest.push({
					file,
					relativePath,
					manifestChecksum: manifestEntry.checksum,
				});
			}
		}

		// Batch calculate checksums with concurrency limit to avoid EMFILE.
		// Use safeChecksum so a single bad file (FIFO, broken symlink, network
		// mount) cannot stall the entire migration.
		if (filesInManifest.length > 0) {
			const total = filesInManifest.length;
			const spinner = createSpinner(`Classifying ${total} files...`).start();
			let completed = 0;

			const checksumResults = await mapWithLimit(
				filesInManifest,
				async ({ file, relativePath, manifestChecksum }) => {
					const actualChecksum = await safeChecksum(file, relativePath);
					completed++;
					if (completed % 100 === 0 || completed === total) {
						spinner.text = `Classifying files... ${completed}/${total}`;
					}
					return { relativePath, actualChecksum, manifestChecksum };
				},
				getOptimalConcurrency(),
			);

			spinner.succeed(`Classified ${total} files`);

			// Classify based on checksum comparison. Files that failed checksum
			// are treated as modified (safer default — they'll be tracked but
			// flagged as user-touched).
			for (const { relativePath, actualChecksum, manifestChecksum } of checksumResults) {
				if (actualChecksum && actualChecksum === manifestChecksum) {
					preview.ckPristine.push(relativePath);
				} else {
					preview.ckModified.push(relativePath);
				}
			}
		}

		return preview;
	}

	/**
	 * Perform migration
	 * @param claudeDir Path to .claude directory
	 * @param manifest Release manifest from kit
	 * @param kitName Name of kit being installed
	 * @param kitVersion Version of kit
	 * @param interactive Whether to prompt user (false in CI)
	 * @returns true if migration successful
	 */
	static async migrate(
		claudeDir: string,
		manifest: ReleaseManifest,
		kitName: string,
		kitVersion: string,
		_interactive = true,
	): Promise<boolean> {
		logger.info("Migrating legacy installation to ownership tracking...");

		// Classify files
		const preview = await LegacyMigration.classifyFiles(claudeDir, manifest);

		// Show preview
		logger.info("Migration preview:");
		logger.info(`  CK files (pristine): ${preview.ckPristine.length}`);
		logger.info(`  CK files (modified): ${preview.ckModified.length}`);
		logger.info(`  User files: ${preview.userCreated.length}`);
		logger.info(`  Total: ${preview.totalFiles}`);

		// Sample files
		if (preview.ckModified.length > 0) {
			logger.info("\nModified CK files (sample):");
			preview.ckModified.slice(0, 3).forEach((f) => logger.info(`  - ${f}`));
			if (preview.ckModified.length > 3) {
				logger.info(`  ... and ${preview.ckModified.length - 3} more`);
			}
		}

		if (preview.userCreated.length > 0) {
			logger.info("\nUser-created files (sample):");
			preview.userCreated.slice(0, 3).forEach((f) => logger.info(`  - ${f}`));
			if (preview.userCreated.length > 3) {
				logger.info(`  ... and ${preview.userCreated.length - 3} more`);
			}
		}

		// Create tracked files list
		const trackedFiles: TrackedFile[] = [];

		// Add pristine CK files (no checksum needed - use manifest)
		for (const relativePath of preview.ckPristine) {
			const manifestEntry = ReleaseManifestLoader.findFile(manifest, relativePath);
			if (manifestEntry) {
				trackedFiles.push({
					path: relativePath,
					checksum: manifestEntry.checksum,
					ownership: "hi",
					installedVersion: kitVersion,
				});
			}
		}

		// User-owned files: ownership-only tracking, no checksum needed.
		// `sync-engine.createSyncPlan` short-circuits on `ownership === "user"`
		// (sync-engine.ts:168) before any checksum comparison, so an empty
		// checksum here is safe and never read. Skipping these saves the bulk
		// of migration time on installs with many user files (4000+ is common
		// after a few months of use on macOS, including Finder duplicates like
		// `.env 2.example`).
		for (const relativePath of preview.userCreated) {
			trackedFiles.push({
				path: relativePath,
				checksum: "",
				ownership: "user",
				installedVersion: kitVersion,
			});
		}

		// Only CK-modified files need fresh checksums — these are kit-owned
		// files the user has edited, and sync-engine compares their checksum
		// against the manifest to decide auto-update vs needs-review on the
		// next `hi init`.
		const filesToChecksum = preview.ckModified.map((p) => ({
			relativePath: p,
			ownership: "hi-modified" as const,
		}));

		if (filesToChecksum.length > 0) {
			const total = filesToChecksum.length;
			const spinner = createSpinner(`Tracking ${total} modified file(s)...`).start();
			let completed = 0;
			let skipped = 0;

			const checksumResults = await mapWithLimit(
				filesToChecksum,
				async ({ relativePath, ownership }) => {
					const fullPath = join(claudeDir, relativePath);
					const checksum = await safeChecksum(fullPath, relativePath);
					completed++;
					if (checksum === null) skipped++;
					if (completed % 50 === 0 || completed === total) {
						spinner.text = `Tracking modified files... ${completed}/${total}${skipped > 0 ? ` (${skipped} skipped)` : ""}`;
					}
					return { relativePath, checksum, ownership };
				},
				getOptimalConcurrency(),
			);

			spinner.succeed(`Tracked ${total - skipped}/${total} modified file(s)`);
			if (skipped > 0) {
				logger.warning(
					`Skipped ${skipped} unreadable file(s) during ownership tracking (see debug logs for details)`,
				);
			}

			for (const { relativePath, checksum, ownership } of checksumResults) {
				if (checksum === null) continue; // file unreadable — exclude from ownership manifest
				trackedFiles.push({
					path: relativePath,
					checksum,
					ownership,
					installedVersion: kitVersion,
				});
			}
		}

		// Update metadata.json
		const existingMetadata = await ManifestWriter.readManifest(claudeDir);
		const updatedMetadata: Metadata = {
			...existingMetadata,
			name: kitName,
			version: kitVersion,
			installedAt: new Date().toISOString(),
			files: trackedFiles,
		};

		// Write metadata
		const metadataPath = join(claudeDir, "metadata.json");
		await writeFile(metadataPath, JSON.stringify(updatedMetadata, null, 2));

		logger.success(`Migration complete: tracked ${trackedFiles.length} files`);
		return true;
	}
}
