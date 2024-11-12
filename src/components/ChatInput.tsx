// ChatInput.tsx

"use client";

import axios from "axios";
import { FC, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./ui/Button";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";

interface ChatInputProps {
  chatPartner: User;
  chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] =
    useState<boolean>(false);

  const hasFetched = useRef(false);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch("/api/reply-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) {
        toast.error("Rate limit exceeded. Retrying in a few seconds...");
        setTimeout(fetchSuggestions, 5000); // Retry after 5 seconds
        return;
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch reply suggestions.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchSuggestions();
      hasFetched.current = true;
    }
  }, [chatId]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const messageHandler = (message: Message) => {
      if (message.senderId === chatPartner.id) {
        fetchSuggestions();
      }
    };

    pusherClient.bind("incoming_message", messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming_message", messageHandler);
    };
  }, [chatId, chatPartner]);

  const sendMessage = async () => {
    if (!input) return;
    setIsLoading(true);

    try {
      await axios.post("/api/message/send", { text: input, chatId });
      setInput("");
      textareaRef.current?.focus();
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      {isLoadingSuggestions && <p>Loading suggestions...</p>}
      {suggestions.length > 0 && (
        <div className="mb-2">
          <p className="text-sm text-gray-500">Suggestions:</p>
          <div className="flex space-x-2">
            {suggestions.map((suggestion, index) => (
              <span
                className={
                  "px-4 py-2 rounded-lg inline-block bg-orange-600 text-white"
                }
                key={index}
              >
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="flex items-center justify-center h-full"
                >
                  {suggestion}
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-orange-500">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
        />

        <div
          onClick={() => textareaRef.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div>

        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrin-0">
            <Button
              isLoading={isLoading}
              onClick={sendMessage}
              type="submit"
              variants={input ? "default" : "ghost"}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
