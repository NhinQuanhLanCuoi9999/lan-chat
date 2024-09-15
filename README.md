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



 const express = require('express');
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
});


* Sau đó tạo 1 file html để chứa cấu trúc gửi tin nhắn , bố cục trang web
  - Dùng lệnh `nano index.html` , và dán code này vào :
 



    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LAN Chat</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f0f0; }
        #messages { list-style-type: none; margin: 0; padding: 0; }
        #messages li { padding: 8px; margin-bottom: 2px; background-color: #fff; border-radius: 4px; }
        #form { position: fixed; bottom: 0; width: 100%; background-color: #fff; padding: 10px; }
        #input { width: 90%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        #submit { padding: 10px; border: none; background-color: #007bff; color: #fff; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <ul id="messages"></ul>
    <form id="form" action="">
        <input id="input" autocomplete="off" /><button id="submit">Send</button>
    </form>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        var socket = io();
        var form = document.getElementById('form');
        var input = document.getElementById('input');
        var messages = document.getElementById('messages');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (input.value) {
                socket.emit('chat message', input.value);
                input.value = '';
            }
        });

        socket.on('chat message', function(msg) {
            var item = document.createElement('li');
            item.textContent = msg;
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        });
    </script>
</body>
</html>



- Dán xong thì nhấn ctrl+x để lưu

  ## Chạy web
- Dùng lệnh `node app.js` để chạy web

  Truy cập vào 3 loại đường dẫn dưới đây để đến trang web
  
  `http://localhost:3000`
  `192.168.1.x:3000` ( chữ x là số ngẫu nhiên máy host , có thể từ 1-9 )
## Lưu ý
* Do trang web được mở bằng cổng `192.168.x.x` nên mọi người có thể vào được mà không cần dùng Internet. Tất nhiên đây là mạng LAN nên chỉ có đường truyền khá ngắn. Và chỉ hoạt động khi có thiết bị khác kết nối chung một mạng.
