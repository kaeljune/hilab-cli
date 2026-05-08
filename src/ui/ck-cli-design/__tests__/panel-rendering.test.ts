import { describe, expect, it } from "bun:test";
import { renderPanel } from "../panel.js";
import { createCliDesignContext, stripAnsi } from "../tokens.js";

describe("renderPanel", () => {
	it("renders boxed zones on wide terminals", () => {
		const output = renderPanel({
			context: createCliDesignContext({
				columns: 72,
				env: { ...process.env, LANG: "en_US.UTF-8" },
				isTTY: true,
				platform: "darwin",
			}),
			subtitle: "Codex -> global",
			title: "hi migrate",
			zones: [
				{ label: "WHERE", lines: ["~/.agents/skills -> cd ~/.agents/skills"] },
				{ label: "WHAT", lines: ["2 skills · 1 command"] },
			],
		}).join("\n");
		const plainOutput = stripAnsi(output);

		expect(plainOutput.startsWith("╔═ hi migrate") || plainOutput.startsWith("+- hi migrate")).toBe(
			true,
		);
		expect(plainOutput).toContain("WHERE");
		expect(plainOutput).toContain("WHAT");
	});

	it("falls back to plain text on narrow terminals", () => {
		const output = renderPanel({
			context: createCliDesignContext({ columns: 48, env: process.env, isTTY: true }),
			title: "hi migrate",
			zones: [{ label: "NEXT", lines: ["hi doctor"] }],
		}).join("\n");

		expect(output).not.toContain("╔");
		expect(output).toContain("hi migrate");
		expect(output).toContain("NEXT");
	});
});
