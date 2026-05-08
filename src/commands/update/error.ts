/**
 * CLI Update Error
 * Domain error class for update command failures.
 */

import { HiLabError } from "@/types";

/**
 * Thrown when the CLI update command fails.
 * Caught and re-thrown by the orchestrator to surface user-facing messages.
 */
export class CliUpdateError extends HiLabError {
	constructor(message: string) {
		super(message, "CLI_UPDATE_ERROR");
		this.name = "CliUpdateError";
	}
}
