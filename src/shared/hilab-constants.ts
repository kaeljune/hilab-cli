/**
 * HiLab-wide constants that should stay consistent across modules.
 * Centralizing these avoids drift between update/version/health-check paths.
 */
export const HILAB_CLI_NPM_PACKAGE_NAME = "hilab-cli";
export const HILAB_CLI_NPM_PACKAGE_URL = `https://www.npmjs.com/package/${HILAB_CLI_NPM_PACKAGE_NAME}`;
export const HILAB_CLI_GLOBAL_INSTALL_COMMAND = `npm install -g ${HILAB_CLI_NPM_PACKAGE_NAME}`;
export const HILAB_CLI_INSTALL_COMMANDS = [
	HILAB_CLI_GLOBAL_INSTALL_COMMAND,
	`pnpm add -g ${HILAB_CLI_NPM_PACKAGE_NAME}`,
	`yarn global add ${HILAB_CLI_NPM_PACKAGE_NAME}`,
	`bun add -g ${HILAB_CLI_NPM_PACKAGE_NAME}`,
] as const;
/**
 * Lazily evaluated so tests can override env vars after module load.
 */
export function getCliVersion(): string {
	return (
		process.env.HILAB_CLI_VERSION?.trim() || process.env.npm_package_version?.trim() || "unknown"
	);
}

/**
 * Lazily evaluated — composed from getCliVersion().
 */
export function getCliUserAgent(): string {
	return `${HILAB_CLI_NPM_PACKAGE_NAME}/${getCliVersion()}`;
}
export const DEFAULT_NETWORK_TIMEOUT_MS = 3_000;
