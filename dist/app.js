import { configDotenv } from "dotenv";
import express from "express";
const app = express();
configDotenv({ path: "./.env" });
const port = process.env.PORT || 3000;
app.get("/new", (req, res) => {
    res.send("Hello, World!");
});
app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
