import { fetchRedis } from "./redis";

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const userId = (await fetchRedis("get", `user:email:${email}`)) as string;

  if (!userId) {
    return null;
  }

  const userRaw = await fetchRedis("get", `user:${userId}`);
  const user = JSON.parse(userRaw) as User;
  return user;
};
