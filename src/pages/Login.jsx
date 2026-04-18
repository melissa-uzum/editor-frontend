import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { LOGIN } from "../graphql/operations";
import { auth } from "../auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const [login, { loading }] = useMutation(LOGIN);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await login({
        variables: {
          input: {
            email: email.trim(),
            password,
          },
        },
      });

      const token = res?.data?.login?.token;
      if (!token) {
        throw new Error("Ingen token returnerades.");
      }

      auth.setToken(token);
      nav("/");
    } catch (e2) {
      setErr(String(e2?.message || "Inloggning misslyckades"));
    }
  }

  return (
    <div className="auth">
      <h1>Logga in</h1>
      {err && <p className="error">{err}</p>}
      <form onSubmit={onSubmit}>
        <input
          required
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loggar in…" : "Logga in"}
        </button>
      </form>
      <p>
        Ingen användare? <Link to="/register">Registrera</Link>
      </p>
    </div>
  );
}