import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "@/contexts/SocketContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
          <Toaster position="top-right" reverseOrder={false} />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
