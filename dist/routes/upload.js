import express from "express";
import multer from "multer";
import path from "path";
const app = express();
// Set up storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
// Initialize multer with the storage configuration
const upload = multer({ storage });
app.post("/upload/multer", upload.single("file"), (req, res) => {
    try {
        console.log("File:", req.file);
        console.log("Body:", req.body);
        res.json({ file: req.file, fields: req.body });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default app;
