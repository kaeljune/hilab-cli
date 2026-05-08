/**
 * Comprehensive Tests for content-transformer.ts
 *
 * Tests the transformation of slash command references when --prefix is applied.
 * Covers all edge cases users might encounter in real-world usage.
 */

import { describe, expect, it } from "bun:test";
import { transformCommandContent } from "@/services/transformers/commands-prefix/content-transformer.js";

describe("transformCommandContent", () => {
	// ============================================================================
	// SECTION 1: VALID TRANSFORMATIONS - Commands that SHOULD be transformed
	// ============================================================================

	describe("basic command transformations", () => {
		it("transforms /plan: to /hi:plan:", () => {
			const input = "Execute `/plan:fast` to create a plan";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Execute `/hi:plan:fast` to create a plan");
			expect(changes).toBe(1);
		});

		it("transforms /review: to /hi:review:", () => {
			const input = "Use `/review:codebase` for analysis";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Use `/hi:review:codebase` for analysis");
			expect(changes).toBe(1);
		});

		it("transforms /test to /hi:test", () => {
			const input = "Run `/test` to verify";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Run `/hi:test` to verify");
			expect(changes).toBe(1);
		});

		it("transforms /preview to /hi:preview", () => {
			const input = "Use `/preview` to see changes";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Use `/hi:preview` to see changes");
			expect(changes).toBe(1);
		});

		it("transforms /journal to /hi:journal", () => {
			const input = "Open `/journal` dashboard";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Open `/hi:journal` dashboard");
			expect(changes).toBe(1);
		});

		it("transforms /journal to /hi:journal", () => {
			const input = "Write with `/journal`";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Write with `/hi:journal`");
			expect(changes).toBe(1);
		});

		it("transforms /watzup to /hi:watzup", () => {
			const input = "Check `/watzup` for changes";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Check `/hi:watzup` for changes");
			expect(changes).toBe(1);
		});

		it("transforms /bootstrap to /hi:bootstrap", () => {
			const input = "Use `/bootstrap` to initialize";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Use `/hi:bootstrap` to initialize");
			expect(changes).toBe(1);
		});

		it("transforms /worktree to /hi:worktree", () => {
			const input = "Create `/worktree` for feature";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Create `/hi:worktree` for feature");
			expect(changes).toBe(1);
		});
	});

	describe("position-based transformations", () => {
		it("transforms command at start of line", () => {
			const input = "/plan:fast is the command";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("/hi:plan:fast is the command");
			expect(changes).toBe(1);
		});

		it("transforms command at end of line", () => {
			const input = "Use this command: /journal";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Use this command: /hi:journal");
			expect(changes).toBe(1);
		});

		it("transforms command after whitespace", () => {
			const input = "The planning process uses /plan:fast";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("The planning process uses /hi:plan:fast");
			expect(changes).toBe(1);
		});

		it("transforms command after tab character", () => {
			const input = "Command:\t/plan:fast";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Command:\t/hi:plan:fast");
			expect(changes).toBe(1);
		});

		it("transforms command after newline", () => {
			const input = "Instructions:\n/plan:fast to start";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Instructions:\n/hi:plan:fast to start");
			expect(changes).toBe(1);
		});

		it("transforms command inside backticks", () => {
			const input = "Run `/plan:fast` command";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Run `/hi:plan:fast` command");
			expect(changes).toBe(1);
		});

		it("transforms command inside double backticks", () => {
			const input = "Run ``/plan:fast`` command";
			const { transformed } = transformCommandContent(input);
			expect(transformed).toContain("/hi:plan:fast");
		});

		it("transforms command that is only content", () => {
			const input = "/journal";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("/hi:journal");
			expect(changes).toBe(1);
		});

		it("transforms command with subcommand that is only content", () => {
			const input = "/plan:fast";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("/hi:plan:fast");
			expect(changes).toBe(1);
		});
	});

	describe("multiple transformations", () => {
		it("transforms multiple commands in same content", () => {
			const input = "Use `/plan:fast` then `/review:codebase` then `/test`";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Use `/hi:plan:fast` then `/hi:review:codebase` then `/hi:test`");
			expect(changes).toBe(3);
		});

		it("transforms commands across multiple lines", () => {
			const input = `1. Run /plan:hard
2. Execute /bootstrap
3. Verify with /review:codebase`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(`1. Run /hi:plan:hard
2. Execute /hi:bootstrap
3. Verify with /hi:review:codebase`);
			expect(changes).toBe(3);
		});

		it("transforms mixed commands with and without subcommands", () => {
			const input = "Run /watzup then /plan:fast then /journal";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Run /hi:watzup then /hi:plan:fast then /hi:journal");
			expect(changes).toBe(3);
		});

		it("transforms many commands in paragraph", () => {
			const input =
				"Start with /watzup to explore, then /plan:fast to create plan, /bootstrap to init, /test for errors, and /review:codebase to verify";
			const { transformed, changes } = transformCommandContent(input);
			expect(changes).toBe(5);
			expect(transformed).toContain("/hi:watzup");
			expect(transformed).toContain("/hi:plan:fast");
			expect(transformed).toContain("/hi:bootstrap");
			expect(transformed).toContain("/hi:test");
			expect(transformed).toContain("/hi:review:codebase");
		});
	});

	describe("markdown context transformations", () => {
		it("transforms commands in markdown lists", () => {
			const input = `- /plan:fast for quick planning
- /plan:hard for thorough planning`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(`- /hi:plan:fast for quick planning
- /hi:plan:hard for thorough planning`);
			expect(changes).toBe(2);
		});

		it("transforms commands in numbered lists", () => {
			const input = `1. /plan:fast
2. /review:codebase
3. /bootstrap`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(`1. /hi:plan:fast
2. /hi:review:codebase
3. /hi:bootstrap`);
			expect(changes).toBe(3);
		});

		it("transforms commands in markdown headers", () => {
			const input = "## Using /plan:fast\n\nThis command...";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("## Using /hi:plan:fast\n\nThis command...");
			expect(changes).toBe(1);
		});

		it("transforms commands in bold text", () => {
			const input = "**Important:** Use `/plan:hard` for complex issues";
			const { transformed } = transformCommandContent(input);
			expect(transformed).toBe("**Important:** Use `/hi:plan:hard` for complex issues");
		});

		it("transforms commands in italic text", () => {
			const input = "*Try `/journal` first*";
			const { transformed } = transformCommandContent(input);
			expect(transformed).toBe("*Try `/hi:journal` first*");
		});

		it("transforms commands after markdown link syntax", () => {
			const input = "[docs](link) then /plan:fast";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("[docs](link) then /hi:plan:fast");
			expect(changes).toBe(1);
		});

		it("transforms commands in blockquotes", () => {
			const input = "> Use /plan:fast for quick results";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("> Use /hi:plan:fast for quick results");
			expect(changes).toBe(1);
		});
	});

	describe("real-world markdown content examples", () => {
		it("transforms markdown file content", () => {
			const input = `## Workflow

- Decide to use \`/plan:fast\` or \`/plan:hard\` SlashCommands based on the complexity.
- Execute SlashCommand: \`/plan:fast <detailed-instructions-prompt>\` or \`/plan:hard <detailed-instructions-prompt>\``;

			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toContain("/hi:plan:fast");
			expect(transformed).toContain("/hi:plan:hard");
			expect(changes).toBe(4);
		});

		it("transforms agent definition content", () => {
			const input =
				"Use the **Skill tool** to invoke `/plan:fast` or `/plan:hard` SlashCommand based on complexity.";

			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(
				"Use the **Skill tool** to invoke `/hi:plan:fast` or `/hi:plan:hard` SlashCommand based on complexity.",
			);
			expect(changes).toBe(2);
		});

		it("transforms README workflow section", () => {
			const input = `## Quick Start

1. Run \`/watzup\` to check status
2. Use \`/plan:fast\` for simple tasks or \`/plan:hard\` for complex ones
3. Execute \`/bootstrap\` to initialize
4. Review with \`/review:codebase\``;

			const { transformed, changes } = transformCommandContent(input);
			expect(changes).toBe(5);
			expect(transformed).toContain("/hi:watzup");
			expect(transformed).toContain("/hi:plan:fast");
			expect(transformed).toContain("/hi:plan:hard");
			expect(transformed).toContain("/hi:bootstrap");
			expect(transformed).toContain("/hi:review:codebase");
		});

		it("transforms YAML command description", () => {
			const input = `commands:
  - name: /plan:fast
    description: Quick planning command`;

			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toContain("/hi:plan:fast");
			expect(changes).toBe(1);
		});
	});

	// ============================================================================
	// SECTION 2: FALSE POSITIVES - Content that should NOT be transformed
	// ============================================================================

	describe("file paths - should NOT transform", () => {
		it("does not transform relative file paths with ./", () => {
			const input = `with patch("builtins.input", side_effect=["3", "./test.db"]):`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform relative paths with ../", () => {
			const input = "Load from ../code/something or ../fix/here";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform absolute Unix paths", () => {
			const input = "File at /home/user/test or /var/log/debug";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform paths with extensions", () => {
			const input = "Open /path/to/code.ts or /data/test.json";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform Windows-style paths in strings", () => {
			const input = 'const path = "C:\\Users\\test\\code";';
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform node_modules paths", () => {
			const input = "import from /node_modules/test/index.js";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});
	});

	describe("HTML/XML tags - should NOT transform", () => {
		it("does not transform HTML closing tags", () => {
			const input = `<code class="font-mono">Code block</code>`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform self-closing tags", () => {
			const input = "<test/>";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform closing tags with attributes", () => {
			const input = '</div class="test">';
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform JSX closing tags", () => {
			const input = "return <Preview />;";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		// NOTE: SVG path data with space before command-like patterns WILL be transformed
		// This is a known limitation - `/test` after whitespace in SVG is indistinguishable
		// from valid documentation. This edge case is rare in practice.
		it("transforms SVG paths with space-preceded command patterns (known limitation)", () => {
			const input = '<path d="M10 10 /test 20 20" />';
			const { changes } = transformCommandContent(input);
			// This transforms because space precedes /test - acceptable trade-off
			expect(changes).toBe(1);
		});
	});

	describe("string literals - should NOT transform", () => {
		it("does not transform single-quoted string literals", () => {
			const input = `const backUrl = options.dashboardUrl || '/journal';`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform double-quoted string literals", () => {
			const input = `const url = "/journal";`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform template literal URL paths", () => {
			const input = "const urlPath = `/journal?dir=${encodeURIComponent(plansDir)}`;";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform JSON string values", () => {
			const input = '{"route": "/journal", "path": "/preview"}';
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform Python string literals", () => {
			const input = `redirect_url = '/journal'`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});
	});

	describe("URL patterns - should NOT transform", () => {
		it("does not transform URLs containing command-like paths", () => {
			const input = "Visit https://example.com/plan:something";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform URL query parameters", () => {
			const input = "Navigate to /preview?id=123&mode=edit";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform API routes", () => {
			const input = "const route = '/api/journal/tasks';";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform API versioned routes", () => {
			const input = "endpoint: /v1/test/results";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform URL fragments", () => {
			const input = "Link to page#/journal section";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform localhost URLs", () => {
			const input = "http://localhost:3000/journal";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform URL with port and path", () => {
			const input = "Server at http://127.0.0.1:8080/preview/index.html";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});
	});

	describe("already prefixed commands - should NOT transform", () => {
		it("does not transform already-prefixed commands", () => {
			const input = "Use `/hi:plan:fast` (already prefixed)";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not double-transform commands", () => {
			const input = "/hi:plan:fast";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform already-prefixed commands without subcommand", () => {
			const input = "Run `/hi:brainstorm` first";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});
	});

	describe("skill references - should NOT transform", () => {
		it("does not transform /cook (skill, not command)", () => {
			const input = "Run `/cook` to implement";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform /cook:auto (skill subcommand)", () => {
			const input = "Try `/cook:auto` for quick implementation";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform /fix (skill, not command)", () => {
			const input = "Use `/fix:types` for TypeScript errors";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform /brainstorm (skill, not command)", () => {
			const input = "Start with `/brainstorm` to explore options";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform /scout (skill, not command)", () => {
			const input = "Use `/scout` to find files";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform /debug (skill, not command)", () => {
			const input = "Use `/debug` for more info";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform /code (removed command)", () => {
			const input = "Run `/code:auto` to implement";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform /integrate (removed command)", () => {
			const input = "Run `/integrate` to connect";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform /kanban (retired command — engineer#711)", () => {
			const input = "Use `/kanban` to view tasks";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});
	});

	describe("code patterns - should NOT transform", () => {
		it("does not transform partial matches in middle of words", () => {
			const input = "This is someplan:thing";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform regex patterns", () => {
			const input = "const regex = /test/g;";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform regex with flags", () => {
			const input = "pattern.match(/code/gi)";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform division operations", () => {
			const input = "result = total/plan";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform import paths", () => {
			const input = 'import { test } from "@/services/test";';
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform require paths", () => {
			const input = "const preview = require('./preview');";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform CSS selectors", () => {
			const input = ".container/preview { display: flex; }";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform object property access", () => {
			const input = "const val = obj.test/fix;";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});
	});

	describe("real-world code examples - should NOT transform", () => {
		it("does not transform Express route handlers", () => {
			const input = `app.get('/journal', (req, res) => {
  res.render('journal');
});`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform React Router paths", () => {
			const input = `<Route path="/preview" element={<Preview />} />`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform Next.js API routes", () => {
			const input = `// pages/api/test.ts
export default function handler(req, res) {}`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform fetch calls", () => {
			const input = `const response = await fetch('/api/journal/tasks');`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform axios calls", () => {
			const input = `axios.get('/preview/data').then(res => console.log(res));`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform redirect calls", () => {
			const input = `router.push('/journal');`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform navigation links", () => {
			const input = `<a href="/preview">Preview</a>`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform form action attributes", () => {
			const input = `<form action="/test/submit" method="POST">`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform Python mock patches", () => {
			const input = `with patch("builtins.input", side_effect=["3", "./test.db"]):`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform database paths", () => {
			const input = `const dbPath = './data/test.db';`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});
	});

	describe("HTTP server URL patterns - should NOT transform", () => {
		it("does not transform URL path assignments", () => {
			const input = `const backUrl = options.dashboardUrl || '/journal';`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform template literal URLs", () => {
			const input = "const urlPath = `/journal?dir=${encodeURIComponent(plansDir)}`;";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform URL building", () => {
			const input = `url = base + '/preview/' + id;`;
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("does not transform URL patterns in comments", () => {
			const input = "// Navigate to /journal?filter=active";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});
	});

	// ============================================================================
	// SECTION 3: EDGE CASES AND BOUNDARY CONDITIONS
	// ============================================================================

	describe("boundary conditions", () => {
		it("returns 0 changes for content without commands", () => {
			const input = "This is regular content without any slash commands";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("returns 0 changes for empty content", () => {
			const input = "";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("");
			expect(changes).toBe(0);
		});

		it("handles content with only whitespace", () => {
			const input = "   \n\t\n   ";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe(input);
			expect(changes).toBe(0);
		});

		it("handles very long content with many commands", () => {
			const commands = Array(100).fill("/plan:fast").join(" ");
			const { changes } = transformCommandContent(commands);
			expect(changes).toBe(100);
		});

		it("handles unicode content around commands", () => {
			const input = "使用 `/plan:fast` 进行规划";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("使用 `/hi:plan:fast` 进行规划");
			expect(changes).toBe(1);
		});

		it("handles emoji around commands", () => {
			const input = "🚀 Run /plan:fast 🎉";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("🚀 Run /hi:plan:fast 🎉");
			expect(changes).toBe(1);
		});
	});

	describe("mixed content scenarios", () => {
		it("transforms only valid commands in mixed content", () => {
			const input = `Documentation: use /plan:fast here.
Code: const url = '/journal';
More docs: try /watzup next.`;
			const { transformed, changes } = transformCommandContent(input);
			expect(changes).toBe(2);
			expect(transformed).toContain("/hi:plan:fast");
			expect(transformed).toContain("/hi:watzup");
			expect(transformed).toContain("'/journal'"); // unchanged
		});

		it("handles markdown with embedded code blocks", () => {
			const input = `## Usage

Use \`/plan:fast\` to start.

\`\`\`javascript
const route = '/journal';
\`\`\`

Then run /watzup for status.`;
			const { transformed, changes } = transformCommandContent(input);
			expect(changes).toBe(2);
			expect(transformed).toContain("/hi:plan:fast");
			expect(transformed).toContain("/hi:watzup");
			expect(transformed).toContain("'/journal'"); // unchanged in code block
		});

		it("handles YAML with mixed command references", () => {
			const input = `name: workflow
commands:
  - /plan:fast
  - /bootstrap
routes:
  dashboard: '/journal'
  preview: '/preview'`;
			const { transformed, changes } = transformCommandContent(input);
			expect(changes).toBe(2);
			expect(transformed).toContain("/hi:plan:fast");
			expect(transformed).toContain("/hi:bootstrap");
			expect(transformed).toContain("'/journal'"); // unchanged
			expect(transformed).toContain("'/preview'"); // unchanged
		});
	});

	describe("special characters and escaping", () => {
		it("handles commands followed by special characters", () => {
			const input = "/brainstorm!";
			const { changes } = transformCommandContent(input);
			// Should not transform - ! is not a valid terminator
			expect(changes).toBe(0);
		});

		it("handles commands in parentheses", () => {
			const input = "(use /plan:fast)";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("(use /hi:plan:fast)");
			expect(changes).toBe(1);
		});

		it("handles commands in square brackets", () => {
			const input = "[see /journal]";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("[see /hi:journal]");
			expect(changes).toBe(1);
		});

		it("handles commands with trailing punctuation in markdown", () => {
			const input = "Run `/plan:fast`.";
			const { transformed, changes } = transformCommandContent(input);
			expect(transformed).toBe("Run `/hi:plan:fast`.");
			expect(changes).toBe(1);
		});
	});

	describe("context preservation", () => {
		it("preserves backtick wrapping", () => {
			const input = "Run ``/plan:fast`` command";
			const { transformed } = transformCommandContent(input);
			expect(transformed).toContain("/hi:plan:fast");
		});

		it("preserves markdown formatting", () => {
			const input = "**Important:** Use `/plan:hard` for complex issues";
			const { transformed } = transformCommandContent(input);
			expect(transformed).toBe("**Important:** Use `/hi:plan:hard` for complex issues");
		});

		it("preserves line structure", () => {
			const input = `Line 1: /plan:fast
Line 2: /review:codebase
Line 3: /bootstrap`;
			const { transformed } = transformCommandContent(input);
			const lines = transformed.split("\n");
			expect(lines).toHaveLength(3);
			expect(lines[0]).toContain("/hi:plan:fast");
			expect(lines[1]).toContain("/hi:review:codebase");
			expect(lines[2]).toContain("/hi:bootstrap");
		});

		it("preserves indentation", () => {
			const input = `  - /plan:fast
    - /review:codebase`;
			const { transformed } = transformCommandContent(input);
			expect(transformed).toBe(`  - /hi:plan:fast
    - /hi:review:codebase`);
		});
	});
});
