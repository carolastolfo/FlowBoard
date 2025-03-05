import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilSquare } from '@fortawesome/free-solid-svg-icons';

const Task = ({ task, index, columnId, deleteTask, editTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(task.content);

  const handleEdit = () => {
    if (isEditing) {
      editTask(columnId, task.id, newContent);
    }
    setIsEditing(!isEditing);
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
            <input
              className='task-input'
              type='text'
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onBlur={handleEdit}
              autoFocus
            />
          ) : (
            <span>{task.content}</span>
          )}
          <div className='task-buttons'>
            <button className='edit-btn' onClick={handleEdit} title='Edit Task'>
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
