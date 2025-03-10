"use client";

import { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import Link from "next/link";
import { Icons } from "./Icons";
import { Menu, X } from "lucide-react";
import SignOutButton from "./SignOutButton";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { SidebarOption } from "@/types/typings";
import SidebarChatList from "./SidebarChatList";
import FriendRequestSidebarOptions from "./FriendRequestSidebarOptions";
import Image from "next/image";

interface MobileChatLayoutProps {
  friends: User[];
  session: Session;
  sidebarOptions: SidebarOption[];
  unseenRequestCount: number;
}

const MobileChatLayout: FC<MobileChatLayoutProps> = ({
  friends,
  session,
  sidebarOptions,
  unseenRequestCount,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="fixed bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 top-0 inset-x-0 py-2 px-4">
      <div className="w-full flex justify-between items-center">
        <Link href="/dashboard" className="flex h-25 shrink-0 items-center">
          <Icons.Logo className="h-10 w-auto pr-2 text-orange-600" />
          <span className="font-bold text-lg font-mono select-none leading-tight text-gray-900 dark:text-gray-100">
            Mistral
            <br />
            Msg_
          </span>
        </Link>
        <Menu
          onClick={() => setOpen(true)}
          className="h-6 w-6 text-gray-900 dark:text-gray-100"
        />
      </div>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
              <DialogPanel
                transition
                className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:-translate-x-full sm:duration-700"
              >
                <TransitionChild>
                  <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-zinc-800 py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                          Dashboard
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white dark:bg-zinc-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <nav className="flex flex-1 flex-col">
                        <ul
                          role="list"
                          className="flex flex-1 flex-col gap-y-7"
                        >
                          <li>
                            <SidebarChatList
                              friends={friends}
                              sessionId={session.user.id}
                            />
                          </li>

                          <li>
                            <div className="text-xs font-semibold leading-6 text-gray-400 dark:text-gray-300">
                              Overview
                            </div>
                            <ul role="list" className="-mx-2 mt-2 space-y-1">
                              {sidebarOptions.map((option) => {
                                const Icon = Icons[option.Icon];
                                return (
                                  <li key={option.name}>
                                    <Link
                                      href={option.href}
                                      className="text-gray-700 dark:text-gray-300 hover:text-orange-600 hover:bg-gray-50 dark:hover:bg-gray-700 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                    >
                                      <span className="text-gray-400 border-gray-200 group-hover:border-orange-600 group-hover:text-orange-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white dark:bg-zinc-800">
                                        <Icon className="h-4 w-4" />
                                      </span>
                                      <span className="truncate">
                                        {option.name}
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}

                              <li>
                                <FriendRequestSidebarOptions
                                  initialUnseenRequestCount={unseenRequestCount}
                                  sessionId={session.user.id}
                                />
                              </li>
                            </ul>
                          </li>

                          <li className="-ml-6 mt-auto flex items-center">
                            <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
                              <div className="relative h-8 w-8 bg-gray-50 dark:bg-zinc-800">
                                <Image
                                  fill
                                  referrerPolicy="no-referrer"
                                  className="rounded-full"
                                  src={session.user.image || ""}
                                  alt="Your profile picture"
                                />
                              </div>

                              <span className="sr-only">Your profile</span>
                              <div className="flex flex-col">
                                <span aria-hidden="true">
                                  {session.user.name}
                                </span>
                                <span
                                  className="text-xs text-zinc-400 dark:text-zinc-500"
                                  aria-hidden="true"
                                >
                                  {session.user.email}
                                </span>
                              </div>
                            </div>

                            <SignOutButton className="h-full aspect-square" />
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </TransitionChild>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MobileChatLayout;
