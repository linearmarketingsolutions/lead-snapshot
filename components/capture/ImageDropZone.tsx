"use client";

import { useRef, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

type ImageDropZoneProps = {
  label: string;
  sublabel?: string;
  imageDataUrl: string | null;
  onFile: (file: File) => void;
  required?: boolean;
};

export function ImageDropZone({
  label,
  sublabel,
  imageDataUrl,
  onFile,
  required = false,
}: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${label} — tap to capture`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className={cn(
        "relative flex min-h-[100px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 transition-all duration-200",
        imageDataUrl
          ? "border-brand-400 bg-brand-50"
          : "border-dashed border-surface-200 bg-surface-50 hover:border-brand-300 hover:bg-brand-50/40"
      )}
    >
      {imageDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageDataUrl}
          alt={label}
          className="block w-full object-contain max-h-52 rounded-xl"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 p-6 text-center select-none">
          <span className="text-3xl">📄</span>
          <div>
            <p className="text-sm font-semibold text-slate-600">{label}</p>
            {sublabel && (
              <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
            )}
            {required && (
              <p className="text-xs text-brand-500 mt-1">Required</p>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 opacity-0 w-0 h-0"
        onChange={handleChange}
      />
    </div>
  );
}
