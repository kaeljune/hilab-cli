import type { HiLabSetup } from "@/types";
import type { CheckResult } from "../types.js";
import { formatVersion } from "../utils/version-formatter.js";

/**
 * Check global HiLab installation
 */
export function checkGlobalInstall(setup: HiLabSetup): CheckResult {
	const hasGlobal = !!setup.global.path;
	const metadata = setup.global.metadata;
	const kitName = metadata?.name || "HiLab";
	const version = formatVersion(metadata?.version);

	return {
		id: "hi-global-install",
		name: "Global CK",
		group: "hilab",
		priority: "critical",
		status: hasGlobal ? "pass" : "warn",
		message: hasGlobal ? `${kitName} ${version}` : "Not installed",
		details: hasGlobal ? setup.global.path : undefined,
		suggestion: !hasGlobal ? "Install globally: hi init --global" : undefined,
		autoFixable: false, // Manual: hi init --global
	};
}

/**
 * Check project HiLab installation
 */
export function checkProjectInstall(setup: HiLabSetup): CheckResult {
	const metadata = setup.project.metadata;
	// A real HiLab project requires metadata.json (not just .claude dir)
	const hasProject = !!metadata;
	const kitName = metadata?.name || "HiLab";
	const version = formatVersion(metadata?.version);

	return {
		id: "hi-project-install",
		name: "Project CK",
		group: "hilab",
		priority: "standard",
		status: hasProject ? "pass" : "info",
		message: hasProject ? `${kitName} ${version}` : "Not a HiLab project",
		details: hasProject ? setup.project.path : undefined,
		suggestion: !hasProject ? "Initialize: hi new or hi init" : undefined,
		autoFixable: false, // Requires user choice
	};
}
