import Image from "next/image";

interface InlineContentImageProps {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
}

/**
 * Small newspaper-style figure floated within article/episode body copy.
 */
export default function InlineContentImage({
  src,
  alt,
  caption,
  priority = false,
}: InlineContentImageProps) {
  return (
    <figure className="not-prose float-none sm:float-left w-full sm:w-52 lg:w-64 max-w-full sm:max-w-[45%] lg:max-w-[50%] mx-auto sm:mx-0 sm:mr-4 sm:mb-4 mb-4 shrink-0">
      <div className="relative overflow-hidden rounded-sm border border-gray-300/80 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 shadow-sm max-w-full">
        <Image
          src={src}
          alt={alt}
          width={400}
          height={300}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 208px, 256px"
          className="object-contain w-full h-auto"
          priority={priority}
        />
      </div>
      {caption ? (
        <figcaption className="mt-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-snug text-center sm:text-left italic">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
