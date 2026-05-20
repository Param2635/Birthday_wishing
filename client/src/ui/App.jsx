import React, { useEffect, useMemo, useRef, useState } from "react";
import ConfettiCanvas from "./ConfettiCanvas.jsx";
import Typewriter from "./Typewriter.jsx";

const DEFAULT = {
  to: "My Friend",
  title: "Happy Birthday!",
  body:
    "I’m really grateful for you. Thanks for being such a good friend — wishing you a day full of smiles, surprises, and all your favorite things.",
  from: "Your Friend"
};

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export default function App() {
  const now = useNow();
  const [message, setMessage] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [lightsOn, setLightsOn] = useState(true);
  const [confettiOn, setConfettiOn] = useState(true);
  const [replaySeed, setReplaySeed] = useState(0);
  const audioRef = useRef(null);
  const [musicReady, setMusicReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/message");
        if (!res.ok) throw new Error("Bad response");
        const data = await res.json();
        if (!cancelled) setMessage({ ...DEFAULT, ...data });
      } catch {
        // Ignore: local API not running yet
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const subtitle = useMemo(() => {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `Make a wish • ${hh}:${mm}:${ss}`;
  }, [now]);

  const toggleMusic = async () => {
    try {
      if (!audioRef.current || !musicReady) return;
      if (audioRef.current.paused) {
        await audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    } catch {
      // Autoplay restrictions; user can click again.
    }
  };

  return (
    <div className={`page ${lightsOn ? "lights" : "dark"}`}>
      <ConfettiCanvas
        enabled={confettiOn}
        seed={replaySeed}
        className="confetti"
      />

      <div className="bg">
        <div className="aurora a1" />
        <div className="aurora a2" />
        <div className="aurora a3" />
        <div className="stars" />
      </div>

      <main className="shell">
        <header className="topbar">
          <div className="badge">
            <span className="dot" />
            <span className="dot d2" />
            <span className="dot d3" />
            <span className="label">Birthday Wish</span>
          </div>

          <div className="controls">
            <button
              className="btn"
              onClick={() => setLightsOn((v) => !v)}
              type="button"
              aria-label="Toggle lights"
              title="Toggle lights"
            >
              {lightsOn ? "Lights: ON" : "Lights: OFF"}
            </button>
            <button
              className="btn"
              onClick={() => setConfettiOn((v) => !v)}
              type="button"
              aria-label="Toggle confetti"
              title="Toggle confetti"
            >
              {confettiOn ? "Confetti: ON" : "Confetti: OFF"}
            </button>
            <button
              className="btn"
              onClick={() => setReplaySeed((s) => s + 1)}
              type="button"
              aria-label="Replay"
              title="Replay"
            >
              Replay
            </button>
            <button className="btn" onClick={toggleMusic} type="button">
              Music{musicReady ? "" : " (add file)"}
            </button>
          </div>
        </header>

        <section className="card">
          <div className="glow" />
          <div className="content">
            <p className="eyebrow">{subtitle}</p>
            <h1 className="title">
              <span className="sparkle" aria-hidden="true" />
              {loading ? "Loading…" : message.title}
            </h1>
            <p className="to">
              To <span className="name">{message.to}</span>
            </p>

            <div className="message">
              <Typewriter key={replaySeed} text={message.body} speed={14} />
            </div>

            <div className="footer">
              <div className="signature">
                — <span className="from">{message.from}</span>
              </div>
              <div className="balloons" aria-hidden="true">
                <span className="balloon b1" />
                <span className="balloon b2" />
                <span className="balloon b3" />
              </div>
            </div>
          </div>
        </section>

        <section className="photoHint">
          <div className="hintCard">
            <div className="hintTitle">Add photos later</div>
            <div className="hintText">
              Drop your images into <code>client/src/assets/</code> and update{" "}
              <code>App.jsx</code>.
            </div>
          </div>
        </section>
      </main>

      <audio
        ref={audioRef}
        preload="auto"
        loop
        src="/happy-birthday.ogg"
        onCanPlayThrough={() => setMusicReady(true)}
        onError={() => setMusicReady(false)}
      />
    </div>
  );
}
