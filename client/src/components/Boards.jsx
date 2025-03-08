import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Boards.css";

const Boards = () => {
    const [searchId, setSearchId] = useState("");
    const [boards, setBoards] = useState([  // should be replaced get all boards API later
        { id: 101, name: "Project Alpha", background_color: "beige", team_members: [2] },
        { id: 102, name: "Marketing Plan", background_color: "pink", team_members: [1] },
    ]);
    const [error, setError] = useState("");
    const navigate = useNavigate(); 


    const handleSearch = async () => {
        if (!searchId) {
            setError("Please enter a Board ID");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/fetch/board/${searchId}`);
            if (!response.ok) {
                throw new Error("Board not found");
            }

            const data = await response.json();
            console.log(data)
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
    }


    return (
        <div className="boards-container">
            {/* Header */}
            <div className="header">
                <h1>UserName Boards</h1>
                <div className="search-container">
                    <input
                        placeholder="Search by Board ID"
                        className="search-input"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                    <button onClick={handleSearch} className="search-button">Search</button>
                </div>
            </div>

            {/* Boards Grid */}
            <div className="boards-grid">
                {boards.length > 0 ? (
                    boards.map((board) => (
                        <div
                            key={board.id}
                            className="board-card"
                            style={{ backgroundColor: board.background_color }}
                            onClick={handleRedirect(board.id)} // click to go to /board
                        >
                            <h2>{board.name}</h2>
                            <p>Team Members: {board.team_members}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-boards">No boards found.</p>
                )}
            </div>
        </div>
    );
};

export default Boards;
