import React, { useState } from "react";
import DefaultLayout from "../Layout/DefaultLayout";
import { useAuth } from "../Auth/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";
import { API_URL } from "../Auth/ApiURL";
import type { AuthResponseError } from "../Types/types";

function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorResponse, setErrorResponse] = useState("");

  const Auth = useAuth();
  const goto = useNavigate();

  async function handleSumit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          password,
        }),
      });
      if (response.ok) {
        console.log("User created successfully");
        goto("/");
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
        <h1>Signup</h1>
        {errorResponse && <div className="errorMessage">{errorResponse}</div>}
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
        <button>Create user</button>
      </form>
    </DefaultLayout>
  );
}

export default Signup;
