import { Command } from "commander";
import kleur from "kleur";
import { getClient } from "../lib/client.js";
import {
	handleCommandError,
	resolveChatIdOrExit,
	WRITE_PERMISSION_ERROR_HANDLER,
} from "../lib/command-utils.js";
import { getConfig } from "../lib/config.js";

type ReactionMutationResponse = {
	chatID: string;
	messageID: string;
	reactionKey: string;
	success: true;
	transactionID?: string;
};

function getReactionPath(chatID: string, messageID: string): string {
	return `/v1/chats/${encodeURIComponent(chatID)}/messages/${encodeURIComponent(messageID)}/reactions`;
}


export const reactCommand = new Command("react")
	.description("Add or remove your reaction on an existing message")
	.argument("<chat-id>", "Chat ID or alias")
	.argument("<message-id>", "Message ID to react to")
	.argument("<reaction-key>", "Reaction key (emoji, shortcode, or custom emoji key)")
	.option("--remove", "Remove your reaction instead of adding it")
	.option("-q, --quiet", "Don't show confirmation")
	.action(async (chatIdArg: string, messageId: string, reactionKey: string, options) => {
		try {
			const client = getClient();
			const config = getConfig();
			const chatID = resolveChatIdOrExit(chatIdArg, config);

			if (options.remove) {
				const removed = await client.delete<ReactionMutationResponse>(
					getReactionPath(chatID, messageId),
					{ query: { reactionKey } },
				);

				if (!options.quiet) {
					console.log(kleur.green("Reaction removed"));
					console.log(kleur.dim(`   Chat: ${removed.chatID}`));
					console.log(kleur.dim(`   Message: ${removed.messageID}`));
					console.log(kleur.dim(`   Reaction: ${removed.reactionKey}`));
				}
				return;
			}

			const added = await client.post<ReactionMutationResponse>(
				getReactionPath(chatID, messageId),
				{ body: { reactionKey } },
			);

			if (!options.quiet) {
				console.log(kleur.green("Reaction added"));
				console.log(kleur.dim(`   Chat: ${added.chatID}`));
				console.log(kleur.dim(`   Message: ${added.messageID}`));
				console.log(kleur.dim(`   Reaction: ${added.reactionKey}`));
				if (added.transactionID) {
					console.log(kleur.dim(`   Transaction: ${added.transactionID}`));
				}
			}
		} catch (error) {
			handleCommandError(error, [WRITE_PERMISSION_ERROR_HANDLER]);
		}
	});
