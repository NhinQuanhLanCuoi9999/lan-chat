const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Định nghĩa mã HTML và JavaScript dưới dạng chuỗi
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LAN Chat</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f0f0; }
        #messages { list-style-type: none; margin: 0; padding: 0; }
        #messages li { 
            padding: 8px; 
            margin-bottom: 2px; 
            background-color: #fff; 
            border-radius: 4px; 
            opacity: 0; /* Bắt đầu với độ mờ 0 */
            transition: opacity 0.5s ease, transform 0.5s ease; /* Thêm hiệu ứng chuyển động */
        }
        #messages li.show { 
            opacity: 1; /* Độ mờ khi hiệu ứng hoàn tất */
            transform: translateY(0); /* Đặt vị trí cuối cùng của hiệu ứng */
        }
        #form { position: fixed; bottom: 0; width: 100%; background-color: #fff; padding: 10px; }
        #name { width: 20%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        #input { width: 60%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        #submit { padding: 10px; border: none; background-color: #007bff; color: #fff; border-radius: 4px; cursor: pointer; }
        .ip-btn { cursor: pointer; color: #007bff; background: none; border: none; text-decoration: underline; }
    </style>
</head>
<body>
    <ul id="messages"></ul>
    <form id="form" action="">
        <input id="name" autocomplete="off" placeholder="Your name" required />
        <input id="input" autocomplete="off" placeholder="Type a message" required />
        <button id="submit">Send</button>
    </form>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        var socket = io();
        var form = document.getElementById('form');
        var nameInput = document.getElementById('name');
        var messageInput = document.getElementById('input');
        var messages = document.getElementById('messages');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (messageInput.value && nameInput.value) {
                var message = {
                    name: nameInput.value,
                    text: messageInput.value
                };
                socket.emit('chat message', message);
                messageInput.value = '';
            }
        });

        socket.on('chat message', function(data) {
            var item = document.createElement('li');
            item.textContent = data.name + ': ' + data.text;

            // Thêm nút xem IP
            if (data.ip) {
                var ipButton = document.createElement('button');
                ipButton.className = 'ip-btn';
                ipButton.textContent = 'Show IP';
                ipButton.addEventListener('click', function() {
                    alert('IP Address: ' + data.ip);
                });
                item.appendChild(ipButton);
            }

            messages.appendChild(item);

            // Thêm lớp show sau khi tin nhắn được thêm vào
            setTimeout(function() {
                item.classList.add('show');
            }, 10); // Thời gian chờ ngắn để đảm bảo lớp được thêm đúng cách
            
            // Cuộn trang đến tin nhắn cuối cùng
            window.scrollTo(0, document.body.scrollHeight);
        });
    </script>
</body>
</html>
`;

// Cấu hình route để phục vụ HTML
app.get('/', (req, res) => {
    res.send(htmlContent);
});

// Cấu hình Socket.io
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Lưu IP của người gửi
    const ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;

    socket.on('chat message', (msg) => {
        // Gửi tin nhắn kèm theo địa chỉ IP của người gửi
        io.emit('chat message', { ...msg, ip });
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Khởi động server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
