"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<User[]>(friends);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const newFriendHandler = (newFriend: User) => {
      setActiveChats((prev) => [...prev, newFriend]);
    };
    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;
      if (!shouldNotify) return;

      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderMessage={message.text}
          senderName={message.senderName}
        />
      ));

      setUnseenMessages((prev) => [...prev, message]);
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

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev?.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  return (
    <>
      {activeChats.length > 0 ? (
        <div className="text-xs font-semibold leading-6 text-gray-400 dark:text-gray-300">
          Your chats
        </div>
      ) : null}
      <ul
        role="list"
        className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1 scrollbar-thumb-blue scrollbar-thumb scrollbar-w-2 scrolling-touch"
      >
        {activeChats
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((friend, index, array) => {
            const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
              return unseenMsg.senderId === friend.id;
            }).length;
            const previousFriend = array[index - 1];
            const showLetterHeader =
              !previousFriend ||
              previousFriend.name[0].toUpperCase() !==
                friend.name[0].toUpperCase();
            return (
              <li key={friend.id}>
                {showLetterHeader && (
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {friend.name[0].toUpperCase()}
                  </div>
                )}
                <a
                  href={`/dashboard/chat/${chatHrefConstructor(
                    sessionId,
                    friend.id
                  )}`}
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                >
                  {friend.name.charAt(0).toUpperCase() + friend.name.slice(1)}
                  {unseenMessagesCount > 0 ? (
                    <div className="bg-orange-500 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                      {unseenMessagesCount}
                    </div>
                  ) : null}
                </a>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default SidebarChatList;
