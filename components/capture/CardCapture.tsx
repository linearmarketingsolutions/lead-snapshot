"use client";

import { useCardScanner } from "@/hooks/useCardScanner";
import { useLeadStore } from "@/hooks/useLeadStore";
import { ImageDropZone } from "./ImageDropZone";
import { CardReview } from "./CardReview";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Card } from "@/components/ui/Card";

export function CardCapture() {
  const session = useLeadStore((s) => s.session);
  const addLead = useLeadStore((s) => s.addLead);
  const { images, scanState, setImage, clearImages, scan, reset, canScan } = useCardScanner();

  if (!session) return null;

  if (scanState.status === "success") {
    return (
      <CardReview
        extracted={scanState.data}
        images={images}
        onSave={(input) => {
          addLead(input);
          clearImages();
          reset();
        }}
        onBack={() => reset()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Scan a Card</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Rep: <span className="font-medium text-slate-700">{session.repName}</span>
          {" · "}
          {session.showName}
        </p>
      </div>

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

          <Button
            size="lg"
            fullWidth
            disabled={!canScan}
            onClick={() => void scan()}
          >
            🔍 Extract Contact Info
          </Button>

          {(images.front || images.back) && (
            <Button variant="ghost" size="sm" fullWidth onClick={clearImages}>
              Clear images
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
