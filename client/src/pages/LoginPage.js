import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useBlogContext } from "../state/BlogContext";

function LoginPage() {
  const { login } = useBlogContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>Password:
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        No account? <Link to="/register">Register here</Link>.
      </p>
    </div>
  );
}

export default LoginPage;
