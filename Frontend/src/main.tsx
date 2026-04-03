import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Router/Login.tsx";
import Signup from "./Router/Signup.tsx";
import Dashboard from "./Router/Dashboard.tsx";
import ProtectedRouter from "./Router/ProtectedRouter.tsx";
import AuthProvider from "./Auth/AuthProvider.tsx";
import { ConfigProvider } from "./Context/ConfigContext.tsx";
import "./App.css";

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
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </AuthProvider>
  </StrictMode>,
);
