import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Column from './Column';
import '../styles/KanbanBoardStyles.css';

// Function to fetch task
const fetchTask = async (setTasks) => {
  console.log('Fetching tasks...');
  try {
    const response = await fetch(`http://localhost:8000/fetch/task`);
    const data = await response.json();

    setTasks(data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

// Function to fetch add task
const fetchAddTask = async (columnId, content, setTasks) => {
  if (!content.trim()) return;

  try {
    const response = await fetch(`http://localhost:8000/fetch/addtask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, content }),
    });

    const data = await response.json();

    setTasks(data.tasks);
  } catch (error) {
    console.error('Error adding task:', error);
  }
};

// Function to fetch delete task
const fetchDeleteTask = async (columnId, taskId, updateTasks) => {
  try {
    const response = await fetch(
      `http://localhost:8000/fetch/deletetask/${columnId}/${taskId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete task:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Updated tasks after deletion:', data.tasks);
    updateTasks(data.tasks);
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

// Function to fetch edit task
const fetchEditTask = async (columnId, taskId, updatedContent, setTasks) => {
  try {
    const response = await fetch(`http://localhost:8000/fetch/edittask`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, taskId, content: updatedContent }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to edit task:', errorData);
      return;
    }

    const data = await response.json();
    console.log('Updated tasks after editing:', data.tasks);

    setTasks(data.tasks);
  } catch (error) {
    console.error('Error editing task:', error);
  }
};

// Function to add a column
const fetchAddColumn = async (columnName, setTasks, setColumnOrder) => {
  try {
    const response = await fetch(`http://localhost:8000/fetch/addcolumn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to add column:', errorData);
      return;
    }

    const data = await response.json();
    console.log('Updated tasks after adding a column:', data.tasks);

    setTasks(data.tasks);
    setColumnOrder(Object.keys(data.tasks));
  } catch (error) {
    console.error('Error adding column:', error);
  }
};

// Function to delete a column

// Represents the entire board with multiple columns
const KanbanBoard = () => {
  const [tasks, setTasks] = useState({});
  const [columnOrder, setColumnOrder] = useState(Object.keys(tasks));
  const [newColumnName, setNewColumnName] = useState('');
  const boardRef = useRef(null);
  const [activeMenuColumn, setActiveMenuColumn] = useState(null);

  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchTask(setTasks, setColumnOrder);
  }, []);

  useEffect(() => {
    setColumnOrder(Object.keys(tasks));
  }, [tasks]);

  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.scrollLeft =
        boardRef.current.scrollWidth / 2 - boardRef.current.clientWidth / 2;
    }
  }, [tasks]);

  // Function to add a task to a specific column
  const addTask = (columnId, content) => {
    if (!content.trim()) return;

    setTasks((prev) => {
      const columnTasks = prev[columnId].items;

      const maxId =
        columnTasks.length > 0
          ? Math.max(...columnTasks.map((task) => parseInt(task.id, 10)))
          : 0;

      const newTaskId = (maxId + 1).toString();

      const updatedItems = [
        ...columnTasks,
        { id: newTaskId, content, completed: false },
      ];
      return {
        ...prev,
        [columnId]: { ...prev[columnId], items: updatedItems },
      };
    });
    fetchAddTask(columnId, content, setTasks);
    console.log('Updated tasks:', tasks);
  };

  // Function to delete a task
  const deleteTask = async (columnId, taskId) => {
    await fetchDeleteTask(columnId, taskId, setTasks);

    setTasks((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        items: prev[columnId].items.filter((task) => task.id !== taskId),
      },
    }));
  };

  // Function to edit a task
  const editTask = (columnId, taskId, updatedTask) => {
    setTasks((prev) => {
      const updatedItems = prev[columnId].items.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      );
      return {
        ...prev,
        [columnId]: { ...prev[columnId], items: updatedItems },
      };
    });
    fetchEditTask(columnId, taskId, updatedTask.content, setTasks);
  };

  // Function to delete a column
  const deleteColumn = (columnId) => {
    setTasks((prev) => {
      const updatedTasks = { ...prev };
      delete updatedTasks[columnId];
      return updatedTasks;
    });
    setColumnOrder((prev) => prev.filter((id) => id !== columnId));
  };

  // Function to add a new column
  const addColumn = () => {
    if (!newColumnName.trim()) return;

    const newColumnId = `col-${Date.now()}`;
    setTasks((prev) => ({
      ...prev,
      [newColumnId]: { title: newColumnName, items: [] },
    }));
    setColumnOrder((prev) => [...prev, newColumnId]);
    setNewColumnName('');

    setTimeout(() => {
      if (boardRef.current) {
        boardRef.current.scrollLeft = boardRef.current.scrollWidth;
      }
    }, 100);
    fetchAddColumn(newColumnName, setTasks, setColumnOrder);
  };

  // Function to handle drag-and-drop task movement
  const onDragEnd = ({ source, destination, type }) => {
    if (!destination) return;

    if (type === 'COLUMN') {
      const newOrder = [...columnOrder];
      const [movedColumn] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, movedColumn);
      setColumnOrder(newOrder);
    } else {
      setTasks((prev) => {
        const sourceTasks = [...prev[source.droppableId].items];
        const destinationTasks =
          source.droppableId === destination.droppableId
            ? sourceTasks
            : [...prev[destination.droppableId].items];

        const [movedTask] = sourceTasks.splice(source.index, 1);
        destinationTasks.splice(destination.index, 0, movedTask);

        return {
          ...prev,
          [source.droppableId]: {
            ...prev[source.droppableId],
            items: sourceTasks,
          },
          ...(source.droppableId !== destination.droppableId && {
            [destination.droppableId]: {
              ...prev[destination.droppableId],
              items: destinationTasks,
            },
          }),
        };
      });
    }
  };

  return (
    <div className='kanban-container'>
      <h2>My Board</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='board' direction='horizontal' type='COLUMN'>
          {(provided) => (
            <div
              className='kanban-board'
              ref={(el) => {
                boardRef.current = el;
                provided.innerRef(el);
              }}
              {...provided.droppableProps}
            >
              {columnOrder.map((columnId, index) => (
                <Draggable key={columnId} draggableId={columnId} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Column
                        key={columnId}
                        id={columnId}
                        title={tasks[columnId].title}
                        tasks={tasks[columnId].items}
                        addTask={addTask}
                        deleteTask={deleteTask}
                        deleteColumn={deleteColumn}
                        editTask={editTask}
                        activeMenuColumn={activeMenuColumn}
                        setActiveMenuColumn={setActiveMenuColumn}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

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
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
