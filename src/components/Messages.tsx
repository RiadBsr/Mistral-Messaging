"use client";

import { cn, toPusherKey } from "@/lib/utils";
import Image from "next/image";
import { format, isToday, isYesterday } from "date-fns";
import { FC, useEffect, useRef, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { Message } from "@/lib/validations/message";
import axios from "axios";

interface MessagesProps {
  sessionId: string;
  initialMessages: Message[];
  sessionImg: string | null | undefined;
  chatPartner: User;
  chatId: string;
  initialLastSeenMessageId: string | null; // Add this prop
}

const Messages: FC<MessagesProps> = ({
  sessionId,
  initialMessages,
  sessionImg,
  chatPartner,
  chatId,
  initialLastSeenMessageId,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(
    initialLastSeenMessageId
  );

  useEffect(() => {
    const markAsSeen = async () => {
      if (messages.length > 0) {
        const lastMessage = messages[0];
        if (
          lastMessage.senderId !== sessionId &&
          lastMessage.id !== lastSeenMessageId
        ) {
          await axios.post("/api/message/seen", {
            chatId,
            messageId: lastMessage.id,
          });
          setLastSeenMessageId(lastMessage.id);
        }
      }
    };

    markAsSeen();

    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);

      // If the new message is from the chat partner, send "seen" event
      if (message.senderId !== sessionId) {
        axios.post("/api/message/seen", {
          chatId,
          messageId: message.id,
        });

        // Reset lastSeenMessageId when a new message is received from the chat partner
        setLastSeenMessageId(null);
      }
    };

    const seenHandler = (data: {
      chatId: string;
      messageId: string;
      seenBy: string;
    }) => {
      // Update "lastSeenMessageId" only if the message was seen by the chat partner
      if (data.seenBy === chatPartner.id && data.chatId === chatId) {
        setLastSeenMessageId(data.messageId);
      }
    };

    pusherClient.bind("incoming_message", messageHandler);
    pusherClient.bind("message_seen", seenHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unbind("incoming_message", messageHandler);
      pusherClient.unbind("message_seen", seenHandler);
    };
  }, [chatId, messages, sessionId, chatPartner.id, lastSeenMessageId]);

  const scrollDownRef = useRef<HTMLDivElement>(null);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };
  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-1 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        const currentMessageDate = format(message.timestamp, "dd/MM/yyyy");
        const previousMessageDate =
          index < messages.length - 1
            ? format(messages[index + 1].timestamp, "dd/MM/yyyy")
            : null;

        const showDateSeparator = currentMessageDate !== previousMessageDate;

        const formattedDate = isToday(message.timestamp)
          ? "Today"
          : isYesterday(message.timestamp)
          ? "Yesterday"
          : format(message.timestamp, "EEEE, MMMM d, yyyy");

        const showSeenIndicator =
          isCurrentUser &&
          message.id === lastSeenMessageId &&
          !hasNextMessageFromSameUser;

        return (
          <div key={`${message.id}-${message.timestamp}`}>
            {showDateSeparator && (
              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                <span className="mx-4 text-gray-400 dark:text-gray-500">
                  {formattedDate}
                </span>
                <hr className="flex-grow border-gray-300 dark:border-gray-600" />
              </div>
            )}
            <div className="chat-message">
              <div
                className={cn("flex items-end", {
                  "justify-end": isCurrentUser,

                  "pb-2": !hasNextMessageFromSameUser,
                })}
              >
                <div
                  className={cn(
                    "flex flex-col space-y-2 text-base max-w-xs mx-2",
                    {
                      "order-1 items-end": isCurrentUser,
                      "order-2 items-start": !isCurrentUser,
                    }
                  )}
                >
                  <span
                    className={cn("px-4 py-2 rounded-lg inline-block", {
                      "bg-orange-600 text-white": isCurrentUser,
                      "bg-gray-200 text-gray-900": !isCurrentUser,
                      "rounded-br-none":
                        !hasNextMessageFromSameUser && isCurrentUser,
                      "rounded-bl-none":
                        !hasNextMessageFromSameUser && !isCurrentUser,
                    })}
                  >
                    {message.text}{" "}
                    <span
                      className={cn("ml-2 text-xs", {
                        "text-gray-200": isCurrentUser,
                        "text-gray-400 dark:text-gray-500": !isCurrentUser,
                      })}
                    >
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </span>
                </div>

                <div
                  className={cn("relative w-6 h-6 flex-shrink-0", {
                    "order-2": isCurrentUser,
                    "order-1": !isCurrentUser,
                    invisible: hasNextMessageFromSameUser,
                  })}
                >
                  <Image
                    fill
                    src={
                      isCurrentUser ? (sessionImg as string) : chatPartner.image
                    }
                    alt="Profile picture"
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
            {showSeenIndicator && (
              <span className="text-xs text-gray-500 dark:text-gray-400 text-right block mr-8">
                Seen
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
