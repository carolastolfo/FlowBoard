import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // Message state to display response or error
  const navigate = useNavigate(); // Initialize navigate
  console.log(import.meta.env.VITE_SERVER_URL)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submission = { email, password };
    setMessage(""); // Clear any previous messages

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });

      const data = await response.json();

      // Handle response data
      if (response.ok) {
        setMessage("Login successful!");

        // Store the JWT token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);

        // Redirect to boards page after successful login
        setTimeout(() => {
          navigate("/boards"); // Redirect user to boards page
        }, 1000); // Delay for UX
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
      </header>
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">FlowBoard</h1>
        <h2 className="form-title">Login to continue</h2>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
      <div className="auth-redirect">
        Don't have an account? <Link to="/register" className="auth-link">Sign up here</Link>
      </div>
    </div>


    
  );
};

export default Login;
