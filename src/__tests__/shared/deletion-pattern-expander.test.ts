import { describe, expect, it } from "bun:test";
import { expandDeletionPatterns } from "@/shared/deletion-pattern-expander.js";

describe("expandDeletionPatterns", () => {
	it("returns original patterns when kit type is not provided", () => {
		const patterns = ["commands/ask.md", "skills/ask/**"];
		expect(expandDeletionPatterns(patterns)).toEqual(patterns);
	});

	it("expands engineer command deletions to legacy hi-prefixed paths", () => {
		expect(expandDeletionPatterns(["commands/ask.md"], "engineer")).toEqual([
			"commands/ask.md",
			"commands/hi/ask.md",
		]);
	});

	it("expands engineer command glob deletions to legacy hi-prefixed paths", () => {
		expect(expandDeletionPatterns(["commands/plan/**"], "engineer")).toEqual([
			"commands/plan/**",
			"commands/hi/plan/**",
		]);
	});

	it("does not expand already prefixed command deletions", () => {
		expect(expandDeletionPatterns(["commands/hi/ask.md"], "engineer")).toEqual([
			"commands/hi/ask.md",
		]);
	});

	it("does not expand paths that are already prefixed for another known kit", () => {
		expect(expandDeletionPatterns(["commands/mkt/email.md"], "engineer")).toEqual([
			"commands/mkt/email.md",
		]);
	});

	it("does not expand non-command deletions", () => {
		expect(expandDeletionPatterns(["skills/ask/**", "hooks/foo.cjs"], "engineer")).toEqual([
			"skills/ask/**",
			"hooks/foo.cjs",
		]);
	});

	it("expands marketing command deletions to legacy mkt-prefixed paths", () => {
		expect(expandDeletionPatterns(["commands/email.md"], "marketing")).toEqual([
			"commands/email.md",
			"commands/mkt/email.md",
		]);
	});
});
