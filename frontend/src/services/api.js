
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
