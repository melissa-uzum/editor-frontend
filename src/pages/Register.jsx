import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.gql";
import { auth } from "../auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await api.register({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      const token = res?.token;

      if (!token) {
        throw new Error("Ingen token returnerades från servern.");
      }

      auth.setToken(token);

      nav("/");
    } catch (e2) {
      console.log("REGISTER ERROR", e2);
      setErr(String(e2?.message || "Något gick fel"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <h1>Registrera</h1>
      {err && <p className="error">{err}</p>}

      <form onSubmit={onSubmit}>
        <input
          required
          placeholder="Användarnamn"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          required
          type="email"
          placeholder="E-post"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          required
          type="password"
          placeholder="Lösenord"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Skapar…" : "Skapa konto"}
        </button>
      </form>

      <p>
        Har konto? <Link to="/login">Logga in</Link>
      </p>
    </div>
  );
}
