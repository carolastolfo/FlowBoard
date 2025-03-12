export const data = {
    users: [
        {
            id: 1,
            // username: "john_doe",
            username: "admin",
            email: "john@example.com",
            // password: "hashed_password",
            password: "admin",
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
    tasks: {
        "col-1": {
            title: "To Do",
            items: [
                { id: "1001", content: "Implement authentication API", status: "To Do", assignee: 1, due_date: "2025-03-20", tags: ["Backend", "Auth"], reminder: "2025-03-19T10:00:00Z" }
            ]
        },
        "col-2": {
            title: "In Progress",
            items: [
                { id: "1002", content: "Create wireframes for the landing page", status: "Doing", assignee: 2, due_date: "2025-03-15", tags: ["UI/UX", "Design"], reminder: "2025-03-14T09:00:00Z" }
            ]
        },
        "col-3": {
            title: "Done",
            items: [
                { id: "1003", content: "Deploy the authentication API to the staging server", status: "Done", assignee: 1, due_date: "2025-03-28", tags: ["Deployment", "Backend"], reminder: "2025-03-19T10:00:00Z" }
            ]
        }
    },
    join_requests: [
        {
            id: 1,
            user_id: 2,
            board_id: 102,
            status: "pending",
        },
    ],

};

export const tasks = data.tasks;