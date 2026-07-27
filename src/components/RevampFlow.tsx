"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  BUDGET_BANDS,
  DESIGN_STYLES,
  PRIORITIES,
  ROOM_TYPES,
} from "@/lib/constants";
import type {
  BudgetBandId,
  DesignStyleId,
  PriorityId,
  RevampBrief,
  RevampVision,
  RoomTypeId,
} from "@/lib/types";
import { parseJsonResponse } from "@/lib/api";
import { BeforeAfter } from "@/components/BeforeAfter";

type Step =
  | "upload"
  | "room"
  | "style"
  | "budget"
  | "brief"
  | "analyzing"
  | "results"
  | "lead"
  | "done";

const STEPS: Step[] = [
  "upload",
  "room",
  "style",
  "budget",
  "brief",
  "analyzing",
  "results",
  "lead",
  "done",
];

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File, maxSize = 960): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.75);
  });

  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

function OptionCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border px-5 py-4 text-left transition-colors ${
        selected
          ? "border-saffron bg-saffron/8"
          : "border-line bg-paper hover:border-stone"
      }`}
    >
      <p className="font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
      ) : null}
    </button>
  );
}

export function RevampFlow() {
  const [step, setStep] = useState<Step>("upload");
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [roomType, setRoomType] = useState<RoomTypeId | "">("");
  const [designStyle, setDesignStyle] = useState<DesignStyleId | "">("");
  const [budgetBand, setBudgetBand] = useState<BudgetBandId | "">("");
  const [priority, setPriority] = useState<PriorityId | "">("");
  const [timeline, setTimeline] = useState("");
  const [revampNotes, setRevampNotes] = useState("");
  const [vision, setVision] = useState<RevampVision | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const stepIndex = STEPS.indexOf(step);
  const progress = useMemo(
    () => Math.min(100, ((stepIndex + 1) / (STEPS.length - 1)) * 100),
    [stepIndex],
  );

  const brief: RevampBrief | null = useMemo(() => {
    if (!roomType || !designStyle || !budgetBand || !priority) return null;
    return {
      roomType,
      designStyle,
      budgetBand,
      priority,
      timeline,
      revampNotes,
    };
  }, [roomType, designStyle, budgetBand, priority, timeline, revampNotes]);

  const handlePhotos = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const compressed: File[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      compressed.push(await compressImage(file));
    }

    if (!compressed.length) return;

    setPhotos((prev) => {
      const next = [...prev];
      for (const file of compressed) {
        if (next.length >= 3) break;
        next.push({ file, preview: URL.createObjectURL(file) });
      }
      return next;
    });
    setError("");
  }, []);

  const onPhotoInput = (
    files: FileList | null,
    input: HTMLInputElement | null,
  ) => {
    void handlePhotos(files);
    if (input) input.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const runAnalysis = async () => {
    if (!brief) return;
    setStep("analyzing");
    setError("");
    setAfterImageUrl(null);
    setImageLoading(true);

    try {
      const images = await Promise.all(
        photos.slice(0, 2).map((p) => fileToBase64(p.file)),
      );

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          images,
        }),
      });

      const data = await parseJsonResponse<{
        vision?: RevampVision;
        afterImageUrl?: string;
        error?: string;
      }>(res);
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      if (!data.vision) {
        throw new Error("No vision returned. Please try again.");
      }

      setVision(data.vision);
      setAfterImageUrl(data.afterImageUrl ?? null);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("brief");
    }
  };

  const submitLead = async () => {
    if (!brief || !vision) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          whatsappSame,
          brief,
          vision,
          photoCount: photos.length,
        }),
      });

      const data = await parseJsonResponse<{ success?: boolean; error?: string }>(
        res,
      );
      if (!res.ok) throw new Error(data.error || "Could not save your details");

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/"
            className="font-display text-2xl tracking-[0.04em] text-ink"
          >
            Belvie
          </Link>
          <span className="text-xs tracking-wide text-stone">
            Quick Home Revamp
          </span>
        </div>
        {step !== "done" && step !== "analyzing" ? (
          <div className="mx-auto mt-4 max-w-2xl">
            <div className="h-0.5 w-full bg-mist">
              <div
                className="h-full bg-saffron transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 md:px-10 md:py-14">
        {error ? (
          <div className="mb-6 border border-terracotta/30 bg-terracotta/8 px-4 py-3 text-sm text-terracotta">
            {error}
          </div>
        ) : null}

        {step === "upload" ? (
          <section>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
              Step 1 of 5
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">
              Upload your room
            </h1>
            <p className="mt-4 text-ink-soft">
              Share 1–3 clear photos — hall, bedroom, study, anything you want
              refreshed. Good daylight helps.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-stone bg-mist/50 px-6 py-10 transition-colors hover:border-saffron hover:bg-saffron/5">
                <span className="text-2xl" aria-hidden>
                  📷
                </span>
                <span className="mt-3 font-medium text-ink">Take photo</span>
                <span className="mt-1 text-center text-sm text-ink-soft">
                  Open camera
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => onPhotoInput(e.target.files, e.target)}
                />
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-stone bg-mist/50 px-6 py-10 transition-colors hover:border-saffron hover:bg-saffron/5">
                <span className="text-2xl" aria-hidden>
                  🖼️
                </span>
                <span className="mt-3 font-medium text-ink">Choose gallery</span>
                <span className="mt-1 text-center text-sm text-ink-soft">
                  Pick up to 3 images
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onPhotoInput(e.target.files, e.target)}
                />
              </label>
            </div>

            <p className="mt-3 text-center text-xs text-stone">
              JPG or PNG · {photos.length}/3 photos added
            </p>

            {photos.length > 0 ? (
              <div className="mt-6 grid grid-cols-3 gap-3">
                {photos.map((photo, i) => (
                  <div key={photo.preview} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.preview}
                      alt={`Room photo ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 bg-ink/70 px-2 py-0.5 text-xs text-paper"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              disabled={photos.length === 0}
              onClick={() => setStep("room")}
              className="mt-10 w-full bg-saffron px-6 py-4 text-sm font-medium tracking-wide text-paper transition-opacity disabled:opacity-40"
            >
              Continue
            </button>
          </section>
        ) : null}

        {step === "room" ? (
          <section>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
              Step 2 of 5
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">
              Which room?
            </h1>
            <p className="mt-4 text-ink-soft">
              Pick the space you want Belvie to revamp.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {ROOM_TYPES.map((room) => (
                <OptionCard
                  key={room.id}
                  selected={roomType === room.id}
                  onClick={() => setRoomType(room.id)}
                  title={room.label}
                />
              ))}
            </div>
            <div className="mt-10 flex gap-3">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="flex-1 border border-line px-6 py-4 text-sm text-ink-soft"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!roomType}
                onClick={() => setStep("style")}
                className="flex-1 bg-saffron px-6 py-4 text-sm font-medium text-paper disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </section>
        ) : null}

        {step === "style" ? (
          <section>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
              Step 3 of 5
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">
              Design style
            </h1>
            <p className="mt-4 text-ink-soft">
              What vibe should your room carry after the revamp?
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {DESIGN_STYLES.map((style) => (
                <OptionCard
                  key={style.id}
                  selected={designStyle === style.id}
                  onClick={() => setDesignStyle(style.id)}
                  title={style.label}
                />
              ))}
            </div>
            <div className="mt-10 flex gap-3">
              <button
                type="button"
                onClick={() => setStep("room")}
                className="flex-1 border border-line px-6 py-4 text-sm text-ink-soft"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!designStyle}
                onClick={() => setStep("budget")}
                className="flex-1 bg-saffron px-6 py-4 text-sm font-medium text-paper disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </section>
        ) : null}

        {step === "budget" ? (
          <section>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
              Step 4 of 5
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">
              Your budget
            </h1>
            <p className="mt-4 text-ink-soft">
              Bangalore pricing — pick the band that feels right. We&apos;ll plan
              within it.
            </p>
            <div className="mt-8 grid gap-3">
              {BUDGET_BANDS.map((band) => (
                <OptionCard
                  key={band.id}
                  selected={budgetBand === band.id}
                  onClick={() => setBudgetBand(band.id)}
                  title={band.label}
                  description="Inclusive of decor, soft furnishings & styling"
                />
              ))}
            </div>
            <div className="mt-10 flex gap-3">
              <button
                type="button"
                onClick={() => setStep("style")}
                className="flex-1 border border-line px-6 py-4 text-sm text-ink-soft"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!budgetBand}
                onClick={() => setStep("brief")}
                className="flex-1 bg-saffron px-6 py-4 text-sm font-medium text-paper disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </section>
        ) : null}

        {step === "brief" ? (
          <section>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
              Step 5 of 5
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">
              Your brief
            </h1>
            <p className="mt-4 text-ink-soft">
              Help us understand what matters most — and what needs changing.
            </p>

            <div className="mt-8">
              <p className="text-sm font-medium text-ink">What matters most?</p>
              <div className="mt-3 grid gap-3">
                {PRIORITIES.map((p) => (
                  <OptionCard
                    key={p.id}
                    selected={priority === p.id}
                    onClick={() => setPriority(p.id)}
                    title={p.label}
                    description={p.description}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8">
              <label className="text-sm font-medium text-ink" htmlFor="timeline">
                When do you want it done?
              </label>
              <select
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="mt-2 w-full border border-line bg-paper px-4 py-3 text-ink"
              >
                <option value="">Select</option>
                <option value="This week">This week</option>
                <option value="Within 2 weeks">Within 2 weeks</option>
                <option value="This month">This month</option>
                <option value="Just exploring">Just exploring for now</option>
              </select>
            </div>

            <div className="mt-8">
              <label
                className="text-sm font-medium text-ink"
                htmlFor="revampNotes"
              >
                What needs revamping? (walls, furniture, lighting, etc.)
              </label>
              <textarea
                id="revampNotes"
                rows={4}
                value={revampNotes}
                onChange={(e) => setRevampNotes(e.target.value)}
                placeholder="e.g. Old sofa, dull walls, no storage, want warmer lighting..."
                className="mt-2 w-full resize-none border border-line bg-paper px-4 py-3 text-ink placeholder:text-stone"
              />
            </div>

            <div className="mt-10 flex gap-3">
              <button
                type="button"
                onClick={() => setStep("budget")}
                className="flex-1 border border-line px-6 py-4 text-sm text-ink-soft"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!priority}
                onClick={runAnalysis}
                className="flex-1 bg-saffron px-6 py-4 text-sm font-medium text-paper disabled:opacity-40"
              >
                Get my revamp plan
              </button>
            </div>
          </section>
        ) : null}

        {step === "analyzing" ? (
          <section className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-saffron border-t-transparent" />
            <h1 className="mt-8 font-display text-3xl tracking-wide text-ink">
              Designing your makeover
            </h1>
            <p className="mt-4 max-w-sm text-ink-soft">
              Belvie is planning your Bangalore revamp and generating a visual
              preview — usually under a minute.
            </p>
          </section>
        ) : null}

        {step === "results" && vision ? (
          <section>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
              Your revamp plan
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">
              Here&apos;s your revamp
            </h1>

            {photos[0] ? (
              <div className="mt-8">
                <p className="mb-3 text-sm text-ink-soft">
                  Styling preview — same room layout, decor & textiles updated.
                  Not a renovation or layout change.
                </p>
                <BeforeAfter
                  beforeSrc={photos[0].preview}
                  afterSrc={afterImageUrl}
                  afterLoading={imageLoading && !afterImageUrl}
                />
                {afterImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={afterImageUrl}
                    alt=""
                    className="hidden"
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                ) : null}
              </div>
            ) : null}

            <p className="mt-6 text-lg leading-relaxed text-ink">
              {vision.visionSummary}
            </p>

            <div className="mt-8 border border-line bg-mist/40 p-5">
              <p className="text-xs uppercase tracking-widest text-sage">
                Estimated budget
              </p>
              <p className="mt-2 font-display text-3xl text-ink">
                {formatINR(vision.estimatedBudget.min)} –{" "}
                {formatINR(vision.estimatedBudget.max)}
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                {vision.estimatedBudget.breakdown}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3 border border-saffron/30 bg-saffron/8 px-5 py-4">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-medium text-ink">
                  Done in ~{vision.timelineHours} hours · No room vacation
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {vision.noVacationNote}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-medium text-ink">Design direction</h2>
              <p className="mt-2 text-ink-soft">{vision.designDirection}</p>
            </div>

            <div className="mt-8">
              <h2 className="font-medium text-ink">Key changes</h2>
              <ul className="mt-3 space-y-2">
                {vision.keyChanges.map((change) => (
                  <li key={change} className="flex gap-3 text-ink-soft">
                    <span className="text-saffron">✦</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h2 className="font-medium text-ink">Colour palette</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {vision.colorPalette.map((color) => (
                  <span
                    key={color}
                    className="border border-line bg-paper px-3 py-1.5 text-sm text-ink-soft"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-medium text-ink">Items to source</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Preview below — share your number to get the full list on
                WhatsApp.
              </p>
              <ul className="mt-4 space-y-3">
                {vision.items.slice(0, 3).map((item) => (
                  <li
                    key={item.name}
                    className="flex justify-between border-b border-line pb-3 text-sm"
                  >
                    <span className="text-ink">{item.name}</span>
                    <span className="text-ink-soft">
                      {formatINR(item.estimatedCost)}
                    </span>
                  </li>
                ))}
              </ul>
              {vision.items.length > 3 ? (
                <p className="mt-3 text-sm text-stone">
                  + {vision.items.length - 3} more items in your full plan
                </p>
              ) : null}
            </div>

            <p className="mt-6 text-sm italic text-ink-soft">
              💡 {vision.bangaloreTip}
            </p>

            <button
              type="button"
              onClick={() => setStep("lead")}
              className="mt-10 w-full bg-saffron px-6 py-4 text-sm font-medium tracking-wide text-paper"
            >
              Get full plan on WhatsApp
            </button>
          </section>
        ) : null}

        {step === "lead" && vision ? (
          <section>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
              Almost there
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">
              We&apos;ll WhatsApp you
            </h1>
            <p className="mt-4 text-ink-soft">
              Share your details and we&apos;ll send the complete item list,
              budget breakdown, and next steps within 24 hours.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="name">
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="mt-2 w-full border border-line bg-paper px-4 py-3 text-ink"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="phone">
                  Phone / WhatsApp number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="mt-2 w-full border border-line bg-paper px-4 py-3 text-ink"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={whatsappSame}
                  onChange={(e) => setWhatsappSame(e.target.checked)}
                  className="h-4 w-4 accent-saffron"
                />
                This number is on WhatsApp
              </label>
            </div>

            <div className="mt-10 flex gap-3">
              <button
                type="button"
                onClick={() => setStep("results")}
                className="flex-1 border border-line px-6 py-4 text-sm text-ink-soft"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!name.trim() || !phone.trim() || submitting}
                onClick={submitLead}
                className="flex-1 bg-saffron px-6 py-4 text-sm font-medium text-paper disabled:opacity-40"
              >
                {submitting ? "Saving…" : "Send my plan"}
              </button>
            </div>
          </section>
        ) : null}

        {step === "done" ? (
          <section className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-saffron/15 text-3xl">
              ✓
            </div>
            <h1 className="mt-8 font-display text-4xl tracking-wide text-ink">
              You&apos;re on the list
            </h1>
            <p className="mx-auto mt-4 max-w-md text-ink-soft">
              Thank you, {name.split(" ")[0]}! We&apos;ll WhatsApp you within
              24 hours with your full revamp plan and how to get started — no
              room vacation, done in under 4 hours.
            </p>

            {vision && photos[0] && afterImageUrl ? (
              <div className="mx-auto mt-10 max-w-lg">
                <BeforeAfter
                  beforeSrc={photos[0].preview}
                  afterSrc={afterImageUrl}
                />
              </div>
            ) : null}

            {vision ? (
              <div className="mx-auto mt-10 max-w-md space-y-6 text-left">
                <div className="border border-line bg-mist/40 p-6">
                  <p className="text-xs uppercase tracking-widest text-sage">
                    Your plan snapshot
                  </p>
                  <p className="mt-3 text-ink">{vision.visionSummary}</p>
                  <p className="mt-4 font-display text-2xl text-ink">
                    {formatINR(vision.estimatedBudget.min)} –{" "}
                    {formatINR(vision.estimatedBudget.max)}
                  </p>
                </div>

                <div className="border border-line bg-paper p-6">
                  <p className="text-xs uppercase tracking-widest text-sage">
                    Full item list
                  </p>
                  <ul className="mt-4 space-y-3">
                    {vision.items.map((item) => (
                      <li
                        key={item.name}
                        className="border-b border-line pb-3 text-sm last:border-0"
                      >
                        <div className="flex justify-between gap-4">
                          <span className="text-ink">{item.name}</span>
                          <span className="shrink-0 text-ink-soft">
                            {formatINR(item.estimatedCost)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-stone">
                          {item.whereToBuy}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <Link
              href="/"
              className="mt-10 inline-block border border-line px-8 py-4 text-sm tracking-wide text-ink transition-colors hover:bg-mist"
            >
              Back to Belvie
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  );
}
