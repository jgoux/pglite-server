import { test } from "./test.js";

test("Postgres.js", async ({ database }) => {
	await database.client.sql`SELECT 1`;
});
