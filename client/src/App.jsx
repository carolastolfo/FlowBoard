import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import KanbanBoard from './components/KanbanBoard';
import Boards from './components/Boards';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import JoinRequestManage from './components/JoinRequestManage';
import './App.css'; // Import the global styles

function App() {
  return (
    // added client side routing with react router dom
    <Router>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/boards' element={<Boards />} />
        <Route path='/board' element={<KanbanBoard />} />
        <Route path='/register' element={<Register />} />
        <Route path='/joinRequestManage' element={<JoinRequestManage />} />
      </Routes>
    </Router>
  );
}

export default App;