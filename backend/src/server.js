import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db.js";
import api from "./routes/index.js"; 
import { withClerkAuth } from './middleware/auth.js'
import { clerkMiddleware } from '@clerk/express';


dotenv.config()

const app = express();
if (process.env.USE_CLERK === 'true') {
  app.use(clerkMiddleware());
}

const PORT = process.env.PORT || 5002;
const __dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
    app.use(cors({
        origin: "http://localhost:5173"
    }));
}
app.use(express.json());

//custom middleware
app.use((req, res, next) => {
    const hdr = req.headers?.authorization || ''
    const redacted = hdr.startsWith('Bearer ')
      ? 'Bearer ' + hdr.slice(7, 19) + '...'
      : hdr
    // Safely resolve userId whether req.auth is a function or object
    let authObj
    try {
      authObj = typeof req.auth === 'function' ? req.auth() : req.auth
    } catch {
      authObj = req.auth
    }
    const userId = authObj?.userId || 'none'
    console.log(`${req.method} ${req.url} :: auth=${redacted} userId=${userId}`)
    next();
})
app.use("/api", withClerkAuth, api);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    })
}

connectDB().then(() => {
        app.listen(PORT, () => {
            console.log("Server started on PORT:", PORT);
    });
});
