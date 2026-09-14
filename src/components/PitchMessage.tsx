"use client";

import { useEffect, useState } from "react";

const CONTACT_NUMBER_KEY = "sat-marketing-contact-number";
const CONTACT_EMAIL_KEY = "sat-marketing-contact-email";

function buildDmMessage(companyName: string) {
  const name = companyName.trim() || "[Company Name]";
  return `Hi ${name}! 👋

I'm reaching out from the team organizing Saturnalia '26 — the 51st edition of the annual cultural fest of Thapar Institute of Engineering & Technology.

We're currently looking for brands to collaborate with us as sponsors/partners. Saturnalia brings together a large and highly engaged student audience, offering brands an excellent opportunity for visibility, on-ground activation, social media promotion, and direct engagement with students.

We'd love to explore a collaboration with ${name} and discuss how we can create a mutually beneficial partnership.

Could you please connect me with the concerned person/team handling brand partnerships or sponsorships?

Looking forward to hearing from you!
Thank you 😊`;
}

function buildEmailMessage(
  companyName: string,
  senderName: string,
  contactNumber: string,
  contactEmail: string
) {
  const name = companyName.trim() || "[Company Name]";
  const from = senderName.trim() || "[Your Name]";
  const phone = contactNumber.trim() || "[Contact Number]";
  const email = contactEmail.trim() || "[Email ID]";

  return `Dear ${name}

Greetings from Saturnalia '26 – Thapar Institute of Engineering & Technology, Patiala!

Thank you for getting back to us and sharing the relevant contacts. We're excited to explore a potential collaboration between ${name} and Saturnalia '26, as we believe the brand aligns strongly with our young and highly engaged student audience.

Entering its 51st edition, Saturnalia is one of North India's prominent techno-cultural fests, bringing together 35,000+ students, 100+ events and 4 days of celebrations. The fest features major attractions including Pronite, Sat Walk, Battle of Bands, EDM Night, Adventure Land, Carnival, Hackathon, E-Sports, LitFest and more.

Saturnalia has consistently hosted prominent artists and performers, with previous editions featuring artists such as Shalmali Kholgade, Javed Ali, Mohit Chauhan, Badshah, Amit Trivedi, Diljit Dosanjh and many more. The upcoming edition is set to continue this legacy with an exciting artist lineup (Sonu Nigam, Shreya Ghosal and Shankar Mahadevan) and large-scale entertainment experiences.

We see exciting opportunities for ${name} to engage with our audience through:

• On-ground product activations and sampling
• Dedicated brand experience/interaction zones
• Stalls within the fest area
• Social media promotions
• Campus and concert-area branding
• Promotional events and student engagement
• Brand integration across Saturnalia's digital platforms

We have attached our detailed sponsorship proposal outlining the various collaboration and branding opportunities available.

We would love to discuss a customized collaboration with ${name} and explore how we can create a high-impact brand presence at Saturnalia '26.

Looking forward to connecting with you!

Warm regards,
${from}
Marketing Team | Saturnalia '26
Thapar Institute of Engineering & Technology
📞 ${phone}
📧 ${email}`;
}

export default function PitchMessage({ senderName }: { senderName: string }) {
  const [template, setTemplate] = useState<"dm" | "email">("dm");
  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setContactNumber(window.localStorage.getItem(CONTACT_NUMBER_KEY) ?? "");
    setContactEmail(window.localStorage.getItem(CONTACT_EMAIL_KEY) ?? "");
  }, []);

  function updateContactNumber(value: string) {
    setContactNumber(value);
    window.localStorage.setItem(CONTACT_NUMBER_KEY, value);
  }

  function updateContactEmail(value: string) {
    setContactEmail(value);
    window.localStorage.setItem(CONTACT_EMAIL_KEY, value);
  }

  const message =
    template === "dm"
      ? buildDmMessage(companyName)
      : buildEmailMessage(companyName, senderName, contactNumber, contactEmail);

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
      <div className="flex gap-2 text-sm" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={template === "dm"}
          onClick={() => setTemplate("dm")}
          className={`flex-1 rounded-md px-3 py-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            template === "dm"
              ? "bg-indigo-700 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Instagram DM
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={template === "email"}
          onClick={() => setTemplate("email")}
          className={`flex-1 rounded-md px-3 py-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            template === "email"
              ? "bg-indigo-700 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Email pitch
        </button>
      </div>

      {template === "email" && (
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          Use this once a company replies to the Instagram DM with their
          email — it's the detailed follow-up, not the first message.
        </p>
      )}

      <label
        htmlFor="pitch-company-name"
        className="mt-4 block text-sm font-medium text-slate-800 dark:text-slate-200"
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

      {template === "email" && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-number"
              className="text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Your contact number
            </label>
            <input
              id="contact-number"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="e.g. +91 98765 43210"
              value={contactNumber}
              onChange={(e) => updateContactNumber(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="contact-email"
              className="text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Your email
            </label>
            <input
              id="contact-email"
              type="email"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="you@example.com"
              value={contactEmail}
              onChange={(e) => updateContactEmail(e.target.value)}
            />
          </div>
        </div>
      )}

      <label
        htmlFor="pitch-message"
        className="mt-4 block text-sm font-medium text-slate-800 dark:text-slate-200"
      >
        {template === "dm" ? "Ready-to-send Instagram DM" : "Ready-to-send email"}
      </label>
      <textarea
        id="pitch-message"
        readOnly
        value={message}
        rows={template === "dm" ? 12 : 24}
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
