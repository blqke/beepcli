import { describe, expect, it } from "vitest";
import { getClient, BeeperDesktop } from "../src/index.js";

describe("BeeperClient", () => {
	it("should create client with getClient()", () => {
		const client = getClient();
		expect(client).toBeDefined();
		expect(client).toBeInstanceOf(BeeperDesktop);
	});

	it("should export BeeperDesktop class", () => {
		expect(BeeperDesktop).toBeDefined();
	});
});
