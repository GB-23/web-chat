const express = require('express');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('teste!');
});


app.listen(PORT, () => {
    console.log(`usando porta: ${PORT}`);
});