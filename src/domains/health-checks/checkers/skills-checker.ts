import { existsSync } from "node:fs";
import { join } from "node:path";
import type { HiLabSetup } from "@/types";
import type { CheckResult } from "../types.js";

/**
 * Check skills install scripts (install.sh / install.ps1)
 */
export function checkSkillsScripts(setup: HiLabSetup): CheckResult[] {
	const results: CheckResult[] = [];
	const platform = process.platform;
	const scriptName = platform === "win32" ? "install.ps1" : "install.sh";

	// Check global skills
	if (setup.global.path) {
		const globalScriptPath = join(setup.global.path, "skills", scriptName);
		const hasGlobalScript = existsSync(globalScriptPath);

		results.push({
			id: "hi-global-skills-script",
			name: "Global Skills Script",
			group: "hilab",
			priority: "standard",
			status: hasGlobalScript ? "pass" : "info",
			message: hasGlobalScript ? "Available" : "Not found",
			details: hasGlobalScript ? globalScriptPath : undefined,
			suggestion: !hasGlobalScript ? "Run: hi init --global --install-skills" : undefined,
			autoFixable: false,
		});
	}

	// Check project skills - only if it's a real HiLab project (has metadata)
	if (setup.project.metadata) {
		const projectScriptPath = join(setup.project.path, "skills", scriptName);
		const hasProjectScript = existsSync(projectScriptPath);

		results.push({
			id: "hi-project-skills-script",
			name: "Project Skills Script",
			group: "hilab",
			priority: "standard",
			status: hasProjectScript ? "pass" : "info",
			message: hasProjectScript ? "Available" : "Not found",
			details: hasProjectScript ? projectScriptPath : undefined,
			suggestion: !hasProjectScript ? "Run: hi init --install-skills" : undefined,
			autoFixable: false,
		});
	}

	return results;
}

/**
 * Check component counts (agents, commands, rules, skills)
 */
export function checkComponentCounts(setup: HiLabSetup): CheckResult {
	const global = setup.global.components;
	const project = setup.project.components;

	const totalAgents = global.agents + project.agents;
	const totalCommands = global.commands + project.commands;
	const totalRules = global.rules + project.rules;
	const totalSkills = global.skills + project.skills;
	const totalComponents = totalAgents + totalCommands + totalRules + totalSkills;

	return {
		id: "hi-component-counts",
		name: "HiLab Components",
		group: "hilab",
		priority: "standard",
		status: totalComponents > 0 ? "info" : "warn",
		message:
			totalComponents > 0
				? `${totalAgents} agents, ${totalCommands} commands, ${totalRules} rules, ${totalSkills} skills`
				: "No components found",
		suggestion: totalComponents === 0 ? "Install HiLab: hi new --kit engineer" : undefined,
		autoFixable: false,
	};
}
