import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import ListMenu from './ListMenu';
console.log(import.meta.env.VITE_SERVER_URL)

// Represents a single column in the Kanban board
const Column = ({
  title,
  tasks,
  id,
  addTask,
  deleteTask,
  editTask,
  deleteColumn,
  activeMenuColumn,
  setActiveMenuColumn,
}) => {
  const [newTask, setNewTask] = useState('');
  const isMenuOpen = activeMenuColumn === id;

  return (
    <div className='column'>
      <div className='column-header'>
        <h2>
          {title.split('\n').map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
        </h2>

        <div className='column-right'>
          <button
            className='list-column-btn'
            title='List Actions'
            onClick={() => setActiveMenuColumn(isMenuOpen ? null : id)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          {isMenuOpen && (
            <ListMenu
              deleteColumn={deleteColumn}
              id={id}
              setActiveMenuColumn={setActiveMenuColumn}
            />
          )}
        </div>
      </div>

      <div className='add-task'>
        <input
          type='text'
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder='Enter task...'
        />

        <button
          onClick={() => {
            if (!newTask.trim()) return;
            addTask(id, newTask);
            setNewTask('');
          }}
        >
          + Add
        </button>
      </div>

      <Droppable droppableId={id}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Task
                  key={task.id}
                  task={task}
                  index={index}
                  columnId={id}
                  deleteTask={deleteTask}
                  editTask={editTask}
                />
              ))
            ) : (
              <p>No taks available at the moment.</p>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
