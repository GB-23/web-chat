// Pacotes //
const express = require('express');
const path = require('path');
const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// Pacotes //


const PORT = 3000;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//const messageRoutes = require('/api/messages')


const JWT_SECRET = 'j39tj0j29gj2034jgj0982jg0j0fjasjf00jf02j03tjj0pajsjdfikjdhfuiqhfiouhodpasd8uy3r'

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(bodyParser.json());


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
        res.status(200).json({ message: 'Usuario registrado!' }); //gg
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
        //res.json({ token }); 
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });
         res.status(200).json({ message: 'Usuario logado!' }); //gg
    } catch (error) {
        res.status(500).json({ error: 'Erro' }); // :( 
    }
});


app.get('/', (req, res) => {
    res.send('Bem vindo ao chat publico, só criar uma conta e colocar um link de chat na URL para começar a conversar!');
});


const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(403).json({ error: 'Acesso negado.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido?' });
    req.user = user;
    next();
  });

};

//não sabia, mas da pra adicionar um middleware para autenticar o JWT antes de enviar o arquivo HTML
app.get('/chat/:roomName', authenticateJWT, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});



// inicio da conexao
io.on('connection', (socket) => {
  console.log('A user connected');

  // função que lida com as mensgens
  socket.on('sendmsg', async (data) => {
    const { roomName, content, senderId } = data;

    try {
   
      let room = await prisma.Room.findUnique({
        where: { name: roomName },
      });

      if (!room) {
        room = await prisma.Room.create({
          data: {
            name: roomName,
          },
        });
        console.log(`Sala criada: ${room.name}`);
      }

      const message = await prisma.Messages.create({
        data: {
          content,
          senderId,
          roomId: room.id,
        },
      });


      io.to(roomName).emit('newmsg', message);

    } catch (error) {
      socket.emit('error', { message: 'Erro ao enviar mensagem' });
    }
  });

 
  socket.on('join', (roomName, token) => {
   try {
      const decoded = jwt.verify(token, JWT_SECRET); 

      socket.join(roomName);
      console.log(`Usuário entrou na sala: ${roomName}`);

      socket.emit('newmsg', { senderId: 'Servidor', content: `Bem-vindo à sala ${roomName}!` });

    } catch (error) {
      console.log('Erro ao validar token:', error);
      socket.emit('error', { message: 'Token inválido ou expirado' });
    }
  });

  
  socket.on('leave', () => {
    socket.leave(roomName);
    console.log('Um usuario desconectou');
  });
});


app.listen(PORT, () => {
    console.log(`usando porta: ${PORT}`);
});