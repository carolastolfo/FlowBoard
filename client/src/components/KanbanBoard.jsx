import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Column from './Column';
import socket from '../socket';
import { produce } from 'immer';
import '../styles/KanbanBoardStyles.css';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestionCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import tutorial from '../assets/tutorial.png';

// Represents the entire board with multiple columns
const KanbanBoard = () => {
  const [tasks, setTasks] = useState({});
  const [columnOrder, setColumnOrder] = useState(Object.keys(tasks));
  const [newColumnName, setNewColumnName] = useState('');
  const boardRef = useRef(null);
  const [activeMenuColumn, setActiveMenuColumn] = useState(null);
  const { boardId } = useParams();
  const [showModal, setShowModal] = useState(false);

  const defaultColumns = {
    'col-1': { title: 'To Do', items: [] },
    'col-2': { title: 'Doing', items: [] },
    'col-3': { title: 'Done', items: [] },
  };

  useEffect(() => {
    if (boardId) {
      socket.emit('joinBoard', boardId);
      console.log('Emitted joinBoard with', boardId);
    }
  }, [boardId]);

  useEffect(() => {
    if (boardId) {
      fetchTask();
    } else {
      setTasks(defaultColumns);
    }
  }, [boardId]);

  useEffect(() => {
    setColumnOrder(Object.keys(tasks));
  }, [tasks]);

  // Websocket useEffect
  useEffect(() => {
    // Ensure socket is connected
    if (!socket.connected) socket.connect();
    console.log('Socket connected in KanbanBoard');

    const handleTaskSaved = (data) => {
      console.log('Received TaskSaved event:', data);
      const { newTask, columnId } = data;

      setTasks((prevTasks) => {
        const column = prevTasks[columnId] || { title: columnId, items: [] };

        const updatedColumn = {
          ...column,
          items: [newTask, ...column.items],
        };

        return {
          ...prevTasks,
          [columnId]: updatedColumn,
        };
      });
    };

    const handleTaskDeleted = (deletedTaskId) => {
      console.log('Received TaskDeleted event:', deletedTaskId);
      setTasks((prevTasks) =>
        produce(prevTasks, (draft) => {
          // Loop through all columns
          Object.keys(draft).forEach((columnId) => {
            // Find the task in the current column's items array
            const index = draft[columnId].items.findIndex(
              (task) => task._id === deletedTaskId
            );
            if (index !== -1) {
              // Remove the task from the column if found
              draft[columnId].items.splice(index, 1);
            }
          });
        })
      );
    };

    const handleTaskUpdated = (data) => {
      console.log('Received TaskUpdated event:', data);
      const { columnId, taskId, updatedTask } = data;

      // Update the tasks state with the updated task information
      setTasks((prevTasks) => {
        const updatedItems = prevTasks[columnId].items.map((task) =>
          task._id === taskId ? { ...task, ...updatedTask } : task
        );

        return {
          ...prevTasks,
          [columnId]: { ...prevTasks[columnId], items: updatedItems },
        };
      });
    };

    const handleColumnSaved = (columnId, columnName) => {
      console.log('Received ColumnSaved event:', columnId, columnName);

      setTasks((prevTasks) => ({
        ...prevTasks,
        [columnId]: { title: columnName, items: [] }, // Default empty column data
      }));

      setColumnOrder((prevOrder) => {
        if (!prevOrder.includes(columnId)) {
          return [...prevOrder, columnId];
        }
        return prevOrder;
      });
    };

    const handleColumnDeleted = (columnId) => {
      console.log('Received ColumnDeleted event:', columnId);

      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        delete updatedTasks[columnId];
        return updatedTasks;
      });

      setColumnOrder((prevOrder) => prevOrder.filter((id) => id !== columnId));
    };

    socket.on('TaskSaved', handleTaskSaved);
    socket.on('TaskDeleted', handleTaskDeleted);
    socket.on('TaskUpdated', handleTaskUpdated);
    socket.on('ColumnSaved', handleColumnSaved);
    socket.on('ColumnDeleted', handleColumnDeleted);

    return () => {
      socket.off('TaskSaved', handleTaskSaved);
      socket.off('TaskDeleted', handleTaskDeleted);
      socket.off('TaskUpdated', handleTaskUpdated);
      socket.off('ColumnSaved', handleColumnSaved);
      socket.off('ColumnDeleted', handleColumnDeleted);
    };
  }, []);

  // Function to fetch task
  const fetchTask = async () => {
    console.log('fetchTask is being called');
    console.log('boardId is:', boardId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/fetch/task/${boardId}`
      );
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      console.log('Fetched task data:', data);

      const validData = data.find((item) => item?.tasks);

      if (validData) {
        setTasks(validData.tasks);
      } else {
        setTasks(defaultColumns);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks(defaultColumns);
    }
  };

  // Function to fecth add a task
  const fetchAddTask = async (columnId, content, setTasks, boardId) => {
    if (!content.trim()) return;

    console.log('Sending to backend:', { columnId, content, boardId });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/fetch/addtask`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ columnId, content, boardId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const data = await response.json();

      setTasks(data.tasks);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Function to fetch delete task
  const fetchDeleteTask = async (columnId, taskId, setTasks, boardId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL
        }/fetch/deletetask/${columnId}/${taskId}/${boardId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ boardId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      const data = await response.json();

      setTasks(data.tasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Function to fetch edit task
  const fetchEditTask = async (
    boardId,
    columnId,
    taskId,
    updatedTask,
    setTasks
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/fetch/edittask`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            boardId,
            columnId,
            taskId,
            content: updatedTask.content,
            completed: updatedTask.completed,
            status: updatedTask.status,
            due_date: updatedTask.due_date,
            tags: updatedTask.tags,
          }),
        }
      );

      if (!response.ok) {
        console.error('Failed to edit task:', await response.json());
        return;
      }

      const data = await response.json();
      console.log('Server response:', data.tasks);

      setTasks(data.tasks);
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  // Function to fetch add a column
  const fetchAddColumn = async (
    columnName,
    setTasks,
    setColumnOrder,
    boardId
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/fetch/addcolumn`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ columnName, boardId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to add column:', errorData);
        return;
      }

      const data = await response.json();

      setTasks(data.tasks);
      setColumnOrder(Object.keys(data.tasks));
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  // Function to fetch delete a column
  const fetchDeleteColumn = async (
    columnId,
    setTasks,
    setColumnOrder,
    boardId
  ) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL
        }/fetch/deletecolumn/${columnId}/${boardId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete column');
      }

      const data = await response.json();
      console.log('Updated tasks after deleting column:', data.tasks);

      setTasks(data.tasks);
      setColumnOrder((prev) => prev.filter((id) => id !== columnId));
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  // Function to fetch update task column
  const fetchUpdateTaskColumn = async (
    taskId,
    fromColumnId,
    toColumnId,
    boardId
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/fetch/updateTaskColumn/${taskId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromColumnId, toColumnId, boardId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to move task');
      }
      const data = await response.json();

      console.log('Task moved successfully', data);

      console.log(`Task ${taskId} moved from ${fromColumnId} to ${toColumnId}`);

      setTasks(data.tasks);
    } catch (error) {
      console.error('Error updating task column:', error);
    }
  };

  // Function to add a task to a specific column
  const addTask = (columnId, content, boardId) => {
    if (!content.trim()) return;

    setTasks((prev) => {
      const updatedItems = [
        ...prev[columnId].items,
        { content, completed: false },
      ];
      return {
        ...prev,
        [columnId]: { ...prev[columnId], items: updatedItems },
      };
    });
    fetchAddTask(columnId, content, setTasks, boardId);
    console.log('Updated tasks:', tasks);
  };

  // Function to delete a task from a specific column
  const deleteTask = async (columnId, taskId, boardId) => {
    await fetchDeleteTask(columnId, taskId, setTasks, boardId);

    setTasks((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        items: prev[columnId].items.filter((task) => task._id !== taskId),
      },
    }));
  };

  const editTask = (boardId, columnId, taskId, updatedTask) => {
    setTasks((prev) => {
      const updatedItems = prev[columnId].items.map((task) =>
        task._id === taskId ? { ...task, ...updatedTask } : task
      );
      return {
        ...prev,
        [columnId]: { ...prev[columnId], items: updatedItems },
      };
    });

    fetchEditTask(boardId, columnId, taskId, updatedTask, setTasks);

    // Send the update to the server via WebSocket
    socket.emit('TaskUpdated', { columnId, taskId, updatedTask });
  };

  // Function to delete a column
  const deleteColumn = async (columnId, boardId) => {
    await fetchDeleteColumn(columnId, setTasks, setColumnOrder, boardId);

    setTasks((prev) => {
      const updatedTasks = { ...prev };
      delete updatedTasks[columnId];
      return updatedTasks;
    });

    setColumnOrder((prev) => prev.filter((id) => id !== columnId));
  };

  // Function to add a new column
  const addColumn = async (boardId) => {
    console.log('Adding column for boardId:', boardId);
    if (!newColumnName.trim()) return;

    try {
      await fetchAddColumn(newColumnName, setTasks, setColumnOrder, boardId);

      setNewColumnName('');

      setTimeout(() => {
        if (boardRef.current) {
          boardRef.current.scrollLeft = boardRef.current.scrollWidth;
        }
      }, 100);
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  const onDragEnd = async ({ source, destination, type }) => {
    if (!destination) return;

    if (type === 'COLUMN') {
      const newOrder = [...columnOrder];
      const [movedColumn] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, movedColumn);
      setColumnOrder(newOrder);
      console.log(
        `Moved column ${movedColumn} from position ${source.index} to ${destination.index}`
      );
    } else {
      const fromColumnId = source.droppableId;
      const toColumnId = destination.droppableId;

      const sourceTasks = [...tasks[fromColumnId].items];
      const destinationTasks =
        fromColumnId === toColumnId
          ? sourceTasks
          : [...tasks[toColumnId].items];

      const [movedTask] = sourceTasks.splice(source.index, 1);
      destinationTasks.splice(destination.index, 0, movedTask);

      if (!movedTask || !movedTask._id) {
        console.error('Moved task or task ID not found.');
        return;
      }

      await fetchUpdateTaskColumn(
        movedTask._id,
        fromColumnId,
        toColumnId,
        boardId
      );

      // Emit WebSocket event to inform other users
      socket.emit('TaskUpdated', {
        columnId: toColumnId,
        taskId: movedTask._id,
        updatedTask: movedTask,
      });

      setTasks((prev) => ({
        ...prev,
        [fromColumnId]: {
          ...prev[fromColumnId],
          items: sourceTasks,
        },
        ...(fromColumnId !== toColumnId && {
          [toColumnId]: {
            ...prev[toColumnId],
            items: destinationTasks,
          },
        }),
      }));
    }
  };

  return (
    <div className='kanban-wrapper'>
      <div className='navbar'>
        <h3>FlowBoard</h3>
        <div className='nav-links'>
          <Link to='/boards'>Boards</Link>
          <Link to='/joinRequestManage'>Request manage</Link>
          <button className='help-btn' onClick={() => setShowModal(true)}>
            <FontAwesomeIcon icon={faQuestionCircle} />
          </button>

          {showModal && (
            <div className='modal-overlay'>
              <div className='modal-content-tutorial'>
                <div className='modal-header'>
                  <button
                    className='close-btn'
                    onClick={() => setShowModal(false)}
                  >
                    <FontAwesomeIcon
                      icon={faTimesCircle}
                      style={{ fontSize: '20px' }}
                    />
                  </button>
                </div>
                <h2>Kanban Board User Guide</h2>
                <img src={tutorial} alt='Tutorial image' />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='kanban-container'>
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
                  <Draggable
                    key={columnId}
                    draggableId={columnId}
                    index={index}
                  >
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
                          boardId={boardId}
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
                  <button onClick={() => addColumn(boardId)}>
                    + Add Column
                  </button>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <footer className='kanban-footer'>
        <p>© 2025 FlowBoard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default KanbanBoard;
