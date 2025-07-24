import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import apiRequest from "../lib/apiRequest";

const usePostActions = (postUserId, postId, isSavedInitial) => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [saved, setSaved] = useState(isSavedInitial);

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev); // rollback
    }
  };

  const handleChat = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (postUserId === currentUser.id) {
      return;
    }
    try {
      const chat = await apiRequest.post("/chats", {
        receiverId: postUserId,
        userId: currentUser.id,
      });
      navigate("/profile?chatId=" + chat.data.id);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    handleSave,
    handleChat,
    saved,
  };
};

export default usePostActions;
