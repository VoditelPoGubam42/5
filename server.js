// server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const CLIENT_ID = "9a841b37861c434eb5db9fdc70eb7eb3";
const CLIENT_SECRET = "d3c405db5a0c4806a77edbe8d5703209";

let accessToken = null;
let tokenExpires = 0;

async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpires) return accessToken;

    const response = await fetch('https://oauth.fatsecret.com/connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            scope: 'basic'
        })
    });

    const data = await response.json();
    if (!data.access_token) throw new Error('Failed to get token');

    accessToken = data.access_token;
    tokenExpires = Date.now() + (data.expires_in * 1000) - 60000;
    return accessToken;
}

app.get('/api/fatsecret', async (req, res) => {
    try {
        const token = await getAccessToken();
        const url = `https://platform.fatsecret.com/rest/server.api?${new URLSearchParams(req.query)}`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('FatSecret Proxy запущен на http://localhost:3000');
});