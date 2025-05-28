import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useBlogContext } from "../state/BlogContext";

function RegisterPage() {
  const { register } = useBlogContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = register({ username, password, email, isAdmin: false });
    if (result.success) {
      navigate("/login");
    } else {
      setError(result.error);
    }
  };

  return (
    <div>
      <h2>Register</h2>
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
        <div>
          <label>Email:
            <input value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
        </div>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>.
      </p>
    </div>
  );
}

export default RegisterPage;
