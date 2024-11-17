import { Mistral } from "@mistralai/mistralai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRedis } from "@/helpers/redis";
import { messageArrayValidator } from "@/lib/validations/message";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { text, prompt, chatId } = await req.json();
    const apiKey = process.env.MISTRAL_API_KEY;
    const client = new Mistral({ apiKey });

    // Fetch the conversation history
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      -10,
      -1
    );
    const dbMessages = results.map((message) => JSON.parse(message) as Message);
    const messages = messageArrayValidator.parse(dbMessages);

    const mistralMessages: Array<{
      role: "system" | "user" | "assistant" | "tool";
      content: string;
    }> = [
      {
        role: "system",
        content:
          "You are a helpful assistant that rewrites messages based on user prompts and based on the conversation history. Return only the rewritten message as a plain string without any additional explanations, brackets, or formatting.",
      },
      {
        role: "user",
        content: `Rewrite the following message: "${text}" with the prompt: "${prompt}"
        
        Conversation history:
        ${
          messages.length > 0
            ? messages
                .map((m) => {
                  const role =
                    m.senderId === session.user.id ? "User" : "Partner";
                  return `${role}: ${m.text}`;
                })
                .join("\n")
            : "No messages yet."
        }

        Ensure that the output is solely the rewritten message without any brackets, quotes, or supplementary text.
        `,
      },
    ];

    const result = await client.chat.stream({
      model: "mistral-small-latest",
      messages: mistralMessages,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result) {
          const streamText = chunk.data.choices[0].delta.content as string;
          controller.enqueue(new TextEncoder().encode(streamText));
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
