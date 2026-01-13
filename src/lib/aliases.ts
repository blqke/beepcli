import type { BeeperConfig } from "./config.js";

/**
 * Resolve an alias or chat ID.
 * Returns the chat ID if alias found, returns input if it's a direct chat ID, or null otherwise.
 */
export function resolveAlias(input: string, config: BeeperConfig): string | null {
	// Check if it's an alias
	if (config.aliases?.[input]) {
		return config.aliases[input];
	}

	// Check if it's a direct chat ID (starts with !)
	if (input.startsWith("!")) {
		return input;
	}

	return null;
}

/**
 * Validate alias name (alphanumeric + underscore only)
 */
export function isValidAliasName(name: string): boolean {
	return /^[a-zA-Z0-9_]+$/.test(name);
}

/**
 * Validate chat ID format (must start with !)
 */
export function isValidChatId(chatId: string): boolean {
	return chatId.startsWith("!");
}
