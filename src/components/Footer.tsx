"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { site } from "@/data/site";

const WEB3FORMS_ACCESS_KEY =
  "f7e1d2c1-ee6a-46ff-8497-5d70467722bb";

export function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer
        id="contact"
        className="relative overflow-hidden border-t border-white/5 bg-neutral-950 px-6 py-32"
      >
        <div className="container mx-auto">
          <div className="mb-32 grid gap-20 md:grid-cols-[1.5fr_1fr]">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16 text-6xl font-medium leading-[0.9] tracking-tighter md:text-9xl"
              >
                Let&apos;s
                <br />
                <span className="font-serif italic text-neutral-500">
                  Talk
                </span>
              </motion.h2>

              <div className="flex flex-col gap-10">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="group flex items-center gap-6 text-left"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black transition-all duration-500 group-hover:scale-105 group-hover:bg-neutral-200">
                    <ArrowUpRight className="h-8 w-8 transition-transform duration-500 group-hover:rotate-45" />
                  </div>

                  <div>
                    <span className="block text-4xl font-light tracking-tighter transition-transform group-hover:translate-x-2">
                      Start a Project
                    </span>

                    <span className="mt-1 block text-sm font-mono uppercase tracking-widest text-neutral-500">
                      Currently accepting selected work
                    </span>
                  </div>
                </button>

                <a
                  href={`mailto:${site.email}`}
                  className="group flex items-center gap-4 pl-4 text-lg font-mono text-neutral-500 transition-colors hover:text-white"
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {site.email}
                </a>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h4 className="mb-6 text-xs font-mono uppercase tracking-widest text-neutral-500">
                    Socials
                  </h4>

                  <ul className="space-y-4">
                    {site.socialLinks.map((social) => (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center gap-2 text-lg font-light text-neutral-400 transition-colors hover:text-white"
                        >
                          {social.label}

                          <ArrowUpRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-6 text-xs font-mono uppercase tracking-widest text-neutral-500">
                    Sitemap
                  </h4>

                  <ul className="space-y-4">
                    <li>
                      <a
                        href="/"
                        className="text-lg font-light text-neutral-400 hover:text-white"
                      >
                        Home
                      </a>
                    </li>

                    <li>
                      <a
                        href="/work"
                        className="text-lg font-light text-neutral-400 hover:text-white"
                      >
                        Work
                      </a>
                    </li>

                    <li>
                      <a
                        href="/gallery"
                        className="text-lg font-light text-neutral-400 hover:text-white"
                      >
                        Gallery
                      </a>
                    </li>

                    <li>
                      <a
                        href="/#about"
                        className="text-lg font-light text-neutral-400 hover:text-white"
                      >
                        About
                      </a>
                    </li>

                    <li>
                      <a
                        href="/#contact"
                        className="text-lg font-light text-neutral-400 hover:text-white"
                      >
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-12 md:flex-row">
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-600">
              © {new Date().getFullYear()} {site.name}.
            </p>

            <p className="text-xs font-mono uppercase tracking-widest text-neutral-600">
              Built with Next.js
            </p>
          </div>
        </div>
      </footer>

      <ContactModal open={open} close={() => setOpen(false)} />
    </>
  );
}

function ContactModal({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setStatus("loading");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.append(
      "access_key",
      WEB3FORMS_ACCESS_KEY
    );

    formData.append(
      "subject",
      "New Portfolio Project Enquiry"
    );

    formData.append(
      "from_name",
      "Riaj Uddin Portfolio"
    );

    try {
      const response = await fetch(
        "https://api.web3forms.com/submit",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Message could not be sent."
        );
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const handleClose = () => {
    close();

    setTimeout(() => {
      setStatus("idle");
      setErrorMessage("");
    }, 300);
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed inset-y-0 right-0 z-[101] w-full overflow-y-auto border-l border-white/10 bg-neutral-900 p-8 shadow-2xl md:w-[600px] md:p-12"
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close contact form"
              className="absolute right-8 top-8 text-neutral-500 transition-colors hover:text-white"
            >
              <X />
            </button>

            {status === "success" ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white">
                  <Send className="h-8 w-8 text-black" />
                </div>

                <h3 className="mb-2 text-3xl font-medium">
                  Message Sent
                </h3>

                <p className="max-w-sm text-neutral-400">
                  Thank you for reaching out. I&apos;ll get
                  back to you as soon as possible.
                </p>

                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-8 rounded-full border border-white/10 px-8 py-3 text-sm transition-colors hover:bg-white hover:text-black"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="mt-12">
                <span className="mb-6 block text-xs font-mono uppercase tracking-widest text-neutral-500">
                  04 / Contact
                </span>

                <h3 className="mb-2 text-4xl font-medium tracking-tighter md:text-5xl">
                  Start a
                  <br />
                  <span className="font-serif italic text-neutral-500">
                    Project
                  </span>
                </h3>

                <p className="mb-12 font-light text-neutral-400">
                  Share your project context, goals, and
                  timeline.
                </p>

                <form
                  onSubmit={submit}
                  className="space-y-10"
                >
                  <input
                    type="checkbox"
                    name="botcheck"
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <input
                    name="name"
                    required
                    placeholder="Your Name"
                    className="w-full border-b border-white/10 bg-transparent py-4 text-xl font-light outline-none transition-colors placeholder:text-neutral-700 focus:border-white"
                  />

                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email Address"
                    className="w-full border-b border-white/10 bg-transparent py-4 text-xl font-light outline-none transition-colors placeholder:text-neutral-700 focus:border-white"
                  />

                  <input
                    name="project_type"
                    placeholder="Project Type"
                    className="w-full border-b border-white/10 bg-transparent py-4 text-xl font-light outline-none transition-colors placeholder:text-neutral-700 focus:border-white"
                  />

                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Project Details..."
                    className="w-full resize-none border-b border-white/10 bg-transparent py-4 text-xl font-light outline-none transition-colors placeholder:text-neutral-700 focus:border-white"
                  />

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full rounded-full bg-white py-4 text-lg font-medium text-black transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "loading"
                      ? "Sending..."
                      : "Send Message"}
                  </button>

                  {status === "error" && (
                    <p className="text-sm text-red-400">
                      {errorMessage}
                    </p>
                  )}
                </form>
              </div>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}