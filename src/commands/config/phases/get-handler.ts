/**
 * Handler for `hi config get <key>` command
 * Uses HiConfigManager for correct .hi.json config resolution
 */

import { HiConfigManager } from "@/domains/config/index.js";
import type { ConfigCommandOptions } from "../types.js";

export async function handleGet(key: string, options: ConfigCommandOptions): Promise<void> {
	const { global: globalOnly, json } = options;
	const projectDir = process.cwd();

	let value: unknown;

	try {
		if (globalOnly) {
			const scoped = await HiConfigManager.loadScope("global", projectDir);
			value = scoped ? getNestedValue(scoped as Record<string, unknown>, key) : undefined;
		} else {
			const { value: v } = await HiConfigManager.getFieldWithSource(key, projectDir);
			value = v;
		}
	} catch (error) {
		console.error(
			`Failed to read config: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		process.exitCode = 1;
		return;
	}

	if (value === undefined) {
		console.error(`Key not found: ${key}`);
		console.error(`Run: hi config show --json | jq 'keys'`);
		process.exitCode = 1;
		return;
	}

	if (json || typeof value === "object") {
		console.log(JSON.stringify(value, null, 2));
	} else {
		console.log(value);
	}
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
	return path.split(".").reduce((acc: unknown, key: string) => {
		if (acc && typeof acc === "object" && key in acc) {
			return (acc as Record<string, unknown>)[key];
		}
		return undefined;
	}, obj);
}
