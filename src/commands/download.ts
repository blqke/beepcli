import { copyFileSync } from "node:fs";
import { basename } from "node:path";
import { Command } from "commander";
import kleur from "kleur";
import { getClient } from "../lib/client.js";

export const downloadCommand = new Command("download")
	.description("Download a message attachment")
	.argument("<url>", "Matrix content URL (mxc:// or localmxc://)")
	.option("-o, --output <path>", "Save to specific file path")
	.action(async (url: string, options) => {
		try {
			const client = getClient();

			const result = await client.assets.download({ url });

			if (result.error) {
				console.error(kleur.red(`❌ Download failed: ${result.error}`));
				process.exit(1);
			}

			if (!result.srcURL) {
				console.error(kleur.red("❌ No source URL returned"));
				process.exit(1);
			}

			// srcURL is a file:// URL, convert to path
			const localPath = result.srcURL.replace(/^file:\/\//, "");

			if (options.output) {
				// Copy to specified output path
				copyFileSync(localPath, options.output);
				console.log(kleur.green("✓ Downloaded successfully"));
				console.log(kleur.dim(`   Saved to: ${options.output}`));
			} else {
				// Just show the local path
				console.log(kleur.green("✓ Asset available locally"));
				console.log(kleur.dim(`   Path: ${localPath}`));
				console.log(kleur.dim(`   Filename: ${basename(localPath)}`));
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
		} else if (error.message.includes("invalid")) {
			console.error(kleur.red("❌ Invalid URL format"));
			console.error(kleur.dim("   URL should be mxc:// or localmxc://"));
		} else {
			console.error(kleur.red(`❌ Error: ${error.message}`));
		}
	} else {
		console.error(kleur.red("❌ Unknown error occurred"));
	}
	process.exit(1);
}
