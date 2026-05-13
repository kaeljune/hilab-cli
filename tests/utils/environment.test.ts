import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
	getHomeDirectoryFromEnv,
	getOptimalConcurrency,
	isCIEnvironment,
	isLinux,
	isMacOS,
	isNonInteractive,
	isWindows,
	shouldSkipExpensiveOperations,
} from "@/shared/environment.js";

describe("environment utilities", () => {
	const originalPlatform = process.platform;
	const originalEnv = { ...process.env };
	const originalStdin = process.stdin.isTTY;

	const unsetEnv = (key: string) => {
		Reflect.deleteProperty(process.env, key);
	};

	beforeEach(() => {
		// Reset environment before each test
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		// Restore original values
		Object.defineProperty(process, "platform", {
			value: originalPlatform,
			writable: true,
		});
		process.env = { ...originalEnv };
		Object.defineProperty(process.stdin, "isTTY", {
			value: originalStdin,
			writable: true,
			configurable: true,
		});
	});

	describe("isCIEnvironment", () => {
		it("should return true when CI=true", () => {
			process.env.CI = "true";
			expect(isCIEnvironment()).toBe(true);
		});

		it("should return true when CI_SAFE_MODE=true", () => {
			process.env.CI_SAFE_MODE = "true";
			expect(isCIEnvironment()).toBe(true);
		});

		it("should return true when CI=1", () => {
			process.env.CI = "1";
			expect(isCIEnvironment()).toBe(true);
		});

		it("should return true when CI=TRUE", () => {
			process.env.CI = "TRUE";
			expect(isCIEnvironment()).toBe(true);
		});

		it("should return false when neither CI nor CI_SAFE_MODE is set", () => {
			unsetEnv("CI");
			unsetEnv("CI_SAFE_MODE");
			expect(isCIEnvironment()).toBe(false);
		});

		it("should return false when CI=false", () => {
			process.env.CI = "false";
			unsetEnv("CI_SAFE_MODE");
			expect(isCIEnvironment()).toBe(false);
		});
	});

	describe("isNonInteractive", () => {
		it("should return true when CI=true", () => {
			process.env.CI = "true";
			expect(isNonInteractive()).toBe(true);
		});

		it("should return true when NON_INTERACTIVE=true", () => {
			process.env.NON_INTERACTIVE = "true";
			expect(isNonInteractive()).toBe(true);
		});

		it("should return true when stdin is not a TTY", () => {
			unsetEnv("CI");
			unsetEnv("NON_INTERACTIVE");
			Object.defineProperty(process.stdin, "isTTY", {
				value: false,
				writable: true,
				configurable: true,
			});
			expect(isNonInteractive()).toBe(true);
		});
	});

	describe("shouldSkipExpensiveOperations", () => {
		it("should return false when HI_TEST_HOME is set (isolated tests)", () => {
			process.env.HI_TEST_HOME = "/tmp/test-home";
			process.env.CI = "true";
			expect(shouldSkipExpensiveOperations()).toBe(false);
		});

		it("should return true in CI when HI_TEST_HOME is not set", () => {
			unsetEnv("HI_TEST_HOME");
			process.env.CI = "true";
			expect(shouldSkipExpensiveOperations()).toBe(true);
		});

		it("should return false outside CI when HI_TEST_HOME is not set", () => {
			unsetEnv("HI_TEST_HOME");
			unsetEnv("CI");
			unsetEnv("CI_SAFE_MODE");
			expect(shouldSkipExpensiveOperations()).toBe(false);
		});

		it("should treat whitespace HI_TEST_HOME as unset", () => {
			process.env.HI_TEST_HOME = "   ";
			process.env.CI = "true";
			expect(shouldSkipExpensiveOperations()).toBe(true);
		});

		it("should treat HI_TEST_HOME=0 as unset", () => {
			process.env.HI_TEST_HOME = "0";
			process.env.CI = "true";
			expect(shouldSkipExpensiveOperations()).toBe(true);
		});
	});

	describe("getHomeDirectoryFromEnv", () => {
		it("should prefer USERPROFILE on Windows", () => {
			process.env.USERPROFILE = "C:\\Users\\kai";
			process.env.HOME = "/home/kai";
			expect(getHomeDirectoryFromEnv("win32")).toBe("C:\\Users\\kai");
		});

		it("should fallback to HOME on Windows when USERPROFILE is missing", () => {
			unsetEnv("USERPROFILE");
			process.env.HOME = "/home/kai";
			expect(getHomeDirectoryFromEnv("win32")).toBe("/home/kai");
		});

		it("should prefer HOME on Unix platforms", () => {
			process.env.HOME = "/home/kai";
			process.env.USERPROFILE = "C:\\Users\\kai";
			expect(getHomeDirectoryFromEnv("linux")).toBe("/home/kai");
		});

		it("should fallback to USERPROFILE on Unix when HOME is missing", () => {
			unsetEnv("HOME");
			process.env.USERPROFILE = "C:\\Users\\kai";
			expect(getHomeDirectoryFromEnv("linux")).toBe("C:\\Users\\kai");
		});

		it("should return null when no home env vars are set", () => {
			unsetEnv("HOME");
			unsetEnv("USERPROFILE");
			expect(getHomeDirectoryFromEnv("linux")).toBeNull();
		});

		it("should trim whitespace from resolved home directory", () => {
			process.env.HOME = "  /home/kai  ";
			expect(getHomeDirectoryFromEnv("linux")).toBe("/home/kai");
		});
	});

	describe("platform detection", () => {
		describe("isMacOS", () => {
			it("should return true on darwin platform", () => {
				Object.defineProperty(process, "platform", {
					value: "darwin",
					writable: true,
				});
				expect(isMacOS()).toBe(true);
			});

			it("should return false on non-darwin platforms", () => {
				Object.defineProperty(process, "platform", {
					value: "linux",
					writable: true,
				});
				expect(isMacOS()).toBe(false);
			});
		});

		describe("isWindows", () => {
			it("should return true on win32 platform", () => {
				Object.defineProperty(process, "platform", {
					value: "win32",
					writable: true,
				});
				expect(isWindows()).toBe(true);
			});

			it("should return false on non-win32 platforms", () => {
				Object.defineProperty(process, "platform", {
					value: "linux",
					writable: true,
				});
				expect(isWindows()).toBe(false);
			});
		});

		describe("isLinux", () => {
			it("should return true on linux platform", () => {
				Object.defineProperty(process, "platform", {
					value: "linux",
					writable: true,
				});
				expect(isLinux()).toBe(true);
			});

			it("should return false on non-linux platforms", () => {
				Object.defineProperty(process, "platform", {
					value: "darwin",
					writable: true,
				});
				expect(isLinux()).toBe(false);
			});
		});
	});

	describe("getOptimalConcurrency", () => {
		// v0.1.6: bumped from 10/15/20 → 50/50/100. Modern SSDs + default ulimit
		// (10240+ on macOS) handle far more concurrent SHA-256 streams than the
		// original conservative limits. ~5x speedup on large `.claude/` trees.
		it("should return 50 for macOS", () => {
			Object.defineProperty(process, "platform", {
				value: "darwin",
				writable: true,
			});
			expect(getOptimalConcurrency()).toBe(50);
		});

		it("should return 50 for Windows", () => {
			Object.defineProperty(process, "platform", {
				value: "win32",
				writable: true,
			});
			expect(getOptimalConcurrency()).toBe(50);
		});

		it("should return 100 for Linux (higher I/O limits)", () => {
			Object.defineProperty(process, "platform", {
				value: "linux",
				writable: true,
			});
			expect(getOptimalConcurrency()).toBe(100);
		});

		it("should return 100 for unknown platforms (defaults to Linux behavior)", () => {
			Object.defineProperty(process, "platform", {
				value: "freebsd",
				writable: true,
			});
			expect(getOptimalConcurrency()).toBe(100);
		});
	});
});
