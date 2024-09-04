require('dotenv').config();
const { Server } = require("socket.io");
const PORT = process.env.PORT || 8000;
const baseURL = process.env.BASE_URL
console.log(PORT, baseURL)
const io = new Server(PORT, {
  cors: true,
});

const nameTable = new Map();

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("user:join-room", ({ roomName, name }) => {
    socket.join(roomName);
    nameTable.set(socket.id, [name, roomName]);
    console.log(nameTable);
  });

  socket.on("user:msg", ({ msg }) => {
    const useInfo = nameTable.get(socket.id);
    if(useInfo){
      const [name, roomName] = useInfo;
      io.to(roomName).emit("server:msg", {
        msg,
        name: name,
      });
    }else{
      socket.emit('server:redirect', {location: baseURL})
    }
  });

  socket.on("disconnect", () => {
    nameTable.delete(socket.id);
  });
});
