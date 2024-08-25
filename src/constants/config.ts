import cors from "cors"; // Import 'cors' and its types

const clientURL: string = process.env.CLIENT_URL || "";

const allowedOrigins = ["http://localhost:5173", clientURL].filter(
  Boolean,
) as string[];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

export { corsOptions };
