import React from 'react'
import PropTypes from 'prop-types'
import TodoItem from './TodoItem'
import styles from './TodoList.module.css'

export default function TodoList({ todos, filter, onToggle, onDelete }) {
  const filtered = todos.filter((t) => {
    if (filter === 'Active') return !t.completed
    if (filter === 'Completed') return t.completed
    return true
  })

  if (filtered.length === 0) {
    return <p className={styles.empty}>No todos here.</p>
  }

  return (
    <ul className={styles.list}>
      {filtered.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  filter: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
