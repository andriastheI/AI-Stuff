import React from 'react'
import { Routes, Route } from 'react-router-dom'
import TodoApp from './components/TodoApp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TodoApp />} />
    </Routes>
  )
}
