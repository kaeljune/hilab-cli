/**
 * Projects Command Help
 *
 * Help definition for the 'projects' command group.
 */

import type { CommandHelp } from "../help-types.js";

export const projectsCommandHelp: CommandHelp = {
	name: "projects",
	description: "Manage local HiLab project registry entries",
	usage: "hi projects <subcommand> [options]",
	examples: [
		{
			command: "hi projects list --pinned",
			description: "Show only pinned projects",
		},
		{
			command: "hi projects add . --alias engine --pinned",
			description: "Add current directory with an alias and pin it",
		},
	],
	optionGroups: [
		{
			title: "Subcommands",
			options: [
				{
					flags: "list | ls",
					description: "List projects in registry",
				},
				{
					flags: "add <path>",
					description: "Add project path to registry",
				},
				{
					flags: "remove [alias] | rm [alias]",
					description: "Remove project by alias or ID",
				},
			],
		},
		{
			title: "List Options",
			options: [
				{
					flags: "--json",
					description: "Output in JSON format",
				},
				{
					flags: "--pinned",
					description: "Filter to pinned projects only",
				},
			],
		},
		{
			title: "Add/Remove Options",
			options: [
				{
					flags: "--alias <alias>",
					description: "Custom alias for project (add)",
				},
				{
					flags: "--pinned",
					description: "Pin this project (add)",
				},
				{
					flags: "--tags <tags>",
					description: "Comma-separated tags (add)",
				},
				{
					flags: "--id <id>",
					description: "Remove by project ID (remove)",
				},
			],
		},
	],
	subcommands: [
		{
			name: "list",
			description: "List projects in registry",
			usage: "hi projects list [--json] [--pinned]",
			examples: [],
			optionGroups: [],
			aliases: ["ls"],
		},
		{
			name: "add",
			description: "Add project path to registry",
			usage: "hi projects add <path> [--alias <alias>] [--pinned] [--tags <tags>]",
			examples: [],
			optionGroups: [],
		},
		{
			name: "remove",
			description: "Remove project by alias or ID",
			usage: "hi projects remove [alias] [--id <id>]",
			examples: [],
			optionGroups: [],
			aliases: ["rm"],
		},
	],
};
