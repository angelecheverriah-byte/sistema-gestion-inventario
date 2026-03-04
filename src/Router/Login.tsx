import React, { useState } from "react";
import DefaultLayout from "../Layout/DefaultLayout";
import { useAuth } from "../Auth/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";
import { API_URL } from "../Auth/ApiURL";
import type { AuthResponse, AuthResponseError } from "../Types/types";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorResponse, setErrorResponse] = useState("");

  const Auth = useAuth();
  const goto = useNavigate();

  async function handleSumit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });
      if (response.ok) {
        console.log("Login successfully");
        const json = (await response.json()) as AuthResponse;

        if (json.body.accessToken) {
          Auth.saveUser(json);
          goto("/Dashboard");
        }
      } else {
        console.log("Something went wrong");
        const json = (await response.json()) as AuthResponseError;
        setErrorResponse(json.body.error);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (Auth.isAuthenticated) {
    return <Navigate to="/Dashboard" />;
  }

  return (
    <DefaultLayout>
      <form className="form" onSubmit={handleSumit}>
        <h1>Login</h1>
        {errorResponse && <div className="errorMessage">{errorResponse}</div>}
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>Login</button>
      </form>
    </DefaultLayout>
  );
}

export default Login;
