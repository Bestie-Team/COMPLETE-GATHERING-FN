import { Client } from "pg";

export class Reader {
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async findCompletedGathering(now: string) {
    const { rows } = await this.client.query<{
      id: string;
      group_id: string | null;
    }>(
      `
      SELECT id, group_id
      FROM gathering
      WHERE deleted_at IS NULL
      AND ended_at IS NULL
      AND gathering_date < $1
    `,
      [now]
    );

    return rows;
  }
}
