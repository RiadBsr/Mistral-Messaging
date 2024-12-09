// src/app/api/reply-suggestions/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRedis } from "@/helpers/redis";
import { Mistral } from "@mistralai/mistralai";
import { messageArrayValidator } from "@/lib/validations/message";
import { Message } from "@/lib/validations/message";
import { differenceInMinutes, differenceInHours } from "date-fns";

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
      const diffMinutes = differenceInMinutes(now, lastMessageTime);
      const diffHours = differenceInHours(now, lastMessageTime);

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

    // Determine who sent the last message
    const lastMessage =
      messages.length > 0 ? messages[messages.length - 1] : null;
    const lastSenderIsUser = lastMessage?.senderId === session.user.id;

    // Update 'elapsedTime'
    elapsedTime = lastMessage
      ? getElapsedTime(lastMessage.timestamp)
      : elapsedTime;

    // Craft the prompt based on the conversation situation
    let prompt = "";

    if (!lastMessage) {
      // No messages yet, use opening prompt
      prompt = `You are an AI assistant that generates three natural and varied opening messages or greetings for initiating a conversation. The suggestions should closely resemble the user's writing style, including punctuation, capitalization, and any unique stylistic choices. Pay attention to how the user structures sentences, uses abbreviations, emojis, or any other distinctive features.

Ensure that the greetings are appropriate for the time of day: it's currently the ${currentTimeOfDay}. Provide different options that feel natural and engaging to start a conversation.

Based on these instructions, generate three opening message suggestions for the user to start a conversation. Output only the suggestions as a JSON array of strings without any additional text, code snippets, or code fences.`;
    } else if (lastSenderIsUser) {
      // Last message sent by the user
      prompt = `You are an AI assistant that helps the user continue the conversation naturally. The last message was sent by the user ${elapsedTime}. Based on the conversation history below, generate three natural and engaging messages for the user to send next. Ensure the messages align with the user's writing style, including punctuation, capitalization, and any unique stylistic choices. Consider the time of day: it's currently the ${currentTimeOfDay}.

Conversation history:
${messages
  .map((m) => {
    const role = m.senderId === session.user.id ? "User" : "Chat Partner";
    return `${role}: ${m.text}`;
  })
  .join("\n")}

Based on the conversation, generate three suggestions for the user to continue the conversation. Output only the suggestions as a JSON array of strings without any additional text, code snippets, or code fences.`;
    } else {
      // Last message sent by the chat partner
      prompt = `You are an AI assistant that generates three natural and nuanced reply suggestions based on the conversation history below. The last message was sent by the chat partner ${elapsedTime}. Ensure the replies are varied and nuanced; they should not all be similar or follow the same sentiment, especially if the last message was a question. The suggestions should closely resemble the user's writing style, including punctuation, capitalization, and any unique stylistic choices. Consider the time of day: it's currently the ${currentTimeOfDay}.

Conversation history:
${messages
  .map((m) => {
    const role = m.senderId === session.user.id ? "User" : "Chat Partner";
    return `${role}: ${m.text}`;
  })
  .join("\n")}

Based on the conversation, generate three reply suggestions for the user to reply with. The suggestions should be coherent with the current discussion and match the user's writing style. Output only the suggestions as a JSON array of strings without any additional text, code snippets, or code fences.`;
    }

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
          "You are a helpful assistant that generates reply suggestions by analyzing the user's writing style and the conversation context.",
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
