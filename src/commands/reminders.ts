import { Command } from "commander";
import kleur from "kleur";
import { isValidChatId, resolveAlias } from "../lib/aliases.js";
import { getClient } from "../lib/client.js";
import { getConfig } from "../lib/config.js";
import { parseFutureTime } from "../lib/dates.js";

export const remindersCommand = new Command("reminders").description("Manage chat reminders");

remindersCommand
	.command("set")
	.description("Set a reminder for a chat")
	.argument("<chat-id>", "Chat ID or alias")
	.argument("<time>", "When to remind (30m, 1h, 2d, 1w, tomorrow, or ISO date)")
	.option("-d, --dismiss-on-message", "Cancel if someone messages in the chat")
	.action(async (chatId: string, time: string, options) => {
		try {
			const client = getClient();
			const config = getConfig();

			const resolved = resolveAlias(chatId, config);
			let targetChatId: string;
			if (resolved) {
				targetChatId = resolved;
			} else if (isValidChatId(chatId)) {
				targetChatId = chatId;
			} else {
				console.error(kleur.red(`❌ Invalid chat ID or alias: ${chatId}`));
				process.exit(1);
			}

			const remindAtMs = parseFutureTime(time);
			const remindAt = new Date(remindAtMs);

			await client.chats.reminders.create(targetChatId, {
				reminder: {
					remindAtMs,
					dismissOnIncomingMessage: options.dismissOnMessage,
				},
			});

			console.log(kleur.green("✓ Reminder set successfully"));
			console.log(kleur.dim(`   Chat: ${targetChatId}`));
			console.log(kleur.dim(`   Remind at: ${remindAt.toLocaleString()}`));
			if (options.dismissOnMessage) {
				console.log(kleur.dim("   Will dismiss if someone messages"));
			}
		} catch (error) {
			handleError(error);
		}
	});

remindersCommand
	.command("clear")
	.description("Clear a reminder from a chat")
	.argument("<chat-id>", "Chat ID or alias")
	.action(async (chatId: string) => {
		try {
			const client = getClient();
			const config = getConfig();

			const resolved = resolveAlias(chatId, config);
			let targetChatId: string;
			if (resolved) {
				targetChatId = resolved;
			} else if (isValidChatId(chatId)) {
				targetChatId = chatId;
			} else {
				console.error(kleur.red(`❌ Invalid chat ID or alias: ${chatId}`));
				process.exit(1);
			}

			await client.chats.reminders.delete(targetChatId);

			console.log(kleur.green("✓ Reminder cleared"));
			console.log(kleur.dim(`   Chat: ${targetChatId}`));
		} catch (error) {
			handleError(error);
		}
	});

function handleError(error: unknown): void {
	if (error instanceof Error) {
		if (error.message.includes("ECONNREFUSED")) {
			console.error(kleur.red("❌ Cannot connect to Beeper Desktop API"));
			console.error(kleur.dim("   Make sure Beeper Desktop is running with API enabled."));
		} else if (error.message.includes("Invalid time format")) {
			console.error(kleur.red(`❌ ${error.message}`));
		} else if (error.message.includes("404")) {
			console.error(kleur.red("❌ Chat not found"));
		} else {
			console.error(kleur.red(`❌ Error: ${error.message}`));
		}
	} else {
		console.error(kleur.red("❌ Unknown error occurred"));
	}
	process.exit(1);
}
