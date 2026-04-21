## API Spec

### GET /api/todos
- **Method:** GET
- **URL:** `/api/todos`
- **Request body:** none
- **Success response:** `200 OK`
  ```json
  [
    { "id": 1, "title": "Buy groceries", "completed": false, "createdAt": "2026-04-21T10:00:00Z" }
  ]
  ```
- **Error responses:** `500` — unexpected server error

---

### POST /api/todos
- **Method:** POST
- **URL:** `/api/todos`
- **Request body:**
  | Field   | Type    | Required |
  |---------|---------|----------|
  | title   | String  | yes      |
- **Success response:** `201 Created`
  ```json
  { "id": 2, "title": "Walk the dog", "completed": false, "createdAt": "2026-04-21T10:05:00Z" }
  ```
- **Error responses:**
  - `400` — title is missing or blank
  - `500` — unexpected server error

---

### GET /api/todos/:id
- **Method:** GET
- **URL:** `/api/todos/{id}`
- **Request body:** none
- **Success response:** `200 OK`
  ```json
  { "id": 1, "title": "Buy groceries", "completed": false, "createdAt": "2026-04-21T10:00:00Z" }
  ```
- **Error responses:**
  - `404` — todo not found
  - `500` — unexpected server error

---

### PUT /api/todos/:id
- **Method:** PUT
- **URL:** `/api/todos/{id}`
- **Request body:**
  | Field     | Type    | Required |
  |-----------|---------|----------|
  | title     | String  | no       |
  | completed | Boolean | no       |
- **Success response:** `200 OK`
  ```json
  { "id": 1, "title": "Buy groceries", "completed": true, "createdAt": "2026-04-21T10:00:00Z" }
  ```
- **Error responses:**
  - `400` — no fields provided or title is blank
  - `404` — todo not found
  - `500` — unexpected server error

---

### DELETE /api/todos/:id
- **Method:** DELETE
- **URL:** `/api/todos/{id}`
- **Request body:** none
- **Success response:** `204 No Content`
- **Error responses:**
  - `404` — todo not found
  - `500` — unexpected server error

---

## DB Schema

### Table: `todos`

| Column       | SQLite Type | Constraints                        |
|--------------|-------------|------------------------------------|
| id           | INTEGER     | PRIMARY KEY AUTOINCREMENT          |
| title        | TEXT        | NOT NULL                           |
| completed    | INTEGER     | NOT NULL DEFAULT 0                 |
| created_at   | TEXT        | NOT NULL DEFAULT (datetime('now')) |

- No foreign keys (single-resource app)
- `completed` stored as INTEGER (0 = false, 1 = true) per SQLite convention

---

## Component Tree

### TodoApp
- **Route:** `/`
- **Props:** none
- **Data fetched:** none (orchestrates children)
- **API endpoints:** none
- **Children:** `TodoForm`, `FilterBar`, `TodoList`

---

### TodoForm
- **Route:** `/`
- **Props:** `onCreated: (todo: object) => void`
- **Data fetched:** none
- **API endpoints:** `POST /api/todos`
- **Children:** none
- **Behaviour:** Controlled input for `title`; calls `createTodo(title)` on submit; invokes `onCreated` with the returned todo on success; shows an inline error message on failure

---

### FilterBar
- **Route:** `/`
- **Props:** `filter: string`, `onFilterChange: (filter: string) => void`
- **Data fetched:** none
- **API endpoints:** none
- **Children:** none
- **Behaviour:** Renders three buttons — "All", "Active", "Completed"; highlights the active filter

---

### TodoList
- **Route:** `/`
- **Props:** `filter: string`, `todos: object[]`, `onToggle: (id: number) => void`, `onDelete: (id: number) => void`
- **Data fetched:** list of todos on mount via `GET /api/todos`
- **API endpoints:** `GET /api/todos`
- **Children:** `TodoItem` (one per todo, filtered by `filter`)
- **Behaviour:** Shows loading state while fetching; shows error state on failure; passes toggle/delete callbacks down

---

### TodoItem
- **Route:** `/`
- **Props:** `todo: { id: number, title: string, completed: boolean, createdAt: string }`, `onToggle: (id: number) => void`, `onDelete: (id: number) => void`
- **Data fetched:** none
- **API endpoints:** `PUT /api/todos/{id}` (toggle), `DELETE /api/todos/{id}` (delete)
- **Children:** none
- **Behaviour:** Checkbox toggles `completed` via `PUT`; delete button calls `DELETE`; title displayed with strikethrough when completed
