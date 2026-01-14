import { Command } from "commander";
import kleur from "kleur";
import { isValidChatId, resolveAlias } from "../lib/aliases.js";
import { getClient } from "../lib/client.js";
import { getConfig } from "../lib/config.js";

export const archiveCommand = new Command("archive")
	.description("Archive or unarchive a chat")
	.argument("<chat-id>", "Chat ID or alias to archive")
	.option("-u, --unarchive", "Unarchive the chat instead of archiving")
	.option("-q, --quiet", "Don't show confirmation message")
	.action(async (chatId: string, options) => {
		try {
			const client = getClient();
			const config = getConfig();

			// Try to resolve alias first
			const resolved = resolveAlias(chatId, config);

			let targetChatId: string;
			if (resolved) {
				targetChatId = resolved;
			} else if (isValidChatId(chatId)) {
				targetChatId = chatId;
			} else {
				console.error(kleur.red(`❌ Invalid chat ID or alias: ${chatId}`));
				console.error(kleur.dim("   Chat IDs should start with '!' (e.g., !abc123:beeper.local)"));
				console.error(kleur.dim(`   Or add an alias: beep alias add ${chatId} <chatId>`));
				process.exit(1);
			}

			const archived = !options.unarchive;
			await client.chats.archive(targetChatId, { archived });

			if (!options.quiet) {
				const action = archived ? "archived" : "unarchived";
				const emoji = archived ? "📦" : "📬";
				console.log(kleur.green(`${emoji} Chat ${action} successfully!`));
				console.log(kleur.dim(`   Chat: ${targetChatId}`));
			}
		} catch (error) {
			handleError(error);
		}
	});

function handleError(error: unknown): void {
	if (error instanceof Error) {
		if (error.message.includes("ECONNREFUSED")) {
			console.error(kleur.red("❌ Cannot connect to Beeper Desktop API"));
			console.error(kleur.dim("   Make sure Beeper Desktop is running with API enabled."));
		} else if (error.message.includes("404")) {
			console.error(kleur.red("❌ Chat not found"));
			console.error(kleur.dim("   Make sure the chat ID is correct."));
		} else if (error.message.includes("403")) {
			console.error(kleur.red(`❌ Permission denied: ${error.message}`));
			console.error(kleur.dim("   Check your token has the required permissions."));
		} else {
			console.error(kleur.red(`❌ Error: ${error.message}`));
		}
	} else {
		console.error(kleur.red("❌ Unknown error occurred"));
	}
	process.exit(1);
}
