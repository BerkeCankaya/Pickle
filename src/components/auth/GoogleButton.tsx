"use client";

import { useFormStatus } from "react-dom";
import { GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { signInWithGoogle } from "@/lib/auth/actions";

function GoogleSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" fullWidth loading={pending}>
      {!pending && <GoogleIcon className="size-5" />}
      Google ile devam et
    </Button>
  );
}

export function GoogleButton({ next }: { next: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next} />
      <GoogleSubmit />
    </form>
  );
}

/** "veya" ayıracı. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-sm text-secondary" aria-hidden="true">
      <span className="h-px flex-1 bg-secondary/25" />
      veya
      <span className="h-px flex-1 bg-secondary/25" />
    </div>
  );
}
