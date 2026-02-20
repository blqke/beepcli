import { Command } from "commander";
import kleur from "kleur";
import type { Message } from "../lib/client.js";
import { getClient } from "../lib/client.js";
import {
	formatSize,
	handleCommandError,
	parseDateOrExit,
	resolveChatIdOrExit,
	SEPARATOR,
	validateDateRangeOrExit,
} from "../lib/command-utils.js";
import { getConfig } from "../lib/config.js";

export const messagesCommand = new Command("messages")
	.description("List messages from a specific chat")
	.argument("<chat-id>", "Chat ID or alias")
	.option("-l, --limit <number>", "Maximum messages to show", "20")
	.option("--after <date>", "Messages after date (e.g., '1d ago', 'yesterday')")
	.option("--before <date>", "Messages before date (e.g., '1h ago', 'today')")
	.option("--json", "Output messages as JSON")
	.action(async (chatIdArg: string, options) => {
		try {
			const client = getClient();
			const config = getConfig();
			const limit = Number.parseInt(options.limit, 10);
			const chatID = resolveChatIdOrExit(chatIdArg, config);

			// Parse dates
			const dateAfter = options.after ? parseDateOrExit(options.after, "--after") : undefined;
			const dateBefore = options.before ? parseDateOrExit(options.before, "--before") : undefined;

			if (dateAfter && dateBefore) {
				validateDateRangeOrExit(dateAfter, dateBefore);
			}

			// Build filter description
			const filterParts: string[] = [];
			if (options.after) filterParts.push(`after: ${options.after}`);
			if (options.before) filterParts.push(`before: ${options.before}`);
			const filters = filterParts.length > 0 ? kleur.dim(` [${filterParts.join(", ")}]`) : "";
			if (!options.json) {
				console.log(kleur.dim(`Listing messages from chat ${chatID}${filters}...`));
			}

			// Fetch messages with client-side date filtering
			const messages: Message[] = [];
			for await (const msg of client.messages.list(chatID)) {
				const msgDate = new Date(msg.timestamp);
				if (dateAfter && msgDate <= new Date(dateAfter)) continue;
				if (dateBefore && msgDate >= new Date(dateBefore)) continue;
				messages.push(msg);
				if (messages.length >= limit) break;
			}

			if (messages.length === 0) {
				if (options.json) {
					console.log("[]");
					return;
				}

				console.log(kleur.yellow(`\nNo messages found in chat ${chatID}`));
				if (options.after || options.before) {
					console.log(kleur.dim("   Try adjusting the date filters"));
				}
				return;
			}

			if (options.json) {
				console.log(JSON.stringify(messages.map(formatMessageForJson), null, 2));
				return;
			}

			// Build accountID -> network map
			const accounts = await client.accounts.list();
			const networkMap = new Map<string, string>();
			for (const account of accounts) {
				networkMap.set(account.accountID, account.network || account.accountID);
			}

			console.log(kleur.bold(`\nMessages (${messages.length})`));
			console.log(SEPARATOR);

			for (let i = 0; i < messages.length; i++) {
				const msg = messages[i];
				printMessage(msg, i, networkMap);
				if (i < messages.length - 1) console.log(SEPARATOR);
			}
			console.log();
		} catch (error) {
			handleCommandError(error);
		}
	});

function printMessage(msg: Message, index: number, networkMap: Map<string, string>): void {
	const num = kleur.dim(`${index + 1}.`);
	const sender = msg.senderName || msg.senderID;
	const network = networkMap.get(msg.accountID) || msg.accountID;
	const time = new Date(msg.timestamp).toLocaleString();

	console.log(
		`${num} ${kleur.cyan(sender)} ${kleur.dim(`[${network}]`)} ${kleur.dim(`• ${time}`)}`,
	);
	console.log(`   ${msg.text || kleur.dim("[no text]")}`);

	// Display attachments
	if (msg.attachments?.length) {
		for (const att of msg.attachments) {
			const icon = getAttachmentIcon(att.type);
			const size = att.fileSize ? ` (${formatSize(att.fileSize)})` : "";
			const name = att.fileName || att.type || "attachment";
			const mxcUrl = getAttachmentMxcUrl(att);
			const url = mxcUrl ? ` ${mxcUrl}` : "";
			console.log(kleur.dim(`   ${icon} ${name}${size}${url}`));
		}
	}

	// Display reactions
	if (msg.reactions?.length) {
		const reacts = msg.reactions.map((r) => r.reactionKey).join(" ");
		console.log(kleur.dim(`   ${reacts}`));
	}
}

function getAttachmentIcon(type?: string): string {
	switch (type) {
		case "img":
			return "img";
		case "video":
			return "vid";
		case "audio":
			return "aud";
		default:
			return "att";
	}
}

function getAttachmentMxcUrl(attachment: unknown): string | undefined {
	if (!attachment || typeof attachment !== "object") return undefined;

	const entry = attachment as Record<string, unknown>;
	const candidates = [entry.url, entry.mxcUrl, entry.mxc, entry.contentUrl, entry.sourceUrl];

	for (const candidate of candidates) {
		if (
			typeof candidate === "string" &&
			(candidate.startsWith("mxc://") || candidate.startsWith("localmxc://"))
		) {
			return candidate;
		}
	}

	return undefined;
}

function formatMessageForJson(
	msg: Message,
): Message & { attachments?: Array<Record<string, unknown>> } {
	return {
		...msg,
		attachments: msg.attachments?.map((att) => ({
			...(att as Record<string, unknown>),
			mxcUrl: getAttachmentMxcUrl(att),
		})),
	};
}
