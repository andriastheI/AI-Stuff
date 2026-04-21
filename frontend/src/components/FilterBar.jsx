import React from 'react'
import PropTypes from 'prop-types'
import styles from './FilterBar.module.css'

const FILTERS = ['All', 'Active', 'Completed']

export default function FilterBar({ filter, onFilterChange }) {
  return (
    <div className={styles.bar}>
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`${styles.button} ${filter === f ? styles.active : ''}`}
          onClick={() => onFilterChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
  )
}

FilterBar.propTypes = {
  filter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
}
