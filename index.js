const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// आपकी सभी JSON फाइलें
const subscriptionData = require('./subscription.json');
const stateData = require('./state.json');
const profileData = require('./profile.json');
const detailsData = require('./details.json');
const languageData = require('./languages.json');
const list223 = require('./223.json');
const list5 = require('./5.json');
const impressionData = require('./impression.json');
const cwData = require('./cw.json');
const experimentData = require('./experiment.json');
const structData = require('./struct.json');
const list505 = require('./505.json');
const idsData = require('./ids.json');
const list507 = require('./507.json');

// 1. Subscription API (Mod Data)
app.post('/analytics/v1/impression', (req, res) => {
    res.json(impressionData);
});

// 2. State API
app.get('/userservice/v1/profile/subscription/state', (req, res) => {
    res.json(stateData);
});

// 3. Profile API
app.get('/feedservice/v1/shows/5', (req, res) => {
    res.json(list5);
});

// 4. Details API
app.get('/userservice/v1/profile/subscription', (req, res) => {
    res.json(subscriptionData);
});

// 5. Languages API
app.get('/userservice/v1/languages', (req, res) => {
    res.json(languageData);
});

// 6. List APIs (जैसे 10446, 10636, 10638 आदि)
app.get('/userservice/v1/profile', (req, res) => {
    res.json(profileData);
});

app.get('/feedservice/v1/shows/223', (req, res) => {
    res.json(list223);
});

app.get('/v1/shows/505', (req, res) => {
    res.json(list505);
});

app.get('/feedservice/v1/shows/507', (req, res) => {
    res.json(list507);
});

app.post('/userservice/v1/device/ids', (req, res) => {
    res.json(idsData);
});

app.get('/feedservice/v1/homepage/struct', (req, res) => {
    res.json(structData);
});

app.get('/userservice/v1/experiments', (req, res) => {
    res.json(experimentData);
});

app.get('/feedservice/v1/show/cw', (req, res) => {
    res.json(cwData);
});

app.get('/feedservice/v1/category/details', (req, res) => {
    res.json(detailsData);
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
