"use client";

import { useState, useCallback } from "react";
import type { ExtractedCard } from "@/types";

type ScanState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "success"; data: ExtractedCard }
  | { status: "error"; message: string };

type CardImages = {
  front: string | null;
  back: string | null;
};

export function useCardScanner() {
  const [images, setImages] = useState<CardImages>({ front: null, back: null });
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });

  const setImage = useCallback((side: "front" | "back", file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== "string") {
          reject(new Error("Failed to read image"));
          return;
        }
        setImages((prev) => ({ ...prev, [side]: result }));
        resolve();
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  const clearImages = useCallback(() => {
    setImages({ front: null, back: null });
    setScanState({ status: "idle" });
  }, []);

  const scan = useCallback(async () => {
    if (!images.front) return;

    setScanState({ status: "scanning" });

    try {
      const body: Record<string, string> = {
        frontImage: images.front.split(",")[1] ?? "",
      };
      if (images.back) {
        body["backImage"] = images.back.split(",")[1] ?? "";
      }

      const res = await fetch("/api/extract-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(
          (err as { error?: string }).error ?? `Server error ${res.status}`
        );
      }

      const data = (await res.json()) as ExtractedCard;
      setScanState({ status: "success", data });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not read the card. Try a clearer photo.";
      setScanState({ status: "error", message });
    }
  }, [images]);

  const reset = useCallback(() => {
    setScanState({ status: "idle" });
  }, []);

  return {
    images,
    scanState,
    setImage,
    clearImages,
    scan,
    reset,
    canScan: !!images.front && scanState.status !== "scanning",
  };
}
