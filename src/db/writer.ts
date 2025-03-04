import { Client } from "pg";

export class Writer {
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async updateGatheringEndedAt(id: string, endedAt: string) {
    await this.client.query(
      "UPDATE gathering SET ended_at = $1 WHERE id = $2 AND ended_at IS NULL",
      [endedAt, id]
    );
  }

  async updateGatheringEndedAtBulk(ids: string[], endedAt: string) {
    await this.client.query(
      "UPDATE gathering SET ended_at = $1 WHERE ended_at IS NULL AND id = ANY($2)",
      [endedAt, ids]
    );
  }

  async updateGroupCount(id: string) {
    await this.client.query(
      'UPDATE "group" SET gathering_count = gathering_count + 1',
      [id]
    );
  }

  async updateGroupCountBulk(ids: string[]) {
    await this.client.query(
      'UPDATE "group" SET gathering_count = gathering_count + 1 WHERE id = ANY($1)',
      [ids]
    );
  }

  async deletePendingInvitation(gatheringIds: string[]) {
    await this.client.query(
      `DELETE FROM gathering_participation WHERE gathering_id = ANY($1) AND status = 'PENDING'`,
      [gatheringIds]
    );
  }
}
