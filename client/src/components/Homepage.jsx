import { Link } from 'react-router-dom';
import '../styles/home.css';
import todoImage from '../assets/to-do.jpg';

const Homepage = () => {
  // const redirectToLogin = () => {
  //   window.location.href = "/login";  // Redirects the user to /login
  // };

  return (
    <div className='homepage-container'>
      <header className='header'>
        <h1 className='logo'>Flowboard</h1>
        <div className='auth-links'>
          <Link to='/login'>Login</Link>
          <Link to='/register'>Register</Link>
        </div>
      </header>

      <main className='hero'>
        <div className='hero-item'>
          <h2 className='hero-text'>
            Stay on top of your tasks effortlessly.
            <br />
            Simplify your workflow and boost productivity with Flowboard.
          </h2>
          <div className='signup-container'>
            <input
              type='email'
              placeholder='Enter your email'
              className='email-input'
            />
            <Link to='/register' className='register-button'>
              Register
            </Link>
          </div>
        </div>
        <div className='hero-item'>
          <img src={todoImage} alt='To-do illustration' />
        </div>
      </main>
    </div>
  );
};

export default Homepage;
