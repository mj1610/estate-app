import { useContext, useEffect } from "react";
import { useNotificationStore } from "../lib/notificationStore";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";

export default function NotificationProvider({ children }) {
  const { socket } = useContext(SocketContext);
  const { currentUser } = useContext(AuthContext);
  const increase = useNotificationStore((state) => state.increase);

  useEffect(() => {
    if (!socket || !currentUser) return;

    socket.on("getMessage", (data) => {
      const { chatId, userId } = data;

      // Don't notify if current user is the sender
      if (userId === currentUser.id) return;

      // Don't notify if user is currently viewing that chat
      const activeChat = JSON.parse(localStorage.getItem("activeChat")); // or use a global state if better
      if (activeChat?.id === chatId) return;
      increase();
    });

    return () => {
      socket.off("getMessage");
    };
  }, [socket, currentUser]);

  return <>{children}</>;
}
