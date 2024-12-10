import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const { chatId, messageId } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) return new Response("Unauthorized", { status: 401 });

    const [userId1, userId2] = chatId.split("--");

    const isParticipant =
      session.user.id === userId1 || session.user.id === userId2;
    if (!isParticipant) return new Response("Unauthorized", { status: 401 });

    const friendId = session.user.id === userId1 ? userId2 : userId1;

    // Store the last seen message ID
    await db.hset(`chat:${chatId}:seen`, { [session.user.id]: messageId });

    // Notify the sender that the recipient has seen the message
    await pusherServer.trigger(
      toPusherKey(`user:${friendId}:chats`),
      "message_seen",
      {
        chatId,
        messageId,
        seenBy: session.user.id,
      }
    );

    return new Response("OK");
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
