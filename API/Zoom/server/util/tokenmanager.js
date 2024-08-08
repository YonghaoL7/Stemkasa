const axios = require('axios');
require('dotenv').config();

let token = process.env.TOKEN;

async function fetchNewToken() {
    try {
        const response = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
                grant_type: 'account_credentials',
                account_id: process.env.ZOOM_ACCOUNT_ID
            },
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const newToken = response.data.access_token;
        token = newToken;
        return newToken;
    } catch (error) {
        console.error('Error fetching new token:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function getToken() {
    if (!token) {
        token = await fetchNewToken();
    }
    return token;
}

module.exports = {
    getToken,
    fetchNewToken
};
