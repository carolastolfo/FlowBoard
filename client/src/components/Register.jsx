import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 
  console.log(import.meta.env.VITE_SERVER_URL)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous message

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username, email, password
        }),
      });

      const data = await response.json();

      console.log(data)

      if (response.ok) {
        setMessage("Registration successful!");

        // Redirect to boards page after successful registration
        setTimeout(() => {
          navigate("/login"); // Redirect user and maybe later pass on user id as param /${data.userId}
        }, 1000); // Delay for UX

      } else {
        setMessage(`Error: ${data.message || "Registration failed"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <header className="register-header">
      </header>
      <form onSubmit={handleSubmit} className="register-form">
        <h1 className="register-title">Flowboard</h1>
        <h2 className='form-title'>Register to continue</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="register-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="register-input"

        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="register-input"
        />
        <button type="submit" className="register-button">Register</button>
      </form>
      {message && <div className={`register-message ${message.includes("Error") ? "error" : ""}`}>{message}</div>}
      <div className="auth-redirect">
        Already have an account? <Link to="/login" className="auth-link">Login here</Link>
      </div>
    </div>
  );
};

export default Register;
