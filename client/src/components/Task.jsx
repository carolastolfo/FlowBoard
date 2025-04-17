import { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPencilSquare,
  faCalendarAlt,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import Tag from './Tag';

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const Task = ({
  task,
  index,
  columnId,
  deleteTask,
  editTask,
  tags,
  setTags,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(task.content);
  const [newStatus, setNewStatus] = useState(task.status ?? '');
  const [dueDate, setDueDate] = useState(task.due_date ?? '');
  const [showDate, setShowDate] = useState(false);

  useEffect(() => {
    setNewContent(task.content);
    setNewStatus(task.status ?? '');
    setDueDate(task.due_date ?? '');
  }, [task.content, task.status, task.due_date]);

  const handleEdit = (e) => {
    if (e) e.preventDefault();

    if (newContent.trim()) {
      editTask(columnId, task._id, {
        content: newContent,
        completed: task.completed,
        status: newStatus,
        due_date: dueDate,
        tags: tags,
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
      tags: tags,
    };

    editTask(columnId, task._id, updatedTask);
  };

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setDueDate(newDate);
    editTask(columnId, task._id, { ...task, due_date: newDate });
    setShowDate(false);
  };

  const handleDeleteDueDate = () => {
    setDueDate('');
    editTask(columnId, task._id, { ...task, due_date: '' });
  };

  return (
    // <Draggable draggableId={task._id} index={index}>
    <Draggable key={task._id} draggableId={String(task._id)} index={index}>
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
            <>
              <span
                className={`task-content ${task.completed ? 'completed' : ''}`}
              >
                {task.content}
              </span>
              {dueDate && (
                <div className='due-date-display'>
                  <button
                    className='delete-due-date-btn'
                    onClick={handleDeleteDueDate}
                    title='Delete Due Date'
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                  Due: {formatDate(dueDate)}
                </div>
              )}
            </>
          )}
          <div className='task-buttons'>
            <input
              type='checkbox'
              className='task-checkbox'
              checked={task.completed ?? false}
              onChange={handleCheckboxChange}
              title={task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            />

            <Tag
              taskId={task._id}
              task={task}
              columnId={columnId}
              setTags={setTags}
              tags={task.tags || []}
              editTask={editTask}
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
              onClick={() => deleteTask(columnId, task._id)}
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
