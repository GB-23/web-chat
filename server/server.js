const express = require('express');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('teste!');
});



app.get('/chat/:name', (req, res) => {
    const chatName = req.params.name;
    res.send(`bem vindo(a) a sala de chat ${chatName}`);
});
app.listen(PORT, () => {
    console.log(`usando porta: ${PORT}`);
});