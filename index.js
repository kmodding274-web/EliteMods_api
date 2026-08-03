const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const ORIGINAL_API_BASE = 'https://story.appsdone.online';

// ---------------- HARD API KEY CONFIGURATION ----------------
// Aap apni strong key yahan set karein ya Environment Variable se lein
const HARD_API_KEY = process.env.API_KEY || "EliteMods_Hub";

// 1. Aapki Local JSON Files Import
const subscriptionData = require('./subscription.json');
const structData = require('./struct.json');
const profileData = require('./profile.json');

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

// ---------------- API KEY VERIFICATION MIDDLEWARE ----------------
const verifyApiKey = (req, res, next) => {
    // Key ko Header ('x-api-key') ya Query Param ('?api_key=...') dono se verify kar sakte hain
    const clientKey = req.headers['x-api-key'] || req.query.api_key;

    if (!clientKey || clientKey !== HARD_API_KEY) {
        return res.status(401).json({
            status: "ACCESS_DENIED",
            message: "Invalid or missing API Key! Authentication failed."
        });
    }

    // Key verify hone par aage request jaane do
    next();
};

// Pure API par verification apply karne ke liye
app.use(verifyApiKey);

// JSON Helper Function
function sendJsonWithCdnProxy(res, req, data) {
    res.header("Cache-Control", "public, max-age=3600");
    return res.json(data);
}

// ---------------- LOCAL CUSTOM ENDPOINTS ----------------

// 1. Subscription API (Local File se)
app.get('/userservice/v1/profile/subscription', (req, res) => {
    sendJsonWithCdnProxy(res, req, subscriptionData);
});

// 2. Homepage Struct API (Local File se)
app.get('/feedservice/v1/homepage/struct', (req, res) => {
    sendJsonWithCdnProxy(res, req, structData);
});

app.get('/userservice/v1/profile', (req, res) => {
    sendJsonWithCdnProxy(res, req, profileData);
});
// ---------------- LIVE PROXY HANDLER (Baaki sab ke liye) ----------------

app.use(async (req, res) => {
    try {
        const targetUrl = `${ORIGINAL_API_BASE}${req.originalUrl}`;

        const headers = {
            'appVersion': req.headers['appversion'] || '14',
            'platform': req.headers['platform'] || '0',
            'deviceId': req.headers['deviceid'] || '5de5d3c427dcb215',
            'os': req.headers['os'] || 'Android 16 (API 36)',
            'network_type': req.headers['network_type'] || 'WIFI',
            'X-AYUSH-KEY': req.headers['x-ayush-key'] || 'LEGEND_2026_SECRET',
            'Authorization': req.headers['authorization'] || 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IlN1biBKdW4gMjggMTU6Mjk6MzQgVVRDIDIwMjYiLCJzZXNzaW9uSWQiOiIxNDMzMDU4NSIsImRldmljZUlkIjoiNWRlNWQzYzQyN2RjYjIxNSIsInN1YiI6IjEyMjcxODY5IiwiZXhwIjoxNzgyOTE5Nzc0fQ.z8f023DCzpzGg3J1t4VHloQWBtcPxi9PbxkqP_zl4PQ',
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
