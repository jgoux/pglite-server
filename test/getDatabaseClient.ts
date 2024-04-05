import postgres from "postgres";

export async function getDatabaseClient(connectionString: string) {
	const sql = postgres(connectionString);

	return {
		sql,
		[Symbol.asyncDispose]: async () => {
			await sql.end();
		},
	};
}
