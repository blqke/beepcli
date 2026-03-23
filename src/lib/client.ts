import BeeperDesktop from "@beeper/desktop-api";
import { getConfig } from "./config.js";

const DEFAULT_BASE_URL = "http://localhost:23373";

export type {
	Account,
	AccountListResponse,
} from "@beeper/desktop-api/resources/accounts/accounts.js";
export type { Chat, ChatListResponse } from "@beeper/desktop-api/resources/chats/chats.js";
export type { Message } from "@beeper/desktop-api/resources/shared.js";

function readOptionalStringField(value: unknown, field: string): string | undefined {
	if (!value || typeof value !== "object") return undefined;
	const record = value as Record<string, unknown>;
	return typeof record[field] === "string" ? record[field] : undefined;
}

export function getAccountNetwork(account: { accountID: string }): string {
	return readOptionalStringField(account, "network") ?? account.accountID;
}

export function getChatDescription(chat: unknown): string | undefined {
	return readOptionalStringField(chat, "description");
}

export function getChatNetwork(chat: { accountID: string }): string {
	return readOptionalStringField(chat, "network") ?? chat.accountID;
}

let _client: BeeperDesktop | null = null;

export function getClient(): BeeperDesktop {
	if (!_client) {
		const config = getConfig();
		_client = new BeeperDesktop({
			accessToken: config.token,
			baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
		});
	}
	return _client;
}
