import Image from "next/image";
import { ImageIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { MediaType } from "@/types/quiz";

type MediaImageProps = {
  src: string | null;
  alt: string;
  mediaType?: MediaType;
  /** Tarayıcıya hangi genişlikte gösterileceğini söyler (ör. "(min-width: 768px) 50vw, 100vw"). */
  sizes: string;
  preload?: boolean;
  loading?: "eager" | "lazy";
  className?: string;
};

/**
 * Quiz görseli. Kapsayıcı öğe `relative` olmalı; görsel onu tamamen doldurur.
 * GÖRSEL: src henüz yoksa "Görsel eklenecek" yer tutucusu gösterilir.
 */
export function MediaImage({ src, alt, mediaType = "image", sizes, preload, loading, className }: MediaImageProps) {
  if (!src) {
    return (
      <span
        {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 text-secondary",
          className,
        )}
      >
        <ImageIcon className="size-7 opacity-70" />
        <span className="text-xs">Görsel eklenecek</span>
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      loading={loading}
      unoptimized={mediaType === "gif"}
      className={cn("object-cover", className)}
    />
  );
}
