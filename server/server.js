const express = require('express');
const path = require('path');
const PORT = 3000;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'j39tj0j29gj2034jgj0982jg0j0fjasjf00jf02j03tjj0pajsjdfikjdhfuiqhfiouhodpasd8uy3r'

const app = express();



app.use(express.json());

app.use('/static', express.static(path.join(__dirname, '..', 'shared')));
const defaultAvatarUrl = 'http://localhost:3000/static/avatar.png';


// endpoint de registro de usuario
app.get('/register', async (req, res) => {
    const { username, password } = req.query; //usa queries
    if (!username || !password) { //precisa informra os dois
        return res.status(400).json({ error: 'Você precisa informar Usuario e senha!' });
    }
    console.log("PASS!");
   try {
        const existingUser = await prisma.Users.findUnique({ where: { username } }); //checar se já existe um usuario com o mesmo nome
        if (existingUser) {
            return res.status(409).json({ error: 'O nome de usuario já está em uso.' });
        }
         console.log("PASS2!");
        const hashedPassword = await bcrypt.hash(password, 10);   //criptografar a senha
        const user = await prisma.Users.create({   //adicicona o usuario no banco (postgre)
            data: {
                username,
                password: hashedPassword,
                Avatar : defaultAvatarUrl // define o avatar padrão
            }
        });
        res.status(201).json({ message: 'Usuario registrado!' }); //gg
    } catch (error) {
        
        res.status(500).json({ error: 'Erro' }); // :( 
    }
});


// endpoint de login de usuario
app.get('/login', async (req, res) => {
    const { username, password } = req.query; //usa queries
    if (!username || !password) { //precisa informar os dois
        return res.status(400).json({ error: 'Você precisa informar Usuario e senha!' });
    }
    try {
        const user = await prisma.Users.findUnique({ where: { username } }); //checar se o usuario existe
        if (!user) {
            return res.status(404).json({ error: 'Usuario não encontrado.' }); // f
        }
        const isPasswordValid = await bcrypt.compare(password, user.password); // verifica se a senha está correta usando o compare
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Senha incorreta.' }); //
        }
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' }); //cria o token de autenticação
        res.json({ token }); 
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