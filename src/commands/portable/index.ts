/**
 * Portable module — shared infrastructure for hi agents, hi commands, hi skills
 */

// Types
export type {
	PortableType,
	ProviderType,
	ConversionFormat,
	WriteStrategy,
	ProviderPathConfig,
	ProviderConfig,
	ParsedFrontmatter,
	PortableItem,
	ConversionResult,
	PortableInstallResult,
	PortableCommandOptions,
	PortableContext,
} from "./types.js";
export { ProviderType as ProviderTypeEnum, PortableCommandOptionsSchema } from "./types.js";

// Provider registry
export {
	providers,
	getAllProviderTypes,
	getProviderConfig,
	detectInstalledProviders,
	getProvidersSupporting,
	getPortableInstallPath,
} from "./provider-registry.js";

// Frontmatter parser
export { parseFrontmatter, parseFrontmatterFile } from "./frontmatter-parser.js";

// Converters
export { convertItem } from "./converters/index.js";

// Installer
export { installPortableItems, installPortableItem } from "./portable-installer.js";
