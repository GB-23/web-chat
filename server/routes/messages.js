const express = require('express');
const prisma = require('../prismaClient'); 

const router = express.Router();


router.get('/:roomName', async (req, res) => {
  const { roomName } = req.params;

  try {

    const room = await prisma.Room.findUnique({
      where: { name: roomName },
      include: { messages: true }, 
    });

    if (!room) {
      return res.status(404).json({ message: 'Sala não encontrada' });
    }


    res.json(room.messages);

  } catch (error) {
    res.status(500).json({ message: 'Não foi possivel recuperar as mensagens', error });
  }
});


router.post('/:roomName', async (req, res) => {
  const { roomName } = req.params;
  const { content, senderId } = req.body;

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
    }

    const message = await prisma.Messages.create({
      data: {
        content,
        senderId,
        roomId: room.id, 
      },
    });

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({ message: 'falha ao criar mensagem', error });
  }
});

module.exports = router;
