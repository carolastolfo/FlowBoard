import { useState, useRef, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';

// Represents the entire board with multiple columns
const KanbanBoard = () => {
  // State to store tasks
  const [tasks, setTasks] = useState({
    todo: { title: 'To Do', items: [{ id: '1', content: 'Design UI' }] },
    doing: { title: 'Doing', items: [{ id: '2', content: 'Develop API' }] },
    done: { title: 'Done', items: [{ id: '3', content: 'Write Docs' }] },
  });

  const [newColumnName, setNewColumnName] = useState(''); // State for new column
  const boardRef = useRef(null);

  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.scrollLeft = boardRef.current.scrollWidth;
    }
  }, [tasks]);

  // Function to add a task to a specific column
  const addTask = (columnId, content) => {
    if (!content.trim()) return; // Prevent adding empty tasks
    const newTask = { id: Date.now().toString(), content, completed: false }; // Create a new task object
    setTasks((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        items: [...prev[columnId].items, newTask], // Add the new task to the column
      },
    }));
  };

  // Function to delete a task from a specific column
  const deleteTask = (columnId, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        items: prev[columnId].items.filter((task) => task.id !== taskId), // Remove the task from the column
      },
    }));
  };

  // Function to edit a task in a specific column
  const editTask = (columnId, taskId, updatedTask) => {
    setTasks((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        items: prev[columnId].items.map((task) =>
          task.id === taskId
            ? {
                ...task,
                content: updatedTask.content,
                completed: updatedTask.completed,
              }
            : task
        ),
      },
    }));
  };

  // Function to delete a column
  const deleteColumn = (columnId) => {
    setTasks((prev) => {
      const updatedTasks = { ...prev };
      delete updatedTasks[columnId]; // Remove the column from state
      return updatedTasks;
    });
  };

  // Function to add a new column
  const addColumn = () => {
    if (!newColumnName.trim()) return; // Prevent adding empty columns
    const newColumnId = `col-${Date.now()}`;
    setTasks((prev) => ({
      ...prev,
      [newColumnId]: { title: newColumnName, items: [] }, // Create a new column with an empty task list
    }));
    setNewColumnName('');

    // Auto-scroll to new column
    setTimeout(() => {
      if (boardRef.current) {
        boardRef.current.scrollLeft = boardRef.current.scrollWidth;
      }
    }, 100);
  };

  // Function to handle drag-and-drop task movement
  const onDragEnd = ({ source, destination }) => {
    // If there's no valid destination or task is dropped at the same position, do nothing
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    )
      return;

    setTasks((prev) => {
      const sourceTasks = [...prev[source.droppableId].items]; // Get tasks from the source column
      const destinationTasks =
        source.droppableId === destination.droppableId
          ? sourceTasks
          : [...prev[destination.droppableId].items]; // Get tasks from the destination column

      const [movedTask] = sourceTasks.splice(source.index, 1); // Remove the task from the source column
      destinationTasks.splice(destination.index, 0, movedTask); // Insert task into the destination column

      return {
        ...prev,
        [source.droppableId]: {
          ...prev[source.droppableId],
          items: sourceTasks, // Update source column tasks
        },
        ...(source.droppableId !== destination.droppableId && {
          [destination.droppableId]: {
            ...prev[destination.droppableId],
            items: destinationTasks, // Update destination column tasks
          },
        }),
      };
    });
  };

  return (
    <div className='kanban-container'>
      <h2>My Board</h2>
      <div className='kanban-board-wrapper'>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className='kanban-board' ref={boardRef}>
            {Object.keys(tasks).map((columnId) => (
              <Column
                key={columnId}
                id={columnId}
                title={tasks[columnId].title}
                tasks={tasks[columnId].items}
                addTask={addTask}
                deleteTask={deleteTask}
                deleteColumn={deleteColumn}
                editTask={editTask}
              />
            ))}

            {/* Add New Column Button */}
            <div className='add-column'>
              <input
                type='text'
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder='New column name'
              />
              <button onClick={addColumn}>+ Add Column</button>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
