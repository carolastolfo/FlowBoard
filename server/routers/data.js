export const data = {
    users: [
        {
            id: 1,
            username: "john_doe",
            email: "john@example.com",
            password: "hashed_password",
            role: "admin",
            boards: [101, 102],
        },
        {
            id: 2,
            username: "jane_smith",
            email: "jane@example.com",
            password: "hashed_password",
            role: "user",
            boards: [101],
        },
    ],
    boards: [
        {
            id: 101,
            name: "Project Alpha",
            owner_id: 1,
            team_members: [2],
            background_color: "beige",
            tasks: [1001, 1002],
        },
        {
            id: 102,
            name: "Marketing Plan",
            owner_id: 2,
            team_members: [1],
            background_color: "pink",
            tasks: [],
        },
    ],
    tasks: [
        {
            id: 1001,
            title: "Design Wireframes",
            description: "Create wireframes for the landing page",
            status: "In Progress",
            assignee: 2,
            due_date: "2025-03-15",
            tags: ["UI/UX", "Design"],
            reminder: "2025-03-14T09:00:00Z",
        },
        {
            id: 1002,
            title: "Backend API",
            description: "Implement authentication API",
            status: "To Do",
            assignee: 1,
            due_date: "2025-03-20",
            tags: ["Backend", "Auth"],
            reminder: "2025-03-19T10:00:00Z",
        },
    ],
    join_requests: [
        {
            id: 1,
            user_id: 2,
            board_id: 102,
            status: "pending",
        },
    ],

};
