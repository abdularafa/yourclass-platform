import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { prisma } from '@yourclass/database';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'chat' }));

io.on('connection', socket => {
  socket.on('join_room', async ({ room_id, user_id }) => {
    socket.join(room_id);
    console.log(`[Chat] User ${user_id} joined room ${room_id}`);
  });

  socket.on('leave_room', ({ room_id }) => {
    socket.leave(room_id);
  });

  socket.on('send_message', async ({ room_id, tenant_id, user_id, content, content_type }) => {
    const message = await prisma.chatMessage.create({
      data: {
        id: uuidv4(),
        room_id,
        tenant_id,
        user_id,
        content,
        content_type: content_type || 'text',
      },
      include: { user: true },
    });
    io.to(room_id).emit('new_message', message);
  });

  socket.on('pin_message', async ({ message_id }) => {
    await prisma.chatMessage.update({ where: { id: message_id }, data: { is_pinned: true } });
    io.to(message_id).emit('message_pinned', { message_id });
  });

  socket.on('delete_message', async ({ message_id }) => {
    await prisma.chatMessage.update({ where: { id: message_id }, data: { is_deleted: true } });
    io.to(message_id).emit('message_deleted', { message_id });
  });
});

app.get('/api/v1/chat-rooms', async (req, res) => {
  const { tenant_id, batch_id } = req.query;
  const rooms = await prisma.chatRoom.findMany({
    where: { tenant_id: String(tenant_id), batch_id: batch_id ? String(batch_id) : undefined },
  });
  res.json({ success: true, data: rooms });
});

app.post('/api/v1/chat-rooms', async (req, res) => {
  const { tenant_id, type, batch_id, course_id, name } = req.body;
  const room = await prisma.chatRoom.create({
    data: { id: uuidv4(), tenant_id, type, batch_id, course_id, name },
  });
  res.status(201).json({ success: true, data: room });
});

app.get('/api/v1/chat-messages', async (req, res) => {
  const { room_id, page = '1', limit = '50' } = req.query;
  const messages = await prisma.chatMessage.findMany({
    where: { room_id: String(room_id), is_deleted: false },
    skip: (parseInt(page as string) - 1) * parseInt(limit as string),
    take: parseInt(limit as string),
    orderBy: { created_at: 'desc' },
    include: { user: { select: { id: true, name: true, avatar_url: true } } },
  });
  res.json({ success: true, data: messages });
});

const PORT = process.env.PORT || 3009;
httpServer.listen(PORT, () => console.log(`[Chat Service] Running on port ${PORT}`));

export default app;
