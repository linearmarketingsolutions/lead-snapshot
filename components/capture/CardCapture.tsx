"use client";

import { useState } from "react";
import { useCardScanner } from "@/hooks/useCardScanner";
import { useLeadStore } from "@/hooks/useLeadStore";
import { ImageDropZone } from "./ImageDropZone";
import { CardReview } from "./CardReview";
import { QRScanner } from "./QRScanner";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Card } from "@/components/ui/Card";
import type { ExtractedCard, LeadInput } from "@/types";

async function syncLeadToSheets(input: LeadInput): Promise<void> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? "Sync failed");
  }
}

async function extractFromQR(qrData: string): Promise<ExtractedCard> {
  const res = await fetch("/api/extract-qr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? `Server error ${res.status}`);
  }
  return res.json() as Promise<ExtractedCard>;
}

type CaptureMode = "card" | "qr";

export function CardCapture() {
  const session = useLeadStore((s) => s.session);
  const addLead = useLeadStore((s) => s.addLead);
  const { images, scanState, setImage, clearImages, scan, reset, canScan } = useCardScanner();
  const [saveSyncError, setSaveSyncError] = useState<string | null>(null);
  const [mode, setMode] = useState<CaptureMode>("card");
  const [qrState, setQrState] = useState<
    | { status: "idle" }
    | { status: "scanning" }
    | { status: "processing" }
    | { status: "success"; data: ExtractedCard }
    | { status: "error"; message: string }
  >({ status: "idle" });

  if (!session) return null;

  // Shared save handler
  const handleSave = (input: LeadInput) => {
    setSaveSyncError(null);
    addLead(input);
    clearImages();
    reset();
    setQrState({ status: "idle" });
    void syncLeadToSheets(input).catch((error) => {
      console.error("[card-capture] failed to sync lead", error);
      setSaveSyncError("Lead saved, but sync failed.");
    });
  };

  // Show review screen for either mode
  const successData =
    scanState.status === "success"
      ? scanState.data
      : qrState.status === "success"
      ? qrState.data
      : null;

  if (successData) {
    return (
      <CardReview
        extracted={successData}
        images={images}
        onSave={handleSave}
        onBack={() => {
          reset();
          setQrState({ status: "idle" });
        }}
      />
    );
  }

  const handleQRResult = async (qrData: string) => {
    setQrState({ status: "processing" });
    try {
      const extracted = await extractFromQR(qrData);
      setQrState({ status: "success", data: extracted });
    } catch (err) {
      setQrState({
        status: "error",
        message: err instanceof Error ? err.message : "Could not read QR code data.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Capture a Lead</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Rep: <span className="font-medium text-slate-700">{session.repName}</span>
          {" · "}
          {session.showName}
        </p>
      </div>

      {saveSyncError && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          {saveSyncError}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex rounded-xl bg-surface-100 p-1 gap-1">
        <button
          onClick={() => { setMode("card"); setQrState({ status: "idle" }); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "card"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          📇 Business Card
        </button>
        <button
          onClick={() => { setMode("qr"); reset(); clearImages(); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "qr"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          📱 QR Code
        </button>
      </div>

      {/* Business card mode */}
      {mode === "card" && (
        <>
          {scanState.status === "scanning" ? (
            <Card className="p-6">
              <Spinner label="Reading card with AI..." />
            </Card>
          ) : (
            <Card className="p-5 flex flex-col gap-3">
              <ImageDropZone
                label="Front of card"
                sublabel="Tap to take a photo or upload"
                imageDataUrl={images.front}
                onFile={(f) => void setImage("front", f)}
                required
              />
              <ImageDropZone
                label="Back of card"
                sublabel="Optional — helps with extra details"
                imageDataUrl={images.back}
                onFile={(f) => void setImage("back", f)}
              />

              {scanState.status === "error" && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {scanState.message}
                </div>
              )}

              <Button size="lg" fullWidth disabled={!canScan} onClick={() => void scan()}>
                🔍 Extract Contact Info
              </Button>

              {(images.front || images.back) && (
                <Button variant="ghost" size="sm" fullWidth onClick={clearImages}>
                  Clear images
                </Button>
              )}
            </Card>
          )}
        </>
      )}

      {/* QR code mode */}
      {mode === "qr" && (
        <>
          {qrState.status === "idle" && (
            <QRScanner
              onResult={(data) => void handleQRResult(data)}
              onCancel={() => setMode("card")}
            />
          )}

          {qrState.status === "processing" && (
            <Card className="p-6">
              <Spinner label="Extracting contact from QR..." />
            </Card>
          )}

          {qrState.status === "error" && (
            <Card className="p-5 flex flex-col gap-3">
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {qrState.message}
              </div>
              <Button variant="ghost" size="sm" fullWidth onClick={() => setQrState({ status: "idle" })}>
                Try again
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
