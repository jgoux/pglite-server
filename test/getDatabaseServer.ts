import type { AddressInfo } from "node:net";
import { promisify } from "node:util";
import { PGlite } from "@electric-sql/pglite";
import { createServer } from "../src/server.js";

export async function getDatabaseServer(port?: number) {
	const db = new PGlite();
	await db.waitReady;
	const server = await createServer(db);

	await new Promise((resolve) => {
		server.listen(port ?? 0, () => {
			resolve(void 0);
		});
	});

	return {
		connectionString: `postgres://postgres@localhost:${
			(server.address() as AddressInfo).port
		}/postgres`,
		server,
		db,
		[Symbol.asyncDispose]: async () => {
			await promisify(server.close.bind(server))();
		},
	};
}
