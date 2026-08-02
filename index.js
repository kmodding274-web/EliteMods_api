const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const ORIGINAL_API_BASE = 'https://api.storymax.app';

// Local JSON Files Import
const subscriptionData = require('./subscription.json');
const structData = require('./struct.json');

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Helper Function
function sendJsonWithCdnProxy(res, req, data) {
    res.header("Cache-Control", "public, max-age=3600");
    return res.json(data);
}

// ---------------- LOCAL CUSTOM ENDPOINTS ----------------

// Subscription API
app.get('/userservice/v1/profile/subscription', (req, res) => {
    sendJsonWithCdnProxy(res, req, subscriptionData);
});

// Homepage Struct API
app.get('/feedservice/v1/homepage/struct', (req, res) => {
    sendJsonWithCdnProxy(res, req, structData);
});

// ---------------- LIVE PROXY HANDLER ----------------

app.use(async (req, res) => {
    try {
        const targetUrl = `${ORIGINAL_API_BASE}${req.originalUrl}`;

        // Dynamic req.headers Fallbacks Hata Kar Purely Fixed Headers Set Kiyen Hain
        const headers = {
            'appVersion': '14',
            'platform': '0',
            'deviceId': 'acac549b0ef02489',
            'os': 'Android 16 (API 36)',
            'network_type': 'WIFI',
            'ep_session_id': '13273025_',
            'X-AYUSH-KEY': 'LEGEND_2026_SECRET',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IjIwMjYtMDctMDggMDg6MDc6NDAuMTA5Iiwic2Vzc2lvbklkIjoiMTU2OTgyNzEiLCJkZXZpY2VJZCI6IjczZDdhMDQ5MmEwYzY4YTQiLCJzdWIiOiIxMzI3MzAyNSIsImV4cCI6MTc4NTgzNzc3MX0.i7bckJ7Hrw57C6upUZhSqxludMC5DgvfLf2Vrt4r8VM',
            'User-Agent': 'ktor-client',
            'Content-Type': 'application/json',
            'ts': Math.floor(Date.now() / 1000).toString()
        };

        const fetchOptions = {
            method: req.method,
            headers: headers
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        res.status(500).json({
            status: "PROXY_ERROR",
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running live on port ${PORT}`);
});
