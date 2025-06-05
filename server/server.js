const express = require('express');

const PORT = 3000;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();


const JWT_SECRET = 'j39tj0j29gj2034jgj0982jg0j0fjasjf00jf02j03tjj0pajsjdfikjdhfuiqhfiouhodpasd8uy3r'
app.use(express.json());



// endpoint de registro de usuario
app.get('/register', async (req, res) => {
    const { username, password } = req.body; //usa queries
    if (!username || !password) { //precisa informra os dois
        return res.status(400).json({ error: 'Você precisa informar Usuario e senha!' });
    }
    try {
        const existingUser = await prisma.user.findUnique({ where: { username } }); //checar se já existe um usuario com o mesmo nome
        if (existingUser) {
            return res.status(409).json({ error: 'O nome de usuario já está em uso.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);   //criptografar a senha
        const user = await prisma.user.create({   //adicicona o usuario no banco (postgre)
            data: {
                username,
                password: hashedPassword
            }
        });
        res.status(201).json({ message: 'Usuario registrado!' }); //gg
    } catch (error) {
        res.status(500).json({ error: 'Erro' }); // :( 
    }
});


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