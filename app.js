const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Mảng lưu trữ các tin nhắn
let messages = [];

// Định nghĩa mã HTML, CSS và JavaScript dưới dạng chuỗi
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
        #input { width: 50%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        #color { width: 20%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        #submit { padding: 10px; border: none; background-color: #007bff; color: #fff; border-radius: 4px; cursor: pointer; }
        .ip-btn, .color-btn { cursor: pointer; color: #007bff; background: none; border: none; text-decoration: underline; }
        #messages img {
            max-width: 100%;
            max-height: 200px; /* Hoặc kích thước bạn muốn */
            display: block;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <ul id="messages"></ul>
    <form id="form" action="">
        <input id="name" autocomplete="off" placeholder="Your name" required />
        <input id="input" autocomplete="off" placeholder="Type a message" />
        <input id="color" type="color" value="#000000" />
        <input id="image" type="file" accept="image/*" />
        <button id="submit">Send</button>
    </form>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        var socket = io();
        var form = document.getElementById('form');
        var nameInput = document.getElementById('name');
        var messageInput = document.getElementById('input');
        var colorInput = document.getElementById('color');
        var imageInput = document.getElementById('image');
        var messages = document.getElementById('messages');
        var messageCount = 0;

        function displayMessage(data, messageId) {
            var item = document.createElement('li');
            item.id = 'message-' + messageId;
            item.style.color = data.color;

            if (data.text) {
                item.textContent = data.name + ': ' + data.text;
            }
            if (data.image) {
                var img = document.createElement('img');
                img.src = data.image;
                item.appendChild(img);
            }

            if (data.name === nameInput.value) {
                var deleteButton = document.createElement('button');
                deleteButton.className = 'color-btn';
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function() {
                    socket.emit('delete message', messageId);
                });
                item.appendChild(deleteButton);
            }

            if (data.ip) {
                var ipButton = document.createElement('button');
                ipButton.className = 'color-btn';
                ipButton.textContent = 'Show IP';
                ipButton.addEventListener('click', function() {
                    alert('IP Address: ' + data.ip);
                });
                item.appendChild(ipButton);
            }

            messages.appendChild(item);
            setTimeout(function() {
                item.classList.add('show');
            }, 10);
            window.scrollTo(0, document.body.scrollHeight);
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var message = {
                name: nameInput.value,
                text: messageInput.value,
                color: colorInput.value
            };

            if (imageInput.files.length > 0) {
                var file = imageInput.files[0];
                var reader = new FileReader();
                reader.onloadend = function() {
                    message.image = reader.result;
                    socket.emit('chat message', message);
                    messageInput.value = '';
                    imageInput.value = '';
                };
                reader.readAsDataURL(file);
            } else {
                socket.emit('chat message', message);
                messageInput.value = '';
            }
        });

        socket.on('all messages', function(data) {
            data.forEach((msg, index) => displayMessage(msg, index));
        });

        socket.on('chat message', function(data) {
            displayMessage(data, messageCount++);
        });

        socket.on('delete message', function(messageId) {
            var messageElement = document.getElementById('message-' + messageId);
            if (messageElement) {
                messageElement.remove();
            }
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
    const ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
    socket.emit('all messages', messages);

    socket.on('chat message', (msg) => {
        const messageId = messages.length;
        const message = { id: messageId, ...msg, ip };
        messages.push(message);
        io.emit('chat message', message);
    });

    socket.on('delete message', (messageId) => {
        messages = messages.filter(msg => msg.id !== messageId);
        io.emit('delete message', messageId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Khởi động server
const PORT = 3000;
server.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
