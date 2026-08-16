"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  pause?: number;
  className?: string;
}

export function Typewriter({ text, speed = 65, pause = 2600, className }: TypewriterProps) {
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
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
