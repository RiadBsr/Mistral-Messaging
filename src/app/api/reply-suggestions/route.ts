// src/app/api/reply-suggestions/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRedis } from "@/helpers/redis";
import { Mistral } from "@mistralai/mistralai";
import { messageArrayValidator } from "@/lib/validations/message";
import { Message } from "@/lib/validations/message";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { chatId } = await req.json();

    // Fetch the conversation history
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );
    const dbMessages = results.map((message) => JSON.parse(message) as Message);
    const messages = messageArrayValidator.parse(dbMessages);

    // Prepare the prompt
    const prompt = `You are an AI assistant that generates three natural reply suggestions based on the conversation history below. The suggestions should closely resemble the user's writing style, including punctuation, capitalization, and any unique stylistic choices. Pay attention to how the user structures sentences, uses abbreviations, emojis, or any other distinctive features.

If there is no conversation history yet, suggest appropriate opening messages or natural greetings that usually people use when chating online.

Conversation history:
${
  messages.length > 0
    ? messages
        .map((m) => {
          const role = m.senderId === session.user.id ? "User" : "Partner";
          return `${role}: ${m.text}`;
        })
        .join("\n")
    : "No messages yet."
}

Based on the conversation, generate three reply suggestions for the user to reply with. The suggestions should be coherent with the current discussion and match the user's writing style. Output only the suggestions as a JSON array of strings without any additional text, code snippets, or code fences.
`;

    // Initialize the Mistral client
    const apiKey = process.env.MISTRAL_API_KEY;
    const client = new Mistral({ apiKey });

    // Prepare the messages for Mistral API
    const mistralMessages: Array<{
      role: "system" | "user" | "assistant" | "tool";
      content: string;
    }> = [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates reply suggestions by analyzing the user's writing style, including punctuation, capitalization, and stylistic choices.",
      },
      { role: "user", content: prompt },
    ];

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: mistralMessages,
      responseFormat: { type: "json_object" },
    });

    const responseText =
      (chatResponse.choices?.[0]?.message?.content as string) ?? "";

    // Parse the response to extract suggestions
    const suggestions: string[] = JSON.parse(responseText);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.log(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
