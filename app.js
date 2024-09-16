const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Mảng lưu trữ các tin nhắn
let messages = [];

// Đọc dữ liệu tin nhắn từ file JSON
try {
    messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));
} catch (err) {
    console.error('Không thể đọc file messages.json:', err);
}

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
            position: relative; /* Đảm bảo phần tử li có thể được xếp chồng đúng */
            z-index: 5; /* Đảm bảo phần tử li không che khuất video */
        }
        #messages li.show { 
            opacity: 1; /* Độ mờ khi hiệu ứng hoàn tất */
            transform: translateY(0); /* Đặt vị trí cuối cùng của hiệu ứng */
        }
        #form {
            position: fixed;
            bottom: 0;
            width: 100%;
            background-color: #fff;
            padding: 10px;
            box-sizing: border-box; /* Đảm bảo padding không làm mở rộng quá kích thước */
            display: flex;
            flex-wrap: wrap; /* Cho phép các phần tử chuyển dòng khi cần */
            gap: 10px; /* Khoảng cách giữa các phần tử */
        }
        #name, #input, #color, #media {
            flex: 1 1 auto; /* Các phần tử có thể thay đổi kích thước linh hoạt */
            min-width: 100px; /* Đặt kích thước tối thiểu để giữ cho các phần tử không bị quá nhỏ */
        }
        #name {
            flex: 2; /* Chiếm nhiều không gian hơn để dễ nhập tên */
        }
        #input {
            flex: 3; /* Chiếm nhiều không gian hơn để dễ nhập tin nhắn */
        }
        #color {
            flex: 1; /* Kích thước hợp lý cho picker màu */
        }
        #media {
            flex: 2; /* Kích thước hợp lý cho lựa chọn tập tin */
        }
        #send {
            padding: 10px;
            border: none;
            background-color: #007bff;
            color: #fff;
            border-radius: 4px;
            cursor: pointer;
            flex: 1 1 100%; /* Đảm bảo nút gửi nằm trên một dòng mới */
            margin-top: 10px; /* Khoảng cách giữa các nút gửi */
        }
        .ip-btn, .color-btn { cursor: pointer; color: #007bff; background: none; border: none; text-decoration: underline; }
        #messages img {
            max-width: 100%;
            max-height: 200px; /* Hoặc kích thước bạn muốn */
            display: block;
            margin-top: 5px;
        }
        #messages video {
            max-width: 100%;
            max-height: 200px;
            display: block;
            margin-top: 5px;
            position: relative; /* Đảm bảo video có z-index hoạt động */
            z-index: 10; /* Đảm bảo video hiển thị trên các phần tử khác */
        }
        #messages a {
            display: block;
            margin-top: 5px;
            text-decoration: underline;
            color: #007bff;
        }
    </style>
</head>
<body>
    <ul id="messages"></ul>
    <form id="form" action="">
        <input id="name" autocomplete="off" placeholder="Your name" required />
        <input id="input" autocomplete="off" placeholder="Type a message" />
        <input id="color" type="color" value="#000000" />
        <input id="media" type="file" accept="image/*,video/*,text/*" />
        <button id="send">Send</button>
    </form>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        var socket = io();
        var form = document.getElementById('form');
        var nameInput = document.getElementById('name');
        var messageInput = document.getElementById('input');
        var colorInput = document.getElementById('color');
        var mediaInput = document.getElementById('media');
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
            if (data.video) {
                var video = document.createElement('video');
                video.src = data.video;
                video.controls = true;
                item.appendChild(video);
            }
            if (data.textFile) {
                var textLink = document.createElement('a');
                textLink.href = data.textFile;
                textLink.download = 'file.txt'; // Đặt tên tệp mặc định cho người dùng tải về
                textLink.textContent = 'Download text file';
                item.appendChild(textLink);
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

            // Thêm nút hiển thị IP
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

        function sendMessage() {
            var message = {
                name: nameInput.value,
                text: messageInput.value,
                color: colorInput.value
            };

            if (mediaInput.files.length > 0) {
                var file = mediaInput.files[0];
                var reader = new FileReader();
                reader.onloadend = function() {
                    if (file.type.startsWith('image/')) {
                        message.image = reader.result;
                    } else if (file.type.startsWith('video/')) {
                        message.video = reader.result;
                    } else if (file.type.startsWith('text/')) {
                        var textFile = new Blob([reader.result], { type: 'text/plain' });
                        var url = URL.createObjectURL(textFile);
                        message.textFile = url;
                    }
                    socket.emit('chat message', message);
                    messageInput.value = '';
                    mediaInput.value = '';
                };
                if (file.type.startsWith('text/')) {
                    reader.readAsText(file);
                } else {
                    reader.readAsDataURL(file);
                }
            } else {
                socket.emit('chat message', message);
                messageInput.value = '';
            }
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
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
    const ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
    console.log('Một người dùng đã kết nối từ IP:', ip);
    socket.emit('all messages', messages);

    socket.on('chat message', (msg) => {
        const messageId = messages.length;
        const message = { id: messageId, ...msg, ip }; // Thêm IP vào message
        messages.push(message);

        // Lưu dữ liệu tin nhắn vào file JSON
        try {
            fs.writeFileSync('messages.json', JSON.stringify(messages));
        } catch (err) {
            console.error('Không thể lưu file messages.json:', err);
        }

        io.emit('chat message', message);
    });

    socket.on('delete message', (messageId) => {
        messages = messages.filter(msg => msg.id !== messageId);

        // Lưu dữ liệu tin nhắn vào file JSON
        try {
            fs.writeFileSync('messages.json', JSON.stringify(messages));
        } catch (err) {
            console.error('Không thể lưu file messages.json:', err);
        }

        io.emit('delete message', messageId);
    });

    socket.on('disconnect', () => {
        console.log(ip , 'đã thoát.');
    });
});

// Khởi động server
const PORT = 3000;
server.listen(PORT, () => {
    console.log('Server đang chạy trên cổng : ' + PORT);
});
