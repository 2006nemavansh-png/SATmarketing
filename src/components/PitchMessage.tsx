"use client";

import { useState } from "react";

function buildMessage(companyName: string) {
  const name = companyName.trim() || "[Company Name]";
  return `Hi ${name}! 👋

I'm reaching out from the team organizing Saturnalia '26 — the 51st edition of the annual cultural fest of Thapar Institute of Engineering & Technology.

We're currently looking for brands to collaborate with us as sponsors/partners. Saturnalia brings together a large and highly engaged student audience, offering brands an excellent opportunity for visibility, on-ground activation, social media promotion, and direct engagement with students.

We'd love to explore a collaboration with ${name} and discuss how we can create a mutually beneficial partnership.

Could you please connect me with the concerned person/team handling brand partnerships or sponsorships?

Looking forward to hearing from you!
Thank you 😊`;
}

export default function PitchMessage() {
  const [companyName, setCompanyName] = useState("");
  const [copied, setCopied] = useState(false);

  const message = buildMessage(companyName);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
      <label
        htmlFor="pitch-company-name"
        className="text-sm font-medium text-slate-800 dark:text-slate-200"
      >
        Company name
      </label>
      <div className="relative mt-2">
        <input
          id="pitch-company-name"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-10 text-base text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder="Type a company name..."
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        {companyName && (
          <button
            type="button"
            onClick={() => setCompanyName("")}
            aria-label="Clear company name"
            title="Clear"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            ×
          </button>
        )}
      </div>

      <label
        htmlFor="pitch-message"
        className="mt-4 block text-sm font-medium text-slate-800 dark:text-slate-200"
      >
        Ready-to-send Instagram DM
      </label>
      <textarea
        id="pitch-message"
        readOnly
        value={message}
        rows={12}
        className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />

      <button
        onClick={copyMessage}
        className="mt-3 w-full rounded-md bg-indigo-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {copied ? "Copied!" : "Copy message"}
      </button>
    </div>
  );
}
