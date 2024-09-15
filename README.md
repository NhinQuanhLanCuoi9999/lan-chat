# lan-chat
## Cách cài
- Đầu tiên tải Termux về rồi thực thi 2 lệnh này ( đây là lệnh cài môi trường ) :

  `pkg update`
  `pkg install nodejs`

  - Sau đó tải socket bằng lệnh này:
    `npm install express socket.io`

     - Dùng lệnh để tạo file server chứa thông tin của tin nhắn :
     `nano app.js` 
- Dán code này vào rồi nhấn ctrl+x để lưu :
  ```const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});``` 
