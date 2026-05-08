/**
 * File operations service - file system operations
 */

export { FileScanner } from "./file-scanner.js";
export { ManifestWriter, type FileTrackInfo } from "./manifest-writer.js";
export {
	scanDirectoryTree,
	filterItemsByPatterns,
	flattenSelectedItems,
	getHiLabDirectories,
	createDefaultSelection,
	type DirectoryItem,
	type SelectionState,
} from "./directory-selector.js";
export {
	scanHiLabDirectory,
	readHiLabMetadata,
	getHiLabSetup,
	type HiLabMetadata,
} from "./hilab-scanner.js";
export { OwnershipChecker, type OwnershipCheckResult } from "./ownership-checker.js";
