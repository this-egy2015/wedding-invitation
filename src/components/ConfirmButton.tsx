"use client";

import type { ComponentProps } from "react";

/** Submit button that asks for confirmation before submitting its parent form. */
export function ConfirmButton({ message, ...props }: ComponentProps<"button"> & { message: string }) {
  return (
    <button
      type="submit"
      {...props}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    />
  );
}
