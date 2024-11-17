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
      -10,
      -1
    );
    const dbMessages = results.map((message) => JSON.parse(message) as Message);
    const messages = messageArrayValidator.parse(dbMessages);

    // Prepare the prompt
    // Function to determine the current time of day
    function getCurrentTimeOfDay() {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) return "morning";
      if (hour < 18) return "afternoon";
      return "evening";
    }

    // Function to calculate elapsed time since the last message
    function getElapsedTime(lastTimestamp: string | number | Date) {
      const now = new Date();
      const lastMessageTime = new Date(lastTimestamp);
      const diffMs = now.getTime() - lastMessageTime.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffHours > 0) {
        return `${diffHours} hour(s) ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute(s) ago`;
      } else {
        return "just now";
      }
    }

    // Example usage:
    // Assuming 'messages' is an array of message objects with a 'timestamp' property
    const currentTimeOfDay = getCurrentTimeOfDay();
    let elapsedTime = "no time information available";

    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      elapsedTime = getElapsedTime(lastMessage.timestamp);
    }
    // Define the prompt for generating opening messages
    const openingPrompt = `You are an AI assistant that generates three natural and varied opening messages or greetings for initiating a conversation. The suggestions should closely resemble the user's writing style, including punctuation, capitalization, and any unique stylistic choices. Pay attention to how the user structures sentences, uses abbreviations, emojis, or any other distinctive features.

Ensure that the greetings are appropriate for the time of day: it's currently the ${currentTimeOfDay}. The suggestions should be nuanced and not all follow the same sentiment or structure. Provide different options that feel natural and engaging to start a conversation.

If there is no conversation history yet, suggest appropriate opening messages or natural greetings that people usually use when chatting online.

Based on these instructions, generate three opening message suggestions for the user to start a conversation. The suggestions should match the user's writing style and be contextually appropriate for initiating a chat. Output only the suggestions as a JSON array of strings without any additional text, code snippets, or code fences.
`;

    const prompt = `You are an AI assistant that generates three natural and nuanced reply suggestions based on the conversation history below. The suggestions should closely resemble the user's writing style, including punctuation, capitalization, and any unique stylistic choices. Pay attention to how the user structures sentences, uses abbreviations, emojis, or any other distinctive features.

Ensure that the replies are varied and nuanced; they should not all be similar or follow the same sentiment, especially if the last message was a question. Provide different options that are contextually appropriate, whether positive, neutral, or negative as suitable.

Consider the current time of day: it's currently the ${currentTimeOfDay}. Also, the last message was sent ${elapsedTime}.

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
      { role: "user", content: messages.length > 0 ? prompt : openingPrompt },
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
