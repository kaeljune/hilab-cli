/**
 * HiConfigManager - Full .hi.json config management with source tracking
 * Handles global (~/.claude/.hi.json) and project (.claude/.hi.json) configs
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { logger } from "@/shared/logger.js";
import {
	type ConfigSource,
	DEFAULT_HI_CONFIG,
	type HiConfig,
	HiConfigSchema,
	type HiConfigWithSources,
	normalizeCkConfigInput,
} from "@/types";

const HI_CONFIG_FILE = ".hi.json";

/**
 * Get nested value from object using dot-notation path
 */
function getNestedValue(obj: unknown, path: string): unknown {
	if (!obj || typeof obj !== "object") return undefined;
	const keys = path.split(".");
	let current: unknown = obj;
	for (const key of keys) {
		if (current === null || current === undefined) return undefined;
		if (typeof current !== "object") return undefined;
		current = (current as Record<string, unknown>)[key];
	}
	return current;
}

/** Dangerous keys that could cause prototype pollution */
const DANGEROUS_KEYS = ["__proto__", "constructor", "prototype"];

/**
 * Set nested value in object using dot-notation path
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
	const keys = path.split(".");
	// Validate no dangerous keys in path
	if (keys.some((k) => DANGEROUS_KEYS.includes(k))) {
		throw new Error("Invalid field path: dangerous key detected");
	}
	let current = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (!(key in current) || typeof current[key] !== "object" || current[key] === null) {
			current[key] = {};
		}
		current = current[key] as Record<string, unknown>;
	}
	current[keys[keys.length - 1]] = value;
}

/**
 * Deep merge two objects (source into target)
 * Filters dangerous keys to prevent prototype pollution
 */
function deepMerge(
	target: Record<string, unknown>,
	source: Record<string, unknown>,
): Record<string, unknown> {
	const result = { ...target };
	for (const key of Object.keys(source)) {
		if (DANGEROUS_KEYS.includes(key)) continue; // Skip dangerous keys
		const sourceVal = source[key];
		const targetVal = result[key];
		if (
			sourceVal !== null &&
			typeof sourceVal === "object" &&
			!Array.isArray(sourceVal) &&
			targetVal !== null &&
			typeof targetVal === "object" &&
			!Array.isArray(targetVal)
		) {
			result[key] = deepMerge(
				targetVal as Record<string, unknown>,
				sourceVal as Record<string, unknown>,
			);
		} else if (sourceVal !== undefined) {
			result[key] = sourceVal;
		}
	}
	return result;
}

/**
 * Compare two values for equality (handles objects and arrays)
 */
function valuesEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (a === null || b === null) return a === b;
	if (typeof a !== typeof b) return false;
	if (typeof a !== "object") return false;
	if (Array.isArray(a) !== Array.isArray(b)) return false;
	if (Array.isArray(a)) {
		const arrA = a as unknown[];
		const arrB = b as unknown[];
		if (arrA.length !== arrB.length) return false;
		return arrA.every((val, i) => valuesEqual(val, arrB[i]));
	}
	const objA = a as Record<string, unknown>;
	const objB = b as Record<string, unknown>;
	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);
	if (keysA.length !== keysB.length) return false;
	return keysA.every((key) => valuesEqual(objA[key], objB[key]));
}

export class HiConfigManager {
	/**
	 * Get the global config directory (~/.claude)
	 */
	static getGlobalConfigDir(): string {
		return join(homedir(), ".claude");
	}

	/**
	 * Get the global config file path (~/.claude/.hi.json)
	 */
	static getGlobalConfigPath(): string {
		return join(HiConfigManager.getGlobalConfigDir(), HI_CONFIG_FILE);
	}

	/**
	 * Get the project config directory (projectDir/.claude)
	 */
	static getProjectConfigDir(projectDir: string): string {
		return join(projectDir, ".claude");
	}

	/**
	 * Get the project config file path (projectDir/.claude/.hi.json)
	 */
	static getProjectConfigPath(projectDir: string): string {
		return join(HiConfigManager.getProjectConfigDir(projectDir), HI_CONFIG_FILE);
	}

	/**
	 * Load raw config from a file path
	 */
	private static async loadConfigFile(configPath: string): Promise<HiConfig | null> {
		try {
			if (!existsSync(configPath)) return null;
			const content = await readFile(configPath, "utf-8");
			const data = normalizeCkConfigInput(JSON.parse(content));
			return HiConfigSchema.parse(data);
		} catch (error) {
			logger.warning(
				`Failed to load config from ${configPath}: ${error instanceof Error ? error.message : "Unknown"}`,
			);
			return null;
		}
	}

	/**
	 * Compute source for each config field by comparing against global and project configs
	 */
	private static computeSources(
		mergedConfig: HiConfig,
		globalConfig: HiConfig | null,
		projectConfig: HiConfig | null,
		prefix = "",
	): Record<string, ConfigSource> {
		const sources: Record<string, ConfigSource> = {};

		const processValue = (key: string, value: unknown, path: string): void => {
			// Skip $schema
			if (key === "$schema") return;

			if (value !== null && typeof value === "object" && !Array.isArray(value)) {
				// Recurse into nested objects
				for (const [nestedKey, nestedVal] of Object.entries(value as Record<string, unknown>)) {
					processValue(nestedKey, nestedVal, path ? `${path}.${nestedKey}` : nestedKey);
				}
			} else {
				// Leaf value - determine source
				const projectVal = projectConfig ? getNestedValue(projectConfig, path) : undefined;
				const globalVal = globalConfig ? getNestedValue(globalConfig, path) : undefined;

				if (projectConfig && projectVal !== undefined && valuesEqual(value, projectVal)) {
					sources[path] = "project";
				} else if (globalConfig && globalVal !== undefined && valuesEqual(value, globalVal)) {
					sources[path] = "global";
				} else {
					sources[path] = "default";
				}
			}
		};

		for (const [key, value] of Object.entries(mergedConfig)) {
			processValue(key, value, prefix ? `${prefix}.${key}` : key);
		}

		return sources;
	}

