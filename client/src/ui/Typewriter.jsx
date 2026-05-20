import React, { useEffect, useMemo, useState } from "react";

export default function Typewriter({ text, speed = 18 }) {
  const [i, setI] = useState(0);

  const safeText = useMemo(() => String(text || ""), [text]);

  useEffect(() => {
    setI(0);
    if (!safeText) return;
    let cancelled = false;
    let id = 0;

    const step = () => {
      if (cancelled) return;
      setI((v) => {
        const next = Math.min(safeText.length, v + 1);
        if (next < safeText.length) id = window.setTimeout(step, speed);
        return next;
      });
    };

    id = window.setTimeout(step, speed);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeText, speed]);

  return (
    <p className="type">
      {safeText.slice(0, i)}
      <span className="caret" aria-hidden="true" />
    </p>
  );
}
