import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = { username, email, password };

    setMessage(""); // Clear previous message

    try {
      const response = await fetch("http://localhost:8000/user/register", {
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
          navigate("/boards"); // Redirect user and maybe later pass on user id as param /${data.userId}
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
        <h1 className="register-title">Register for Flowboard</h1>
      </header>
      <form onSubmit={handleSubmit} className="register-form">
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
    </div>
  );
};

export default Register;
