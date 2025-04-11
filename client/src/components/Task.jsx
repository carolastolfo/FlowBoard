import { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPencilSquare,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';

const Task = ({ task, index, columnId, deleteTask, editTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(task.content);
  const [newStatus, setNewStatus] = useState(task.status ?? '');
  const [dueDate, setDueDate] = useState(task.due_date ?? '');
  const [showDate, setShowDate] = useState(false);
  console.log(import.meta.env.VITE_SERVER_URL)

  useEffect(() => {
    setNewContent(task.content);
    setNewStatus(task.status ?? '');
    setDueDate(task.due_date ?? '');
  }, [task.content, task.status, task.due_date]);

  const handleEdit = (e) => {
    if (e) e.preventDefault();

    if (newContent.trim()) {
      editTask(columnId, task.id, {
        content: newContent,
        completed: task.completed,
        status: newStatus,
        due_date: dueDate,
      });
    }

    setIsEditing(false);
  };

  const handleCheckboxChange = () => {
    if (!task.content) {
      console.error('Error: Task content is undefined', task);
      return;
    }

    const updatedTask = {
      content: task.content,
      completed: !task.completed,
      status: task.status ?? '',
      due_date: dueDate,
    };

    editTask(columnId, task.id, updatedTask);
  };

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setDueDate(newDate);
    editTask(columnId, task.id, { ...task, due_date: newDate });
    setShowDate(false);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className='task'
        >
          {isEditing ? (
            <textarea
              className='task-textarea'
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit(e);
                }
              }}
              autoFocus
            />
          ) : (
            <span
              className={`task-content ${task.completed ? 'completed' : ''}`}
            >
              {task.content}
            </span>
          )}

          <div className='task-buttons'>
            <input
              type='checkbox'
              className='task-checkbox'
              checked={task.completed ?? false}
              onChange={handleCheckboxChange}
              title={task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            />

            <button
              className='edit-btn'
              onClick={() => setIsEditing(true)}
              title='Edit Task'
            >
              <FontAwesomeIcon icon={faPencilSquare} />
            </button>

            <button
              className='delete-btn'
              onClick={() => deleteTask(columnId, task.id)}
              title='Delete Task'
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>

            <button
              className='due-date-btn'
              onClick={() => setShowDate(!showDate)}
              title='Set Due Date'
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
            </button>

            {showDate && (
              <input
                className='dateStyle'
                type='date'
                value={dueDate}
                onChange={handleDateChange}
              />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Task;