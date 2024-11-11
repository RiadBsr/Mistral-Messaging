"use client";

import { ButtonHTMLAttributes, FC, useState } from "react";
import Button from "./ui/Button";
import toast from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const SignOutButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  ...props
}) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  return (
    <Button
      {...props}
      variants="ghost"
      onClick={async () => {
        setIsSigningOut(true);
        try {
          await signOut();
        } catch (error) {
          console.log(error);
          toast.error("There was a problem signing out");
        } finally {
          setIsSigningOut(false);
        }
      }}
    >
      {isSigningOut ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
    </Button>
  );
};

export default SignOutButton;
