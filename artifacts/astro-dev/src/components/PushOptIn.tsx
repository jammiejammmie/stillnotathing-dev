import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = "BDnu30ntBGzeZkK0PwEyhEw4MM5PzwKUTqI4qGGn4C4eKahuthuC0gJOD3sR_CPh0H4LuK8a9HSm8vNfSBNRNRQ";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type PushStatus = "unknown" | "unsupported" | "denied" | "subscribed" | "unsubscribed" | "loading";

export default function PushOptIn() {
  const [status, setStatus] = useState<PushStatus>("unknown");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "denied") { setStatus("denied"); return; }
    if (perm === "granted") {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setStatus(sub ? "subscribed" : "unsubscribed");
        });
      });
    } else {
      setStatus("unsubscribed");
    }
  }, []);

  const handleSubscribe = async () => {
    if (status === "loading") return;
    setStatus("loading");

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); return; }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      setStatus("subscribed");
    } catch (err) {
      console.error("Push subscribe failed:", err);
      setStatus("unsubscribed");
    }
  };

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setStatus("unsubscribed");
    } catch {
      setStatus("subscribed");
    }
  };

  if (status === "unsupported") return null;

  return (
    <button
      onClick={status === "subscribed" ? handleUnsubscribe : handleSubscribe}
      disabled={status === "loading" || status === "denied" || status === "unknown"}
      data-testid="button-push-optin"
      title={
        status === "subscribed" ? "Notifications on — click to turn off"
          : status === "denied" ? "Notifications blocked in browser settings"
          : "Get notified about new tools and guides"
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border font-mono text-[10px] transition-all duration-150
        ${status === "subscribed"
          ? "text-primary border-primary/30 bg-primary/10 hover:bg-primary/5 hover:border-border hover:text-muted-foreground"
          : status === "denied"
          ? "text-muted-foreground/40 border-border cursor-not-allowed"
          : "text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
        }`}
    >
      {status === "loading" ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : status === "subscribed" ? (
        <BellRing className="w-3.5 h-3.5" />
      ) : status === "denied" ? (
        <BellOff className="w-3.5 h-3.5" />
      ) : (
        <Bell className="w-3.5 h-3.5" />
      )}
      {status === "subscribed" ? "notified" : status === "denied" ? "blocked" : "notify me"}
    </button>
  );
}
