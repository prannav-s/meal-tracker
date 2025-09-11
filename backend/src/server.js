import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import { connectDB } from "./config/db.js";
import api from "./routes/index.js"; 

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
    app.use(cors({
        origin: "http://localhost:5173"
    }));
}
app.use(express.json()); //middleware that will parse JSON bodies: req.body

//custom middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next();
})

app.use("/api", api);

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
