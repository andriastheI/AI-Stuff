## Third-Pass Review — Full Audit

---

## Contract Audit

### GET /api/todos
- Backend: `get { }` inside `route("/api/todos")` ✅
- Frontend: `fetch('/api/todos')` ✅
- Response shape: `id, title, description, completed, createdAt, updatedAt` — matches on both sides ✅
- **OK: GET /api/todos**

### GET /api/todos/{id}
- Backend: `get("/{id}") { }` ✅
- Frontend: `` fetch(`/api/todos/${id}`) `` ✅
- Status codes: 200 / 400 / 404 all handled ✅
- **OK: GET /api/todos/{id}**

### POST /api/todos
- Backend: `post { }`, returns 201 ✅
- Frontend: POST with `Content-Type: application/json` ✅
- Request body `{ title, description, completed }` matches `CreateTodo` ✅
- **OK: POST /api/todos**

### PUT /api/todos/{id}
- Backend: `put("/{id}") { }` ✅
- Frontend: PUT with `Content-Type: application/json` ✅
- Validation: `&&` operator correctly rejects only empty body ✅
- Description update: unconditional `it[description] = body.description` ✅
- **OK: PUT /api/todos/{id}**

### DELETE /api/todos/{id}
- Backend: `delete("/{id}") { }`, returns 204 ✅
- Frontend: DELETE with correct status handling ✅
- Status codes: 204 / 400 / 404 all handled ✅
- **OK: DELETE /api/todos/{id}**

---

## Frontend Review

### App
- Both routes defined correctly (`/` and `/todos/:id`) ✅
- No props, no PropTypes needed ✅

### TodoListPage
- `prop-types` import removed ✅
- Loading state: `{loading && <p>Loading...</p>}` ✅
- Error state: `{error && <p className={styles.error}>{error}</p>}` ✅
- Summary hidden during loading and error ✅

### TodoForm
- `PropTypes.func.isRequired` defined for `onCreated` ✅
- Error and submitting states handled ✅
- Sends `description: description || undefined` (omits key when blank — correct for POST) ✅

### propTypes.js *(new file)*
- `TodoShape` exported and imported correctly by both `TodoList` and `TodoItem` ✅
- Eliminates the previous duplicated shape definition ✅

### TodoList
- Uses `PropTypes.arrayOf(TodoShape)` ✅
- Empty state message rendered ✅

### TodoItem ❌
- Inline `actionError` state replaces `alert()` ✅
- Uses `TodoShape.isRequired` ✅
- **`handleToggle` still sends only `{ completed: !todo.completed }` — bug not fixed.**
  The backend now writes `it[description] = body.description` unconditionally. Since
  `description` is not included in the toggle payload, Kotlin deserialises it as `null`
  (the `UpdateTodo` default), and the column is set to `NULL`. Any todo with a description
  loses it silently on the first checkbox click.

### TodoDetailPage
- `styles.loading` used for the loading spinner (no longer ambiguous with `styles.status`) ✅
- Cancellation guard (`cancelled` flag) prevents setState on unmount ✅
- Loading and error states handled ✅

### TodoEditForm
- `useEffect(() => { setSaved(false); }, [todo.id])` resets the "Saved!" banner ✅
- Error, submitting, and saved states all handled ✅
- Sends all three fields (`title`, `description`, `completed`) on submit — correct ✅

**Frontend Quality: 4/5** — One remaining data-loss bug in `TodoItem.handleToggle`; everything else is clean.

---

## Backend Review

### GET /api/todos
- `Todos.selectAll().map { rowToTodo(it) }` inside `transaction { }` ✅
- Returns 200 with list ✅
- try/catch ✅

### GET /api/todos/{id}
- `toIntOrNull()` guard returns 400 on bad id ✅
- `singleOrNull()` returns 404 on missing record ✅
- try/catch ✅

### POST /api/todos
- `body.title.isBlank()` correctly rejects whitespace-only titles ✅
- Returns 201 with created todo ✅
- try/catch ✅

### PUT /api/todos/{id}
- `body.title == null && body.description == null && body.completed == null` correctly
  returns 400 only when body is completely empty ✅
- `body.title?.let { t -> it[title] = t }` — title conditionally updated ✅
- `it[description] = body.description` — description always written, enabling null-clear ✅
- `body.completed?.let { c -> it[completed] = if (c) 1 else 0 }` — completed conditionally updated ✅
- Returns 200 with re-fetched row, 404 when not found ✅
- try/catch ✅

### DELETE /api/todos/{id}
- Existence check before delete returns 404 correctly ✅
- Returns 204 on success ✅
- try/catch ✅

**Backend Quality: 5/5** — All routes fully implemented with correct status codes, Exposed transactions, and error handling. No issues.

---

## Priority 1 — Fix Before Running

```
File: frontend/src/components/TodoItem.jsx  (handleToggle)
Issue: Toggle only sends { completed: !todo.completed } to the PUT endpoint.
       The backend unconditionally writes body.description to the DB column.
       Since description is absent from the payload, Kotlin defaults it to null,
       silently erasing the description of any todo that has one.

Fix:

Before:
  await updateTodo(todo.id, { completed: !todo.completed });

After:
  await updateTodo(todo.id, {
    title: todo.title,
    description: todo.description,
    completed: !todo.completed,
  });
```

---

## Priority 2 — Fix Before Shipping

No issues. All previous Priority 2 items are resolved.

---

## Priority 3 — Nice to Have

- **`Application.kt`** — `allowHost("localhost:5173")` is hardcoded. Add an environment
  variable fallback so staging and production deployments don't require a code change.

- **`TodoDetailPage.jsx`** — `<TodoEditForm>` has no `key` prop. React will reuse the
  same component instance if the parent rerenders without a route change. Adding
  `key={todo.id}` guarantees a clean remount with fresh local state whenever a different
  todo is loaded.

---

## Quick Win

One line in `TodoItem.jsx` — include the current todo fields in the toggle call:

**Before:**
```js
await updateTodo(todo.id, { completed: !todo.completed });
```

**After:**
```js
await updateTodo(todo.id, {
  title: todo.title,
  description: todo.description,
  completed: !todo.completed,
});
```

No backend change needed. Fixes the description data-loss bug in under two minutes.
