import React, { useEffect, useMemo, useRef, useState } from "react";
import ConfettiCanvas from "./ConfettiCanvas.jsx";
import Typewriter from "./Typewriter.jsx";
import useScrollProgress from "./useScrollProgress.js";
import SpaceToSeaScene from "./SpaceToSeaScene.jsx";
import Planet3D from "./Planet3D.jsx";

const DEFAULT = {
  to: "Megha",
  title: "Happy Birthday!",
  body:
    "You’re genuinely one of my favorite people to have around. Thanks for being such a good friend — wishing you a day full of laughs, good vibes, and wonderful surprises. Happy Birthday!",
  from: "Param"
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
  const progress = useScrollProgress();
  const now = useNow();
  const [message, setMessage] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [lightsOn, setLightsOn] = useState(true);
  const [confettiOn, setConfettiOn] = useState(true);
  const [replaySeed, setReplaySeed] = useState(0);
  const [stunBurst, setStunBurst] = useState(0);
  const audioRef = useRef(null);
  const [musicReady, setMusicReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/message");
        if (!res.ok) throw new Error("Bad response");
        const data = await res.json();
        if (!cancelled)
          setMessage({
            ...DEFAULT,
            title: data.title || DEFAULT.title,
            body: data.body || DEFAULT.body,
            to: data.to || DEFAULT.to,
            from: data.from || DEFAULT.from
          });
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

  useEffect(() => {
    if (!stunBurst) return undefined;
    const id = window.setTimeout(() => setStunBurst(0), 1200);
    return () => window.clearTimeout(id);
  }, [stunBurst]);

  const handleSceneTap = () => {
    setReplaySeed((s) => s + 1);
    setStunBurst((n) => n + 1);
  };

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

  useEffect(() => {
    // Try to autoplay when the audio is ready (best-effort; browsers may block).
    if (!audioRef.current) return undefined;
    if (musicReady) {
      audioRef.current.play().catch(() => {});
    } else {
      // Try once on mount as a fallback (will silently fail if blocked)
      audioRef.current.play().catch(() => {});
    }
    return undefined;
  }, [musicReady]);

  return (
    <div
      className={`page ${lightsOn ? "lights" : "dark"}`}
      style={{ "--scrollP": progress }}
    >
      <ConfettiCanvas
        enabled={confettiOn}
        seed={replaySeed}
        className="confetti"
      />

      <div className="sceneWrap" aria-hidden="true" onPointerDown={handleSceneTap}>
        <SpaceToSeaScene key={replaySeed} className="sceneCanvas" progress={progress} />
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
            {/* <button
              className="btn"
              onClick={() => setReplaySeed((s) => s + 1)}
              type="button"
              aria-label="Replay"
              title="Replay"
            >
              Replay
            </button> */}
            <button className="btn" onClick={toggleMusic} type="button">
              Music{musicReady ? "" : " (add file)"}
            </button>
          </div>
        </header>

        <section className="hero">
          <div className={`heroLeft ${stunBurst ? "stunned" : ""}`}>
            <p className="heroTag">
              Scroll down • Universe → Ocean • Stars → Sea Creatures
            </p>
            <div className={`shockToast ${stunBurst ? "active" : ""}`}>
              <span>😲💙</span>
              <strong>She’s stunned by how magical it feels!</strong>
            </div>
            <h2 className="heroTitle">
              A little universe made just for your birthday
            </h2>
            <p className="heroSub">
              Twinkling stars, meteors, nebula clouds… then a rich ocean full of dolphins, turtles, whales, seahorses, starfish, corals, seagrass, and jellyfish.
            </p>
          </div>
          <Planet3D className="planetWrap" />
        </section>

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

        <section className="universeView">
          <div className="viewHead">
            <div className="viewTitle">Universe view</div>
            <div className="viewDesc">
              Pause here to enjoy the starry sky, the meteor trails, and the nebula glow before diving into the deep blue.
            </div>
          </div>
          <div className="viewCards">
            <div className="viewCard">
              <div className="viewCardTitle">Meteor shower</div>
              <p>Catch the streaking meteors while the stars pulse gently overhead.</p>
            </div>
            <div className="viewCard">
              <div className="viewCardTitle">Floating galaxy</div>
              <p>Feel the universe drift as the scene slowly transitions into oceanic blue.</p>
            </div>
          </div>
        </section>

        <section className="underwaterStage" aria-hidden="true" />

        {/* <section className="photoHint">
          <div className="hintCard">
            <div className="hintTitle">Add photos later</div>
            <div className="hintText">
              Drop your images into <code>client/src/assets/</code> and update{" "}
              <code>client/src/ui/App.jsx</code>.
            </div>
          </div>
          <div className="hintCard">
            <div className="hintTitle">Add music (optional)</div>
            <div className="hintText">
              Put a file at <code>client/public/happy-birthday.ogg</code> and
              click <b>Music</b>.
            </div>
          </div>
        </section> */}
      </main>

      <audio
        ref={audioRef}
        preload="auto"
        loop
        autoPlay
        playsInline
        src="/happy-birthday.ogg"
        onCanPlayThrough={() => setMusicReady(true)}
        onError={() => setMusicReady(false)}
      />
    </div>
  );
}
