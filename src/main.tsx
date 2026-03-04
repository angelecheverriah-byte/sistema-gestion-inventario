import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Router/Login.tsx";
import Signup from "./Router/Signup.tsx";
import Dashboard from "./Router/Dashboard.tsx";
import ProtectedRouter from "./Router/ProtectedRouter.tsx";
import AuthProvider from "./Auth/AuthProvider.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/Signup",
    element: <Signup />,
  },
  {
    path: "/",
    element: <ProtectedRouter />,
    children: [
      {
        path: "/Dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
