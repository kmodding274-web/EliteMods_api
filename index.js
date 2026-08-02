const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Base URLs
const ORIGINAL_API_BASE = 'https://api.storymax.app';
const MOENGAGE_API_BASE = 'https://sdk-03.moengage.com';

// Local JSON Files Import
const subscriptionData = require('./subscription.json');
const structData = require('./struct.json');
const sdkConfigData = require('./sdkconfig.json');
const analyticsEventsData = require('./analytics_events.json');

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

// MoEngage SDK Config Endpoint (Local JSON Response for GET & POST)
app.all('/v3/sdkconfig/android/YK7OBFDSPNTUQ9KQUQHSO4NO', (req, res) => {
    sendJsonWithCdnProxy(res, req, sdkConfigData);
});

// Analytics Events API
app.all('/v2/analytics/send/storymax/events', (req, res) => {
    sendJsonWithCdnProxy(res, req, analyticsEventsData);
});

// Android Event Proxy API
app.post('/api/v6.18/androidevent', async (req, res) => {
    try {
        const txtData = fs.readFileSync('./androidevent.txt');

        const response = await fetch(
            'https://biriuu.launches.appsflyersdk.com/api/v6.18/androidevent?app_id=com.storymax.reels.shorts&buildnumber=6.18.0',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 16; I2407 Build/BP2A.250605.031.A3_V000L1)',
                    'Accept-Encoding': 'gzip',
                    'Connection': 'Keep-Alive'
                },
                body: txtData
            }
        );

        const data = Buffer.from(await response.arrayBuffer());

        res.status(response.status);
        res.setHeader(
            'Content-Type',
            response.headers.get('content-type') || 'application/octet-stream'
        );
        res.send(data);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// ---------------- STARTUP MOENGAGE TEST FETCH ----------------
// Server start hote hi agar test fetch chalana hai toh isse async IIFE me wrap kar diya hai
(async () => {
    try {
        if (fs.existsSync('./sdkconfig_body.json')) {
            const body = fs.readFileSync('./sdkconfig_body.json', 'utf8');

            const response = await fetch(
              'https://sdk-03.moengage.com/v3/sdkconfig/android/YK7OBFDSPNTUQ9KQUQHSO4NO',
              {
                method: 'POST',
                headers: {
                  'MOE-APPKEY': 'YK7OBFDSPNTUQ9KQUQHSO4NO',
                  'Accept-Encoding': 'gzip',
                  'Accept-Charset': 'UTF-8',
                  'Content-Type': 'application/json',
                  'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 16; I2407 Build/BP2A.250605.031.A3_V000L1)',
                  'Connection': 'Keep-Alive'
                },
                body: body
              }
            );

            const result = await response.text();
            console.log('MoEngage Test Response:', result);
        }
    } catch (err) {
        console.error('MoEngage startup fetch failed:', err.message);
    }
})();

// ---------------- LIVE STORYMAX PROXY HANDLER (DEFAULT) ----------------

app.use(async (req, res) => {
    try {
        const targetUrl = `${ORIGINAL_API_BASE}${req.originalUrl}`;

        const headers = {
            'appVersion': '14',
            'platform': '0',
            'deviceId': '',
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
