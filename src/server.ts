import * as net from "node:net";
import type { PGlite } from "@electric-sql/pglite";
import debug from "debug";
import { parseMessage } from "./messages.js";
import { createMessageResponse } from "./responses.js";

const log = debug("pglite:server");

export async function createServer(db: PGlite, opts = {}) {
	const server = net.createServer(opts);

	server.on("connection", (socket) => {
		let clientBuffer = Buffer.allocUnsafe(0);
		const clientAddr = `${socket.remoteAddress}:${socket.remotePort}`;

		log(`Client connected: ${clientAddr}`);

		socket.on("data", async (data) => {
			clientBuffer = Buffer.concat([clientBuffer, data]);

			while (clientBuffer.length > 0) {
				const message = parseMessage(clientBuffer);

				log(`${"-".repeat(42)}\n`);
				log("> Current buffer");
				log(`> Length: ${clientBuffer.length}`);
				log("> Raw:", clientBuffer);
				log(`> Text: ${clientBuffer.toString()}`);
				log("");
				log(`>> Message name: ${message.name}`);
				log(`>> Message length: ${message.length}`);
				log(">> Message buffer raw:", message.buffer);
				log(`>> Message buffer text: ${message.buffer.toString()}`);
				log("");

				if (message.name === "InsufficientData") {
					continue;
				}

				if (message.name === "Unknown" || message.name === "Terminate") {
					socket.end();
					return;
				}

				const response = await createMessageResponse(message, db);
				socket.write(response);
				clientBuffer = Buffer.from(clientBuffer.subarray(message.length));
				log("> Remaining buffer");
				log(`> Length: ${clientBuffer.length}`);
				log("> Raw:", clientBuffer);
				log(`> Text: ${clientBuffer.toString() || "<empty>"}`);
				log("");
			}
		});

		socket.on("end", () => {
			log(`Client disconnected: ${clientAddr}`);
		});

		socket.on("error", (err) => {
			log(`Client ${clientAddr} error:`, err);
			socket.end();
		});
	});

	server.on("error", (err) => {
		log("Server error:", err);
	});

	return server;
}
