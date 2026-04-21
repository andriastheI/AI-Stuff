package com.app.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.IntIdTable

object Todos : IntIdTable("todos") {
    val title = varchar("title", 512)
    val completed = bool("completed").default(false)
    val createdAt = varchar("created_at", 64).clientDefault { java.time.Instant.now().toString() }
}

@Serializable
data class Todo(
    val id: Int,
    val title: String,
    val completed: Boolean,
    val createdAt: String,
)

@Serializable
data class CreateTodo(
    val title: String,
)

@Serializable
data class UpdateTodo(
    val title: String? = null,
    val completed: Boolean? = null,
)
