import { useState } from "react";
import { Mail, ArrowRight, Check, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading" || status === "success") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="border border-border rounded-lg p-5 bg-card" data-testid="newsletter-form">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-4 h-4 text-primary shrink-0" />
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
          Weekly Digest
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Top tools, guides, and HN picks — once a week. No spam.
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-primary font-mono text-xs py-2" data-testid="newsletter-success">
          <Check className="w-4 h-4 shrink-0" />
          You're on the list. Talk soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            data-testid="input-newsletter-email"
            className="flex-1 min-w-0 bg-background border border-border rounded px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            data-testid="button-newsletter-submit"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary font-mono text-xs rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {status === "loading" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-[10px] font-mono text-red-400 mt-1.5">{errorMsg}</p>
      )}

      <p className="text-[10px] font-mono text-muted-foreground/50 mt-2">
        Powered by Resend — coming soon
      </p>
    </div>
  );
}