	/**
	 * Load full config with source tracking
	 * Merges: defaults <- global <- project
	 */
	static async loadFull(projectDir: string | null): Promise<HiConfigWithSources> {
		const globalPath = HiConfigManager.getGlobalConfigPath();
		const projectPath = projectDir ? HiConfigManager.getProjectConfigPath(projectDir) : null;

		// Load configs
		const globalConfig = await HiConfigManager.loadConfigFile(globalPath);
		const projectConfig = projectPath ? await HiConfigManager.loadConfigFile(projectPath) : null;

		// Merge: defaults <- global <- project
		let merged: HiConfig = { ...DEFAULT_HI_CONFIG };
		if (globalConfig) {
			merged = deepMerge(
				merged as Record<string, unknown>,
				globalConfig as Record<string, unknown>,
			) as HiConfig;
		}
		if (projectConfig) {
			merged = deepMerge(
				merged as Record<string, unknown>,
				projectConfig as Record<string, unknown>,
			) as HiConfig;
		}

		// Compute sources
		const sources = HiConfigManager.computeSources(merged, globalConfig, projectConfig);

		return {
			config: merged,
			sources,
			globalPath,
			projectPath,
		};
	}

	/**
	 * Save config to specified scope
	 * Only writes fields that differ from inherited values (selective save)
	 */
	static async saveFull(
		config: HiConfig,
		scope: "global" | "project",
		projectDir: string | null,
	): Promise<string> {
		// Validate config
		const validConfig = HiConfigSchema.parse(normalizeCkConfigInput(config));

		const configPath =
			scope === "global"
				? HiConfigManager.getGlobalConfigPath()
				: projectDir
					? HiConfigManager.getProjectConfigPath(projectDir)
					: null;

		if (!configPath) {
			throw new Error("Project directory required for project scope");
		}

		// projectDir is guaranteed non-null here since we checked configPath above
		const configDir =
			scope === "global"
				? HiConfigManager.getGlobalConfigDir()
				: HiConfigManager.getProjectConfigDir(projectDir as string);

		// Ensure directory exists
		if (!existsSync(configDir)) {
			await mkdir(configDir, { recursive: true });
		}

		// Prefer the parsed scope config as the merge base so save paths self-heal
		// legacy aliases and drop unsupported keys. If the current file no longer
		// parses under the latest schema, fall back to normalized raw JSON so a
		// partial save does not wipe unrelated settings.
		let existingConfig = (await HiConfigManager.loadScope(scope, projectDir)) as Record<
			string,
			unknown
		> | null;
		if (!existingConfig && existsSync(configPath)) {
			try {
				const content = await readFile(configPath, "utf-8");
				const parsed = JSON.parse(content);
				if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
					existingConfig = normalizeCkConfigInput(parsed) as Record<string, unknown>;
				}
			} catch {
				// Start fresh if parsing fails
			}
		}

		// Merge new config into existing
		const mergedConfig = deepMerge(existingConfig || {}, validConfig as Record<string, unknown>);

		// Write with pretty formatting
		await writeFile(configPath, JSON.stringify(mergedConfig, null, 2), "utf-8");
		logger.debug(`Config saved to ${configPath}`);

		return configPath;
	}

	/**
	 * Load config for a specific scope only (no merge)
	 */
	static async loadScope(
		scope: "global" | "project",
		projectDir: string | null,
	): Promise<HiConfig | null> {
		if (scope === "global") {
			return HiConfigManager.loadConfigFile(HiConfigManager.getGlobalConfigPath());
		}
		if (!projectDir) return null;
		return HiConfigManager.loadConfigFile(HiConfigManager.getProjectConfigPath(projectDir));
	}

	/**
	 * Check if project-level .hi.json exists
	 * @param dir - Project directory (or ~/.claude for global)
	 * @param isGlobal - If true, check dir/.hi.json (global config);
	 *                   if false or undefined (default), check dir/.claude/.hi.json (project config)
	 * @returns true if config file exists
	 */
	static projectConfigExists(dir: string, isGlobal?: boolean): boolean {
		const configPath = isGlobal ? join(dir, ".hi.json") : HiConfigManager.getProjectConfigPath(dir);
		return existsSync(configPath);
	}

	/**
	 * Check if config exists at specified scope
	 */
	static configExists(scope: "global" | "project", projectDir: string | null): boolean {
		if (scope === "global") {
			return existsSync(HiConfigManager.getGlobalConfigPath());
		}
		if (!projectDir) return false;
		return existsSync(HiConfigManager.getProjectConfigPath(projectDir));
	}

	/**
	 * Get a single field value with its source
	 */
	static async getFieldWithSource(
		fieldPath: string,
		projectDir: string | null,
	): Promise<{ value: unknown; source: ConfigSource }> {
		const { config, sources } = await HiConfigManager.loadFull(projectDir);
		const value = getNestedValue(config, fieldPath);
		const source = sources[fieldPath] || "default";
		return { value, source };
	}

	/**
	 * Update a single field at the specified scope
	 */
	static async updateField(
		fieldPath: string,
		value: unknown,
		scope: "global" | "project",
		projectDir: string | null,
	): Promise<void> {
		// Load existing config for scope
		const existing = (await HiConfigManager.loadScope(scope, projectDir)) || {};

		// Set the new value
		setNestedValue(existing as Record<string, unknown>, fieldPath, value);

		// Save back
		await HiConfigManager.saveFull(existing, scope, projectDir);
	}
}
