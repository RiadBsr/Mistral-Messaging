import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, isToday, isYesterday } from "date-fns";
import AddDeveloperCardClient from "@/components/AddDeveloperCard";
import { getUserByEmail } from "@/helpers/get-user-by-email";

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

      return {
        ...friend,
        lastMessage,
      };
    })
  );

  // Sort the chats by last message timestamp in descending order
  friendsWithLastMessage.sort(
    (a, b) => (b.lastMessage?.timestamp ?? 0) - (a.lastMessage?.timestamp ?? 0)
  );

  const developer = (await getUserByEmail("riad.boussoura@gmail.com")) as User;

  return (
    <div className="container py-10">
      <h1 className="font-bold font-mono text-5xl mb-8">Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <>
          <p className="text-sm text-zinc-500 mb-4">No chats for now...</p>
          <div className="mt-8">
            <AddDeveloperCardClient developer={developer} />
          </div>
        </>
      ) : (
        <div className="max-h-[calc(100vh-15rem)] overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-w-2 scrolling-touch">
          {friendsWithLastMessage.map((friend) => (
            <div
              key={friend.id}
              className="relative bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 m-3 rounded-md"
            >
              <Link
                href={`/dashboard/chat/${chatHrefConstructor(
                  session.user.id,
                  friend.id
                )}`}
                className="relative flex items-center"
              >
                <div className="flex-shrink-0 mr-4">
                  <div className="relative h-10 w-10">
                    <Image
                      referrerPolicy="no-referrer"
                      className="rounded-full"
                      alt={`${friend.name} profile picture`}
                      src={friend.image}
                      fill
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold truncate">
                    {friend.name}
                  </h4>
                  <p className="mt-1 max-w-md line-clamp-2">
                    <span className="text-zinc-400">
                      {friend.lastMessage?.senderId === session.user.id
                        ? "You: "
                        : ""}
                    </span>
                    {friend.lastMessage?.text}
                  </p>

                  <p className="text-sm text-zinc-500">
                    {friend.lastMessage
                      ? isToday(friend.lastMessage.timestamp)
                        ? "Today"
                        : isYesterday(friend.lastMessage.timestamp)
                        ? "Yesterday"
                        : format(
                            friend.lastMessage.timestamp,
                            "MMM d, yyyy, h:mm a"
                          )
                      : "No messages yet..."}
                  </p>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <ChevronRight className="h-7 w-7 text-zinc-400" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default page;
