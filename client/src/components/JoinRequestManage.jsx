import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/joinRequestManage.css";


const JoinRequestManage = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchJoinRequests = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/fetch/joinRequests`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                console.log("API response data:", data);
                setRequests(data.request);
            } catch (err) {
                setError("Failed to fetch join requests.");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchJoinRequests();
    }, [token]);


    const handleAction = async (joinRequestId, action) => {
        try {
            const url = `${import.meta.env.VITE_SERVER_URL}/fetch/joinRequests/${joinRequestId}/${action}`;
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Action failed");

            setRequests(requests.filter((r) => r._id !== joinRequestId));
        } catch (err) {
            alert(err.message);
        }
    };

    if (!token) return <p>Please log in to manage join requests.</p>;
    if (loading) return <p>Loading join requests...</p>;

    return (
        <div className="join-requests-container">
            <h1>Manage Join Requests</h1>
            {/* boards button */}
            <button
                className="boards-button"
                onClick={() => navigate("/boards")}
            >
                Board List
            </button>
            {error && <p className="error-message">{error}</p>}
            {requests.length === 0 ? (
                <p>No pending requests.</p>
            ) : (
                <div className="request-list">
                    {requests.map((req) => (
                        <div className="request-card" key={req._id}>
                            <p><strong>User:</strong> {req.userId.username}</p>
                            <p><strong>Board:</strong> {req.boardId.name}</p>
                            <div className="action-buttons">
                                <button onClick={() => handleAction(req._id, "accept")}>Accept</button>
                                <button onClick={() => handleAction(req._id, "reject")}>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JoinRequestManage;
