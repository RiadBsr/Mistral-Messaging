"use client";

import Button from "@/components/ui/Button";
import { Icons } from "@/components/Icons";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [text, setText] = useState("");
  const [gradientOpacity, setGradientOpacity] = useState("opacity-100");
  const [contentTransform, setContentTransform] = useState("");
  const [textColor, setTextColor] = useState("text-black");
  const fullText =
    "Real-time messaging with AI-powered contextual reply suggestions and rewriting.";
  const router = useRouter();
  const [speed, setSpeed] = useState(50); // Default speed is 50ms
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateText = () => {
      setText(fullText.slice(0, indexRef.current + 1));
      indexRef.current++;
      if (indexRef.current < fullText.length) {
        timeoutRef.current = setTimeout(updateText, speed);
      }
    };
    updateText();
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [speed]);

  useEffect(() => {
    const handleMouseDown = () => {
      setSpeed(5);
    };

    const handleMouseUp = () => {
      setSpeed(50);
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleMouseDown);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleMouseDown);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  const handleSignIn = () => {
    // Fade out the gradient overlay
    setGradientOpacity("opacity-0");
    // Move the content downwards
    setContentTransform("translate-y-[1.5rem]");
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
          className={`pb-6 text-base sm:text-lg max-w-xl sm:max-w-2xl font-bold font-mono text-center transition-colors duration-1000 ${textColor} select-none`}
        >
          {text}
        </p>
        <div className="my-8">
          {text === fullText && (
            <Button
              className="font-bold font-mono rounded-none select-none"
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
