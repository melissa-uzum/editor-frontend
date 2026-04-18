import { Link, useNavigate } from "react-router-dom";
import { auth } from "../auth";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { authed } = useAuth();
  const navigate = useNavigate();

  function handleLogout(e) {
    e.preventDefault();
    auth.clear();
    navigate("/login");
  }

  return (
    <header className="site-header">
      <nav>
        <Link to="/">Hem</Link>
        <Link to="/about">Om</Link>

        {authed && <Link to="/new">Nytt dokument</Link>}

        {!authed && <Link to="/login">Logga in</Link>}
        {!authed && <Link to="/register">Registrera</Link>}

        {authed && (
          <a href="#logout" onClick={handleLogout}>
            Logga ut
          </a>
        )}
      </nav>
    </header>
  );
}