import React, { useState, useEffect } from 'react'
import TodoForm from './TodoForm'
import FilterBar from './FilterBar'
import TodoList from './TodoList'
import { getTodos } from '../services/api'
import styles from './TodoApp.module.css'

export default function TodoApp() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleCreated(todo) {
    setTodos((prev) => [...prev, todo])
  }

  function handleToggle(updatedTodo) {
    setTodos((prev) =>
      prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
    )
  }

  function handleDelete(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Todo List</h1>
      <TodoForm onCreated={handleCreated} />
      <FilterBar filter={filter} onFilterChange={setFilter} />
      {loading && <p className={styles.status}>Loading...</p>}
      {error && <p className={styles.error}>Error: {error}</p>}
      {!loading && !error && (
        <TodoList
          todos={todos}
          filter={filter}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
