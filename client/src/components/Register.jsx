import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../styles/register.css";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate(); 

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  console.log(import.meta.env.VITE_SERVER_URL)


  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // clear previous message

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
          navigate("/boards"); 
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
        <h1 className="register-title">FlowBoard</h1>
        <h2 className='form-title'>Sign up to continue</h2>
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
        <button type="submit" className="register-button">Sign up</button>
      </form>
      {message && <div className={`register-message ${message.includes("Error") ? "error" : ""}`}>{message}</div>}
      <div className="auth-redirect">
        Already have an account? <Link to="/login" className="auth-link">Log in here</Link>
      </div>
    </div>
  );
};

export default Register;
