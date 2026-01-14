import { Command } from "commander";
import kleur from "kleur";
import { getClient } from "../lib/client.js";

const SEPARATOR = kleur.dim("─".repeat(50));

export const contactsCommand = new Command("contacts").description("Search contacts");

contactsCommand
	.command("search")
	.description("Search contacts on a specific account")
	.argument("<account-id>", "Account ID to search on")
	.argument("<query>", "Search query")
	.action(async (accountId: string, query: string) => {
		try {
			const client = getClient();

			const result = await client.accounts.contacts.search(accountId, { query });

			if (result.items.length === 0) {
				console.log(kleur.yellow(`No contacts found for "${query}"`));
				return;
			}

			console.log(kleur.bold(`\n🔍 Contacts matching "${query}" (${result.items.length})`));
			console.log(SEPARATOR);

			for (let i = 0; i < result.items.length; i++) {
				const user = result.items[i];
				const num = kleur.dim(`${i + 1}.`);
				const name = kleur.bold(user.fullName || user.username || user.id);
				const self = user.isSelf ? kleur.cyan(" (you)") : "";
				const blocked = user.cannotMessage ? kleur.red(" [cannot message]") : "";

				console.log(`${num} ${name}${self}${blocked}`);
				console.log(kleur.dim(`   ID: ${user.id}`));

				if (user.username) {
					console.log(kleur.dim(`   @${user.username}`));
				}
				if (user.phoneNumber) {
					console.log(kleur.dim(`   📱 ${user.phoneNumber}`));
				}
				if (user.email) {
					console.log(kleur.dim(`   📧 ${user.email}`));
				}

				if (i < result.items.length - 1) {
					console.log(SEPARATOR);
				}
			}
			console.log();
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
			console.error(kleur.red("❌ Account not found"));
			console.error(kleur.dim("   Run 'beep accounts' to see available accounts."));
		} else {
			console.error(kleur.red(`❌ Error: ${error.message}`));
		}
	} else {
		console.error(kleur.red("❌ Unknown error occurred"));
	}
	process.exit(1);
}
