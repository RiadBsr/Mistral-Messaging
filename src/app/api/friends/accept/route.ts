import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id: idToAccept } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    //verify both users are not already friends
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAccept
    );
    if (isAlreadyFriends)
      return new Response("Already friends", { status: 400 });

    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAccept
    ); // we want to find out if the id to accept is already in these incoming friend requests

    if (!hasFriendRequest) {
      return new Response("No friend request", { status: 400 });
    }

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis("get", `user:${session.user.id}`),
      fetchRedis("get", `user:${idToAccept}`),
    ])) as [string, string];

    const user = JSON.parse(userRaw) as User;
    const friend = JSON.parse(friendRaw) as User;

    // nodify added user

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${idToAccept}:friends`),
        "new_friend",
        user
      ),
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        "new_friend",
        friend
      ),
      db.sadd(`user:${session.user.id}:friends`, idToAccept),
      db.sadd(`user:${idToAccept}:friends`, session.user.id),
      db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAccept),
    ]);

    // Notify the requester that their friend request has been accepted
    await pusherServer.trigger(
      toPusherKey(`user:${idToAccept}:friends`),
      "friend_request_accepted",
      {
        accepterId: user.id,
        accepterEmail: user.email,
        accepterName: user.name,
        accepterImage: user.image,
      }
    );

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
