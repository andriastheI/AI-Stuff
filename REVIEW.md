## Contract Audit

### GET /api/todos
- Backend: `get { }` inside `route("/api/todos")` — correct path and method ✅
- Frontend: `fetch('/api/todos')` in `getTodos()` — correct ✅
- Response shape: backend `Todo` serializes `id, title, description, completed, createdAt, updatedAt`; frontend destructures the same fields ✅
- **OK: GET /api/todos**

### GET /api/todos/{id}
- Backend: `get("/{id}") { }` — correct path and method ✅
- Frontend: `` fetch(`/api/todos/${id}`) `` in `getTodo(id)` — correct ✅
- Response shape: backend returns `rowToTodo(row)` which is `Todo` — matches frontend expectations ✅
- Status codes: 200 / 400 / 404 all present ✅
- **OK: GET /api/todos/{id}**

### POST /api/todos
- Backend: `post { }` responds with `HttpStatusCode.Created` (201) ✅
- Frontend: `fetch('/api/todos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })` ✅
- Request body: frontend sends `{ title, description }` matching `CreateTodo(title, description?, completed?)` ✅
- Response shape: `Todo` object returned and destructured correctly ✅
- **OK: POST /api/todos**

### PUT /api/todos/{id}
- Backend: `put("/{id}") { }` — correct path and method ✅
- Frontend: `` fetch(`/api/todos/${id}`, { method: 'PUT', ... }) `` ✅
- Request/response shape: frontend sends `{ title, description, completed }` matching `UpdateTodo`; backend returns `Todo` ✅
- **MISMATCH: PUT /api/todos/{id} — validation logic uses `||` instead of `&&`**
  The backend check `if (body.title == null || body.description == null || body.completed == null)` returns 400 whenever *any* field is absent, making every partial update impossible. Toggle requests (`{ completed: true }`) fail because `title == null`. Edit-form requests with `description: null` fail because `description == null`. This breaks the spec requirement that "at least one field must be present."

### DELETE /api/todos/{id}
- Backend: `delete("/{id}") { }` — correct path and method ✅
- Frontend: `` fetch(`/api/todos/${id}`, { method: 'DELETE' }) `` ✅
- Status codes: 204 / 400 / 404 all present ✅
- **OK: DELETE /api/todos/{id}**

---

## Frontend Review

### App
- Exists in `App.jsx` ✅
- Sets up two routes: `/` → `TodoListPage`, `/todos/:id` → `TodoDetailPage` ✅
- No loading/error/PropTypes needed for a pure routing shell ✅

### TodoListPage
- Exists in `TodoListPage.jsx` ✅
- Loading state: `{loading && <p>Loading...</p>}` ✅
- Error state: `{error && <p className={styles.error}>{error}</p>}` ✅
- PropTypes: component takes no props — none needed ✅
- Unused import: `import PropTypes from 'prop-types'` is present but never used; `prop-types` is also **missing from `package.json`** — see Priority 1

### TodoForm
- Exists in `TodoForm.jsx` ✅
- Error state: `{error && <p className={styles.error}>{error}</p>}` ✅
- Submitting state: button disabled while in-flight ✅
- PropTypes defined: `onCreated: PropTypes.func.isRequired` ✅

### TodoList
- Exists in `TodoList.jsx` ✅
- Empty state message rendered when `todos.length === 0` ✅
- No internal loading/error state (handled by parent) — acceptable ✅
- PropTypes defined with full shape ✅

### TodoItem
- Exists in `TodoItem.jsx` ✅
- PropTypes defined ✅
- Error feedback uses `alert(err.message)` — poor UX, no inline error display
- `onDeleted` callback signature: design spec says `(id: number) => void`, but `TodoListPage` passes `fetchTodos` (no-argument function). `TodoItem` calls `onDeleted(todo.id)` — the argument is silently ignored. Functionally correct but the type contract is violated.

### TodoDetailPage
- Exists in `TodoDetailPage.jsx` ✅
- Loading state: early return `<p>Loading...</p>` ✅
- Error state: early return `<p className={styles.error}>{error}</p>` ✅
- Cancellation guard (`cancelled` flag) prevents setState after unmount ✅
- No PropTypes needed (no props) ✅

### TodoEditForm
- Exists in `TodoEditForm.jsx` ✅
- Error state: `{error && <p className={styles.error}>{error}</p>}` ✅
- Submitting state: button disabled while in-flight ✅
- Success feedback: `{saved && <p className={styles.success}>Saved!</p>}` ✅
- PropTypes defined ✅
- Issue: `saved` state is never reset when the parent passes a new `todo` prop (on navigate). Harmless here because the page remounts on route change, but fragile.

**Frontend Quality: 3/5** — Structure and state management are solid, but a missing package dependency (`prop-types`) will crash the dev server before a single component renders.

---

## Backend Review

### GET /api/todos
- Fully implemented ✅
- `transaction { Todos.selectAll().map { rowToTodo(it) } }` — correct Exposed usage ✅
- HTTP 200 ✅
- try/catch wrapping full handler ✅
- No SQL injection risk (Exposed parameterized queries) ✅

### GET /api/todos/{id}
- Fully implemented ✅
- `toIntOrNull()` guard returns 400 on bad id ✅
- `singleOrNull()` returns 404 on missing record ✅
- HTTP 200 / 400 / 404 all correct ✅
- try/catch ✅

