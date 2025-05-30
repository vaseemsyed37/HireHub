import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import socket from "../socket";
import { useOnlineUsers } from "../context/OnlineUsersContext";

const MessageModal = ({ isOpen, onClose, senderId, reciever, chatroomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(chatroomId);
  const onlineUsers = useOnlineUsers();

  useEffect(() => {
    if (!chatId) {
      fetchChatId();
    } else {
      fetchMessages();
    }

    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === message._id ? { ...msg, status: "seen" } : msg
        )
      );
    });

    socket.on("messageDelivered", (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status: "delivered" } : msg
        )
      );
    });

    socket.on("messageSeen", (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status: "seen" } : msg
        )
      );
    });
   console.log('onlineUsers',onlineUsers);
    return () => {
      socket.off("receiveMessage");
      socket.off("messageDelivered");
      socket.off("messageSeen");
    };
  }, []);

  const fetchChatId = async () => {
    const response = await fetch(
      `http://localhost:4000/api/getchatId?senderId=${encodeURIComponent(
        senderId
      )}&receiverId=${encodeURIComponent(reciever._id)}`,
      { method: "GET" }
    );
    const data = await response.json();
    if (data.chat) {
      setChatId(data.chat._id);
    }
    if (data.messages) {
      setMessages(data.messages);
    }
  };

  const fetchMessages = async () => {
    const response = await fetch(
      `http://localhost:4000/api/fetchMessages?chatId=${encodeURIComponent(chatId)}`
    );
    const data = await response.json();
    if (data.messages) {
      setMessages(data.messages);
      markMessagesAsSeen(data.messages);
    }
  };

  const markMessagesAsSeen = (msgs) => {
    const unseenMessages = msgs.filter(
      (msg) => msg.receiverId === senderId && msg.status !== "seen"
    );
    unseenMessages.forEach((msg) => {
      socket.emit("messageSeen", msg._id);
    });
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        chatId: chatId,
        senderId: senderId,
        receiverId: reciever._id || reciever.id,
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      };

      setMessages((prevMessages) => [...prevMessages, messageData]);
      socket.emit("sendMessage", messageData, (response) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg === messageData ? { ...msg, _id: response._id, status: "delivered" } : msg
          )
        );
      });

      setNewMessage("");
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="w-full fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-5/12 h-4/5">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800"><div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${onlineUsers.has(reciever._id || reciever.id) ? "bg-green-500" : "bg-gray-400"
                }`}
              title={onlineUsers.has(reciever._id || reciever.id) ? "Online" : "Offline"}
            ></div>
            <span className="text-sm">{reciever.name}</span>
          </div></h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            ✕
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 bg-gray-50 h-4/5">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                msg.senderId === senderId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.senderId === senderId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                } max-w-xs shadow-md`}
              >
                <p className="text-sm">{msg.content}</p>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-400">{msg.createdAt || "Now"}</span>
                  {msg.senderId === senderId && (
                    <span
                      className={`ml-2 ${
                        msg.status === "seen"
                          ? "text-white"
                          : msg.status === "delivered"
                          ? "text-gray-400"
                          : "text-gray-300"
                      }`}
                    >
                      {msg.status === "seen"
                        ? "✔✔"
                        : msg.status === "delivered"
                        ? "✔✔"
                        : "✔"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2.94 12.94a1.5 1.5 0 001.768.326l10.486-6.63a.75.75 0 010 1.3l-10.486 6.63a1.5 1.5 0 01-2.236-1.33V6.96a1.5 1.5 0 01.468-1.07 1.5 1.5 0 011.768-.326l10.486 6.63a.75.75 0 010 1.3L4.708 16.944a1.5 1.5 0 01-1.768-.326 1.5 1.5 0 01-.468-1.07V8.98a1.5 1.5 0 01.468-1.07z" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MessageModal;
