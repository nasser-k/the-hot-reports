"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";
import { commentOnStoryEpisode, getApiErrorMessage } from "@/lib/api";

interface CommentSheetProps {
  episodeSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RATE_LIMIT_KEY = "last_comment_time";
const RATE_LIMIT_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

export default function CommentSheet({ episodeSlug, isOpen, onClose, onSuccess }: CommentSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-dismiss feedback messages after 5 seconds
  useEffect(() => {
    if (!success && !error) return;
    const timer = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [success, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim() || submitting) return;

    // 2-day rate limit check
    const lastCommentTime = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastCommentTime) {
      const elapsed = Date.now() - parseInt(lastCommentTime, 10);
      if (elapsed < RATE_LIMIT_MS) {
        const hoursLeft = Math.ceil((RATE_LIMIT_MS - elapsed) / (1000 * 60 * 60));
        setError(`You can submit another comment in ${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""}.`);
        return;
      }
    }

    setSubmitting(true);
    setSuccess("");
    setError("");
    try {
      await commentOnStoryEpisode(episodeSlug, {
        name: name.trim(),
        email: email.trim(),
        content: content.trim(),
      });
      localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      setName("");
      setEmail("");
      setContent("");
      setSuccess("Comment submitted! It will appear after approval.");
      onSuccess?.();
      router.refresh();
    } catch (err) {
      console.error("Failed to submit comment:", err);
      setError(getApiErrorMessage(err, "Failed to submit comment. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Mobile Sheet - slides from bottom */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-red-600" />
            Add a Comment
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 px-4 py-3 text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="comment-name-mobile" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name *
              </label>
              <input
                id="comment-name-mobile"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                autoComplete="name"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="comment-email-mobile" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address *
              </label>
              <input
                id="comment-email-mobile"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your valid email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="comment-content-mobile" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Comment *
              </label>
              <textarea
                id="comment-content-mobile"
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Post Comment
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Desktop Centered Modal */}
      <div
        className={`hidden lg:flex fixed inset-0 z-50 items-center justify-center ${
          isOpen ? "pointer-events-auto" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg mx-4 overflow-hidden transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-red-600" />
              Add a Comment
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {success && (
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 px-4 py-3 text-sm">
                  {success}
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="comment-name-desktop" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="comment-name-desktop"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    autoComplete="name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="comment-email-desktop" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="comment-email-desktop"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your valid email"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="comment-content-desktop" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Comment *
                </label>
                <textarea
                  id="comment-content-desktop"
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold rounded-full transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-full transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Post Comment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
