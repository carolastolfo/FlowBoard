import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import '../styles/home.css';
import introGif from '../assets/intro.gif';

const Homepage = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleRegisterClick = () => {
    navigate("/register", { state: { email } });
  };

  return (
    <div className='homepage-container'>
      <header className='header'>
        <h1 className='logo'>FlowBoard</h1>
        <div className='auth-links'>
          <Link to='/login'>Log in</Link>
          <Link to='/register'>Sign up</Link>
        </div>
      </header>

      <main className='hero'>
        <div className='hero-item'>
          <h2 className='hero-text'>
            Stay on top of your tasks effortlessly.
            <br />
            Simplify your workflow and boost productivity with FlowBoard.
          </h2>
          <div className='signup-container'>
          <input
              type='email'
              placeholder='Enter your email'
              className='email-input'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className='registration-button' onClick={handleRegisterClick}>
              Sign up
            </button>
          </div>
        </div>
        <div className='hero-item'>
          <img src={introGif} alt='To-do illustration' />
        </div>
      </main>
    </div>
  );
};

export default Homepage;
