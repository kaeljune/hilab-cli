/**
 * Config Command Help
 *
 * Help definition for the 'config' command.
 */

import type { CommandHelp } from "../help-types.js";

export const configCommandHelp: CommandHelp = {
	name: "config",
	description: "Manage HiLab configuration and launch the config dashboard",
	usage: "hi config [action] [key] [value] [options]",
	examples: [
		{
			command: "hi config",
			description: "Launch the web dashboard (same as 'hi config ui')",
		},
		{
			command: "hi config --host 0.0.0.0 --no-open",
			description: "Expose the dashboard to your network intentionally",
		},
		{
			command: "hi config set defaults.kit coding",
			description: "Set a config value from the CLI",
		},
	],
	optionGroups: [
		{
			title: "Actions",
			options: [
				{
					flags: "ui",
					description: "Launch config dashboard (default action when omitted)",
				},
				{
					flags: "get <key>",
					description: "Read a config value",
				},
				{
					flags: "set <key> <value>",
					description: "Write a config value",
				},
				{
					flags: "show",
					description: "Print merged config",
				},
			],
		},
		{
			title: "Scope Options",
			options: [
				{
					flags: "-g, --global",
					description: "Use global config (~/.hilab/config.json)",
				},
				{
					flags: "-l, --local",
					description: "Use local config (.claude/.hi.json)",
				},
			],
		},
		{
			title: "Dashboard Options",
			options: [
				{
					flags: "--port <port>",
					description: "Port for dashboard server",
				},
				{
					flags: "--host <host>",
					description: "Bind dashboard host (default: 127.0.0.1)",
				},
				{
					flags: "--no-open",
					description: "Do not auto-open browser when launching dashboard",
				},
				{
					flags: "--dev",
					description: "Run dashboard in development mode with HMR",
				},
			],
		},
		{
			title: "Output Options",
			options: [
				{
					flags: "--json",
					description: "Output machine-readable JSON for CLI actions",
				},
			],
		},
	],
	subcommands: [
		{
			name: "ui",
			description: "Launch config dashboard (default action when omitted)",
			usage: "hi config ui [--port <port>] [--host <host>] [--no-open] [--dev]",
			examples: [],
			optionGroups: [],
		},
		{
			name: "get",
			description: "Read a config value",
			usage: "hi config get <key> [-g | -l] [--json]",
			examples: [],
			optionGroups: [],
		},
		{
			name: "set",
			description: "Write a config value",
			usage: "hi config set <key> <value> [-g | -l]",
			examples: [],
			optionGroups: [],
		},
		{
			name: "show",
			description: "Print merged config",
			usage: "hi config show [-g | -l] [--json]",
			examples: [],
			optionGroups: [],
		},
	],
	sections: [
		{
			title: "Notes",
			content:
				"Run 'hi config --help' to see both CLI actions and dashboard flags. Running bare 'hi config' opens the dashboard directly. Use '--host' to expose the dashboard intentionally beyond localhost.",
		},
	],
};
