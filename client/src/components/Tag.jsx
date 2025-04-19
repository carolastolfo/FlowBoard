import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/KanbanBoardStyles.css';

const Tag = ({ boardId, taskId, task, columnId, editTask, tags, setTags }) => {
  const tagColors = ['#EB1660', '#4F9D69', '#E28413'];
  const [showModal, setShowModal] = useState(false);
  const [tagText, setTagText] = useState('');

  const handleAddTag = () => {
    if (tagText.trim()) {
      let randomColor;
      if ((tags || []).length > 0) {
        do {
          randomColor = tagColors[Math.floor(Math.random() * tagColors.length)];
        } while (randomColor === tags[tags.length - 1]?.color);
      } else {
        randomColor = tagColors[Math.floor(Math.random() * tagColors.length)];
      }

      const newTag = tagText.trim();

      const updatedTags = [...(tags || []), newTag];
      setTags(updatedTags);
      setTagText('');
      setShowModal(false);

      editTask(boardId, columnId, task._id, {
        ...task,
        tags: updatedTags,
      });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    editTask(boardId, columnId, task._id, {
      ...task,
      tags: updatedTags,
    });
  };

  const taskTags = tags || [];

  return (
    <>
      <div className='tags-container'>
        <button
          className='edit-btn'
          onClick={() => setShowModal(true)}
          title='Add Tag'
        >
          <FontAwesomeIcon icon={faBookmark} />
        </button>
      </div>

      {showModal && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <div className='modal-tags'>
              {taskTags.length > 0 ? (
                taskTags.map((tag, index) => (
                  <span
                    key={`${taskId}-${index}`}
                    style={{
                      backgroundColor: tagColors[index % tagColors.length],
                      padding: '5px 10px',
                      margin: '5px',
                      borderRadius: '20px',
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className='tag-delete-btn'
                      title='Remove tag'
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  </span>
                ))
              ) : (
                <span>No tags added yet</span>
              )}
            </div>

            <input
              type='text'
              placeholder='Enter a tag...'
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
            />
            <div className='modal-buttons'>
              <button onClick={handleAddTag} className='save-btn'>
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
                className='cancel-btn'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tag;
