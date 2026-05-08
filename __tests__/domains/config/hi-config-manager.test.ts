import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HiConfigManager } from "../../../src/domains/config/hi-config-manager.js";
import {
	DEFAULT_HI_CONFIG,
	HI_HOOK_NAMES,
	type HiConfig,
	HiConfigSchema,
} from "../../../src/types/hi-config.js";
// HiSimplifyConfigSchema is validated via HiConfigSchema.parse({ simplify: {...} })

describe("HiConfigManager", () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtemp(join(tmpdir(), "hi-config-test-"));
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	describe("projectConfigExists", () => {
		it("should detect project config at dir/.claude/.hi.json (isGlobal=false)", async () => {
			// Create project structure: projectDir/.claude/.hi.json
			const projectDir = join(tempDir, "myproject");
			const claudeDir = join(projectDir, ".claude");
			const configPath = join(claudeDir, ".hi.json");

			await mkdir(claudeDir, { recursive: true });
			await writeFile(configPath, JSON.stringify({}));

			const exists = HiConfigManager.projectConfigExists(projectDir, false);
			expect(exists).toBe(true);
		});

		it("should detect global config at dir/.hi.json (isGlobal=true)", async () => {
			// Create global structure: ~/.hi.json
			const globalPath = join(tempDir, ".hi.json");
			await writeFile(globalPath, JSON.stringify({}));

			const exists = HiConfigManager.projectConfigExists(tempDir, true);
			expect(exists).toBe(true);
		});

		it("should return false when project config doesn't exist (isGlobal=false)", async () => {
			const projectDir = join(tempDir, "nonexistent-project");

			const exists = HiConfigManager.projectConfigExists(projectDir, false);
			expect(exists).toBe(false);
		});

		it("should return false when global config doesn't exist (isGlobal=true)", async () => {
			const exists = HiConfigManager.projectConfigExists(tempDir, true);
			expect(exists).toBe(false);
		});

		it("should default to isGlobal=false when undefined", async () => {
			// Create project structure
			const projectDir = join(tempDir, "myproject");
			const claudeDir = join(projectDir, ".claude");
			const configPath = join(claudeDir, ".hi.json");

			await mkdir(claudeDir, { recursive: true });
			await writeFile(configPath, JSON.stringify({}));

			// Call without isGlobal - should default to false (project config)
			const exists = HiConfigManager.projectConfigExists(projectDir);
			expect(exists).toBe(true);
		});

		it("should handle nested project directories", async () => {
			const projectDir = join(tempDir, "a", "b", "c", "myproject");
			const claudeDir = join(projectDir, ".claude");
			const configPath = join(claudeDir, ".hi.json");

			await mkdir(claudeDir, { recursive: true });
			await writeFile(configPath, JSON.stringify({}));

			const exists = HiConfigManager.projectConfigExists(projectDir, false);
			expect(exists).toBe(true);
		});
	});

	describe("Hook schema sync", () => {
		it("should have consistent hook counts across all locations", () => {
			const hooksInNames = HI_HOOK_NAMES.length;
			const hooksInDefaults = Object.keys(DEFAULT_HI_CONFIG.hooks ?? {}).length;
			// Both should be 9 (matching the hook count)
			expect(hooksInNames).toBe(9);
			expect(hooksInDefaults).toBe(9);
		});

		it("should have all hooks from HI_HOOK_NAMES in DEFAULT_HI_CONFIG.hooks", () => {
			for (const hookName of HI_HOOK_NAMES) {
				expect(DEFAULT_HI_CONFIG.hooks).toHaveProperty(hookName);
			}
		});

		it("should have all hooks in DEFAULT_HI_CONFIG.hooks set to true", () => {
			const hooks = DEFAULT_HI_CONFIG.hooks;
			expect(hooks).toBeDefined();
			if (!hooks) return;
			for (const hookName of HI_HOOK_NAMES) {
				const hookValue = hooks[hookName as keyof typeof hooks];
				expect(hookValue).toBe(true);
			}
		});

		it("should have all DEFAULT_HI_CONFIG.hooks entries in HI_HOOK_NAMES", () => {
			expect(DEFAULT_HI_CONFIG.hooks).toBeDefined();
			const hookEntries = Object.keys(DEFAULT_HI_CONFIG.hooks as Record<string, boolean>);
			for (const hookEntry of hookEntries) {
				expect(HI_HOOK_NAMES).toContain(hookEntry as any);
			}
		});

		it("should parse valid hooks config with all 9 hooks (incl. simplify-gate)", async () => {
			const hooksConfig = {
				"session-init": true,
				"subagent-init": true,
				"descriptive-name": true,
				"dev-rules-reminder": true,
				"usage-context-awareness": true,
				"context-tracking": true,
				"scout-block": true,
				"privacy-block": true,
				"simplify-gate": true,
			};

			const testConfig: HiConfig = {
				...DEFAULT_HI_CONFIG,
				hooks: hooksConfig,
			};

			const result = HiConfigSchema.parse(testConfig);
			expect(result.hooks).toEqual(hooksConfig);
		});

		it("should allow optional hooks in schema (partial config)", async () => {
			const partialConfig: HiConfig = {
				hooks: {
					"session-init": false,
					"privacy-block": true,
				},
			};

			const result = HiConfigSchema.parse(partialConfig);
			expect(result.hooks?.["session-init"]).toBe(false);
			expect(result.hooks?.["privacy-block"]).toBe(true);
		});

		it("should validate that HI_HOOK_NAMES includes all expected hooks", () => {
			const expectedHooks = [
				"session-init",
				"subagent-init",
				"descriptive-name",
				"dev-rules-reminder",
				"usage-context-awareness",
				"context-tracking",
				"scout-block",
				"privacy-block",
				"simplify-gate",
			];

			for (const hook of expectedHooks) {
				expect(HI_HOOK_NAMES).toContain(hook as any);
			}
		});

		it("should have no unexpected hooks in HI_HOOK_NAMES", () => {
			const expectedHooks = new Set([
				"session-init",
				"subagent-init",
				"descriptive-name",
				"dev-rules-reminder",
				"usage-context-awareness",
				"context-tracking",
				"scout-block",
				"privacy-block",
				"simplify-gate",
			]);

			for (const hook of HI_HOOK_NAMES) {
				expect(expectedHooks.has(hook)).toBe(true);
			}
		});

		it("should maintain hook schema consistency across all three locations", () => {
			// All three must have exactly the same hooks
			const hooksInNames = new Set(HI_HOOK_NAMES);
			expect(DEFAULT_HI_CONFIG.hooks).toBeDefined();
			const hooksInConfig = new Set(
				Object.keys(DEFAULT_HI_CONFIG.hooks as Record<string, boolean>),
			);

			expect(hooksInNames.size).toBe(hooksInConfig.size);
			for (const hook of hooksInNames) {
				expect(hooksInConfig.has(hook)).toBe(true);
			}
		});
	});

	describe("Config file operations", () => {
		it("should save and load full config", async () => {
			const projectDir = join(tempDir, "project");
			const claudeDir = join(projectDir, ".claude");
			await mkdir(claudeDir, { recursive: true });

			const config: HiConfig = {
				...DEFAULT_HI_CONFIG,
				codingLevel: 2,
			};

			await HiConfigManager.saveFull(config, "project", projectDir);

			const loaded = await HiConfigManager.loadScope("project", projectDir);
			expect(loaded).toBeDefined();
			expect(loaded?.codingLevel).toBe(2);
		});

		it("should load global config path correctly", () => {
			const globalPath = HiConfigManager.getGlobalConfigPath();
			expect(globalPath).toContain(".claude");
			expect(globalPath).toContain(".hi.json");
			expect(globalPath).toContain(homedir());
		});

		it("should load project config path correctly", () => {
			const projectDir = join(tmpdir(), "myproject");
			const projectPath = HiConfigManager.getProjectConfigPath(projectDir);
			expect(projectPath).toContain(".claude");
			expect(projectPath).toContain(".hi.json");
			expect(projectPath).toContain("myproject");
		});

		it("should validate config on save using HiConfigSchema", async () => {
			const projectDir = join(tempDir, "project");
			const claudeDir = join(projectDir, ".claude");
			await mkdir(claudeDir, { recursive: true });

			const validConfig: HiConfig = {
				codingLevel: 1,
				hooks: { "session-init": true },
			};

			const path = await HiConfigManager.saveFull(validConfig, "project", projectDir);
			expect(existsSync(path)).toBe(true);

			const content = await readFile(path, "utf-8");
			const parsed = JSON.parse(content);
			expect(parsed.codingLevel).toBe(1);
		});
	});

	describe("Config existence checks", () => {
		it("should check if project config exists", async () => {
			const projectDir = join(tempDir, "project");
			const claudeDir = join(projectDir, ".claude");
			await mkdir(claudeDir, { recursive: true });

			expect(HiConfigManager.configExists("project", projectDir)).toBe(false);

			const configPath = join(claudeDir, ".hi.json");
			await writeFile(configPath, JSON.stringify({}));

			expect(HiConfigManager.configExists("project", projectDir)).toBe(true);
		});

		it("should return false for project scope when projectDir is null", () => {
			const exists = HiConfigManager.configExists("project", null);
			expect(exists).toBe(false);
		});
	});

	describe("Integrated test scenarios", () => {
		it("should handle complete project config lifecycle", async () => {
			const projectDir = join(tempDir, "myapp");

			// Initially should not exist
			expect(HiConfigManager.projectConfigExists(projectDir, false)).toBe(false);

			// Create and save config
			const claudeDir = join(projectDir, ".claude");
			await mkdir(claudeDir, { recursive: true });

			const initialConfig: HiConfig = {
				...DEFAULT_HI_CONFIG,
				codingLevel: 0,
				statusline: "compact",
			};

			await HiConfigManager.saveFull(initialConfig, "project", projectDir);

			// Should now exist
			expect(HiConfigManager.projectConfigExists(projectDir, false)).toBe(true);

			// Should be loadable
			const loaded = await HiConfigManager.loadScope("project", projectDir);
			expect(loaded?.codingLevel).toBe(0);
			expect(loaded?.statusline).toBe("compact");
		});

		it("should preserve hook configuration through save/load cycle", async () => {
			const projectDir = join(tempDir, "project");
			const claudeDir = join(projectDir, ".claude");
			await mkdir(claudeDir, { recursive: true });

			const customConfig: HiConfig = {
				...DEFAULT_HI_CONFIG,
				hooks: {
					"session-init": true,
					"privacy-block": false,
					"scout-block": true,
				},
			};

			await HiConfigManager.saveFull(customConfig, "project", projectDir);

			const loaded = await HiConfigManager.loadScope("project", projectDir);
			expect(loaded?.hooks?.["session-init"]).toBe(true);
			expect(loaded?.hooks?.["privacy-block"]).toBe(false);
			expect(loaded?.hooks?.["scout-block"]).toBe(true);
		});
	});

	describe("Edge cases", () => {
		it("should handle non-existent directory for projectConfigExists", () => {
			const nonexistentPath = join(tempDir, "this", "does", "not", "exist");
			const exists = HiConfigManager.projectConfigExists(nonexistentPath, false);
			expect(exists).toBe(false);
		});

		it("should distinguish between global and project config correctly", async () => {
			// Create both global and project configs
			const globalPath = join(tempDir, ".hi.json");
			await writeFile(globalPath, JSON.stringify({ codingLevel: 0 }));

			const projectDir = join(tempDir, "project");
			const claudeDir = join(projectDir, ".claude");
			await mkdir(claudeDir, { recursive: true });
			const projectPath = join(claudeDir, ".hi.json");
			await writeFile(projectPath, JSON.stringify({ codingLevel: 1 }));

			// Check global
			expect(HiConfigManager.projectConfigExists(tempDir, true)).toBe(true);

			// Check project
			expect(HiConfigManager.projectConfigExists(projectDir, false)).toBe(true);

			// They should be different files
			const globalContent = await readFile(globalPath, "utf-8");
			const projectContent = await readFile(projectPath, "utf-8");
			expect(globalContent).not.toBe(projectContent);
		});
	});
});

