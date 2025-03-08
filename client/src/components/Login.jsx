import { useState } from "react";
import "../styles/login.css"; 

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // Message state to display response or error

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submission = { username, password };
        setMessage(""); // Clear any previous messages
      
        try {
          const response = await fetch("http://localhost:8000/fetch/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
      
          const data = await response.json();

          // Handle response data
          if (response.ok) {
            setMessage(JSON.stringify(data.message));
          } else {
            setMessage(JSON.stringify(data.message));
          }
        } catch (error) {
          console.error(error);
          setMessage("An error occurred. Please try again.");
        } 
      };
      
      

  return (
    <div className="login-container">
      <header className="login-header">
        <h1 className="login-title">Login to Flowboard</h1>
      </header>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit" className="login-button">Login</button>
      </form>
      {message && <div className={`login-message ${message.includes('Error') ? 'error' : ''}`}>{message}</div>} {/* Display message */}
    </div>
  );
};

export default Login;
