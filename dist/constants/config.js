const clientURL = process.env.CLIENT_URL || "";
const allowedOrigins = ["http://localhost:5173", clientURL].filter(Boolean);
const corsOptions = {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
export { corsOptions };
