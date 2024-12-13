import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import AddDeveloperCardClient from "@/components/AddDeveloperCard";
import DashboardChatList from "@/components/DashboardChatList"; // New import

const page = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const friends = await getFriendsByUserId(session.user.id);

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessageRaw] = (await fetchRedis(
        "zrange",
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[];

      const lastMessage = lastMessageRaw
        ? (JSON.parse(lastMessageRaw) as Message)
        : null;

      const lastSeenMessageId = (await fetchRedis(
        "hget",
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:seen`,
        session.user.id
      )) as string | null;

      const hasUnseenMessages =
        lastMessage &&
        lastMessage.senderId !== session.user.id &&
        lastMessage.id !== lastSeenMessageId;

      return {
        ...friend,
        lastMessage,
        hasUnseenMessages: hasUnseenMessages ?? false,
      };
    })
  );

  // Sort the chats by last message timestamp in descending order
  friendsWithLastMessage.sort(
    (a, b) => (b.lastMessage?.timestamp ?? 0) - (a.lastMessage?.timestamp ?? 0)
  );

  return (
    <div className="container py-10">
      <h1 className="font-bold font-mono mb-8 text-3xl sm:text-5xl">
        Recent chats
      </h1>
      {friendsWithLastMessage.length === 0 ? (
        <>
          <p className="text-sm text-zinc-500 mb-4">No chats for now...</p>
          <div className="mt-8">
            <AddDeveloperCardClient />
          </div>
        </>
      ) : (
        <DashboardChatList
          sessionId={session.user.id}
          initialFriendsWithLastMessage={friendsWithLastMessage}
        />
      )}
    </div>
  );
};

export default page;
