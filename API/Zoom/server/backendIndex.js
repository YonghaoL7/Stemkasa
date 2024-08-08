require('dotenv').config();
const tokenManager = require('../util/tokenmanager');

(async () => {
    console.log(await tokenManager.getToken()); // Test the token retrieval
    console.log(await getMeetings()); // Log the updated list of meetings
})();

