import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Column from './Column';

// Represents the entire board with multiple columns
const KanbanBoard = () => {
  const [tasks, setTasks] = useState({
    todo: { title: 'To Do', items: [{ id: '1', content: 'Design UI' }] },
    doing: { title: 'Doing', items: [{ id: '2', content: 'Develop API' }] },
    done: { title: 'Done', items: [{ id: '3', content: 'Write Docs' }] },
  });

  const [columnOrder, setColumnOrder] = useState(Object.keys(tasks));
  const [newColumnName, setNewColumnName] = useState('');
  const boardRef = useRef(null);
  const [activeMenuColumn, setActiveMenuColumn] = useState(null);

  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.scrollLeft = boardRef.current.scrollWidth;
    }
  }, [tasks]);

  // Function to add a task to a specific column
  const addTask = (columnId, content) => {
    if (!content.trim()) return;

    setTasks((prev) => {
      const updatedItems = [
        ...prev[columnId].items,
        { id: Date.now().toString(), content, completed: false },
      ];
      return {
        ...prev,
        [columnId]: { ...prev[columnId], items: updatedItems },
      };
    });
  };

  // Function to delete a task from a specific column
  const deleteTask = (columnId, taskId) => {
    setTasks((prev) => {
      const updatedItems = prev[columnId].items.filter(
        (task) => task.id !== taskId
      );
      return {
        ...prev,
        [columnId]: { ...prev[columnId], items: updatedItems },
      };
    });
  };

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

    // Auto-scroll to new column
    setTimeout(() => {
      if (boardRef.current) {
        boardRef.current.scrollLeft = boardRef.current.scrollWidth;
      }
    }, 100);
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
      <div className='kanban-board-wrapper'>
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
    </div>
  );
};

export default KanbanBoard;
