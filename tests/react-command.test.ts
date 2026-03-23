import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const addReaction = vi.fn();
const deleteReaction = vi.fn();
const mockConfig = {
	token: "test-token",
	baseUrl: "http://localhost:23373",
	aliases: {} as Record<string, string>,
};

const mockClient = {
	chats: {
		messages: {
			reactions: {
				add: addReaction,
				delete: deleteReaction,
			},
		},
	},
};

vi.mock("../src/lib/client.js", () => ({
	getClient: () => mockClient,
}));

vi.mock("../src/lib/config.js", () => ({
	getConfig: () => mockConfig,
}));

async function runReactCommand(args: string[]): Promise<void> {
	vi.resetModules();
	const { reactCommand } = await import("../src/commands/react.js");
	await reactCommand.parseAsync(args, { from: "user" });
}

function joinedOutput(spy: ReturnType<typeof vi.spyOn>): string {
	return spy.mock.calls.flat().join("\n");
}

describe("reactCommand", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockConfig.aliases = {};
		addReaction.mockResolvedValue({
			chatID: "!chat:beeper.local",
			messageID: "708111",
			reactionKey: "✅",
			success: true,
			transactionID: "txn-123",
		});
		deleteReaction.mockResolvedValue({
			chatID: "!chat:beeper.local",
			messageID: "708111",
			reactionKey: "👍",
			success: true,
		});
	});

	it("adds a reaction with the official reactions API", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await runReactCommand(["!chat:beeper.local", "708111", "✅"]);

		expect(addReaction).toHaveBeenCalledWith("708111", {
			chatID: "!chat:beeper.local",
			reactionKey: "✅",
		});
		expect(deleteReaction).not.toHaveBeenCalled();

		const output = joinedOutput(logSpy);
		expect(output).toContain("Reaction added");
		expect(output).toContain("!chat:beeper.local");
		expect(output).toContain("708111");
		expect(output).toContain("✅");
		expect(output).toContain("txn-123");
	});

	it("removes a reaction using an alias and --remove", async () => {
		mockConfig.aliases = { work: "!resolved:beeper.local" };
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await runReactCommand(["work", "708111", "--remove", "👍"]);

		expect(deleteReaction).toHaveBeenCalledWith("708111", {
			chatID: "!resolved:beeper.local",
			reactionKey: "👍",
		});
		expect(addReaction).not.toHaveBeenCalled();

		const output = joinedOutput(logSpy);
		expect(output).toContain("Reaction removed");
		expect(output).toContain("!chat:beeper.local");
		expect(output).toContain("708111");
		expect(output).toContain("👍");
	});

	it("suppresses confirmation output in quiet mode", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await runReactCommand(["!chat:beeper.local", "708111", "❌", "--quiet"]);

		expect(addReaction).toHaveBeenCalledWith("708111", {
			chatID: "!chat:beeper.local",
			reactionKey: "❌",
		});
		expect(logSpy).not.toHaveBeenCalled();
	});

	it("prints the shared write-permission hint on 403 errors", async () => {
		addReaction.mockRejectedValue(new Error("403 Forbidden"));
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
			throw new Error(`process.exit:${code}`);
		}) as never);

		await expect(runReactCommand(["!chat:beeper.local", "708111", "✅"])).rejects.toThrow(
			"process.exit:1",
		);

		expect(addReaction).toHaveBeenCalledWith("708111", {
			chatID: "!chat:beeper.local",
			reactionKey: "✅",
		});
		const output = joinedOutput(errorSpy);
		expect(output).toContain("Permission denied");
		expect(output).toContain("Enable write permissions");
		expect(output).toContain("write' scope");
		expect(exitSpy).toHaveBeenCalledWith(1);
	});
});
