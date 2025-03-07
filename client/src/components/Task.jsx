import { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilSquare } from '@fortawesome/free-solid-svg-icons';

const Task = ({ task, index, columnId, deleteTask, editTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(task.content);

  // Update content when task content changes
  useEffect(() => {
    setNewContent(task.content);
  }, [task.content]);

  // Function to handle editing the task
  const handleEdit = (e) => {
    if (e) e.preventDefault();

    if (newContent.trim()) {
      editTask(columnId, task.id, {
        content: newContent,
        completed: task.completed,
      });
    }

    setIsEditing(false);
  };

  // Handle toggling the checkbox state
  const handleCheckboxChange = () => {
    editTask(columnId, task.id, {
      content: task.content,
      completed: !task.completed,
    });
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
              checked={task.completed || false}
              onChange={handleCheckboxChange}
              title='Mark complete'
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
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Task;
