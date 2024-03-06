import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { PermissionProvider } from './context/PermissionContext';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PermissionProvider>
    <App />
    </PermissionProvider>
  </React.StrictMode>
);
