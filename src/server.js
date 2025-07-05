require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const http = require('http');
const { Server } = require('socket.io');

// Connect to database
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io accessible in controllers
app.set('socketio', io);

// Redis setup (optional for development)
if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
  const Redis = require('ioredis');
  const { createAdapter } = require('@socket.io/redis-adapter');
  
  try {
    const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = pubClient.duplicate();
    
    pubClient.on('error', (err) => {
      console.log('Redis pub client error:', err);
    });
    
    subClient.on('error', (err) => {
      console.log('Redis sub client error:', err);
    });
    
    io.adapter(createAdapter(pubClient, subClient));
    console.log('✅ Redis adapter connected');
  } catch (err) {
    console.log('⚠️ Redis connection failed, using memory adapter');
  }
} else {
  console.log('⚠️ Running without Redis (development mode)');
}

io.on('connection', (socket) => {
  console.log(`✅ User Connected: ${socket.id}`);

  socket.on('join_room', (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data.message);
  });

  socket.on('disconnect', () => {
    console.log('❌ User Disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
});

// Export io for use in controllers
module.exports.io = io;
