import { config } from "dotenv";
import express, { Request, Response } from "express";

const app = express();

config({ path: "./.env" });

const port = process.env.PORT || 3000;

app.get("/new", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
