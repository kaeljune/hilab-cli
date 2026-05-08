import { PackageManagerDetector } from "@/domains/installation/package-manager-detector.js";
import { HILAB_CLI_INSTALL_COMMANDS } from "@/shared/hilab-constants.js";
import { logger } from "@/shared/logger.js";
import type { CheckResult } from "../types.js";

/**
 * Check how the CLI was installed (npm, bun, yarn, pnpm)
 */
export async function checkCliInstallMethod(): Promise<CheckResult> {
	// Skip external command execution in test environment to prevent hangs
	if (process.env.NODE_ENV === "test") {
		logger.verbose("ClaudekitChecker: Skipping PM detection in test mode");
		return {
			id: "hi-cli-install-method",
			name: "CLI Installed Via",
			group: "hilab",
			priority: "standard",
			status: "pass",
			message: "Test Mode (skipped)",
			autoFixable: false,
		};
	}

	const pm = await PackageManagerDetector.detect();
	const pmVersion = await PackageManagerDetector.getVersion(pm);
	const displayName = PackageManagerDetector.getDisplayName(pm);

	return {
		id: "hi-cli-install-method",
		name: "CLI Installed Via",
		group: "hilab",
		priority: "standard",
		status: pm !== "unknown" ? "pass" : "warn",
		message: pmVersion ? `${displayName} (v${pmVersion})` : displayName,
		suggestion:
			pm === "unknown"
				? `Install with one of: ${HILAB_CLI_INSTALL_COMMANDS.join(" | ")}`
				: undefined,
		autoFixable: false,
	};
}
