"use client";

import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (response?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(response?.url ?? "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-white/80">
          Email
        </label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue="admin@ludo.local"
          className="h-12 w-full rounded border border-white/10 bg-white/10 px-3 text-white outline-none transition placeholder:text-white/35 focus:border-ludo-gold"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-white/80">
          Password
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 w-full rounded border border-white/10 bg-white/10 px-3 text-white outline-none transition placeholder:text-white/35 focus:border-ludo-gold"
        />
      </div>

      {error ? (
        <p className="rounded border border-ludo-red/50 bg-ludo-red/15 px-3 py-2 text-sm font-semibold text-red-100">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded bg-ludo-red px-4 text-sm font-black uppercase text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Login
      </button>
    </form>
  );
}
