import { Client } from "pg";
import { client } from "./db/connection";
import { Reader } from "./db/reader";
import { Writer } from "./db/writer";

const initialize = async (client: Client) => {
  await client.connect();
  const reader = new Reader(client);
  const writer = new Writer(client);

  return {
    reader,
    writer,
  };
};

export const handler = async (event: any) => {
  try {
    const { reader, writer } = await initialize(client);
    const currentDate = new Date().toISOString();
    const gatherings = await reader.findCompletedGathering(currentDate);

    const gatheringIds = gatherings.map((gathering) => gathering.id);
    const groupIds = gatherings
      .map((gathering) => gathering.group_id)
      .filter((id) => id !== null) as string[];

    try {
      await client.query("BEGIN");

      if (gatheringIds.length > 0) {
        await writer.deletePendingInvitation(gatheringIds);
        await writer.updateGatheringEndedAtBulk(gatheringIds, currentDate);
      }
      if (groupIds.length > 0) {
        await writer.updateGroupCountBulk(groupIds);
      }

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `모임 완료: ${gatheringIds.length}건, 그룹: ${groupIds.length}건`,
        timestamp: currentDate,
      }),
    };
  } catch (e: unknown) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "모임 완료 업데이트 실패.",
        error: (e as Error).message,
        timestamp: new Date().toISOString(),
      }),
    };
  } finally {
    await client.end();
  }
};
