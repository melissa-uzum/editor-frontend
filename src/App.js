import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Editor from "./pages/Editor";
import Header from "./components/Header";
import Footer from "./components/Footer";

const basename =
  (process.env.PUBLIC_URL && process.env.PUBLIC_URL.replace(/^https?:\/\/[^/]+/, "")) || "/";

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<Editor mode="create" />} />
          <Route path="/doc/:id" element={<Editor mode="edit" />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
