import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "./ProtectedRoute";

function AppWrap() {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>HEMLIG SIDA</div>} />
        </Route>
        <Route path="/login" element={<div>LOGIN</div>} />
      </Routes>
    </MemoryRouter>
  );
}

test("redirectar till /login om ingen token finns", () => {
  localStorage.removeItem("token");
  render(<AppWrap />);
  expect(screen.getByText("LOGIN")).toBeInTheDocument();
});