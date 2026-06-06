import { useState } from "react";
import { Share2, Check, Link as LinkIcon } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url?: string;
  size?: "sm" | "xs";
  className?: string;
}

export default function ShareButton({ title, url, size = "sm", className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // fallthrough to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  const iconSize = size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5";
  const padding = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-1";

  return (
    <button
      onClick={handleShare}
      data-testid="button-share"
      className={`inline-flex items-center gap-1 font-mono text-[10px] border rounded transition-all duration-150 shrink-0
        ${copied
          ? "text-primary border-primary/30 bg-primary/10"
          : "text-muted-foreground border-border hover:text-foreground hover:border-primary/30 hover:bg-muted"
        } ${padding} ${className}`}
      title="Share"
    >
      {copied ? (
        <><Check className={iconSize} />copied</>
      ) : (
        <><LinkIcon className={iconSize} />share</>
      )}
    </button>
  );
}
