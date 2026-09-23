"use client";

import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { submitContact } from "@/lib/api";

// Client-side rate limiting: 48 hours between submissions (matches backend)
const RATE_LIMIT_HOURS = 48;

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const lastSubmitTimeRef = useRef<number>(0);

  // Auto-dismiss feedback messages after 5 seconds
  useEffect(() => {
    if (!success && !error) return;
    const timer = setTimeout(() => {
      setSuccess(false);
      setError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [success, error]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTimeRef.current;
    const rateLimitMs = RATE_LIMIT_HOURS * 60 * 60 * 1000;
    if (timeSinceLastSubmit < rateLimitMs) {
      const hoursRemaining = Math.ceil((rateLimitMs - timeSinceLastSubmit) / (60 * 60 * 1000));
      setError(`Please wait ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} before sending another message.`);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "");
    const email = String(fd.get("email") || "");
    const subject = String(fd.get("subject") || "");
    const phone = String(fd.get("phone") || "");
    const message = String(fd.get("message") || "");

    // Validate phone if provided
    if (phone && !/^\+?[\d\s\-().]{7,20}$/.test(phone)) {
      setError("Please enter a valid phone number (e.g. +256 700 000 000).");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await submitContact({ name, email, subject, phone, message });
      setSuccess(true);
      lastSubmitTimeRef.current = Date.now();
      // Use ref to safely reset form
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (err) {
      // Handle specific error types for better user feedback
      let errorMessage = "Something went wrong. Please try again.";
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        // Network/server errors
        if (message.includes("can't connect") || 
            message.includes("network") || 
            message.includes("offline") ||
            message.includes("failed to fetch") ||
            message.includes("server")) {
          errorMessage = "Can't connect to the server. Please check your internet connection and try again.";
        } else if (message.includes("404") || message.includes("couldn't find")) {
          // Don't show 404 for contact form - it means server might be down
          errorMessage = "Our server seems to be unavailable. Please try again in a moment.";
        } else if (message.includes("500") || message.includes("502") || message.includes("503") || message.includes("504")) {
          errorMessage = "Our server is experiencing issues. Please try again later.";
        } else if (message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
      <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-6">
        Send Us a Message
      </h2>
      {success && (
        <div className="mb-5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 px-4 py-3 text-sm">
          Message sent successfully. We shall contact you soon.
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form ref={formRef} className="space-y-5" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Enter your name"
              autoComplete="name"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your valid email"
              autoComplete="email"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Subject *
          </label>
          <select
            id="subject"
            name="subject"
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          >
            <option value="">Select a subject</option>
            <option value="news-tip">News Tip</option>
            <option value="story-submission">Submit Your Story</option>
            <option value="story-feedback">Story Feedback</option>
            <option value="tourism-listing">List Your Tourism Business</option>
            <option value="advertising">Advertising Inquiry</option>
            <option value="correction">Correction / Fact Check</option>
            <option value="general">General Inquiry</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter your phone number (optional)"
            pattern="^\+?[\d\s\-().]{7,20}$"
            title="Enter a valid phone number (e.g. +256 700 000 000)"
            autoComplete="tel"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="Write your message here..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <Send size={16} />
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
}
