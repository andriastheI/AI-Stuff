```json
// FILE: frontend/package.json
{
  "name": "todo-frontend",
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
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```
Defines the project name, scripts, and all runtime and dev dependencies needed to build and run the Vite + React app.

```js
// FILE: frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
```
Registers the React plugin and proxies all `/api` requests to the backend at port 3001, eliminating CORS errors during local development.

```jsx
// FILE: frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```
Entry point that mounts the React app inside a `BrowserRouter` so all route-aware components have access to routing context.

```jsx
// FILE: frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import TodoListPage from './components/TodoListPage';
import TodoDetailPage from './components/TodoDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TodoListPage />} />
      <Route path="/todos/:id" element={<TodoDetailPage />} />
    </Routes>
  );
}
```
Defines the two top-level routes: the list page at `/` and the detail page at `/todos/:id`.

```js
// FILE: frontend/src/services/api.js

// GET /api/todos — retrieves all todo items
export async function getTodos() {
  const res = await fetch('/api/todos');
  if (!res.ok) throw new Error(`Failed to fetch todos: ${res.status}`);
  return res.json();
}

// GET /api/todos/{id} — retrieves a single todo by id
export async function getTodo(id) {
  const res = await fetch(`/api/todos/${id}`);
  if (res.status === 404) throw new Error('Todo not found');
  if (res.status === 400) throw new Error('Invalid todo id');
  if (!res.ok) throw new Error(`Failed to fetch todo ${id}: ${res.status}`);
  return res.json();
}

// POST /api/todos — creates a new todo, returns the created object
export async function createTodo(data) {
  const res = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.status === 400) throw new Error('Title is required and must not be blank');
  if (!res.ok) throw new Error(`Failed to create todo: ${res.status}`);
  return res.json();
}

// PUT /api/todos/{id} — updates an existing todo, returns the updated object
export async function updateTodo(id, data) {
  const res = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.status === 404) throw new Error('Todo not found');
  if (res.status === 400) throw new Error('Invalid request: check id and body');
  if (!res.ok) throw new Error(`Failed to update todo ${id}: ${res.status}`);
  return res.json();
}

// DELETE /api/todos/{id} — deletes a todo by id, returns nothing on success
export async function deleteTodo(id) {
  const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
  if (res.status === 404) throw new Error('Todo not found');
  if (res.status === 400) throw new Error('Invalid todo id');
  if (!res.ok) throw new Error(`Failed to delete todo ${id}: ${res.status}`);
}
```
Exports one async function per API endpoint; each uses `fetch`, sets the correct method and headers, and throws descriptive errors on non-2xx responses.

```jsx
// FILE: frontend/src/components/TodoListPage.jsx
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getTodos } from '../services/api';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import styles from './TodoListPage.module.css';

export default function TodoListPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Todos</h1>
      {!loading && !error && (
        <p className={styles.summary}>
          {todos.length} total &mdash; {completedCount} completed
        </p>
      )}
      <TodoForm onCreated={fetchTodos} />
      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <TodoList
          todos={todos}
          onDeleted={fetchTodos}
          onToggled={fetchTodos}
        />
      )}
    </div>
  );
}
```
Fetches the full todo list on mount, shows a count/completion summary, and re-fetches after any create, delete, or toggle action.

```css
/* FILE: frontend/src/components/TodoListPage.module.css */
.page {
  max-width: 640px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.heading {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.summary {
  color: #555;
  margin-bottom: 1.5rem;
}

.error {
  color: #c0392b;
  font-weight: 500;
}
```
Styles the list page with a centered, readable layout and coloured error text.

