import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );
    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reversedDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch (error) {
    console.log(error);
    notFound();
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const { user } = session;

  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && user.id !== userId2) notFound();

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  const chatPartnerRaw = (await fetchRedis(
    "get",
    `user:${chatPartnerId}`
  )) as string;
  const chatPartner = JSON.parse(chatPartnerRaw) as User;
  const initialMessages = await getChatMessages(chatId);

  // Fetch the last seen message ID for the chat partner using fetchRedis
  const lastSeenMessageId = (await fetchRedis(
    "hget",
    `chat:${chatId}:seen`,
    chatPartnerId
  )) as string | null;

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh)-6rem]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 dark:text-gray-300 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              {chatPartner.email}
            </span>
          </div>
        </div>
      </div>

      <Messages
        sessionId={session.user.id}
        initialMessages={initialMessages}
        sessionImg={session.user.image}
        chatPartner={chatPartner}
        chatId={chatId}
        initialLastSeenMessageId={lastSeenMessageId}
      />
      <ChatInput chatId={chatId} chatPartner={chatPartner} />
    </div>
  );
}
