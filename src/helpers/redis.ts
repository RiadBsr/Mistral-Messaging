const upstashRedistRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN;

type Command = "zrange" | "sismember" | "get" | "smembers";

export async function fetchRedis<T extends string | number>(
  command: Command,
  ...args: (string | number)[]
): Promise<T | T[] | null> {
  const commandUrl = `${upstashRedistRestUrl}/${command}/${args.join("/")}`;

  const response = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }
  const data = (await response.json()) as { result: T | T[] | null };
  return data.result;
}
