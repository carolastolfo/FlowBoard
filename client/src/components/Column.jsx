import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

// Represents a single column in the Kanban board
const Column = ({
  title, // Title of the column
  tasks, // Array of tasks in this column
  id, // Unique identifier for the column
  addTask, // Function to add a new task
  deleteTask, // Function to delete a task
  editTask, // Function to edit a task
  deleteColumn, // Function to delete this column
}) => {
  const [newTask, setNewTask] = useState(''); // State to store the new task input

  // Function to handle adding a new task
  // const handleAddTask = () => {
  //   if (!newTask.trim()) return; // Prevent adding empty tasks
  //   addTask(id, newTask); // Call addTask function with column ID and task text
  //   setNewTask(''); // Clear the input field
  // };

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

        {deleteColumn && (
          <button
            className='delete-column-btn'
            onClick={() => deleteColumn(id)}
            title='Delete Column'
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>

      {/* Input for adding tasks */}
      <div className='add-task'>
        <input
          type='text'
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder='Enter task...'
        />
        {/* <button onClick={handleAddTask}>+ Add</button> */}
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

      {/* Droppable area for drag-and-drop functionality */}
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className='task-list'
          >
            {tasks.map((task, index) => (
              <Task
                key={task.id}
                task={task}
                index={index}
                columnId={id}
                deleteTask={deleteTask}
                editTask={editTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
