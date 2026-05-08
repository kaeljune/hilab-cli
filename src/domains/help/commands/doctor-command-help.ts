/**
 * Doctor Command Help
 *
 * Help definition for the 'doctor' command.
 */

import type { CommandHelp } from "../help-types.js";

export const doctorCommandHelp: CommandHelp = {
	name: "doctor",
	description: "Comprehensive health check for HiLab",
	usage: "hi doctor [options]",
	examples: [
		{
			command: "hi doctor",
			description: "Run full health check interactively",
		},
		{
			command: "hi doctor --fix",
			description: "Auto-fix all fixable issues",
		},
		{
			command: "hi doctor --check-only",
			description: "CI mode: exit 1 on failures, no prompts",
		},
	],
	optionGroups: [
		{
			title: "Options",
			options: [
				{
					flags: "--report",
					description: "Generate shareable diagnostic report",
				},
				{
					flags: "--fix",
					description: "Auto-fix all fixable issues",
				},
				{
					flags: "--check-only",
					description: "CI mode: no prompts, exit 1 on failures",
				},
				{
					flags: "--full",
					description: "Include extended priority checks (slower but more thorough)",
				},
				{
					flags: "--json",
					description: "Output JSON format",
				},
			],
		},
	],
};
