import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { updateTodo, deleteTodo } from '../services/api'
import styles from './TodoItem.module.css'

export default function TodoItem({ todo, onToggle, onDelete }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleToggle() {
    setBusy(true)
    setError(null)
    try {
      const updated = await updateTodo(todo.id, { completed: !todo.completed })
      onToggle(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    setError(null)
    try {
      await deleteTodo(todo.id)
      onDelete(todo.id)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <li className={styles.item}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={todo.completed}
        onChange={handleToggle}
        disabled={busy}
      />
      <span className={`${styles.title} ${todo.completed ? styles.done : ''}`}>
        {todo.title}
      </span>
      <button
        className={styles.deleteBtn}
        onClick={handleDelete}
        disabled={busy}
        aria-label="Delete todo"
      >
        ✕
      </button>
      {error && <span className={styles.error}>{error}</span>}
    </li>
  )
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
