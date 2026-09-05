const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Updated Premium JSON
const HARDCODED_PREMIUM_DATA = {
    "appVersion": "60",
    "platform": "0",
    "deviceId": "83a25beee1317224",
    "os": "Android 16 (API 36)",
    "network_type": "WIFI",
    "X-AYUSH-KEY": "LEGEND_2026_SECRET",
    "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IjIwMjYtMDEtMTEgMDM6NDA6MDEuNjYyIiwic2Vzc2lvbklkIjoiMTYxMzU2Mjk5IiwiZGV2aWNlSWQiOiJhN2Q5MjgzODQxYjRmMWIzIiwic3ViIjoiNTMzMTQ2MzMiLCJleHAiOjE3ODI4ODEwMTZ9.O62idCQnjAIyP_r-JRH6mt0i38dkYXpskpbJOET-E34",
    "accept": "application/json",
    "user-agent": "ktor-client",
    "Content-Type": "application/json",
    "accept-encoding": "gzip",
    "ts": "1788621233"
};

const ORIGINAL_SERVER_URL = "https://api.storytv.asia";

app.all('*', async (req, res) => {
    try {
        console.log(`[Proxy] Request aayi: ${req.method} ${req.url}`);

        const finalHeaders = {
            ...HARDCODED_PREMIUM_DATA,
            'host': 'api.storytv.asia'
        };

        const targetUrl = `${ORIGINAL_SERVER_URL}${req.url}`;

        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: finalHeaders,
            data: req.body,
            validateStatus: () => true 
        });

        res.status(response.status).json(response.data);

    } catch (error) {
        res.status(500).json({ error: "Proxy Error", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hardcoded Proxy Server running on port ${PORT}`));
