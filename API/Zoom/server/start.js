// start.js
const app = require('./server');
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// npm run build in client folder 
// node start.js in server file 