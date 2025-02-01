import pg from "pg";
import * as dotenv from 'dotenv';

dotenv.config();

export const handler = async (event: any) => {
  const { Client } = pg;
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await client.connect();

    const currentDate = new Date().toISOString();
    const query =
      "UPDATE gathering SET ended_at = $1 WHERE ended_at IS NULL AND gathering_date < $2";

    const result = await client.query(query, [currentDate, currentDate]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${result.rowCount}개의 모임이 완료 됨.`,
        timestamp: currentDate,
      }),
    };
  } catch (e: unknown) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '모임 완료 업데이트 실패.',
        error: (e as Error).message,
        timestamp: new Date().toISOString(),
      })
    }
  } finally {
    await client.end();
  }
};

handler('');
