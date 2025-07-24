import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import "./profilePage.scss";
import apiRequest from "../../lib/apiRequest";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";

function ProfilePage() {
  const data = useLoaderData();
  const navigate = useNavigate();
  const { updateUser, currentUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chatId");

  const [savePosts, setSavePosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [chats, setChats] = useState([]);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    data.postResponse
      .then((res) => {
        setUserPosts(res.data.userPosts || []);
        const savedWithFlag = (res.data.savedPosts || []).map((post) => ({
          ...post,
          isSaved: true,
        }));
        setSavePosts(savedWithFlag);
      })
      .catch((err) => {
        console.error("Failed to load posts", err);
        setUserPosts([]);
        setSavePosts([]);
      });

    data.chatResponse
      .then((res) => setChats(res.data || []))
      .catch((err) => {
        console.error("Failed to load chats", err);
        setChats([]);
      });
  }, [data]);

  const handlePostUpdate = (postId) => {
    // For saved posts (unsaving)
    setSavePosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to="/profile/update">
              <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img src={currentUser.avatar || "noavatar.jpg"} alt="" />
            </span>
            <span>
              Username: <b>{currentUser.username}</b>
            </span>
            <span>
              E-mail: <b>{currentUser.email}</b>
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="title">
            <h1>My List</h1>
            <Link to="/add">
              <button>Create New Post</button>
            </Link>
          </div>
          {userPosts.length ? (
            <List userPosts={userPosts} />
          ) : (
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              There are no posts added by you.
            </p>
          )}

          <div className="title">
            <h1>Saved List</h1>
          </div>
          {savePosts.length ? (
            <List savePosts={savePosts} handlePostUpdate={handlePostUpdate} />
          ) : (
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              There are no saved posts.
            </p>
          )}
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          {chats ? (
            <Chat chats={chats} defaultChatId={chatId} />
          ) : (
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>No chats.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
