"use client";

import Image from "next/image";
import { UserPlus } from "lucide-react";
import { FC, useState } from "react";
import { addFriendValidator } from "@/lib/validations/add-friend";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { toast } from "react-hot-toast";

const AddDeveloperCardClient: FC = () => {
  const [isRequestSent, setIsRequestSent] = useState<boolean>(false);

  const handleAddFriend = async () => {
    try {
      const validatedEmail = addFriendValidator.parse({
        email: "riad.boussoura@gmail.com",
      });

      await axios.post("/api/friends/add", {
        email: validatedEmail,
      });
      setIsRequestSent(true);
      toast.success("Friend request sent!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.message);
        return;
      }
      if (error instanceof AxiosError) {
        toast.error(error.response?.data);
        return;
      }
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-md flex items-center">
      <div className="flex-shrink-0 mr-4">
        <div className="relative h-10 w-10">
          <Image
            referrerPolicy="no-referrer"
            className="rounded-full"
            alt={`$Dev's profile picture`}
            src={
              "https://lh3.googleusercontent.com/a/ACg8ocLBmF6hq6uPgVkVAe-8e7YuWL6HODzYPp8IUwKe8eIrD1g6Nys=s96-c"
            }
            fill
          />
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold">{"Developer"} 👋</h4>
        <p className="text-sm text-zinc-500">
          Add the developer as a friend to test the app.
        </p>
      </div>
      {isRequestSent ? (
        <p className="ml-4 text-sm text-green-500">Request Sent!</p>
      ) : (
        <button
          onClick={handleAddFriend}
          className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Add Friend
        </button>
      )}
    </div>
  );
};

export default AddDeveloperCardClient;