```jsx
// FILE: frontend/src/components/TodoForm.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { createTodo } from '../services/api';
import styles from './TodoForm.module.css';

export default function TodoForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createTodo({ title, description: description || undefined });
      setTitle('');
      setDescription('');
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>New Todo</h2>
      {error && <p className={styles.error}>{error}</p>}
      <label className={styles.label}>
        Title
        <input
          className={styles.input}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </label>
      <label className={styles.label}>
        Description
        <input
          className={styles.input}
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </label>
      <button className={styles.button} type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add Todo'}
      </button>
    </form>
  );
}

TodoForm.propTypes = {
  onCreated: PropTypes.func.isRequired,
};
```
Controlled form for creating a new todo; calls `onCreated` after a successful POST so the parent can refresh the list.

```css
/* FILE: frontend/src/components/TodoForm.module.css */
.form {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.heading {
  font-size: 1.1rem;
  margin: 0;
}

.label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.input {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.button {
  align-self: flex-start;
  padding: 0.45rem 1rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #c0392b;
  font-size: 0.9rem;
}
```
Styles the creation form as a contained card with a clearly labelled submit button and disabled state.

```jsx
// FILE: frontend/src/components/TodoList.jsx
import PropTypes from 'prop-types';
import TodoItem from './TodoItem';
import styles from './TodoList.module.css';

export default function TodoList({ todos, onDeleted, onToggled }) {
  if (todos.length === 0) {
    return <p className={styles.empty}>No todos yet. Add one above!</p>;
  }

  return (
    <ul className={styles.list}>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDeleted={onDeleted}
          onToggled={onToggled}
        />
      ))}
    </ul>
  );
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    completed: PropTypes.bool.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  })).isRequired,
  onDeleted: PropTypes.func.isRequired,
  onToggled: PropTypes.func.isRequired,
};
```
Renders the ordered list of `TodoItem` components, or an empty-state message when no todos exist.

```css
/* FILE: frontend/src/components/TodoList.module.css */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty {
  color: #888;
  font-style: italic;
}
```
Removes default list styling and stacks items with a consistent gap.

```jsx
// FILE: frontend/src/components/TodoItem.jsx
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { deleteTodo, updateTodo } from '../services/api';
import styles from './TodoItem.module.css';

export default function TodoItem({ todo, onDeleted, onToggled }) {
  async function handleDelete() {
    try {
      await deleteTodo(todo.id);
      onDeleted(todo.id);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleToggle() {
    try {
      await updateTodo(todo.id, { completed: !todo.completed });
      onToggled(todo.id, !todo.completed);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <li className={`${styles.item} ${todo.completed ? styles.done : ''}`}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={todo.completed}
        onChange={handleToggle}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <div className={styles.body}>
        <Link className={styles.title} to={`/todos/${todo.id}`}>
          {todo.title}
        </Link>
        {todo.description && (
          <p className={styles.description}>{todo.description}</p>
        )}
        <p className={styles.meta}>
          Created: {new Date(todo.createdAt).toLocaleString()}
        </p>
      </div>
      <button className={styles.deleteBtn} onClick={handleDelete} aria-label="Delete todo">
        Delete
      </button>
    </li>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    completed: PropTypes.bool.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
  onDeleted: PropTypes.func.isRequired,
  onToggled: PropTypes.func.isRequired,
};
```
Displays a single todo with a completion checkbox, a link to its detail page, and a delete button; calls the appropriate parent callbacks after each mutation.

```css
/* FILE: frontend/src/components/TodoItem.module.css */
.item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
}

.item.done {
  opacity: 0.55;
}

.checkbox {
  margin-top: 0.2rem;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  flex-shrink: 0;
}

.body {
  flex: 1;
}

.title {
  font-weight: 600;
  color: #1d4ed8;
  text-decoration: none;
}

.title:hover {
  text-decoration: underline;
}

.description {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  color: #555;
}

.meta {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: #999;
}

.deleteBtn {
  padding: 0.3rem 0.7rem;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.deleteBtn:hover {
  background: #dc2626;
}
```
Styles each todo as a card row with a muted appearance when completed and a red delete button.

