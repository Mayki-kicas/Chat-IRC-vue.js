const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'chatIRC';

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

function todayDate() {
  var today = Date.now();
  today = today.toString().slice(0, 10);
  var a = new Date(today * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}

function toArray(iterator) {
  return new Promise((resolve, reject) => {
    iterator.toArray((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

MongoClient.connect(url, function (err, client) {
  if (err) throw err;
  console.log('Connecté à MongoDB');
  const db = client.db(dbName);

  app.get('/list', async (req, res) => {
    const myArray = await toArray(db.listCollections());
    let result = [];

    for (const object of myArray) {
      result.push({ name: object.name });
    }
    res.send(result).status(200);
  });

  io.on('connect', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
      const { error, user } = addUser({ id: socket.id, name, room });

      if (error) return callback(error);

      socket.join(user.room);

      var mess = {
        name: 'admin',
        message: `${user.name} has joined ${user.room}.`,
        DateTime: todayDate(),
      };
      db.collection(room).insertOne(mess, function (err, res) {
        if (err) throw err;
      });

      socket.emit('message', {
        user: 'admin',
        text: `${user.name}, welcome to room ${user.room}.`,
      });
      socket.broadcast
        .to(user.room)
        .emit('message', { user: 'admin', text: `${user.name} has joined!` });

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });

      callback();
    });

    socket.on('sendMessage', async (message, callback) => {
      const user = getUser(socket.id);

      var mess = { name: user.name, message: message, DateTime: todayDate() };
      db.collection(user.room).insertOne(mess, function (err, res) {
        if (err) throw err;
      });

      if (message.toString().startsWith('/')) {
        var command = message.toString().split(' ')[0];

        switch (command) {
          case '/list':
            var msg = 'Channels available : ';

            const myArray = await toArray(db.listCollections());

            if (message.toString().split(' ')[1]) {
              const result = myArray.filter((collection) =>
                collection.name.includes(message.toString().split(' ')[1])
              );

              result.forEach((collection) => {
                msg += collection.name.toString() + ', ';
              });
            } else {
              myArray.forEach((collection) => {
                msg += collection.name.toString() + ', ';
              });
            }

            msg = msg.slice(0, msg.length - 2);
            message = msg;
            break;

          case '/delete':
            var collection = message.toString().split(' ')[1];
            db.collection(collection).drop();
            break;

          case '/rename':
            let collectionNewName = message.toString().split(' ')[1];
            db.collection(user.room).rename(collectionNewName);
            socket.disconnect();
            break;

          case '/users':
            var listU = getUsersInRoom(user.room);
            var msg = 'Actually in the chat : ';
            listU.forEach((user) => {
              msg += user.name.toString() + ', ';
            });
            msg = msg.slice(0, msg.length - 2);
            message = msg;
            break;
          default:
        }
      }

      io.to(user.room).emit('message', { user: user.name, text: message });
      callback();
    });

    socket.on('disconnect', () => {
      const user = removeUser(socket.id);

      if (user) {
        var mess = {
          name: 'admin',
          message: `${user.name} has left.`,
          DateTime: todayDate(),
        };
        db.collection(user.room).insertOne(mess, function (err, res) {
          if (err) throw err;
        });
        io.to(user.room).emit('message', {
          user: 'Admin',
          text: `${user.name} has left.`,
        });
        io.to(user.room).emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room),
        });
      }
    });
  });
});
server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));
