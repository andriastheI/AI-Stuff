## Second-Pass Review — Fix Verification

---

## What Was Fixed (Confirmed)

### Priority 1 — both resolved
- ✅ `prop-types` added to `package.json` dependencies (`"prop-types": "^15.8.1"`)
- ✅ PUT validation operator corrected: `||` → `&&` on `TodoRoutes.kt:279`

### Priority 2 — all resolved
- ✅ Blank title now rejected: `isBlank()` replaces `isEmpty()` on `TodoRoutes.kt:241`
- ✅ Description can now be cleared: `it[description] = body.description` on `TodoRoutes.kt:291`
- ✅ Unused `PropTypes` import removed from `TodoListPage.jsx`

### Priority 3 — all resolved
- ✅ `TodoItem` replaces `alert()` with inline `actionError` state and `.actionError` CSS class
- ✅ `TodoEditForm` resets the "Saved!" banner on `todo.id` change via `useEffect`
- ✅ `TodoDetailPage` loading spinner now uses `styles.loading` instead of the ambiguous `styles.status`
- ✅ Shared `TodoShape` extracted to `src/propTypes.js` and imported by both `TodoList` and `TodoItem`

---

## Contract Audit

All five endpoints remain correctly matched on path, method, and response shape.

- **OK: GET /api/todos**
- **OK: GET /api/todos/{id}**
- **OK: POST /api/todos**
- **OK: PUT /api/todos/{id}**
- **OK: DELETE /api/todos/{id}**

---

## Frontend Review

All components present. Loading and error states handled throughout. PropTypes defined everywhere. Shared `TodoShape` eliminates the prior duplication.

One new issue introduced by the combined frontend + backend changes — see Priority 1 below.

**Frontend Quality: 4/5** — Solid structure with one remaining data-loss bug in the toggle path.

---

## Backend Review

All five routes fully implemented. Exposed transactions used correctly throughout. Status codes correct. try/catch on every handler.

The description fix (`it[description] = body.description`) is correct but creates a side-effect when paired with partial update requests — see Priority 1 below.

**Backend Quality: 4/5** — Only one remaining issue, and it is fixable with a one-line change.

---

## Priority 1 — Fix Before Running

```
File: frontend/src/components/TodoItem.jsx  (handleToggle, line ~422)
Issue: The toggle action sends only { completed: !todo.completed } to the backend.
       After the description fix, the backend now unconditionally writes
       `it[description] = body.description`, and since description is absent from
       the toggle request body, UpdateTodo deserialises it as null (the default).
       Result: toggling any todo that has a description silently erases that description.

Fix:   Include the full current todo data in the toggle PUT so description is preserved:

Before:
  async function handleToggle() {
    setActionError(null);
    try {
      await updateTodo(todo.id, { completed: !todo.completed });

After:
  async function handleToggle() {
    setActionError(null);
    try {
      await updateTodo(todo.id, {
        title: todo.title,
        description: todo.description,
        completed: !todo.completed,
      });
```

---

## Priority 2 — Fix Before Shipping

No new Priority 2 issues. All previous ones are resolved.

---

## Priority 3 — Nice to Have

- `TodoEditForm` resets `saved` on `todo.id` change but does **not** re-sync `title`, `description`, or `completed` state when a new todo is passed in. This is safe today only because route-based navigation remounts the component; if the parent ever reuses the instance across todos, the form will show stale values. Add a `useEffect` that calls the state setters whenever `todo.id` changes, or add `key={todo.id}` to the `<TodoEditForm>` element in `TodoDetailPage` to force a remount.
- `Application.kt` — CORS `allowHost` is still hardcoded to `localhost:5173`. Fine for development, but will silently block all mutation requests when deployed to any other origin. Consider reading from an environment variable.

---

## Quick Win

One-line fix in `TodoItem.jsx` — spread the full todo into the toggle call:

**Before (`TodoItem.jsx` ~line 422):**
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

This prevents description data loss on every toggle without any backend changes.
