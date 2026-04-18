import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Editor from "./pages/Editor";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles.css";
import SocketTest from "./pages/SocketTest";

console.log("SocketTest import:", SocketTest);
console.log("APP LOADED", new Date().toISOString());
console.log("ENV CHECK:", {
  api: process.env.REACT_APP_API_BASE_URL,
  gql: process.env.REACT_APP_GRAPHQL_URL,
  socket: process.env.REACT_APP_SOCKET_URL,
  nodeEnv: process.env.NODE_ENV,
});

export default function App() {
  return (
    <HashRouter>
      <Header />
      <main>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/new" element={<Editor key="new-doc" mode="create" />} />
            <Route path="/doc/:id" element={<Editor key="edit-doc" mode="edit" />} />
          </Route>

          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/socket-test" element={<SocketTest />} />
        </Routes>
      </main>
      <Footer />
    </HashRouter>
  );
}