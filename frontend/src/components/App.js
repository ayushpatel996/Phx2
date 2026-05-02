import React from "react";
import { createRoot } from "react-dom/client";
import HomePage from "../pages/HomePage";

function App() {
  return (
    <div className="antialiased">
      <HomePage />
    </div>
  );
}

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);