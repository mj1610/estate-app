import { useContext, useState, useEffect } from "react";
import "./navbar.scss";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNotificationStore } from "../../lib/notificationStore";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const { fetch, number } = useNotificationStore((state) => ({
    fetch: state.fetch,
    number: state.number,
  }));

  useEffect(() => {
    if (currentUser) {
      fetch();
    }
  }, [currentUser, fetch]);

  const NavLinks = () => {
    return (
      <>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/agents">Agents</Link>
      </>
    );
  };

  const AuthSection = () =>
    currentUser ? (
      <div className="user">
        <img src={currentUser.avatar || "/noavatar.jpg"} alt="" />
        <span>{currentUser.username}</span>
        <Link to="/profile" className="profile">
          {number > 0 && <span className="notification">{number}</span>}
          <span>Profile</span>
        </Link>
      </div>
    ) : (
      <>
        <Link to="/login">Sign in</Link>
        <Link to="/register" className="register">
          Sign up
        </Link>
      </>
    );

  return (
    <nav>
      <div className="left">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="" />
          <span>Estate App</span>
        </Link>
        <NavLinks />
      </div>
      <div className="right">
        <AuthSection />
        <div className="menuIcon">
          <img
            src="/menu.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>
        <div className={open ? "menu active" : "menu"}>
          <NavLinks />
          {currentUser ? (
            <Link to="/profile" className="profile">
              {number > 0 && <div className="notification">{number}</div>}
              <span>Profile</span>
            </Link>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register" className="register">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
