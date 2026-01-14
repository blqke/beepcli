import { Command } from "commander";
import kleur from "kleur";
import { isValidChatId, resolveAlias } from "../lib/aliases.js";
import { getClient } from "../lib/client.js";
import { getConfig } from "../lib/config.js";

export const focusCommand = new Command("focus")
	.description("Bring Beeper Desktop to foreground")
	.argument("[chat-id]", "Optional chat ID or alias to open")
	.option("-m, --message <id>", "Jump to specific message")
	.option("-d, --draft <text>", "Pre-fill draft text")
	.option("-a, --attachment <path>", "Pre-fill draft attachment")
	.action(async (chatId: string | undefined, options) => {
		try {
			const client = getClient();
			const config = getConfig();

			let targetChatId: string | undefined;

			if (chatId) {
				const resolved = resolveAlias(chatId, config);
				if (resolved) {
					targetChatId = resolved;
				} else if (isValidChatId(chatId)) {
					targetChatId = chatId;
				} else {
					console.error(kleur.red(`❌ Invalid chat ID or alias: ${chatId}`));
					console.error(kleur.dim("   Chat IDs should start with '!'"));
					process.exit(1);
				}
			}

			const result = await client.focus({
				chatID: targetChatId,
				messageID: options.message,
				draftText: options.draft,
				draftAttachmentPath: options.attachment,
			});

			if (result.success) {
				console.log(kleur.green("✓ Beeper Desktop focused"));
				if (targetChatId) {
					console.log(kleur.dim(`   Chat: ${targetChatId}`));
				}
			} else {
				console.error(kleur.red("❌ Failed to focus Beeper Desktop"));
				process.exit(1);
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
		} else {
			console.error(kleur.red(`❌ Error: ${error.message}`));
		}
	} else {
		console.error(kleur.red("❌ Unknown error occurred"));
	}
	process.exit(1);
}
