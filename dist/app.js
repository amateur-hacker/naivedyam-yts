import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import yts from "yt-search";
import { errorHandler, notFound } from "./middlewares/index.js";
const app = new Hono({ strict: false }).basePath("/api/v1");
// Initialize middlewares
app.use("*", logger(), prettyJSON());
// Cors
app.use("*", cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
// Error Handler
app.onError((_err, c) => {
    const error = errorHandler(c);
    return error;
});
// Not Found Handler
app.notFound((c) => {
    const error = notFound(c);
    return error;
});
// Routes
app.get("/", (c) => {
    return c.text("Hello it's a yt-search API.");
});
app.get("/yts", async (c) => {
    const query = c.req.query("q");
    if (!query) {
        return c.json({
            message: "Missing query parameter",
            success: false,
            statusCode: 422,
        });
    }
    const results = await yts(query);
    const filteredResults = results.videos.map((video) => ({
        id: video.videoId,
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        duration: {
            timestamp: video.duration.timestamp,
            seconds: video.duration.seconds,
        },
    }));
    return c.json(filteredResults);
});
app.get("/hello", (c) => {
    return c.json({ message: "Hello World!" });
});
export { app };
