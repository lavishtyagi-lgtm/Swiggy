import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

// Enable CORS for all routes (since we are calling from localhost:1234)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Endpoint: Get Restaurants List
app.get("/api/restaurants", async (req, res) => {
    try {
        const defaultLat = "18.5204303";
        const defaultLng = "73.8567437";
        const lat = req.query.lat || defaultLat;
        const lng = req.query.lng || defaultLng;

        const url = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&page_type=DESKTOP_WEB_LISTING`;

        console.log(`Fetching restaurants from: ${url}`);

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Swiggy API Error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ error: "Failed to fetch data from Swiggy" });
    }
});

// Endpoint: Get Restaurant Menu
app.get("/api/menu", async (req, res) => {
    try {
        const defaultLat = "18.5204303";
        const defaultLng = "73.8567437";
        const lat = req.query.lat || defaultLat;
        const lng = req.query.lng || defaultLng;
        const restaurantId = req.query.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ error: "restaurantId query param is required" });
        }

        const url = `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${lat}&lng=${lng}&restaurantId=${restaurantId}&submitAction=ENTER`;

        console.log(`Fetching menu from: ${url}`);

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": "https://www.swiggy.com/",
                "Origin": "https://www.swiggy.com",
            },
        });

        const text = await response.text();

        if (!text || text.trim() === "") {
            console.error(`Swiggy returned empty body for restaurantId=${restaurantId}`);
            return res.status(503).json({
                error: "Swiggy returned an empty response. This usually means the session has expired. Open swiggy.com in your browser, browse any restaurant, then retry.",
            });
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("Swiggy returned non-JSON body:", text.slice(0, 300));
            return res.status(502).json({
                error: "Swiggy returned an unexpected response (not JSON). Try opening swiggy.com in your browser first.",
            });
        }

        if (!response.ok) {
            console.error(`Swiggy menu API returned ${response.status}`);
            return res.status(response.status).json({
                error: `Swiggy returned ${response.status}: ${response.statusText}`,
            });
        }

        res.json(data);
    } catch (error) {
        console.error("Error fetching menu:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
});
