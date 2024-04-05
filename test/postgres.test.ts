import { test } from "./test.js";

test("is provided database server and client", async ({ database }) => {
	await database.client.sql`SELECT 1`;
});
