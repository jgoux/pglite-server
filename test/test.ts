import * as vitest from "vitest";
import { getDatabaseClient } from "./getDatabaseClient";
import { getDatabaseServer } from "./getDatabaseServer";

interface Context {
	database: {
		client: Awaited<ReturnType<typeof getDatabaseClient>>;
		server: Awaited<ReturnType<typeof getDatabaseServer>>;
	};
}

export const test = vitest.test.extend<Context>({
	// biome-ignore lint/correctness/noEmptyPattern: <explanation>
	database: async ({}, use) => {
		await using server = await getDatabaseServer();
		await using client = await getDatabaseClient(server.connectionString);
		await use({ client, server });
	},
});
