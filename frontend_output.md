```json
// FILE: frontend/package.json
{
  "name": "todo-list-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.1"
  }
}
```
Defines the project metadata, run scripts, and dependencies for the React + Vite frontend.

```javascript
// FILE: frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```
Configures Vite with the React plugin and proxies all `/api` requests to the Ktor backend on port 3001 to avoid CORS issues in development.

```jsx
// FILE: frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```
Entry point that mounts the React app inside a `BrowserRouter` for client-side routing.

```jsx
// FILE: frontend/src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import TodoApp from './components/TodoApp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TodoApp />} />
    </Routes>
  )
}
```
Defines the single route `/` mapping to the `TodoApp` page component.

```javascript
// FILE: frontend/src/services/api.js

// GET /api/todos — fetches all todo items, returns array
export async function getTodos() {
  const res = await fetch('/api/todos')
  if (!res.ok) throw new Error(`Failed to fetch todos: ${res.status}`)
  return res.json()
}

// POST /api/todos — creates a new todo, returns the created object
export async function createTodo(title) {
  const res = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error(`Failed to create todo: ${res.status}`)
  return res.json()
}

// GET /api/todos/:id — fetches a single todo by id
export async function getTodoById(id) {
  const res = await fetch(`/api/todos/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch todo ${id}: ${res.status}`)
  return res.json()
}

// PUT /api/todos/:id — updates a todo (title and/or completed), returns updated object
export async function updateTodo(id, fields) {
  const res = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  })
  if (!res.ok) throw new Error(`Failed to update todo ${id}: ${res.status}`)
  return res.json()
}

// DELETE /api/todos/:id — deletes a todo, returns nothing (204)
export async function deleteTodo(id) {
  const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete todo ${id}: ${res.status}`)
}
```
Exports one async function per API endpoint; each function throws a descriptive `Error` on non-2xx responses.

```jsx
// FILE: frontend/src/components/TodoApp.jsx
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
```
Top-level page component that owns the todo state, fetches data on mount, and passes callbacks to children.

```css
/* FILE: frontend/src/components/TodoApp.module.css */
.container {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 16px;
}

.heading {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 24px;
  color: #2d3748;
}

.status {
  text-align: center;
  color: #718096;
  margin-top: 16px;
}

.error {
  text-align: center;
  color: #e53e3e;
  margin-top: 16px;
}
```
Styles the main container, heading, and status/error messages for `TodoApp`.

```jsx
// FILE: frontend/src/components/TodoForm.jsx
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
```
Controlled form that POSTs a new todo to the API and calls `onCreated` with the result; disables the button while submitting.

```css
/* FILE: frontend/src/components/TodoForm.module.css */
.form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  min-width: 0;
}

.input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.3);
}

.button {
  padding: 10px 20px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  width: 100%;
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 4px;
}
```
Styles the add-todo form with a flexible input and button layout.

```jsx
// FILE: frontend/src/components/FilterBar.jsx
import React from 'react'
import PropTypes from 'prop-types'
import styles from './FilterBar.module.css'

const FILTERS = ['All', 'Active', 'Completed']

export default function FilterBar({ filter, onFilterChange }) {
  return (
    <div className={styles.bar}>
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`${styles.button} ${filter === f ? styles.active : ''}`}
          onClick={() => onFilterChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
  )
}

FilterBar.propTypes = {
  filter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
}
```
Renders three filter buttons (All / Active / Completed) and highlights the currently selected one.

```css
/* FILE: frontend/src/components/FilterBar.module.css */
.bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.button {
  padding: 6px 16px;
  border: 1px solid #cbd5e0;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4a5568;
  transition: background 0.15s, color 0.15s;
}

.button:hover {
  background: #ebf8ff;
  border-color: #4299e1;
}

.active {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}
```
Styles the filter button strip with pill-shaped buttons and an active highlight.

```jsx
// FILE: frontend/src/components/TodoList.jsx
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
```
Filters the todos array by the active filter and renders a `TodoItem` for each; shows an empty-state message when the list is empty.

```css
/* FILE: frontend/src/components/TodoList.module.css */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.empty {
  text-align: center;
  color: #a0aec0;
  margin-top: 24px;
  font-style: italic;
}
```
Resets the list styles and centres the empty-state message.

```jsx
// FILE: frontend/src/components/TodoItem.jsx
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
```
Renders a single todo row with a checkbox for toggling completion and a delete button; calls the appropriate API endpoints on interaction.

```css
/* FILE: frontend/src/components/TodoItem.module.css */
.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 8px;
  border-bottom: 1px solid #edf2f7;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
}

.title {
  flex: 1;
  font-size: 1rem;
  color: #2d3748;
  word-break: break-word;
}

.done {
  text-decoration: line-through;
  color: #a0aec0;
}

.deleteBtn {
  background: none;
  border: none;
  color: #fc8181;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.deleteBtn:hover {
  background: #fff5f5;
}

.deleteBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.error {
  color: #e53e3e;
  font-size: 0.75rem;
  width: 100%;
}
```
Styles the individual todo row with a flexible layout, strikethrough for completed items, and a red delete button.

```css
/* FILE: frontend/src/index.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
  background-color: #f7fafc;
  color: #2d3748;
  line-height: 1.5;
}
```
Global CSS reset and base body styles applied to the entire application.
