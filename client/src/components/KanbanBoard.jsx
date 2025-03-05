import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState({
    todo: [{ id: '1', content: 'Default' }],
    doing: [{ id: '2', content: 'Default' }],
    done: [{ id: '3', content: 'Default' }],
  });

  const addTask = (columnId, content) => {
    if (!content.trim()) return;
    const newTask = { id: Date.now().toString(), content };
    setTasks((prev) => ({
      ...prev,
      [columnId]: [...prev[columnId], newTask],
    }));
  };

  const deleteTask = (columnId, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((task) => task.id !== taskId),
    }));
  };

  const editTask = (columnId, taskId, newContent) => {
    setTasks((prev) => ({
      ...prev,
      [columnId]: prev[columnId].map((task) =>
        task.id === taskId ? { ...task, content: newContent } : task
      ),
    }));
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceColumn = source.droppableId;
    const destinationColumn = destination.droppableId;

    const sourceTasks = Array.from(tasks[sourceColumn]);
    const destinationTasks = Array.from(tasks[destinationColumn]);

    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (sourceColumn === destinationColumn) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setTasks((prev) => ({
        ...prev,
        [sourceColumn]: sourceTasks,
      }));
    } else {
      destinationTasks.splice(destination.index, 0, movedTask);
      setTasks((prev) => ({
        ...prev,
        [sourceColumn]: sourceTasks,
        [destinationColumn]: destinationTasks,
      }));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className='kanban-board'>
        <Column
          title='To Do'
          tasks={tasks.todo}
          id='todo'
          addTask={addTask}
          deleteTask={deleteTask}
          editTask={editTask}
        />
        <Column
          title='Doing'
          tasks={tasks.doing}
          id='doing'
          addTask={addTask}
          deleteTask={deleteTask}
          editTask={editTask}
        />
        <Column
          title='Done'
          tasks={tasks.done}
          id='done'
          addTask={addTask}
          deleteTask={deleteTask}
          editTask={editTask}
        />
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
