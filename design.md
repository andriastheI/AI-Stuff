## API Spec

### GET /api/todos

- **Description:** Retrieve all todo items
- **Request body:** None
- **Success response:** HTTP 200
  - body: array of todo objects
    - id: integer
    - title: string
    - description: string or null
    - completed: boolean
    - createdAt: string (ISO 8601 datetime)
    - updatedAt: string (ISO 8601 datetime)
- **Error responses:**
  - 500 Internal Server Error — unexpected server failure

---

### GET /api/todos/{id}

- **Description:** Retrieve a single todo item by ID
- **URL parameters:** id (integer, required)
- **Request body:** None
- **Success response:** HTTP 200
  - body: single todo object
    - id: integer
    - title: string
    - description: string or null
    - completed: boolean
    - createdAt: string (ISO 8601 datetime)
    - updatedAt: string (ISO 8601 datetime)
- **Error responses:**
  - 404 Not Found — no todo exists with the given id
  - 400 Bad Request — id is not a valid integer
  - 500 Internal Server Error — unexpected server failure

---

### POST /api/todos

- **Description:** Create a new todo item
- **Request body:** JSON object
  - title: string, required
  - description: string, optional
  - completed: boolean, optional (defaults to false)
- **Success response:** HTTP 201
  - body: created todo object
    - id: integer
    - title: string
    - description: string or null
    - completed: boolean
    - createdAt: string (ISO 8601 datetime)
    - updatedAt: string (ISO 8601 datetime)
- **Error responses:**
  - 400 Bad Request — missing required field title, or title is blank
  - 500 Internal Server Error — unexpected server failure

---

### PUT /api/todos/{id}

- **Description:** Update an existing todo item
- **URL parameters:** id (integer, required)
- **Request body:** JSON object (all fields optional; at least one must be present)
  - title: string, optional
  - description: string or null, optional
  - completed: boolean, optional
- **Success response:** HTTP 200
  - body: updated todo object
    - id: integer
    - title: string
    - description: string or null
    - completed: boolean
    - createdAt: string (ISO 8601 datetime)
    - updatedAt: string (ISO 8601 datetime)
- **Error responses:**
  - 400 Bad Request — id is not a valid integer, or request body is empty / malformed
  - 404 Not Found — no todo exists with the given id
  - 500 Internal Server Error — unexpected server failure

---

### DELETE /api/todos/{id}

- **Description:** Delete a todo item by ID
- **URL parameters:** id (integer, required)
- **Request body:** None
- **Success response:** HTTP 204 No Content — empty body
- **Error responses:**
  - 400 Bad Request — id is not a valid integer
  - 404 Not Found — no todo exists with the given id
  - 500 Internal Server Error — unexpected server failure

---

## DB Schema

### Table: todos

| Column      | SQLite Type | Constraints                              |
|-------------|-------------|------------------------------------------|
| id          | INTEGER     | PRIMARY KEY AUTOINCREMENT                |
| title       | TEXT        | NOT NULL                                 |
| description | TEXT        | (nullable, no constraint)                |
| completed   | INTEGER     | NOT NULL DEFAULT 0 (0 = false, 1 = true) |
| created_at  | TEXT        | NOT NULL                                 |
| updated_at  | TEXT        | NOT NULL                                 |

- No foreign keys (single-resource application, one user role, no authentication table required)
- `completed` stored as INTEGER because SQLite has no native BOOLEAN type; 0 represents false, 1 represents true
- `created_at` and `updated_at` stored as TEXT in ISO 8601 format (e.g. "2026-04-21T14:00:00Z")

---

## Component Tree

### App

- **Route:** / (root, wraps all routes)
- **Props:** none
- **Data fetched/displayed:** none directly; sets up routing context
- **API endpoints called:** none
- **Children:** TodoListPage, TodoDetailPage

---

### TodoListPage

- **Route:** /
- **Props:** none
- **Data fetched/displayed:** fetches and displays the full list of todo items; shows total count and completion status summary
- **API endpoints called:**
  - GET /api/todos (on mount and after any mutation)
  - DELETE /api/todos/{id} (delegated through child)
- **Children:** TodoForm, TodoList

---

### TodoForm

- **Route:** / (rendered within TodoListPage)
- **Props:**
  - onCreated: () => void (callback to refresh list after creation)
- **Data fetched/displayed:** controlled form inputs for creating a new todo; displays validation error messages
- **API endpoints called:**
  - POST /api/todos (on form submit)
- **Children:** none

---

### TodoList

- **Route:** / (rendered within TodoListPage)
- **Props:**
  - todos: Todo[] (array of todo objects passed from TodoListPage)
  - onDeleted: (id: number) => void (callback after deletion)
  - onToggled: (id: number, completed: boolean) => void (callback after completion toggle)
- **Data fetched/displayed:** renders the ordered list of todo items
- **API endpoints called:**
  - DELETE /api/todos/{id} (on delete button click)
  - PUT /api/todos/{id} (on completion checkbox toggle)
- **Children:** TodoItem

---

### TodoItem

- **Route:** / (rendered within TodoList)
- **Props:**
  - todo: Todo (single todo object: id, title, description, completed, createdAt, updatedAt)
  - onDeleted: (id: number) => void
  - onToggled: (id: number, completed: boolean) => void
- **Data fetched/displayed:** displays title, description, completed status, and timestamps for one todo; provides delete button and completed checkbox; provides link to detail page
- **API endpoints called:**
  - DELETE /api/todos/{id} (on delete action)
  - PUT /api/todos/{id} (on toggle action)
- **Children:** none

---

### TodoDetailPage

- **Route:** /todos/:id
- **Props:** none (reads id from URL params)
- **Data fetched/displayed:** fetches and displays full details of a single todo; provides an inline edit form for title, description, and completed; shows createdAt and updatedAt timestamps
- **API endpoints called:**
  - GET /api/todos/{id} (on mount)
  - PUT /api/todos/{id} (on edit form submit)
  - DELETE /api/todos/{id} (on delete button; redirects to / after deletion)
- **Children:** TodoEditForm

---

### TodoEditForm

- **Route:** /todos/:id (rendered within TodoDetailPage)
- **Props:**
  - todo: Todo (current todo values used to pre-populate form fields)
  - onUpdated: (updated: Todo) => void (callback with updated todo after successful PUT)
- **Data fetched/displayed:** controlled form pre-filled with existing title, description, and completed values; displays validation and server error messages
- **API endpoints called:**
  - PUT /api/todos/{id} (on form submit)
- **Children:** none
