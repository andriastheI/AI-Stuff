package com.app.routes

import com.app.models.CreateTodo
import com.app.models.Todo
import com.app.models.Todos
import com.app.models.UpdateTodo
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant

@Serializable
data class ErrorResponse(val error: String)

fun Application.todoRoutes() {
    routing {
        route("/api/todos") {

            // GET /api/todos
            get {
                try {
                    val todos = transaction {
                        Todos.selectAll().map { row ->
                            Todo(
                                id = row[Todos.id].value,
                                title = row[Todos.title],
                                completed = row[Todos.completed],
                                createdAt = row[Todos.createdAt],
                            )
                        }
                    }
                    call.respond(HttpStatusCode.OK, todos)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
                }
            }

            // POST /api/todos
            post {
                try {
                    val body = call.receive<CreateTodo>()
                    if (body.title.isBlank()) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("title must not be blank"))
                        return@post
                    }
                    val now = Instant.now().toString()
                    val todo = transaction {
                        val stmt = Todos.insert {
                            it[title] = body.title
                            it[completed] = false
                            it[createdAt] = now
                        }
                        Todo(
                            id = stmt[Todos.id].value,
                            title = body.title,
                            completed = false,
                            createdAt = now,
                        )
                    }
                    // Intentional bug: returns 200 instead of the required 201
                    call.respond(HttpStatusCode.OK, todo)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
                }
            }

            // GET /api/todos/{id}
            get("{id}") {
                try {
                    val id = call.parameters["id"]?.toIntOrNull()
                        ?: return@get call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid id"))
                    val todo = transaction {
                        Todos.select { Todos.id eq id }.firstOrNull()?.let { row ->
                            Todo(
                                id = row[Todos.id].value,
                                title = row[Todos.title],
                                completed = row[Todos.completed],
                                createdAt = row[Todos.createdAt],
                            )
                        }
                    }
                    if (todo == null) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Todo $id not found"))
                    } else {
                        call.respond(HttpStatusCode.OK, todo)
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
                }
            }

            // PUT /api/todos/{id}
            put("{id}") {
                try {
                    val id = call.parameters["id"]?.toIntOrNull()
                        ?: return@put call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid id"))
                    val body = call.receive<UpdateTodo>()
                    if (body.title == null && body.completed == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("No fields provided"))
                        return@put
                    }
                    if (body.title != null && body.title.isBlank()) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("title must not be blank"))
                        return@put
                    }
                    val updated = transaction {
                        val existing = Todos.select { Todos.id eq id }.firstOrNull()
                            ?: return@transaction null
                        Todos.update({ Todos.id eq id }) {
                            if (body.title != null) it[title] = body.title
                            if (body.completed != null) it[completed] = body.completed
                        }
                        Todos.select { Todos.id eq id }.first().let { row ->
                            Todo(
                                id = row[Todos.id].value,
                                title = row[Todos.title],
                                completed = row[Todos.completed],
                                createdAt = row[Todos.createdAt],
                            )
                        }
                    }
                    if (updated == null) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Todo $id not found"))
                    } else {
                        call.respond(HttpStatusCode.OK, updated)
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
                }
            }

            // DELETE /api/todos/{id}
            delete("{id}") {
                try {
                    val id = call.parameters["id"]?.toIntOrNull()
                        ?: return@delete call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid id"))
                    val deleted = transaction {
                        val existing = Todos.select { Todos.id eq id }.firstOrNull()
                            ?: return@transaction false
                        Todos.deleteWhere { Todos.id eq id }
                        true
                    }
                    if (!deleted) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Todo $id not found"))
                    } else {
                        call.respond(HttpStatusCode.NoContent)
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
                }
            }
        }
    }
}
