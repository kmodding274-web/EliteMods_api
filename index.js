const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Base Target URL
const TARGET_BASE_URL = 'https://api.storymax.app';

// ---------------- LOCAL JSON FILES IMPORT ----------------
const subscriptionData = require('./subscription.json');
const structData = require('./struct.json');
const subscriptionStateData = require('./state.json');
const profileData = require('./profile.json');
const watchedData = require('./watched.json');

// ---------------- MIDDLEWARES ----------------
app.use(cors());
app.use(express.json());

// Helper function to build dynamic headers for live proxying
const getForwardHeaders = (req) => {
    return {
        'authorization': req.headers['authorization'] || '',
        'appversion': req.headers['appversion'] || '17',
        'platform': req.headers['platform'] || '0',
        'deviceid': req.headers['deviceid'] || 'acac549b0ef02489',
        'os': req.headers['os'] || 'Android 16 (API 36)',
        'network_type': req.headers['network_type'] || 'CELLULAR',
        'ep_session_id': req.headers['ep_session_id'] || '',
        'sessionid': req.headers['sessionid'] || '',
        'user-agent': req.headers['user-agent'] || 'ktor-client',
        'content-type': 'application/json',
        'accept': 'application/json',
        'ts': Math.floor(Date.now() / 1000).toString()
    };
};

// JSON Helper Function with CDN/Cache Control Headers
function sendJsonWithCdnProxy(res, req, data) {
    res.header("Cache-Control", "public, max-age=3600");
    return res.json(data);
}


// ========================================================
// 1. LOCAL CUSTOM ENDPOINTS (File-based responses)
// ========================================================

// Subscription API (Local File)
app.get('/userservice/v1/profile/subscription', (req, res) => {
    sendJsonWithCdnProxy(res, req, subscriptionData);
});

// Subscription State API (Local Response)
app.get('/userservice/v1/profile/subscription/state', (req, res) => {
    sendJsonWithCdnProxy(res, req, subscriptionStateData);
});

// Homepage Struct API (Local File)
app.get('/feedservice/v1/homepage/struct', (req, res) => {
    sendJsonWithCdnProxy(res, req, structData);
});

app.get('/userservice/v1/profile', (req, res) => {
    sendJsonWithCdnProxy(res, req, profileData);
});

app.get('/feedservice/v1/shows/watched', (req, res) => {
    sendJsonWithCdnProxy(res, req, watchedData);
});
// ========================================================
// 2. LIVE PROXY ENDPOINTS (Forward to https://api.storymax.app)
// ========================================================

// Analytics Impression Proxy
app.post('/api/analytics/v1/impression', async (req, res) => {
    try {
        const response = await axios.post(`${TARGET_BASE_URL}/analytics/v1/impression`, req.body, {
            headers: getForwardHeaders(req)
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});

// Heartbeat Analytics Proxy
app.post('/api/analytics/v1/heartbeat', async (req, res) => {
    try {
        const response = await axios.post(`${TARGET_BASE_URL}/analytics/v1/heartbeat`, req.body, {
            headers: getForwardHeaders(req)
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});

// Mark Episode Watched Proxy

// Get Episode Metadata Proxy (Includes Pagination/Cursor handling)
app.get('/api/feedservice/v1/episode/metadata/:showId', async (req, res) => {
    try {
        const { showId } = req.params;

        const response = await axios.get(`${TARGET_BASE_URL}/feedservice/v1/episode/metadata/${showId}`, {
            params: req.query,
            headers: getForwardHeaders(req)
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});

// Get Episode List Proxy
app.get('/api/feedservice/v1/episode/list/:showId', async (req, res) => {
    try {
        const { showId } = req.params;

        const response = await axios.get(`${TARGET_BASE_URL}/feedservice/v1/episode/list/${showId}`, {
            headers: getForwardHeaders(req)
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});

// Get Suggested Shows Proxy
app.get('/api/feedservice/v1/suggested/shows', async (req, res) => {
    try {
        const response = await axios.get(`${TARGET_BASE_URL}/feedservice/v1/suggested/shows`, {
            params: req.query,
            headers: getForwardHeaders(req)
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});


// ========================================================
// 3. CATCH-ALL UNIVERSAL PROXY (Baqi sab unmapped requests ke liye)
// ========================================================
app.use('*', async (req, res) => {
    try {
        // Cleaning original path
        const cleanPath = req.originalUrl.replace(/^\/proxy/, '');
        
        const response = await axios({
            method: req.method,
            url: `${TARGET_BASE_URL}${cleanPath}`,
            data: req.body,
            headers: getForwardHeaders(req)
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { status: "PROXY_ERROR", message: error.message }
        );
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Unified Proxy Server running at http://localhost:${PORT}`);
});