```jsx
// FILE: frontend/src/components/TodoDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTodo, deleteTodo } from '../services/api';
import TodoEditForm from './TodoEditForm';
import styles from './TodoDetailPage.module.css';

export default function TodoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTodo(id)
      .then(data => { if (!cancelled) setTodo(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  async function handleDelete() {
    try {
      await deleteTodo(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className={styles.status}>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/')}>
        ← Back to list
      </button>
      <h1 className={styles.title}>{todo.title}</h1>
      <p className={styles.meta}>
        Created: {new Date(todo.createdAt).toLocaleString()} &nbsp;|&nbsp;
        Updated: {new Date(todo.updatedAt).toLocaleString()}
      </p>
      <p className={styles.status}>
        Status: <strong>{todo.completed ? 'Completed' : 'Incomplete'}</strong>
      </p>
      {todo.description && (
        <p className={styles.description}>{todo.description}</p>
      )}
      <TodoEditForm todo={todo} onUpdated={setTodo} />
      <button className={styles.deleteBtn} onClick={handleDelete}>
        Delete Todo
      </button>
    </div>
  );
}
```
Fetches a single todo by URL param on mount, renders its details and an inline edit form, and navigates back to `/` after deletion.

```css
/* FILE: frontend/src/components/TodoDetailPage.module.css */
.page {
  max-width: 640px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.back {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0;
  margin-bottom: 1rem;
}

.back:hover {
  text-decoration: underline;
}

.title {
  font-size: 1.8rem;
  margin: 0 0 0.25rem;
}

.meta {
  font-size: 0.82rem;
  color: #999;
  margin-bottom: 0.5rem;
}

.status {
  margin-bottom: 0.5rem;
}

.description {
  color: #444;
  margin-bottom: 1.5rem;
}

.error {
  color: #c0392b;
  font-weight: 500;
}

.deleteBtn {
  margin-top: 1.5rem;
  padding: 0.45rem 1rem;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
}

.deleteBtn:hover {
  background: #dc2626;
}
```
Styles the detail page with a back link, readable type hierarchy, and a destructive delete button at the bottom.

```jsx
// FILE: frontend/src/components/TodoEditForm.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { updateTodo } from '../services/api';
import styles from './TodoEditForm.module.css';

export default function TodoEditForm({ todo, onUpdated }) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');
  const [completed, setCompleted] = useState(todo.completed);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const updated = await updateTodo(todo.id, {
        title,
        description: description || null,
        completed,
      });
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>Edit Todo</h2>
      {error && <p className={styles.error}>{error}</p>}
      {saved && <p className={styles.success}>Saved!</p>}
      <label className={styles.label}>
        Title
        <input
          className={styles.input}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </label>
      <label className={styles.label}>
        Description
        <input
          className={styles.input}
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </label>
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          checked={completed}
          onChange={e => setCompleted(e.target.checked)}
        />
        Completed
      </label>
      <button className={styles.button} type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

TodoEditForm.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
  onUpdated: PropTypes.func.isRequired,
};
```
Pre-populated edit form that issues a PUT on submit and calls `onUpdated` with the returned todo so the parent can reflect changes immediately.

```css
/* FILE: frontend/src/components/TodoEditForm.module.css */
.form {
  background: #f0f4ff;
  border: 1px solid #c7d2fe;
  border-radius: 6px;
  padding: 1.25rem;
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.heading {
  font-size: 1.1rem;
  margin: 0;
}

.label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.input {
  padding: 0.4rem 0.6rem;
  border: 1px solid #a5b4fc;
  border-radius: 4px;
  font-size: 1rem;
}

.checkLabel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.button {
  align-self: flex-start;
  padding: 0.45rem 1rem;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #c0392b;
  font-size: 0.9rem;
}

.success {
  color: #16a34a;
  font-size: 0.9rem;
  font-weight: 500;
}
```
Styles the edit form with a blue-tinted background to visually distinguish it from the creation form, with success and error feedback.

```css
/* FILE: frontend/src/index.css */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f3f4f6;
  color: #111827;
  line-height: 1.5;
}
```
Global CSS reset and base body styles applied before any component styles are loaded.
