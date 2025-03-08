import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ListMenu = ({ deleteColumn, id, setActiveMenuColumn }) => {
  return (
    <div className='menu'>
      <div className='menu-header'>
        <h5>List Actions</h5>
        <div className='header-btn'>
          <button
            className='close-list-menu-btn'
            onClick={() => setActiveMenuColumn(null)}
            title='Close'
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
      <button onClick={() => deleteColumn(id)}>Delete column</button>
    </div>
  );
};

export default ListMenu;