describe("HiSimplifyConfigSchema", () => {
	it("should apply defaults when simplify block is empty", () => {
		const result = HiConfigSchema.parse({ simplify: {} });
		expect(result.simplify?.threshold?.locDelta).toBe(400);
		expect(result.simplify?.threshold?.fileCount).toBe(8);
		expect(result.simplify?.threshold?.singleFileLoc).toBe(200);
		expect(result.simplify?.gate?.enabled).toBe(false);
		expect(result.simplify?.gate?.hardVerbs).toEqual(["ship", "merge", "pr", "deploy", "publish"]);
		expect(result.simplify?.gate?.softVerbs).toEqual(["commit", "finalize", "release"]);
	});

	it("should reject unknown root keys under simplify (strict)", () => {
		expect(() => HiConfigSchema.parse({ simplify: { unknownKey: "x" } })).toThrow();
	});

	it("should allow unknown nested keys under simplify.threshold and simplify.gate (passthrough)", () => {
		const result = HiConfigSchema.parse({
			simplify: {
				threshold: { locDelta: 500, futureField: "ok" },
				gate: { enabled: true, futureFlag: 1 },
			},
		});
		expect(result.simplify?.threshold?.locDelta).toBe(500);
	});

	it("should accept user override of hardVerbs and softVerbs", () => {
		const result = HiConfigSchema.parse({
			simplify: {
				gate: { hardVerbs: ["release"], softVerbs: ["push"] },
			},
		});
		expect(result.simplify?.gate?.hardVerbs).toEqual(["release"]);
		expect(result.simplify?.gate?.softVerbs).toEqual(["push"]);
	});
});
