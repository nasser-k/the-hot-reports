export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center gap-1 mb-4">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Loading...
        </p>
      </div>
    </div>
  );
}
