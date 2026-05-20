import express from "express";

export function buildRoutes({ friendName, fromName }) {
  const router = express.Router();

  router.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  router.get("/message", (req, res) => {
    res.json({
      to: friendName,
      title: `Happy Birthday, ${friendName}!`,
      body:
        "You’re genuinely one of my favorite people to have around. Thanks for being such a good friend — wishing you a day full of laughs, good vibes, and wonderful surprises. Happy Birthday!",
      from: fromName
    });
  });

  return router;
}
