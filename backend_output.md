```kotlin
// FILE: backend/settings.gradle.kts
rootProject.name = "app"
```
Declares the Gradle root project name used by all subprojects and build scripts.

```kotlin
// FILE: backend/build.gradle.kts
plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.serialization") version "1.9.25"
    application
}

group = "com.app"
version = "1.0.0"

application {
    mainClass.set("com.app.ApplicationKt")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-core:2.3.12")
    implementation("io.ktor:ktor-server-netty:2.3.12")
    implementation("io.ktor:ktor-server-content-negotiation:2.3.12")
    implementation("io.ktor:ktor-server-cors:2.3.12")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.12")
    implementation("org.jetbrains.exposed:exposed-core:0.55.0")
    implementation("org.jetbrains.exposed:exposed-dao:0.55.0")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.55.0")
    implementation("org.xerial:sqlite-jdbc:3.47.1.0")
    implementation("ch.qos.logback:logback-classic:1.5.12")
}

kotlin {
    jvmToolchain(21)
}
```
Configures the Kotlin JVM project with all required Ktor, Exposed, SQLite, and Logback dependencies plus the serialization plugin and JVM 21 toolchain.

```properties
# FILE: backend/gradle/wrapper/gradle-wrapper.properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.10-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```
Pins the Gradle wrapper to version 8.10 so any developer or CI runner uses the same build tool version.

```kotlin
// FILE: backend/src/main/kotlin/com/app/Application.kt
package com.app

import com.app.routes.todoRoutes
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import kotlinx.serialization.json.Json

fun main() {
    DatabaseFactory.init()
    embeddedServer(Netty, port = 3001) {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                ignoreUnknownKeys = true
            })
        }
        install(CORS) {
            allowHost("localhost:5173")
            allowHeader(HttpHeaders.ContentType)
            allowMethod(HttpMethod.Get)
            allowMethod(HttpMethod.Post)
            allowMethod(HttpMethod.Put)
            allowMethod(HttpMethod.Delete)
        }
        todoRoutes()
    }.start(wait = true)
}
```
Entry point that initialises the database, starts the Netty server on port 3001, and wires up JSON content negotiation, CORS for the frontend origin, and all route modules.

```kotlin
// FILE: backend/src/main/kotlin/com/app/DatabaseFactory.kt
package com.app

import com.app.models.Todos
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.time.Instant

object DatabaseFactory {
    fun init() {
        File("data").mkdirs()
        Database.connect("jdbc:sqlite:data/app.db", driver = "org.sqlite.JDBC")
        transaction {
            SchemaUtils.createMissingTablesAndColumns(Todos)
            if (Todos.selectAll().empty()) {
                val now = Instant.now().toString()
                Todos.insert {
                    it[title] = "Buy groceries"
                    it[description] = "Milk, eggs, bread"
                    it[completed] = 0
                    it[createdAt] = now
                    it[updatedAt] = now
                }
                Todos.insert {
                    it[title] = "Write unit tests"
                    it[description] = null
                    it[completed] = 1
                    it[createdAt] = now
                    it[updatedAt] = now
                }
                Todos.insert {
                    it[title] = "Read Kotlin docs"
                    it[description] = "Focus on coroutines chapter"
                    it[completed] = 0
                    it[createdAt] = now
                    it[updatedAt] = now
                }
            }
        }
    }
}
```
Singleton that creates the `data/` directory, connects to the SQLite file, applies any missing schema changes, and seeds three sample rows when the table is empty.

```kotlin
// FILE: backend/src/main/kotlin/com/app/models/Todo.kt
package com.app.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.IntIdTable

object Todos : IntIdTable("todos") {
    val title = varchar("title", 1000)
    val description = text("description").nullable()
    val completed = integer("completed").default(0)
    val createdAt = varchar("created_at", 50)
    val updatedAt = varchar("updated_at", 50)
}

@Serializable
data class Todo(
    val id: Int,
    val title: String,
    val description: String?,
    val completed: Boolean,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class CreateTodo(
    val title: String = "",
    val description: String? = null,
    val completed: Boolean = false
)

@Serializable
data class UpdateTodo(
    val title: String? = null,
    val description: String? = null,
    val completed: Boolean? = null
)
```
Defines the `Todos` Exposed table (using `IntIdTable` so the `id` column is auto-managed), the `Todo` response class, the `CreateTodo` request body class, and the `UpdateTodo` partial-update request body class.

