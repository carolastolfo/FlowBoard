import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';

const Column = ({ title, tasks, id, addTask, deleteTask, editTask }) => {
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    addTask(id, newTask);
    setNewTask('');
  };

  return (
    <div className='column'>
      <h2>{title}</h2>

      <div className='add-task'>
        <input
          type='text'
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder='Enter task...'
        />
        <button onClick={handleAddTask}>+ Add</button>
      </div>

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
