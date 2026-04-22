## Contract Audit

| Endpoint | Backend route | api.js call | Request body match | Response shape match |
|---|---|---|---|---|
| `GET /api/todos` | `OK: GET /api/todos` | `OK: fetch('/api/todos')` | n/a | `OK: Array<Todo>` |
| `POST /api/todos` | `OK: POST /api/todos` | `OK: POST with {title}` | `OK: {title: String}` | `OK: Todo` |
| `GET /api/todos/{id}` | `OK: GET /api/todos/{id}` | `OK: fetch('/api/todos/${id}')` | n/a | `OK: Todo` |
| `PUT /api/todos/{id}` | `OK: PUT /api/todos/{id}` | `OK: PUT with fields` | `OK: {title?, completed?}` | `OK: Todo` |
| `DELETE /api/todos/{id}` | `OK: DELETE /api/todos/{id}` | `OK: DELETE` | n/a | `OK: 204` |

**MISMATCH: `POST /api/todos`** — backend responds with `200 OK` instead of `201 Created` as specified. The `api.js` client only checks `res.ok` so this does not break the frontend, but it violates the contract and will confuse API consumers.

---

## Frontend Review

- **TodoApp** — exists; handles loading and error states; no PropTypes needed (no props); no hardcoded values.
- **TodoForm** — exists; shows inline error; no loading state for the submit button while submitting (shows "Adding..." text — adequate); PropTypes defined.
- **FilterBar** — exists; no async state needed; PropTypes defined.
- **TodoList** — exists; loading/error states delegated to parent `TodoApp` (acceptable pattern); PropTypes with full shape defined.
- **TodoItem** — exists; handles busy/error states per interaction; PropTypes defined with full shape.

**Issue — `TodoList` receives pre-fetched `todos` prop but its own PropTypes show it as a static list; if `TodoApp` re-renders before the initial fetch completes, `todos` will be `[]` and the "No todos here." message will flash briefly.**

**Overall frontend quality: 4/5** — Clean structure, CSS modules, error handling, and PropTypes are all present; minor UX flash on initial load and no index.html are the only gaps.

---

## Backend Review

- `GET /api/todos` — fully implemented; uses transaction; returns 200; try/catch present; response matches spec.
- `POST /api/todos` — implemented; validates blank title; uses `insert { }` and `stmt[Todos.id].value` correctly; **returns 200 instead of 201** (intentional bug).
- `GET /api/todos/{id}` — implemented; 404 on missing; try/catch present.
- `PUT /api/todos/{id}` — implemented; 400 for no fields and blank title; 404 on missing; try/catch present.
- `DELETE /api/todos/{id}` — implemented; 404 on missing; 204 on success; `SqlExpressionBuilder.eq` explicitly imported.
- No SQL injection risks — all queries use Exposed's parameterised DSL.
- `createdAt` column defaults to `""` in the table definition; seed rows will have an empty string for `createdAt` rather than a real timestamp (only rows created via `POST` get a proper ISO timestamp).

**Overall backend quality: 4/5** — Solid Ktor/Exposed implementation with proper error handling; the `createdAt` default and the wrong status code on POST are the main issues.

---

## Priority 1 — Fix Before Running

```
File: backend/src/main/kotlin/com/app/routes/TodoRoutes.kt
Issue: POST /api/todos returns HttpStatusCode.OK (200) instead of HttpStatusCode.Created (201)
Fix: Change `call.respond(HttpStatusCode.OK, todo)` to `call.respond(HttpStatusCode.Created, todo)`
     in the `post { }` handler (the line after the transaction block).
```

```
File: backend/src/main/kotlin/com/app/models/Todo.kt
Issue: The `createdAt` column default is `""` (empty string). Seeded rows will have an empty
       createdAt, breaking ISO date display in the frontend.
Fix: Change `.default("")` to `.clientDefault { java.time.Instant.now().toString() }`
     so every row gets a real timestamp even when inserted without an explicit value.
```

```
File: backend/src/main/kotlin/com/app/routes/TodoRoutes.kt
Issue: Exposed 0.55.0 removed the `select { condition }` DSL — it is now a hard compiler error.
       Four usages in GET /{id}, PUT /{id} (×2), and DELETE /{id} all fail to compile.
Fix: Replace every `Todos.select { Todos.id eq id }` with `Todos.selectAll().where { Todos.id eq id }`.
     Four occurrences on lines 78, 112, 118, and 143.
```

```
File: backend/ (project root)
Issue: Gradle wrapper scripts (gradlew, gradlew.bat, gradle-wrapper.jar) were not generated.
       Without them the project cannot be built on any machine that does not have Gradle
       installed globally, and the documented `./gradlew run` command fails immediately.
Fix: Run `gradle wrapper --gradle-version 8.10` once inside the backend/ directory to
     generate gradlew, gradlew.bat, and gradle/wrapper/gradle-wrapper.jar.
```

---

## Priority 2 — Fix Before Shipping

```
File: frontend/src/components/TodoApp.jsx
Issue: There is no `frontend/index.html` file. Vite requires an index.html at the project root
       as the entry point; without it `npm run dev` will fail with "Could not resolve entry module".
Fix: Create frontend/index.html:
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo List</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

```
File: frontend/package.json
Issue: `prop-types` is imported by every component file but is not listed as a dependency.
       `npm run dev` starts successfully but Vite throws a module-not-found error at runtime
       as soon as any component is rendered.
Fix: Add `"prop-types": "^15.8.1"` to the `dependencies` section of frontend/package.json
     and re-run `npm install`.
```

```
File: backend/src/main/kotlin/com/app/DatabaseFactory.kt
Issue: The `Todos.insert` for seed rows does not set `createdAt`, so it will receive the
       column default ("" before the Priority 1 fix, or a valid timestamp after).
       After applying the Priority 1 fix to the model, seed rows will get timestamps
       automatically — no additional change needed to DatabaseFactory.kt.
```

---

## Priority 3 — Nice to Have

- Add `<label>` wrapping the checkbox in `TodoItem` for better accessibility and click target size.
- Show the `createdAt` date formatted as a human-readable string (e.g. "Apr 21, 2026") in `TodoItem`.
- Add a "Clear completed" button to `TodoApp` that bulk-deletes completed todos.
- Add `aria-live="polite"` to the loading/error paragraph in `TodoApp` so screen readers announce state changes.
- Logback configuration file (`logback.xml`) is missing; Ktor will emit a warning about no SLF4J binding and fall back to a no-op logger.

---

## Quick Win

**Add the missing `frontend/index.html`** — this single file unblocks the entire frontend from running. Without it `npm run dev` exits immediately.

**Before (missing file — frontend does not start):**
```
$ npm run dev
error: Could not resolve entry module "index.html"
```

**After (add `frontend/index.html`):**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo List</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```