```kotlin
// FILE: backend/src/main/kotlin/com/app/routes/TodoRoutes.kt
package com.app.routes

import com.app.models.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant

private fun rowToTodo(row: ResultRow) = Todo(
    id = row[Todos.id].value,
    title = row[Todos.title],
    description = row[Todos.description],
    completed = row[Todos.completed] == 1,
    createdAt = row[Todos.createdAt],
    updatedAt = row[Todos.updatedAt]
)

fun Application.todoRoutes() {
    routing {
        route("/api/todos") {

            get {
                try {
                    val todos = transaction {
                        Todos.selectAll().map { rowToTodo(it) }
                    }
                    call.respond(HttpStatusCode.OK, todos)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Unexpected server error"))
                }
            }

            get("/{id}") {
                try {
                    val id = call.parameters["id"]?.toIntOrNull()
                        ?: return@get call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to "id must be a valid integer")
                        )
                    val todo = transaction {
                        Todos.selectAll().where { Todos.id eq id }.singleOrNull()?.let { rowToTodo(it) }
                    }
                    if (todo == null) {
                        call.respond(HttpStatusCode.NotFound, mapOf("error" to "Todo not found"))
                    } else {
                        call.respond(HttpStatusCode.OK, todo)
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Unexpected server error"))
                }
            }

            post {
                try {
                    val body = call.receive<CreateTodo>()
                    if (body.title.isBlank()) {
                        return@post call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to "title is required and must not be blank")
                        )
                    }
                    val now = Instant.now().toString()
                    val todo = transaction {
                        val stmt = Todos.insert {
                            it[title] = body.title
                            it[description] = body.description
                            it[completed] = if (body.completed) 1 else 0
                            it[createdAt] = now
                            it[updatedAt] = now
                        }
                        Todo(
                            id = stmt[Todos.id].value,
                            title = body.title,
                            description = body.description,
                            completed = body.completed,
                            createdAt = now,
                            updatedAt = now
                        )
                    }
                    call.respond(HttpStatusCode.Created, todo)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Unexpected server error"))
                }
            }

            put("/{id}") {
                try {
                    val id = call.parameters["id"]?.toIntOrNull()
                        ?: return@put call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to "id must be a valid integer")
                        )
                    val body = call.receive<UpdateTodo>()
                    if (body.title == null && body.description == null && body.completed == null) {
                        return@put call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to "request body must contain at least one field")
                        )
                    }
                    val now = Instant.now().toString()
                    val todo = transaction {
                        val existing = Todos.selectAll().where { Todos.id eq id }.singleOrNull()
                            ?: return@transaction null
                        Todos.update({ Todos.id eq id }) {
                            body.title?.let { t -> it[title] = t }
                            it[description] = body.description
                            body.completed?.let { c -> it[completed] = if (c) 1 else 0 }
                            it[updatedAt] = now
                        }
                        Todos.selectAll().where { Todos.id eq id }.single().let { rowToTodo(it) }
                    }
                    if (todo == null) {
                        call.respond(HttpStatusCode.NotFound, mapOf("error" to "Todo not found"))
                    } else {
                        call.respond(HttpStatusCode.OK, todo)
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Unexpected server error"))
                }
            }

            delete("/{id}") {
                try {
                    val id = call.parameters["id"]?.toIntOrNull()
                        ?: return@delete call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to "id must be a valid integer")
                        )
                    val deleted = transaction {
                        val existing = Todos.selectAll().where { Todos.id eq id }.singleOrNull()
                        if (existing == null) return@transaction false
                        Todos.deleteWhere { Todos.id eq id }
                        true
                    }
                    if (!deleted) {
                        call.respond(HttpStatusCode.NotFound, mapOf("error" to "Todo not found"))
                    } else {
                        call.respond(HttpStatusCode.NoContent)
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Unexpected server error"))
                }
            }
        }
    }
}
```
Implements all five Todo endpoints (GET list, GET by id, POST create, PUT update, DELETE) as a single `Application` extension function, using Exposed transactions for every database access and returning appropriate status codes and JSON error bodies.

```xml
<!-- FILE: backend/src/main/resources/logback.xml -->
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="INFO">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```
Configures Logback to print INFO-level logs to stdout with timestamps, suppressing the verbose Netty and Exposed debug output that appears without an explicit configuration.
