"use client";

import Image from "next/image";
import { UserPlus } from "lucide-react";
import { FC, useState } from "react";
import { addFriendValidator } from "@/lib/validations/add-friend";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { toast } from "react-hot-toast";

interface AddDeveloperCardClientProps {
  developer: User;
}

const AddDeveloperCardClient: FC<AddDeveloperCardClientProps> = ({
  developer,
}) => {
  const [isRequestSent, setIsRequestSent] = useState<boolean>(false);

  const handleAddFriend = async () => {
    try {
      const validatedEmail = addFriendValidator.parse({
        email: developer?.email,
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
          {developer?.image ? (
            <Image
              referrerPolicy="no-referrer"
              className="rounded-full"
              alt={`${developer.name}'s profile picture`}
              src={developer.image}
              fill
            />
          ) : (
            <div className="bg-gray-300 rounded-full h-10 w-10" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold">
          {developer?.name.split(" ")[0] ?? "Developer"} 👋
        </h4>
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
