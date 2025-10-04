import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <div className="header-inner">
        <h1 className="site-title">SSR Editor</h1>
        <nav>
          <Link to="/">Hem</Link>
          <Link to="/new">Ny</Link>
          <Link to="/about">Om</Link>
        </nav>
      </div>
    </header>
  );
}
