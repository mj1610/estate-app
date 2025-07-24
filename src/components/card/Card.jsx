import { Link, useNavigate } from "react-router-dom";
import "./card.scss";
import usePostActions from "../../lib/logics";
import apiRequest from "../../lib/apiRequest";

function Card({ item, handlePostUpdate }) {
  const navigate = useNavigate();
  const { handleChat, handleSave, saved } = usePostActions(
    item.userId,
    item.id,
    item.isSaved
  );
  const isOwner = item.isOwner || item.userId === item.currentUserId;

  const handleDelete = async () => {
    try {
      const res = await apiRequest.delete(`/posts/${item.id}`);
      if (res.status === 200) {
        alert("Post deleted successfully.");
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete the post. Please try again.");
    }
  };

  const handleSaveClick = async () => {
    await handleSave();
    if (typeof handlePostUpdate === "function") {
      await handlePostUpdate(item.id, { isSaved: !saved });
    } else {
      console.warn("function");
    }
  };

  return (
    <div className="card">
      <Link to={`/${item.id}`} className="imageContainer">
        <img
          src={`${item.images[0]}?auto=compress&cs=tinysrgb&dpr=2&w=400`}
          loading="lazy"
          alt={`Image of ${item.id}`}
        />
      </Link>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`}>{item.title}</Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="pin image" />
          <span>{item.address}</span>
        </p>
        <p className="price">$ {item.price}</p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="bed" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="bath" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          <div className="icons">
            {isOwner ? (
              <div className="icon delete" onClick={handleDelete}>
                <img src="/delete.webp" alt="del" />
              </div>
            ) : (
              <div
                className="icon"
                onClick={handleSaveClick}
                style={{
                  backgroundColor: saved ? "#fece51" : "white",
                }}
              >
                <img src="/save.png" alt="save" />
              </div>
            )}

            <div className="icon" onClick={handleChat}>
              <img src="/chat.png" alt="chat" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
