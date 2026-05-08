# HiLab CLI Reference

Complete reference for all `hi` commands, auto-generated from the help registry.

## Table of Contents

- [hi agents](#hi-agents)
- [hi backups](#hi-backups)
- [hi commands](#hi-commands)
- [hi config](#hi-config)
- [hi doctor](#hi-doctor)
- [hi init](#hi-init)
- [hi migrate](#hi-migrate)
- [hi new](#hi-new)
- [hi plan](#hi-plan)
- [hi projects](#hi-projects)
- [hi setup](#hi-setup)
- [hi skills](#hi-skills)
- [hi uninstall](#hi-uninstall)
- [hi update](#hi-update)
- [hi versions](#hi-versions)

## hi agents

Install, uninstall, and manage Claude Code agents across providers

**Usage:** `hi agents [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `-l, --list` | List available agents from source | — |
| `--installed` | When used with --list, show installed agents instead | — |
| `-u, --uninstall` | Uninstall agent(s) from providers | — |
| `--sync` | Sync registry with filesystem (clean orphaned entries) | — |
| `-n, --name <agent>` | Agent name to install or uninstall | — |
| `-a, --agent <provider>` | Target provider(s), can be specified multiple times | — |
| `-g, --global` | Install globally instead of project-level | — |
| `--all` | Install to all supported providers | — |
| `-y, --yes` | Skip confirmation prompts | — |
| `--force` | Force uninstall even if not tracked in registry | — |

**Examples:**

- `hi agents --name maintainer --agent codex` — Install one agent to Codex
- `hi agents --list --installed` — Show installed agents and locations


## hi backups

List, restore, and prune HiLab recovery backups

**Usage:** `hi backups <list|restore|prune> [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `list [--limit <n>] [--json]` | List recovery backups under ~/.hilab/backups/ | — |
| `restore <id> [--yes] [--json]` | Restore a specific recovery backup to its original source root | — |
| `prune [id] [--keep <n> \| --all] [--yes] [--json]` | Delete one, many, or old recovery backups | — |
| `--limit <n>` | Show only the newest N backups | — |
| `--keep <n>` | Keep the newest N backups when pruning | — |
| `--all` | Delete all recovery backups | — |
| `-y, --yes` | Skip confirmation prompts | — |
| `--json` | Output machine-readable JSON | — |

**Examples:**

- `hi backups list --limit 5` — Show the newest five recovery backups
- `hi backups restore 2026-04-06T21-53-01-706-byrf --yes` — Restore a specific recovery backup without prompting

**Backup Scope:**

These backups contain only the HiLab-managed files targeted by destructive operations, not the full ~/.claude/ directory.

**Automatic Retention:**

HiLab keeps the newest recovery backups automatically and prunes older ones after successful destructive operations.

### list

List recovery backups under ~/.hilab/backups/

**Usage:** `hi backups list [--limit <n>] [--json]`

### restore

Restore a specific recovery backup to its original source root

**Usage:** `hi backups restore <id> [--yes] [--json]`

### prune

Delete one, many, or old recovery backups

**Usage:** `hi backups prune [id] [--keep <n> | --all] [--yes] [--json]`


## hi commands

Install, uninstall, and manage Claude commands across providers

**Usage:** `hi commands [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `-l, --list` | List available commands from source | — |
| `--installed` | When used with --list, show installed commands instead | — |
| `-u, --uninstall` | Uninstall command(s) from providers | — |
| `--sync` | Sync registry with filesystem (clean orphaned entries) | — |
| `-n, --name <command>` | Command name to install or uninstall | — |
| `-a, --agent <provider>` | Target provider(s), can be specified multiple times | — |
| `-g, --global` | Install globally instead of project-level | — |
| `--all` | Install to all supported providers | — |
| `-y, --yes` | Skip confirmation prompts | — |
| `--force` | Force uninstall even if not tracked in registry | — |

**Examples:**

- `hi commands --name plan --agent codex` — Install one slash command to Codex
- `hi commands --list` — List available commands from source


## hi config

Manage HiLab configuration and launch the config dashboard

**Usage:** `hi config [action] [key] [value] [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `ui` | Launch config dashboard (default action when omitted) | — |
| `get <key>` | Read a config value | — |
| `set <key> <value>` | Write a config value | — |
| `show` | Print merged config | — |
| `-g, --global` | Use global config (~/.hilab/config.json) | — |
| `-l, --local` | Use local config (.claude/.hi.json) | — |
| `--port <port>` | Port for dashboard server | — |
| `--host <host>` | Bind dashboard host (default: 127.0.0.1) | — |
| `--no-open` | Do not auto-open browser when launching dashboard | — |
| `--dev` | Run dashboard in development mode with HMR | — |
| `--json` | Output machine-readable JSON for CLI actions | — |

**Examples:**

- `hi config` — Launch the web dashboard (same as 'hi config ui')
- `hi config --host 0.0.0.0 --no-open` — Expose the dashboard to your network intentionally
- `hi config set defaults.kit engineer` — Set a config value from the CLI

**Notes:**

Run 'hi config --help' to see both CLI actions and dashboard flags. Running bare 'hi config' opens the dashboard directly. Use '--host' to expose the dashboard intentionally beyond localhost.

### ui

Launch config dashboard (default action when omitted)

**Usage:** `hi config ui [--port <port>] [--host <host>] [--no-open] [--dev]`

### get

Read a config value

**Usage:** `hi config get <key> [-g | -l] [--json]`

### set

Write a config value

**Usage:** `hi config set <key> <value> [-g | -l]`

### show

Print merged config

**Usage:** `hi config show [-g | -l] [--json]`


## hi doctor

Comprehensive health check for HiLab

**Usage:** `hi doctor [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--report` | Generate shareable diagnostic report | — |
| `--fix` | Auto-fix all fixable issues | — |
| `--check-only` | CI mode: no prompts, exit 1 on failures | — |
| `--full` | Include extended priority checks (slower but more thorough) | — |
| `--json` | Output JSON format | — |

**Examples:**

- `hi doctor` — Run full health check interactively
- `hi doctor --fix` — Auto-fix all fixable issues
- `hi doctor --check-only` — CI mode: exit 1 on failures, no prompts


## hi init

Initialize or update HiLab project (with interactive version selection)

**Usage:** `hi init [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `-y, --yes` | Non-interactive mode with sensible defaults (kit: engineer, dir: ., version: latest) | — |
| `--use-git` | Use git clone instead of GitHub API (uses SSH/HTTPS credentials) | — |
| `--sync` | Sync config files from upstream with interactive hunk-by-hunk merge | — |
| `--archive <path>` | Use local archive file instead of downloading (zip/tar.gz) | — |
| `--kit-path <path>` | Use local kit directory instead of downloading | — |
| `--dir <directory>` | Target directory to initialize/update | `.` |
| `--kit <kit>` | Kit to use (engineer, marketing) | — |
| `-r, --release <version>` | Skip version selection, use specific version | — |
| `-g, --global` | Use platform-specific user configuration directory | — |
| `--fresh` | Full reset: remove CK files, replace settings.json and CLAUDE.md, reinstall from scratch | — |
| `--force` | Force reinstall even if already at latest version (use with --yes; re-onboards missing files without full reset) | — |
| `--exclude <pattern>` | Exclude files matching glob pattern (can be used multiple times) | — |
| `--only <pattern>` | Include only files matching glob pattern (can be used multiple times) | — |
| `--beta` | Show beta versions in selection prompt | — |
| `--refresh` | Bypass release cache to fetch latest versions from GitHub | — |
| `--install-skills` | Install skills dependencies (non-interactive mode) | — |
| `--with-sudo` | Include system packages requiring sudo (Linux: ffmpeg, imagemagick) | — |
| `--prefix` | Add /hi: prefix to all slash commands | — |
| `--skip-setup` | Skip interactive configuration wizard | — |
| `--dry-run` | Preview changes without applying them (requires --prefix) | — |
| `--force-overwrite` | Override ownership protections and delete user-modified files | — |
| `--force-overwrite-settings` | Fully replace settings.json instead of selective merge | — |
| `--docs-dir <name>` | Custom docs folder name to avoid conflicts with existing folders | `docs` |
| `--plans-dir <name>` | Custom plans folder name to avoid conflicts with existing folders | `plans` |

**Examples:**

- `hi init --kit engineer` — Update local project with latest engineer kit
- `hi init --use-git --release v2.1.0 -y` — Non-interactive with git clone (no GitHub API needed)


## hi migrate

Migrate Claude Code agents, commands, skills, config, rules, and hooks to other providers

**Usage:** `hi migrate [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--install` | Opt-in install picker mode — interactively select which items to install (default when registry is empty or has unknown checksums) | — |
| `--reconcile` | Force reconcile mode — compute diff vs registry and apply only changes (default when registry is valid) | — |
| `--reinstall-empty-dirs` | Reinstall all items when their type directory is empty or missing (default: true). Use --respect-deletions to disable. | — |
| `--respect-deletions` | Preserve deletion even when a type directory is empty — skip reinstall heuristic. Mutually exclusive with --reinstall-empty-dirs. | — |
| `-a, --agent <provider>` | Target provider(s), can be specified multiple times | — |
| `--all` | Migrate to all supported providers | — |
| `-g, --global` | Install globally instead of the default project-level scope | — |
| `-y, --yes` | Skip confirmation prompts after the pre-flight summary | — |
| `-f, --force` | Force reinstall deleted or edited managed items | — |
| `--dry-run` | Preview plan, destinations, and next steps without writing files | — |
| `--only-agents` | Migrate agents only | — |
| `--only-commands` | Migrate commands only | — |
| `--only-skills` | Migrate skills only | — |
| `--config` | Migrate CLAUDE.md config only | — |
| `--rules` | Migrate .claude/rules only | — |
| `--hooks` | Migrate .claude/hooks only | — |
| `--skip-agents` | Skip agents migration | — |
| `--skip-commands` | Skip commands migration | — |
| `--skip-skills` | Skip skills migration (preserve symlinks/custom layouts) | — |
| `--skip-config` | Skip config migration | — |
| `--skip-rules` | Skip rules migration | — |
| `--skip-hooks` | Skip hooks migration | — |
| `--source <path>` | Custom CLAUDE.md source path | — |

**Examples:**

- `hi migrate --install` — Pick items to install interactively (install picker mode)
- `hi migrate --agent codex --dry-run` — Preview the destination-aware reconcile plan before writing files
- `hi migrate --respect-deletions` — Preserve empty directories — do not auto-reinstall deleted items

**Gotchas:**

  --install and --reconcile are mutually exclusive — pass only one
  --reinstall-empty-dirs and --respect-deletions are mutually exclusive — pass only one
  Default mode is smart-detected: no/stale registry → install, valid registry → reconcile
  --respect-deletions disables the auto-reinstall heuristic for empty directories
  --force overrides skip decisions per item; --reinstall-empty-dirs is a per-directory heuristic


## hi new

Bootstrap a new HiLab project (with interactive version selection)

**Usage:** `hi new [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `-y, --yes` | Non-interactive mode (skip all prompts) | — |
| `--use-git` | Use git clone instead of GitHub API (uses SSH/HTTPS credentials) | — |
| `--archive <path>` | Use local archive file instead of downloading (zip/tar.gz) | — |
| `--kit-path <path>` | Use local kit directory instead of downloading | — |
| `--dir <directory>` | Target directory for the new project | `.` |
| `--kit <kit>` | Kit to use (engineer, marketing) | — |
| `-r, --release <version>` | Skip version selection, use specific version (e.g., latest, v1.0.0) | — |
| `--force` | Overwrite existing files without confirmation | — |
| `--exclude <pattern>` | Exclude files matching glob pattern (can be used multiple times) | — |
| `--beta` | Show beta versions in selection prompt | — |
| `--refresh` | Bypass release cache to fetch latest versions from GitHub | — |
| `--opencode` | Install OpenCode CLI package (non-interactive mode) | — |
| `--gemini` | Install Google Gemini CLI package (non-interactive mode) | — |
| `--install-skills` | Install skills dependencies (non-interactive mode) | — |
| `--with-sudo` | Include system packages requiring sudo (Linux: ffmpeg, imagemagick) | — |
| `--prefix` | Add /hi: prefix to all slash commands | — |
| `--docs-dir <name>` | Custom docs folder name to avoid conflicts with existing folders | `docs` |
| `--plans-dir <name>` | Custom plans folder name to avoid conflicts with existing folders | `plans` |

**Examples:**

- `hi new --kit engineer --dir ./my-project` — Create engineer kit project in specific directory
- `hi new -y --use-git --release v2.1.0` — Non-interactive with git clone (no GitHub API needed)


## hi plan

Plan management: parse, validate, status, kanban, create, check, uncheck, add-phase

**Usage:** `hi plan [action] [target] [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--json` | Output in JSON format | — |
| `--strict` | Strict validation mode (validate action) | — |
| `-g, --global` | Use global plans scope (~/.claude/plans or configured global root) | — |

**Examples:**

- `hi plan status` — Show progress summary for all plans in the current project
- `hi plan create --title 'Auth feature' --phases setup,api,ui` — Scaffold a new plan directory with three phases

### parse

Parse a plan.md and output an ASCII table or JSON of all phases

**Usage:** `hi plan parse [target] [--json]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--json` | Output machine-readable JSON | — |

### validate

Validate plan.md syntax and structure

**Usage:** `hi plan validate [target] [--strict] [--json]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--strict` | Fail on warnings in addition to errors | — |
| `--json` | Output results as JSON | — |

### status

Show progress for plans in scope

**Usage:** `hi plan status [--json] [-g]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--json` | Output in JSON format | — |
| `-g, --global` | Show status for global plans scope | — |

### kanban

Launch interactive Kanban dashboard in the browser

**Usage:** `hi plan kanban [--port <port>] [--no-open] [--dev]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--port <port>` | Port to serve the Kanban dashboard on | — |
| `--no-open` | Do not auto-open the browser | — |
| `--dev` | Start dashboard in development mode | — |

### create

Scaffold a new plan directory with phase files

**Usage:** `hi plan create [--title <title>] [--phases <phases>] [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--title <title>` | Plan title | — |
| `--phases <phases>` | Comma-separated list of phase names | — |
| `--dir <dir>` | Plan output directory | — |
| `--priority <priority>` | Priority level: P1, P2, or P3 | — |
| `--issue <issue>` | GitHub issue number to link | — |
| `--source <source>` | Creation source: skill \| cli \| dashboard | — |
| `--session-id <id>` | Claude session ID for tracking | — |
| `-g, --global` | Create plan in global plans scope | — |

### check

Mark a phase as completed (or in-progress with --start)

**Usage:** `hi plan check <id> [--start]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--start` | Mark phase as in-progress instead of completed | — |

### uncheck

Reset a phase back to pending status

**Usage:** `hi plan uncheck <id>`

### add-phase

Append a new phase to an existing plan

**Usage:** `hi plan add-phase [target] [--after <id>]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--after <after>` | Insert the new phase after this phase ID | — |


## hi projects

Manage local HiLab project registry entries

**Usage:** `hi projects <subcommand> [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `list \| ls` | List projects in registry | — |
| `add <path>` | Add project path to registry | — |
| `remove [alias] \| rm [alias]` | Remove project by alias or ID | — |
| `--json` | Output in JSON format | — |
| `--pinned` | Filter to pinned projects only | — |
| `--alias <alias>` | Custom alias for project (add) | — |
| `--pinned` | Pin this project (add) | — |
| `--tags <tags>` | Comma-separated tags (add) | — |
| `--id <id>` | Remove by project ID (remove) | — |

**Examples:**

- `hi projects list --pinned` — Show only pinned projects
- `hi projects add . --alias engine --pinned` — Add current directory with an alias and pin it

### list

List projects in registry

**Usage:** `hi projects list [--json] [--pinned]`

### add

Add project path to registry

**Usage:** `hi projects add <path> [--alias <alias>] [--pinned] [--tags <tags>]`

### remove

Remove project by alias or ID

**Usage:** `hi projects remove [alias] [--id <id>]`


## hi setup

Run guided setup for provider API keys, preferred image provider, and optional packages

**Usage:** `hi setup [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--global` | Configure in global Claude directory (~/.claude/) | — |
| `--skip-packages` | Skip optional package installation | — |
| `--dir <dir>` | Target directory for setup | `current directory` |

**Examples:**

- `hi setup` — Run setup wizard in current project
- `hi setup --global` — Configure global provider keys and a preferred image-generation path
- `hi setup --global --skip-packages` — Configure global setup without package installation


## hi skills

Install, uninstall, and manage HiLab skills across coding agents

**Usage:** `hi skills [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `-l, --list` | List available skills from HiLab source | — |
| `--installed` | When used with --list, show installed skills instead | — |
| `-u, --uninstall` | Uninstall skill(s) from agent(s) | — |
| `--sync` | Sync registry with filesystem (clean orphaned entries) | — |
| `-n, --name <skill>` | Skill name to install or uninstall | — |
| `-a, --agent <agent>` | Target agent(s) - can be specified multiple times. Valid: claude-code, cursor, codex, opencode, goose, gemini-cli, antigravity, github-copilot, amp, kilo, roo, windsurf, cline, openhands | — |
| `-g, --global` | Install to user's home directory (available across projects) | — |
| `--all` | Install to all supported agents | — |
| `-y, --yes` | Non-interactive mode (skip confirmations) | — |
| `--catalog` | Show skill catalog stats and metadata | — |
| `--regenerate` | Force regenerate catalog (use with --catalog) | — |
| `--search <query>` | BM25 full-text search over skill catalog | — |
| `--json` | Output search results as JSON (use with --search) | — |
| `--limit <n>` | Max search results, default 10 (use with --search) | — |
| `--validate` | Validate SKILL.md frontmatter fields | — |
| `-f, --force` | Force uninstall even if skill not in registry (requires --agent) | — |

**Examples:**

- `hi skills --name frontend-design --agent claude-code -g` — Install skill to Claude Code globally
- `hi skills --list --installed` — Show all installed skills with their locations

**Supported Agents:**

  claude-code     Claude Code CLI
  cursor          Cursor IDE
  codex           Codex CLI
  opencode        OpenCode
  goose           Goose AI
  gemini-cli      Gemini CLI
  antigravity     Antigravity Agent
  github-copilot  GitHub Copilot
  amp             Amp
  kilo            Kilo Code
  roo             Roo Code
  windsurf        Windsurf IDE
  cline           Cline
  openhands       OpenHands

**Notes:**

  • Skills are installed from ~/.claude/skills (HiLab Engineer source)
  • OpenCode reuses Claude-compatible skill roots (.claude/skills, ~/.claude/skills), so installs may be a no-op
  • Registry stored at ~/.hilab/skill-registry.json
  • Target paths vary by agent; some agents intentionally share a common skills directory


## hi uninstall

Remove HiLab installations (ownership-aware)

**Usage:** `hi uninstall [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `-l, --local` | Uninstall only local installation (current project) | — |
| `-g, --global` | Uninstall only global installation (~/.claude/) | — |
| `-A, --all` | Uninstall from both local and global locations | — |
| `-k, --kit <type>` | Uninstall specific kit only (engineer, marketing) | — |
| `--dry-run` | Preview what would be removed without deleting | — |
| `--force-overwrite` | Delete even user-modified files (requires confirmation) | — |
| `-y, --yes` | Skip confirmation prompt | — |

**Examples:**

- `hi uninstall --local --yes` — Remove local installation without confirmation
- `hi uninstall --dry-run` — Preview what would be removed without deleting

**Ownership-Aware Uninstall:**

Uninstall preserves user customizations by default. Only CK-installed files that haven't been modified are removed. User-created files and modified files are preserved unless --force-overwrite is used.


## hi update

Update HiLab CLI tool only (not kit content)

**Usage:** `hi update [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `-r, --release <version>` | Update to a specific version | — |
| `--check` | Check for updates without installing | — |
| `-y, --yes` | Skip all confirmation prompts (CLI and kit content update) | — |
| `-d, --dev` | Update to the latest dev version | — |
| `--registry <url>` | Custom npm registry URL | — |
| `--beta` | (deprecated) Alias for --dev; use -d, --dev instead | — |
| `--kit <kit>` | This option is no longer supported with 'hi update' | — |
| `-g, --global` | This option is no longer supported with 'hi update' | — |

**Examples:**

- `hi update --check` — Check for CLI updates without installing
- `hi update --dev --yes` — Update to latest dev version without confirmation

**Note:**

'hi update' updates the CLI tool only and defaults to the latest stable release. Use '--beta' to opt into prerelease CLI builds. To update kit content (skills, commands, rules), use 'hi init' for local or 'hi init -g' for global. Use --yes to skip all prompts (both CLI and kit content update) for non-interactive/CI usage.


## hi versions

List available versions of HiLab repositories

**Usage:** `hi versions [options]`

**Options:**

| Flag | Description | Default |
|------|-------------|----------|
| `--kit <kit>` | Filter by specific kit (engineer, marketing) | — |
| `--limit <number>` | Number of releases to show | `30` |
| `--all` | Show all releases including prereleases | — |

**Examples:**

- `hi versions --kit engineer --limit 10` — Show latest 10 versions of engineer kit
- `hi versions --all` — Show all releases including prereleases


<!-- generated: 2026-05-08T05:08:48.078Z -->