### POST /api/todos
- Fully implemented ✅
- HTTP 201 ✅
- `body.title.isEmpty()` check misses blank titles (whitespace-only strings like `"   "` pass validation) — spec says "title is blank" should be 400; fix: use `isBlank()` instead of `isEmpty()`
- try/catch ✅

### PUT /api/todos/{id}
- **Critical validation bug:** `if (body.title == null || body.description == null || body.completed == null)` uses `||` (OR), meaning 400 is returned whenever *any* field is missing. Fix: use `&&` (AND) so 400 is returned only when all three are null (empty body).
- **Description cannot be cleared:** `body.description?.let { d -> it[description] = d }` skips the column update when description is null. If a user clears the description field in the edit form, the PUT sends `description: null` but the backend silently ignores it. Fix: apply description update unconditionally — `it[description] = body.description`.
- HTTP 200 / 400 / 404 correct (once bug is fixed) ✅
- try/catch ✅

### DELETE /api/todos/{id}
- Fully implemented ✅
- HTTP 204 ✅
- `singleOrNull()` check before delete returns 404 correctly ✅
- try/catch ✅
- No SQL injection risk ✅

**Backend Quality: 2/5** — The PUT validation bug renders the most-used mutation endpoint (toggle complete, update title, clear description) completely broken at runtime; the blank-title and description-clearing issues add two more silent failures.

---

## Priority 1 — Fix Before Running

```
File: frontend/package.json
Issue: `prop-types` is imported in five components (TodoListPage, TodoForm, TodoList,
        TodoItem, TodoEditForm) but is not listed as a dependency. `npm install` will
        not fetch it, and every component that imports it will throw a module-not-found
        error, preventing the app from starting.
Fix:   Add "prop-types": "^15.8.1" to the "dependencies" object in package.json:

Before:
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  }

After:
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "prop-types": "^15.8.1"
  }
```

```
File: backend/src/main/kotlin/com/app/routes/TodoRoutes.kt  (line 279)
Issue: The PUT validation condition uses `||` (OR) instead of `&&` (AND). Any request
        that omits even one field — including toggle-complete (`{ completed: true }`) and
        all partial edits — returns 400 Bad Request. The PUT endpoint is unusable for any
        partial update.
Fix:   Change the operator on line 279:

Before:
  if (body.title == null || body.description == null || body.completed == null) {

After:
  if (body.title == null && body.description == null && body.completed == null) {
```

---

## Priority 2 — Fix Before Shipping

```
File: backend/src/main/kotlin/com/app/routes/TodoRoutes.kt  (line 241)
Issue: `body.title.isEmpty()` accepts whitespace-only strings such as "   " as valid
        titles. The API spec requires that blank titles return 400.
Fix:   Replace isEmpty() with isBlank():

Before:
  if (body.title.isEmpty()) {

After:
  if (body.title.isBlank()) {
```

```
File: backend/src/main/kotlin/com/app/routes/TodoRoutes.kt  (line 292)
Issue: `body.description?.let { d -> it[description] = d }` skips the DB column update
        when description is null. If the user clears the description field and saves,
        the frontend sends `"description": null` in the PUT body, but the backend ignores
        it and the old description persists.
Fix:   Apply the update unconditionally so null clears the column:

Before:
  body.description?.let { d -> it[description] = d }

After:
  it[description] = body.description
```

```
File: frontend/src/components/TodoListPage.jsx  (line 132)
Issue: `import PropTypes from 'prop-types'` is unused — TodoListPage defines no propTypes.
        Importing an unused package pollutes the bundle and triggers linter warnings.
Fix:   Remove the import line entirely:

Before:
  import PropTypes from 'prop-types';
  import { getTodos } from '../services/api';

After:
  import { getTodos } from '../services/api';
```

---

## Priority 3 — Nice to Have

- **TodoItem.jsx** — `alert(err.message)` for delete/toggle failures is jarring; replace with inline error state rendered in the list item, consistent with every other component.
- **TodoEditForm.jsx** — The `saved` flag never resets between navigations; add `useEffect(() => { setSaved(false); }, [todo.id])` to clear the banner when a different todo is loaded.
- **TodoDetailPage.jsx** — CSS class name `styles.status` is used for both the loading spinner and the "Status: Completed/Incomplete" paragraph; rename one to avoid confusion.
- **backend/src/main/kotlin/com/app/Application.kt** — The CORS `allowHost` is hardcoded to `localhost:5173`; externalise to an environment variable so staging/production configurations don't require a code change.
- **TodoList.jsx** — The `todos` PropType shape duplicates the shape already defined in `TodoItem.jsx`; extract a shared `TodoShape` constant to a `src/propTypes.js` file and import it in both components.

---

## Quick Win

**Fix the one-character PUT bug — takes under 60 seconds, unblocks all updates.**

`backend/src/main/kotlin/com/app/routes/TodoRoutes.kt`, line 279:

**Before:**
```kotlin
if (body.title == null || body.description == null || body.completed == null) {
    return@put call.respond(
        HttpStatusCode.BadRequest,
        mapOf("error" to "request body must contain at least one field")
    )
}
```

**After:**
```kotlin
if (body.title == null && body.description == null && body.completed == null) {
    return@put call.respond(
        HttpStatusCode.BadRequest,
        mapOf("error" to "request body must contain at least one field")
    )
}
```

This single `||` → `&&` change makes toggle-complete, title edits, description edits, and all partial updates work correctly. Without it, the PUT endpoint always returns 400.
