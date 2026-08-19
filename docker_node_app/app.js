const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Node.js Express app is running!');
});

app.get('/health', (req, res) => {
    res.send('Health check passed!');
});

app.get('/data', (req, res) => {
    res.send("Here's some sample data from the API!");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
