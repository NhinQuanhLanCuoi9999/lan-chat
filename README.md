# lan-chat
## Cách cài
- Đầu tiên tải Termux về rồi thực thi 2 lệnh này ( đây là lệnh cài môi trường ) :

  `pkg update`
  `pkg install nodejs`

  - Sau đó tải socket bằng lệnh này:
    `npm install express socket.io`

     - Dùng lệnh để tạo file server chứa thông tin của tin nhắn :
     `nano app.js` 
- Dán code này vào :

[app.js](https://raw.githubusercontent.com/NhinQuanhLanCuoi9999/lan-chat/refs/heads/main/app.js)


- Dán xong thì nhấn ctrl+x để lưu

  ## Chạy web
- Dùng lệnh `node app.js` để chạy web

  Truy cập vào 3 loại đường dẫn dưới đây để đến trang web
  
  `http://localhost:3000`
  `192.168.1.x:3000` ( chữ x là số ngẫu nhiên máy host , có thể từ 1-9 )
## Lưu ý
* Do trang web được mở bằng cổng `192.168.x.x` nên mọi người có thể vào được mà không cần dùng Internet. Tất nhiên đây là mạng LAN nên chỉ có đường truyền khá ngắn. Và chỉ hoạt động khi có thiết bị khác kết nối chung một mạng.

* Đây là địa chỉ IP mạng LAN riêng , không thể truy cập bằng Internet công cộng.
