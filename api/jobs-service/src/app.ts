import express from "express";
import config from "config";
import log from "./logger";
import connect from "./db/connect";
import routes from "./routes";

const port = config.get("port") as number;
const host = config.get("host") as string;

const app = express();

// Parses incoming requests with JSON payloads
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.listen(port, host, () => {
  log.info(`Server listing at http://${host}:${port}`);

  connect();

  routes(app);
});