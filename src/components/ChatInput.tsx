// ChatInput.tsx

"use client";

import axios from "axios";
import { FC, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { Send, Sparkles, MessageCirclePlus } from "lucide-react";
import { motion } from "framer-motion"; // Add this import

interface ChatInputProps {
  chatPartner: User;
  chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] =
    useState<boolean>(false);
  const [rewritePrompt, setRewritePrompt] = useState<string>("");
  const [showPromptInput, setShowPromptInput] = useState<boolean>(false);
  const [isRewriting, setIsRewriting] = useState<boolean>(false);

  const hasFetched = useRef(false);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch("/api/mistral-ai/reply-suggestions", {
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
    // setIsLoading(true);

    try {
      await axios.post("/api/message/send", { text: input, chatId });
      setInput("");
      setSuggestions([]);
      setShowPromptInput(false);
      textareaRef.current?.focus();
    } catch {
      toast.error("Something went wrong. Please try again later.");
      // } finally {
      //   setIsLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!input || !rewritePrompt) return; // Ensure prompt is written
    setIsRewriting(true);

    try {
      const response = await fetch("/api/mistral-ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, prompt: rewritePrompt, chatId }),
      });

      if (!response.ok) {
        toast.error("Failed to rewrite the message.");
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let rewrittenText = "";

      while (true) {
        if (!reader) {
          throw new Error("Reader is undefined");
        }
        const { done, value } = await reader.read();
        if (done) break;
        rewrittenText += decoder.decode(value);
        setInput(rewrittenText);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsRewriting(false);
      setShowPromptInput(false);
      setRewritePrompt("");
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 px-4 pt-2 mb-2 sm:mb-0">
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={
          isLoadingSuggestions
            ? { height: "auto", opacity: 1 }
            : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.2 }}
        className={isLoadingSuggestions ? "animate-pulse" : ""}
      >
        <p>Loading suggestions...</p>
      </motion.div>
      <motion.div
        animate={
          suggestions.length > 0
            ? { height: "auto", opacity: 1 }
            : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.2 }}
      >
        <div className="mb-2 flex space-x-2">
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
      </motion.div>
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-orange-500">
        <div className="flex items-center py-2 pl-3 pr-2">
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
            placeholder={`Message ${
              chatPartner.name.length > 20
                ? chatPartner.name.slice(0, 20) + "..."
                : chatPartner.name
            }`}
            className="flex-grow block w-full resize-none border-0 bg-transparent placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
          />
          <button
            onClick={() => setShowPromptInput(!showPromptInput)}
            disabled={!input}
            className={`m-2 ${
              input ? "text-orange-500" : "text-gray-400 cursor-default"
            }`}
          >
            <MessageCirclePlus />
          </button>
          <button
            onClick={input ? sendMessage : undefined}
            disabled={!input}
            className={`m-2 ${
              input ? "text-orange-500" : "text-gray-400 cursor-default"
            }`}
          >
            <Send />
          </button>
        </div>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={
            showPromptInput
              ? { height: 55, opacity: 1 }
              : { height: 0, opacity: 0 }
          }
          transition={{ duration: 0.3 }}
          className="border-t border-gray-200 dark:border-gray-700 flex items-center px-1 mx-2"
        >
          <input
            type="text"
            value={rewritePrompt}
            onChange={(e) => setRewritePrompt(e.target.value)}
            placeholder="Guide the AI (e.g., make it longer, add emojis...)"
            className="flex-grow block w-full resize-none border-0 bg-transparent placeholder:text-gray-400 focus:ring-0 outline-none sm:py-1.5 sm:text-sm sm:leading-6" // Matching styling and removing outline
          />
          <button
            onClick={handleRewrite}
            disabled={!rewritePrompt || isRewriting}
            className={`m-2 ${
              rewritePrompt && !isRewriting
                ? "text-orange-500"
                : "text-gray-400 cursor-default"
            }`}
          >
            <Sparkles />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInput;
