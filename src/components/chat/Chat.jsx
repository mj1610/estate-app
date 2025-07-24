import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";

function Chat({ chats, defaultChatId }) {
  const [chat, setChat] = useState(null);
  const chatRef = useRef(chat);
  const hasDecreasedRef = useRef(false);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const messageEndRef = useRef();

  const decrease = useNotificationStore((state) => state.decrease);

  const closeChat = () => {
    setChat(null);
    localStorage.removeItem("activeChat");
  };

  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("activeChat");
    };
  }, []);

  const handleOpenChat = async (chatId, receiver) => {
    try {
      hasDecreasedRef.current = false; // Reset decrease state
      const res = await apiRequest("/chats/" + chatId);

      localStorage.setItem("activeChat", JSON.stringify({ id: chatId }));

      if (!res.data.seenBy.includes(currentUser.id)) {
        await apiRequest.put("/chats/read/" + chatId);
        decrease();
        hasDecreasedRef.current = true;
      }
      setChat({ ...res.data, id: chatId, receiver });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const openDefaultChat = async () => {
      const targetChat = chats.find((c) => c.id === defaultChatId);

      if (targetChat) {
        const receiverUser = targetChat.receiver;
        await handleOpenChat(targetChat.id, receiverUser);
      }
    };

    if (defaultChatId && chats.length > 0) {
      openDefaultChat();
    }
  }, [defaultChatId, chats]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const text = formData.get("text");

    if (!text) return;

    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });
      setChat((prev) => ({ ...prev, messages: [...prev.messages, res.data] }));
      e.target.reset();

      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleGetMessage = async (data) => {
      setChat((prev) => {
        if (!prev || prev.id !== data.chatId) return prev;

        const alreadySeen = prev.seenBy.includes(currentUser.id);
        const updatedMessages = [...prev.messages, data];

        // Always call backend to ensure user is added to seenBy list
        apiRequest
          .put("/chats/read/" + data.chatId)
          .then((res) => {
            const updatedSeenBy = res.data.seenBy;

            setChat((prev) => ({
              ...prev,
              seenBy: updatedSeenBy,
            }));

            // Only call decrease if currentUser wasn't already in seenBy
            if (!alreadySeen && !hasDecreasedRef.current) {
              decrease();
              hasDecreasedRef.current = true;
            }
          })
          .catch((err) => console.error("Error in read API:", err));

        return {
          ...prev,
          messages: updatedMessages,
        };
      });
    };

    socket.on("getMessage", handleGetMessage);

    return () => {
      socket.off("getMessage", handleGetMessage);
    };
  }, [socket, currentUser.id, decrease]);

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats?.map((c) => (
          <div
            className="message"
            key={c.id}
            style={{
              backgroundColor:
                c.seenBy.includes(currentUser.id) || chat?.id === c.id
                  ? "white"
                  : "#fecd514e",
            }}
            onClick={() => handleOpenChat(c.id, c.receiver)}
          >
            <img src={c.receiver.avatar || "/noavatar.jpg"} alt="avatar" />
            <span>{c.receiver.username}</span>
            <p>{c.lastMessage}</p>
          </div>
        ))}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img
                src={chat.receiver.avatar || "noavatar.jpg"}
                alt="noavatar"
              />
              {chat.receiver.username}
            </div>
            <span className="close" onClick={closeChat}>
              X
            </span>
          </div>
          <div className="center">
            {Array.isArray(chat.messages) &&
              chat.messages.map((message) => (
                <div
                  className="chatMessage"
                  style={{
                    alignSelf:
                      message.userId === currentUser.id
                        ? "flex-end"
                        : "flex-start",
                    textAlign:
                      message.userId === currentUser.id ? "right" : "left",
                  }}
                  key={message.id}
                >
                  <p>{message.text}</p>
                  <span>{format(message.createdAt)}</span>
                </div>
              ))}
            <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text"></textarea>
            <button aria-label="Send">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
