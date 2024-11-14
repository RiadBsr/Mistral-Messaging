"use client";

import Button from "@/components/ui/Button";
import { Icons } from "@/components/Icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [text, setText] = useState("");
  const [gradientOpacity, setGradientOpacity] = useState("opacity-100");
  const [contentTransform, setContentTransform] = useState("");
  const [textColor, setTextColor] = useState("text-black");
  const fullText =
    "This application provides real-time messaging functionality, built using Next.js and integrated with Mistral AI. Users can send and receive messages instantly, with AI features seamlessly incorporated into the experience.";
  const router = useRouter();

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = () => {
    // Fade out the gradient overlay
    setGradientOpacity("opacity-0");
    // Move the content downwards
    setContentTransform("translate-y-[3.5rem]");
    // Change text color to white
    setTextColor("text-white");
    // Navigate to the login page after the animation completes
    setTimeout(() => {
      router.push("/login");
    }, 1000); // Duration matches the transition durations
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white text-black py-2 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-tl from-orange-600 via-yellow-500 to-white transition-opacity duration-1000 ${gradientOpacity}`}
      ></div>

      {/* Content Wrapper */}
      <div
        className={`absolute z-10 flex flex-col items-center transition-transform duration-1000 ${contentTransform}`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 pb-10">
          <Icons.Logo
            width={150}
            height={150}
            className="w-24 h-24 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
          />
          <span className="font-bold text-4xl sm:text-5xl lg:text-6xl font-mono select-none leading-tight flex items-center text-center sm:text-left">
            Mistral <br /> Msg_
          </span>
        </div>
        <p
          className={`pb-6 text-base sm:text-lg max-w-xl sm:max-w-2xl font-bold font-mono text-center transition-colors duration-1000 ${textColor}`}
        >
          {text}
        </p>
        <div className="my-8">
          {text === fullText && (
            <Button
              className="font-bold font-mono rounded-none"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
