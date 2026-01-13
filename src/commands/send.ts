import { Command } from "commander";
import kleur from "kleur";
import { getClient } from "../lib/client.js";

export const sendCommand = new Command("send")
	.description("Send a message to a chat")
	.argument("<chat-id>", "Chat ID to send message to")
	.argument("<message>", "Message text to send")
	.option("-q, --quiet", "Don't show confirmation")
	.action(async (chatId: string, message: string, options) => {
		try {
			const client = getClient();

			const sent = await client.messages.send(chatId, { text: message });

			if (!options.quiet) {
				console.log(kleur.green("✅ Message sent!"));
				console.log(kleur.dim(`   ID: ${sent.pendingMessageID}`));
				console.log(kleur.dim(`   Chat: ${sent.chatID}`));
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
