package com.app

import com.app.models.Todos
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File

object DatabaseFactory {
    fun init() {
        File("data").mkdirs()
        Database.connect("jdbc:sqlite:data/app.db", driver = "org.sqlite.JDBC")
        transaction {
            SchemaUtils.createMissingTablesAndColumns(Todos)
            if (Todos.selectAll().count() == 0L) {
                Todos.insert {
                    it[title] = "Buy groceries"
                    it[completed] = false
                }
                Todos.insert {
                    it[title] = "Read a book"
                    it[completed] = false
                }
                Todos.insert {
                    it[title] = "Go for a walk"
                    it[completed] = true
                }
            }
        }
    }
}
