"use client";

import { useState } from "react";
import { MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { StoryComment } from "@/data/data";

const PAGE_SIZE = 5;

export default function CommentSection({
  comments,
  commentsCount,
}: {
  comments: StoryComment[];
  commentsCount: number;
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(comments.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visible = comments.slice(start, start + PAGE_SIZE);

  function goTo(p: number) {
    setPage(p);
    // Scroll to top of comment section
    document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mt-12 min-w-0" id="comments-section">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 min-w-0">
        <MessageCircle className="w-6 h-6 text-red-600" />
        Comments ({commentsCount})
      </h3>

      {comments.length > 0 ? (
        <>
          <div className="space-y-4 mb-6">
            {visible.map((comment) => (
              <div
                key={comment.id}
                className="p-4 sm:p-5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-3">
                  <span className="font-semibold text-gray-900 dark:text-white truncate min-w-0">
                    {comment.name}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                    {new Date(comment.createdAt).toLocaleDateString("en-UG")}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`w-9 h-9 text-sm font-semibold rounded-full transition-all ${
                      p === page
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 mb-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}
