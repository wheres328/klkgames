"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  pause?: number;
  className?: string;
}

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Typewriter({ text, speed = 65, pause = 2600, className }: TypewriterProps) {
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (reduced) return;

    let i = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const step = () => {
      setDisplay(text.slice(0, i));
      if (!deleting && i < text.length) {
        i += 1;
        timeout = setTimeout(step, speed);
      } else if (!deleting) {
        timeout = setTimeout(() => {
          deleting = true;
          step();
        }, pause);
      } else if (i > 0) {
        i -= 1;
        timeout = setTimeout(step, speed / 2);
      } else {
        deleting = false;
        timeout = setTimeout(step, pause);
      }
    };

    timeout = setTimeout(step, 450);
    return () => clearTimeout(timeout);
  }, [text, speed, pause, reduced]);

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {display}
      <span className="animate-pulse text-accent-2" aria-hidden>
        |
      </span>
    </span>
  );
}
