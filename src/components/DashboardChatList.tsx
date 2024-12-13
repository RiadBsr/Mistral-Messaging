"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { format, isToday, isYesterday, isSameYear } from "date-fns";
import { ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface DashboardChatListProps {
  sessionId: string;
  initialFriendsWithLastMessage: FriendWithLastMessage[];
}

interface FriendWithLastMessage {
  id: string;
  name: string;
  image: string;
  lastMessage: Message | null;
  hasUnseenMessages: boolean;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const DashboardChatList: React.FC<DashboardChatListProps> = ({
  sessionId,
  initialFriendsWithLastMessage,
}) => {
  const [friendsWithLastMessage, setFriendsWithLastMessage] = useState<
    FriendWithLastMessage[]
  >(initialFriendsWithLastMessage);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const newFriendHandler = (newFriend: User) => {
      setFriendsWithLastMessage((prev) => [
        ...prev,
        {
          id: newFriend.id,
          name: newFriend.name,
          image: newFriend.image,
          lastMessage: null,
          hasUnseenMessages: false,
        },
      ]);
    };

    const chatHandler = (message: ExtendedMessage) => {
      setFriendsWithLastMessage((prev) => {
        const friendId =
          message.senderId === sessionId
            ? message.receiverId
            : message.senderId;

        const updatedFriends = prev.map((friend) => {
          if (friend.id === friendId) {
            const hasUnseenMessages =
              message.senderId !== sessionId &&
              message.id !== friend.lastMessage?.id;

            return {
              ...friend,
              lastMessage: message,
              hasUnseenMessages,
            };
          }
          return friend;
        });

        // Re-sort the list based on the new message timestamp
        updatedFriends.sort(
          (a, b) =>
            (b.lastMessage?.timestamp ?? 0) - (a.lastMessage?.timestamp ?? 0)
        );

        return updatedFriends;
      });
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [pathname, sessionId, router]);

  return (
    <div className="max-h-[calc(100vh-15rem)] overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-w-2 scrolling-touch">
      {friendsWithLastMessage.map((friend) => (
        <div
          key={friend.id}
          className={`relative p-2 m-2 rounded-full border ${
            friend.hasUnseenMessages
              ? "border-orange-600"
              : "border-zinc-200 dark:border-zinc-700"
          } bg-zinc-50 dark:bg-zinc-800`}
        >
          <Link
            href={`/dashboard/chat/${chatHrefConstructor(
              sessionId,
              friend.id
            )}`}
            className="relative flex items-center"
          >
            <div className="flex-shrink-0 mr-4">
              <div className="relative h-16 w-16">
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
              <h4
                className={`text-lg truncate ${
                  friend.hasUnseenMessages ? "font-bold" : "font-normal"
                } flex items-center`}
              >
                {friend.hasUnseenMessages && (
                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                )}
                {friend.name}
              </h4>
              <p
                className={`text-sm max-w-md line-clamp-1 ${
                  friend.hasUnseenMessages ? "font-bold" : ""
                }`}
              >
                <span className="text-zinc-400">
                  {friend.lastMessage?.senderId === sessionId ? "You: " : ""}
                </span>
                {friend.lastMessage?.text}
              </p>

              <p className="text-xs text-zinc-500">
                {friend.lastMessage
                  ? isToday(friend.lastMessage.timestamp)
                    ? `Today at ${format(
                        friend.lastMessage.timestamp,
                        "h:mm a"
                      )}`
                    : isYesterday(friend.lastMessage.timestamp)
                    ? `Yesterday at ${format(
                        friend.lastMessage.timestamp,
                        "h:mm a"
                      )}`
                    : isSameYear(friend.lastMessage.timestamp, new Date())
                    ? format(friend.lastMessage.timestamp, "MMM d, h:mm a")
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
  );
};

export default DashboardChatList;
