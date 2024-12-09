import { fetchRedis } from "./redis";

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const userId = (await fetchRedis("get", `user:email:${email}`)) as string;

  if (!userId) {
    return null;
  }

  const userData = (await fetchRedis("get", `user:${userId}`)) as string | null;

  if (!userData) {
    return null;
  }

  const user = JSON.parse(userData) as User;
  return user;
};
