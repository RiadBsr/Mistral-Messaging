import { FC } from "react";
import Image from "next/image";
import { chatHrefConstructor, cn } from "@/lib/utils";
import { toast, Toast } from "react-hot-toast";

interface FriendRequestAcceptedToastProps {
  t: Toast;
  sessionId: string;
  accepterId: string;
  accepterName: string;
  accepterImg: string;
}

const FriendRequestAcceptedToast: FC<FriendRequestAcceptedToastProps> = ({
  t,
  sessionId,
  accepterId,
  accepterName,
  accepterImg,
}) => {
  return (
    <div
      className={cn(
        "max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5",
        { "animate-enter": t.visible, "animate-leave": !t.visible }
      )}
    >
      <a
        onClick={() => toast.dismiss(t.id)}
        href={`/dashboard/chat/${chatHrefConstructor(sessionId, accepterId)}`}
        className="flex-1 w-0 p-4"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="relative h-10 w-10">
              <Image
                fill
                referrerPolicy="no-referrer"
                className="rounded-full"
                src={accepterImg}
                alt={`${accepterName} profile picture`}
              />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {accepterName}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Accepted your friend request
            </p>
          </div>
        </div>
      </a>
      <div className="flex border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-orange-600 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FriendRequestAcceptedToast;
