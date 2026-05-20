import express from "express";
import cors from "cors";
import { getConfig } from "./config.js";
import { buildRoutes } from "./routes.js";

const app = express();

app.use(cors());
app.use(express.json());

const config = getConfig();
app.use("/api", buildRoutes(config));

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${config.port}`);
});
