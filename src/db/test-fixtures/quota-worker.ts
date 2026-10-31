import { parentPort, workerData } from "node:worker_threads";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../schema.ts";
import { openSqlite } from "../sqlite.ts";
import { saveRsvp, updateGuestDetails } from "../writes.ts";

const client = openSqlite(workerData.path);
const db = drizzle(client, { schema });
parentPort!.postMessage("ready");
parentPort!.once("message", () => {
  try {
    const result = workerData.operation === "rsvp"
      ? saveRsvp(db, workerData.input)
      : updateGuestDetails(db, workerData.invitationId, workerData.guestId, { name: "Tamu", partnerName: null, allowedGuestCount: 2 });
    parentPort!.postMessage(result);
  } finally { client.close(); }
});
