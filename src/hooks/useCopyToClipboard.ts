import { useEffect, useState } from "react";

export const useCopyToClipboard = (duration = 2000) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), duration);
    return () => clearTimeout(timeout);
  }, [copied, duration]);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return { copied, copy };
};
