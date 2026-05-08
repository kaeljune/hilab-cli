/**
 * Update Command Help
 *
 * Help definition for the 'update' command.
 */

import type { CommandHelp } from "../help-types.js";

export const updateCommandHelp: CommandHelp = {
	name: "update",
	description: "Update HiLab CLI tool only (not kit content)",
	usage: "hi update [options]",
	examples: [
		{
			command: "hi update --check",
			description: "Check for CLI updates without installing",
		},
		{
			command: "hi update --dev --yes",
			description: "Update to latest dev version without confirmation",
		},
	],
	optionGroups: [
		{
			title: "Update Options",
			options: [
				{
					flags: "-r, --release <version>",
					description: "Update to a specific version",
				},
				{
					flags: "--check",
					description: "Check for updates without installing",
				},
				{
					flags: "-y, --yes",
					description: "Skip all confirmation prompts (CLI and kit content update)",
				},
				{
					flags: "-d, --dev",
					description: "Update to the latest dev version",
				},
				{
					flags: "--registry <url>",
					description: "Custom npm registry URL",
				},
			],
		},
		{
			title: "Deprecated Options",
			options: [
				{
					flags: "--beta",
					description: "(deprecated) Alias for --dev; use -d, --dev instead",
					deprecated: {
						message: "Use '-d, --dev' to update to the latest dev version",
						alternative: "-d, --dev",
					},
				},
				{
					flags: "--kit <kit>",
					description: "This option is no longer supported with 'hi update'",
					deprecated: {
						message: "Use 'hi init --kit <kit>' to update kit installations",
						alternative: "hi init --kit <kit>",
					},
				},
				{
					flags: "-g, --global",
					description: "This option is no longer supported with 'hi update'",
					deprecated: {
						message: "Use 'hi init --global' to update global kit",
						alternative: "hi init --global",
					},
				},
			],
		},
	],
	sections: [
		{
			title: "Note",
			content:
				"'hi update' updates the CLI tool only and defaults to the latest stable release. Use '--beta' to opt into prerelease CLI builds. To update kit content (skills, commands, rules), use 'hi init' for local or 'hi init -g' for global. Use --yes to skip all prompts (both CLI and kit content update) for non-interactive/CI usage.",
		},
	],
};
