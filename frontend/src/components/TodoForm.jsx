import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { createTodo } from '../services/api'
import styles from './TodoForm.module.css'

export default function TodoForm({ onCreated }) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const todo = await createTodo(title.trim())
      onCreated(todo)
      setTitle('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={submitting}
      />
      <button className={styles.button} type="submit" disabled={submitting || !title.trim()}>
        {submitting ? 'Adding...' : 'Add'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  )
}

TodoForm.propTypes = {
  onCreated: PropTypes.func.isRequired,
}
