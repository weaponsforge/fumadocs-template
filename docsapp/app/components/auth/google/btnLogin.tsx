"use client";

import { signIn } from "next-auth/react";
import { CustomButton } from "@/app/components/ui/buttons/buttonCustom";

export function GoogleSignInButton() {
  return (
    <CustomButton
      title="Sign-in with Google"
      image="/images/icon-google.svg"
      callback={() => signIn("google", { callbackUrl: "/docs" })}
      styles={{
        container:
          "flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer w-50",
      }}
    />
  );
}
