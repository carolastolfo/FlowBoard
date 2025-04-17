import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// Represents a single column in the Kanban board
const Column = ({
  title,
  tasks,
  id,
  addTask,
  deleteTask,
  editTask,
  deleteColumn,
}) => {
  const [newTask, setNewTask] = useState('');
  const [tags, setTags] = useState([]);

  return (
    <div className='column'>
      <div className='column-header'>
        <h2>
          {/* {title.split('\n').map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))} */}
          {title.split('\n').map((line, index) => (
            <span key={`${line}-${index}`}>
              {line}
              <br />
            </span>
          ))}
        </h2>

        <div className='column-right'>
          <button
            className='list-column-btn'
            title='Delete Column'
            onClick={() => deleteColumn(id)}
          >
            <FontAwesomeIcon
              icon={faTimesCircle}
              style={{ fontSize: '20px' }}
            />
          </button>
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

      <Droppable droppableId={id.toString()}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Task
                  key={task._id || `${index}`}
                  task={task}
                  index={index}
                  columnId={id}
                  deleteTask={deleteTask}
                  editTask={editTask}
                  tags={tags}
                  setTags={setTags}
                />
              ))
            ) : (
              <p>No tasks available in the column</p>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
