import { parentPort, workerData } from "node:worker_threads";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../schema.ts";
import { connectDatabase } from "../client.ts";
import { saveRsvp, updateGuestDetails } from "../writes.ts";

const client = await connectDatabase({ SQLITE_PATH: workerData.path });
const db = drizzle(client, { schema });
parentPort!.postMessage("ready");
parentPort!.once("message", async () => {
  try {
    const result = workerData.operation === "rsvp"
      ? await saveRsvp(db, workerData.input)
      : await updateGuestDetails(db, workerData.invitationId, workerData.guestId, { name: "Tamu", partnerName: null, allowedGuestCount: 2 });
    parentPort!.postMessage(result);
  } finally { client.close(); }
});
