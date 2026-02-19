"use client";

import { Loader } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface StylesInterface {
  container?: string;
  title?: string;
  label?: string;
}

export interface CustomButtonProps {
  title: string;
  label?: string;
  icon?: string;
  image?: string;
  styles?: StylesInterface;
  callback?: () => void;
}

enum ButtonState {
  ACTIVE = "active",
  LOADING = "loading",
  DISABLED = "disabled",
}

export function CustomButton(props: CustomButtonProps) {
  const [status, setStatus] = useState(ButtonState.ACTIVE);

  const { title = "", label = "", image, styles, callback } = props;

  const stylesContainer = cn(
    "flex gap-2 items-center px-3 py-2 w-full rounded-full border text-xs cursor-pointer bg-white dark:bg-stone-200",
    styles?.container,
  );

  const stylesTextContainer = cn(
    "flex flex-col items-start w-full",
    !label && "justify-center",
  );

  const stylesTitle = cn("dark:text-black", !image && "m-auto", styles?.title);

  const stylesLabel = cn(
    "text-[10px] text-gray-500 truncate max-w-[180px]",
    !label && "hidden",
    styles?.label,
  );

  const handleButtonClick = () => {
    setStatus(ButtonState.LOADING);
    callback?.();
  };

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      className={stylesContainer}
      disabled={status === ButtonState.LOADING}
    >
      {image && status === ButtonState.ACTIVE && (
        <Image
          src={image}
          alt="user"
          width={32}
          height={24}
          aria-hidden="true"
          className="rounded-full object-cover"
        />
      )}

      {status === ButtonState.LOADING && (
        <div className="flex flex-col justify-center w-8 h-8 animate-spin">
          <Loader width={32} height={24} className="dark:text-black" />
        </div>
      )}

      <div className={stylesTextContainer}>
        <div className={stylesTitle}>{title}</div>

        {label && <div className={stylesLabel}>{label}</div>}
      </div>
    </button>
  );
}
