"use client";

import { useState } from "react";
import { getApiErrorMessage, subscribeNewsletter } from "@/lib/api";

interface NewsletterFormProps {
  minimal?: boolean;
}

export default function NewsletterForm({ minimal = false }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await subscribeNewsletter(email);
      setSuccess(res.alreadySubscribed ? "You are already subscribed." : "Subscribed successfully.");
      setEmail("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Something went wrong."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={minimal ? "" : "bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4 lg:p-5"}>
      {!minimal && (
        <>
          <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1 sm:mb-2">
            Stay Updated
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
            Get the latest news delivered to your inbox.
          </p>
        </>
      )}
      {success && (
        <div className="mb-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 px-3 py-2 text-xs sm:text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 px-3 py-2 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <form className={`${minimal ? "flex gap-2" : "space-y-2 sm:space-y-3"}`} onSubmit={onSubmit}>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={`${minimal ? "flex-1" : "w-full"} px-3 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors`}
        />
        <div className={`${minimal ? "flex-shrink-0" : ""}`}>
          <button
            type="submit"
            disabled={submitting}
            className={`${minimal ? "" : "w-full"} px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm sm:text-base font-bold rounded-full transition-colors whitespace-nowrap`}
          >
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
      </form>
    </div>
  );
}
