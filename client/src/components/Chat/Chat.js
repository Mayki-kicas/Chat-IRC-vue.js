import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import RoomContainer from "../TextContainer/RoomContainer";
import Messages from "../Messages/Messages";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import PvMessages from "../PvMessages/PvMessages";

import "./Chat.css";

const ENDPOINT = "http://localhost:5000/";

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState("");
  const [users, setUsers] = useState("");
  let [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setRoom(room);
    setName(name);

    socket.emit("join", { name, room }, (error) => {
      if (error) {
        alert(error);
      }
    });
  }, [location.search]);

  fetch(ENDPOINT + "list")
    .then((response) => response.json())
    .then((data) => {
      setRooms(data);
    });

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message]);
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      if (message.toString().startsWith("/")) {
        var command = message.toString().split(" ")[0];
        var room, params, name;
        switch (command) {
          case "/nick":
            name = message.toString().split(" ")[1];
            params = new URL(document.location).searchParams;
            room = params.get("room");
            window.location.href = `/chat?name=${name}&room=${room}`;
            socket.emit("sendMessage", message, () => setMessage(""));
            break;

          case "/join":
            room = message.toString().split(" ")[1];
            params = new URL(document.location).searchParams;
            name = params.get("name");
            window.open(`/chat?name=${name}&room=${room}`, "_blank");
            socket.emit("sendMessage", message, () => setMessage(""));
            break;

          case "/create":
            room = message.toString().split(" ")[1];
            params = new URL(document.location).searchParams;
            name = params.get("name");
            window.open(`/chat?name=${name}&room=${room}`, "_blank");
            socket.emit("sendMessage", message, () => setMessage(""));

            break;

          case "/rename":
            room = message.toString().split(" ")[1];
            params = new URL(document.location).searchParams;
            let alreadyExist = rooms.find((element) => element.name === room);
            if (!alreadyExist) {
              name = params.get("name");
              socket.emit("sendMessage", message, () => setMessage(""));
              window.location.href = `/chat?name=${name}&room=${room}`;
            } else {
              message = "Room already exist";
              socket.emit("sendMessage", message, () => setMessage(""));
            }
            break;

          case "/quit":
            window.location.href = `/`;
            break;

          case "/delete":
            params = new URL(document.location).searchParams;
            room = params.get("room");
            let paramRoom = message.toString().split(" ")[1];
            socket.emit("sendMessage", message, () => setMessage(""));
            if (room === paramRoom) {
              message = "Please leave this room before delete it.";
              socket.emit("sendMessage", message, () => setMessage(""));
            }
            break;

          case "/help":
            var msg = [
              "• /nick nickname: define the nickname of the user on the server. ",
              "• /list [string]: list the available channels from the server. If string is specified, only displays those whose name contains the string.",
              "• /create channel: create a channel with the specified name.",
              "• /delete channel: delete the channel with the specified name.",
              "• /join channel: join the specified channel.",
              "• /quit channel: quit the specified channel.",
              "• /users: list the users currently in the channel.",
              "• /msg nickname message: send a private the message to the specified nickname.",
            ];
            msg.forEach((regle) => {
              message = regle;
              socket.emit("sendMessage", regle, () => setMessage(""));
            });
            break;

          default:
            socket.emit("sendMessage", message, () => setMessage(""));
            break;
        }
      } else {
        socket.emit("sendMessage", message, () => setMessage(""));
      }
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>{" "}
      <div className="infoContainer">
        <RoomContainer rooms={rooms} />
        {/* <TextContainer users={users} /> */}

        <h1 id="h1Private">Your private message:</h1>
        <PvMessages messages={messages} name={name} />
      </div>
    </div>
  );
};

export default Chat;
