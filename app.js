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
        /* Các style từ code 1 */
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
            z-index: 10; /* Thay đổi z-index thành 10 cho phần tử li */
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
            z-index: 10; /* Đảm bảo form nằm trên các phần tử khác khi cần */
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
    <style>
        /* Các style từ code 2 */
    .menu-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 30;
      cursor: pointer;
      opacity: 0.6;
    }

    .menu-btn__burger {
      width: 30px;
      height: 6px;
      z-index: 30;
      background-color: #333;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(255, 101, 47, 0.2);
      transition: all 0.5s ease-in-out;
    }

    .menu-btn__burger::before,
    .menu-btn__burger::after {
      content: "";
      position: absolute;
      width: 30px;
      height: 6px;
      z-index: 30;
      background-color: #333;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(255, 101, 47, 0.2);
      transition: all 0.5s ease-in-out;
    }

    .menu-btn__burger::before {
      transform: translateY(-12px);
      z-index: 30;
    }

    .menu-btn__burger::after {
   z-index: 30;
   transform: translateY(12px);
    }

.side-nav {
  z-index: 29;
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transition: all 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.side-nav.open {
  left: 0;
}

.side-nav a.source-btn {
  display: inline-block;
  padding: 5px 5px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  margin-top: 10px;
transform: translate(-50px, -200px);
}

.side-nav a.source-btn:hover {
  background-color: #45a049;
}

.side-nav a.source-btn:active {
  background-color: #3e8e41;
}
 </style>
</head>
<body>
 <style>
        .chat-button {
            background-color: #007bff; /* Màu xanh dương */
            color: white;
            border: none;
            padding: 5px 5px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
transform: translate(-60px, -190px);
  }

        .chat-button:hover {
            background-color: #0056b3; /* Màu xanh dương đậm hơn khi hover */
        }
    </style>
     <script>
        function redirectToChat() {
            const currentUrl = window.location.hostname;
             const newUrl = 'http://' + currentUrl + ':8000'; // Sử dụng chuỗi thông thường
            window.location.href = newUrl;
        }
    </script>
    <div class="menu-btn">
        <span class="menu-btn__burger"></span>
    </div>
<div class="side-nav">
    <a href="https://raw.githubusercontent.com/NhinQuanhLanCuoi9999/lan-chat/refs/heads/main/app.js" class="source-btn">Mã nguồn</a>
<button class="chat-button" onclick="redirectToChat()">Forum</button>
</div>
<ul id="messages"></ul>
    <form id="form" action="">
        <input id="name" autocomplete="off" placeholder="Your name" required />
        <input id="input" autocomplete="off" placeholder="Type a message" required />
        <input id="color" type="color" value="#000000" />
       <input id="media" type="file" accept="image/*,video/*,text/*,.pdf,.html,.css,.js,.php,.sql,.doc,.docx,.xlsx" />
 <button id="send">Send</button>
    </form>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        /* Các script từ code 1 */
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

    const timestamp = new Date().toLocaleString();
    const timestampSpan = document.createElement('span');
    timestampSpan.style.fontSize = '12px';
    timestampSpan.style.color = 'gray';
    timestampSpan.textContent = timestamp;

    if (data.text) {
        item.textContent = data.name + ': ' + data.text;
        item.appendChild(timestampSpan);
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
        textLink.download = 'file.txt';
        textLink.textContent = 'Download text file';
        item.appendChild(textLink);
    }
    if (data.file) {
        var fileLink = document.createElement('a');
        fileLink.href = data.file.url;
        fileLink.download = data.file.name;
        fileLink.textContent = 'Download ' + data.file.name;
        item.appendChild(fileLink);
    }

    // Thêm nút xem IP
    if (data.ip) {
        var ipButton = document.createElement('button');
        ipButton.textContent = 'Xem IP';
        ipButton.classList.add('ip-btn');
        ipButton.onclick = function() {
            alert('IP của người gửi: ' + data.ip);
        };
        item.appendChild(ipButton);
    }

    // Thêm nút xóa tin nhắn
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Xóa';
    deleteButton.classList.add('color-btn');
    deleteButton.onclick = function() {
        socket.emit('delete message', messageId); 
    };
    item.appendChild(deleteButton);

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
            } else if (file.type === 'application/pdf' || 
                       file.type === 'text/html' || 
                       file.type === 'text/css' || 
                       file.type === 'application/javascript' || 
                       file.type === 'application/x-httpd-php' || 
                       file.type === 'application/sql' || 
                       file.type === 'application/msword' || 
                       file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                       file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                // Xử lý các loại file khác
                var fileBlob = new Blob([reader.result], { type: file.type });
                var fileUrl = URL.createObjectURL(fileBlob);
                message.file = { url: fileUrl, name: file.name };
            }
            socket.emit('chat message', message);
            messageInput.value = '';
            mediaInput.value = '';
        };
        reader.readAsArrayBuffer(file);  // Đọc file dưới dạng nhị phân cho tất cả các loại file
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

const menuBtn = document.querySelector('.menu-btn');
const sideNav = document.querySelector('.side-nav');

menuBtn.addEventListener('click', () => {
    sideNav.classList.toggle('open');
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
