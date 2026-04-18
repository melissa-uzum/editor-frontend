import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { REGISTER } from "../graphql/operations";
import { auth } from "../auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const [register, { loading }] = useMutation(REGISTER);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await register({
        variables: {
          input: {
            username: username.trim(),
            email: email.trim(),
            password,
          },
        },
      });

      const token = res?.data?.register?.token;
      if (!token) {
        throw new Error("Ingen token returnerades.");
      }

      auth.setToken(token);
      nav("/");
    } catch (e2) {
      setErr(String(e2?.message || "Registrering misslyckades"));
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
          {loading ? "Skapar…" : "Skapa konto"}
        </button>
      </form>
      <p>
        Har konto? <Link to="/login">Logga in</Link>
      </p>
    </div>
  );
}