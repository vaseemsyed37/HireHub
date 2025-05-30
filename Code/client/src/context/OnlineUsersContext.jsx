import React, { createContext, useContext, useState, useEffect } from "react";
import socket from "../socket";

const OnlineUsersContext = createContext();

export const OnlineUsersProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    socket.on("userOnline", (userId) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
    });
    socket.on("onlineUsers", (users) => {
        setOnlineUsers(new Set(users));
      });

    socket.on("userOffline", (userId) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    return () => {
    socket.off("onlineUsers");
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, []);

  return (
    <OnlineUsersContext.Provider value={onlineUsers}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export const useOnlineUsers = () => useContext(OnlineUsersContext);
