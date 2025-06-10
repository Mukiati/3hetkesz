import dotenv from "dotenv";
dotenv.config();

import express from "express";
import APIApp from "./api.js";
import webApp from "./web.js";

const app = express();
app.use(webApp);
app.use("/api", APIApp);

const port = process.env.PORT;
if (!port) {
  console.error("The PORT env variable must be set to the port to listen on!");
  process.exit(1);
}
app.listen(port, () => console.log(`Listening on :${port}`));
