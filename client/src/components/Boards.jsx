import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode"; 
import "../styles/Boards.css";

const Boards = ({ state }) => {
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState("");
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [boardName, setBoardName] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const token = localStorage.getItem("token");
  const userId = token ? jwt_decode(token).userId : null;
  console.log(import.meta.env.VITE_SERVER_URL)

  useEffect(() => {
    // fetch boards
    const fetchBoards = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/fetch/board`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json(); // get user boards
        setBoards(data);
        console.log(data)
      } catch (error) {
        console.error("Error fetching boards:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBoards(); // only tries to get boards if user is logged in
  }, [token]);

  // create boards function
  const createBoard = async () => {
    if (!boardName || !backgroundColor) {
      setError("Both board name and background color are required.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/board`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: boardName,
          backgroundColor: backgroundColor,
        }),
      });
      const newBoard = await response.json();
      setBoards([...boards, newBoard]);
      setBoardName(""); // Clear input fields after creation
      setBackgroundColor("");
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchName.trim()) {
      // If input is empty, fetch all boards again
      try {
        const response = await fetch("http://localhost:8000/board", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setBoards(data);
        setError("");
      } catch (error) {
        console.error("Error fetching all boards:", error);
        setError("Failed to fetch boards");
      }
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/fetch/board/${searchName}`
      );
      setSearchName("")
      if (!response.ok) {
        throw new Error("Board not found");
      }

      const data = await response.json();
      console.log(data);
      setBoards([data]);
      setError("");
    } catch (err) {
      setBoards([]);
      setError(err.message);
    }
  };

  // function to redirect to board
  const handleRedirect = (boardId) => {
    setTimeout(() => {
      navigate("/board"); // redirect user and maybe later pass on boardid as param
    }, 1000);
  };

  if (!token) return <p>Please log in to see your boards.</p>;
  if (loading) return <p>Loading boards...</p>;

  const handleJoinRequest = async (boardId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/fetch/boards/${boardId}/join`,
        {
          method: "POST", 
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const data = await response.json(); 
        alert(data.message);
        return
      }
      setError("");
      alert("Join request sent. Please wait for the owner's approval.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="boards-container">
      {/* Header */}
      <div className="header">
        <h1>Your Boards</h1>
        <div className="search-container">
          <input
            placeholder="Search by Board Name"
            className="search-input"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="boards-grid">
        {boards.length > 0 ? (
          boards.map((board) => (
            <div
              key={board._id}
              className="board-card"
              style={{ backgroundColor: board.backgroundColor }}
              onClick={() => handleRedirect(board._id)} // click to go to /board
            >
              <h2>{board.name}</h2>
              <p>Team Members: {board.teamMembers.length}</p>
              {/* If current user is the owner of a board, show Owner badge */}
              {board.ownerId === userId && (
                <p className="owner-badge">👑 Owner</p>
              )}

              {/* If current user is not a member of a board, show Join button */}
              {board.ownerId !== userId && !board.teamMembers.includes(userId) && (
                <button
                  className="owner-badge"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent board redirect
                    console.log(`User ${userId} wants to join board ${board._id}`);
                    handleJoinRequest(board._id)
                  }}
                >
                  ➕ Join
                </button>
              )}

            </div>
          ))
        ) : (
          <p className="no-boards">No boards found.</p>
        )}
      </div>
      {/* Create Board Form */}
      <div className="create-board-container">
        <h2>Create a New Board</h2>
        <input
          type="text"
          placeholder="Board Name"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          className="board-input"
        />
        <input
          type="text"
          placeholder="Board Color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="board-input"
        />
        <button className="create-board-button" onClick={createBoard}>
          Create Board
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Boards;
