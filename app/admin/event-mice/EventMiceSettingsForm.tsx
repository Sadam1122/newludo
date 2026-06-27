"use client";

import { useState } from "react";
import { updateEventMiceSetting } from "./actions";

type FormProps = {
  initialData: {
    heroHeadline: string;
    heroDescription: string;
    section2Headline: string;
    section2Description: string;
    quoteText: string;
  } | null;
};

export function EventMiceSettingsForm({ initialData }: FormProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  async function action(formData: FormData) {
    setIsPending(true);
    setMessage({ text: "", type: "" });
    try {
      await updateEventMiceSetting({
        heroHeadline: formData.get("heroHeadline") as string,
        heroDescription: formData.get("heroDescription") as string,
        section2Headline: formData.get("section2Headline") as string,
        section2Description: formData.get("section2Description") as string,
        quoteText: formData.get("quoteText") as string,
      });
      setMessage({ text: "Settings saved successfully.", type: "success" });
    } catch (error) {
      console.error(error);
      setMessage({ text: "Failed to save settings.", type: "error" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase text-white/50">
          Slide 1 (Hero Section)
        </h3>
        <div>
          <label
            htmlFor="heroHeadline"
            className="mb-2 block text-sm font-medium text-white/80"
          >
            Headline
          </label>
          <input
            id="heroHeadline"
            name="heroHeadline"
            type="text"
            required
            defaultValue={initialData?.heroHeadline ?? "SPACE FOR EVERY OCCASION"}
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-white placeholder:text-white/30 focus:border-ludo-red focus:outline-none focus:ring-1 focus:ring-ludo-red"
          />
        </div>
        <div>
          <label
            htmlFor="heroDescription"
            className="mb-2 block text-sm font-medium text-white/80"
          >
            Description
          </label>
          <textarea
            id="heroDescription"
            name="heroDescription"
            rows={5}
            required
            defaultValue={
              initialData?.heroDescription ??
              "Host gathering, meeting, watch party, community event, hingga private celebration dengan suasana sportsbar premium di Bandung.\n\nIndoor & semi outdoor venue dengan giant screen, live entertainment, dan pilihan paket F&B yang dapat disesuaikan dengan kebutuhan acara Anda."
            }
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-white placeholder:text-white/30 focus:border-ludo-red focus:outline-none focus:ring-1 focus:ring-ludo-red"
          />
        </div>
      </div>

      <div className="my-8 h-px w-full bg-white/10" />

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase text-white/50">
          Slide 2 (Collaborations Section)
        </h3>
        <div>
          <label
            htmlFor="section2Headline"
            className="mb-2 block text-sm font-medium text-white/80"
          >
            Headline
          </label>
          <input
            id="section2Headline"
            name="section2Headline"
            type="text"
            required
            defaultValue={
              initialData?.section2Headline ??
              "BUILT FOR GATHERINGS, DESIGNED FOR COLLABORATIONS."
            }
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-white placeholder:text-white/30 focus:border-ludo-red focus:outline-none focus:ring-1 focus:ring-ludo-red"
          />
        </div>
        <div>
          <label
            htmlFor="section2Description"
            className="mb-2 block text-sm font-medium text-white/80"
          >
            Description
          </label>
          <textarea
            id="section2Description"
            name="section2Description"
            rows={3}
            required
            defaultValue={
              initialData?.section2Description ??
              "Dari meeting hingga brand activation, dari komunitas hingga perayaan spesial—setiap detail acara Anda dapat kami sesuaikan."
            }
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-white placeholder:text-white/30 focus:border-ludo-red focus:outline-none focus:ring-1 focus:ring-ludo-red"
          />
        </div>
        <div>
          <label
            htmlFor="quoteText"
            className="mb-2 block text-sm font-medium text-white/80"
          >
            Bottom Quote Text
          </label>
          <input
            id="quoteText"
            name="quoteText"
            type="text"
            required
            defaultValue={
              initialData?.quoteText ??
              "YOUR VISION, OUR SPACE. TOGETHER, WE CREATE UNFORGETTABLE EXPERIENCES."
            }
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-white placeholder:text-white/30 focus:border-ludo-red focus:outline-none focus:ring-1 focus:ring-ludo-red"
          />
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        {message.text && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-semibold ${
              message.type === "success"
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="flex min-w-[140px] w-max items-center justify-center rounded-xl bg-ludo-red px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#D41B23] disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
