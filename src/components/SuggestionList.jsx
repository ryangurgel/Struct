// SuggestionList.jsx
import React, { useImperativeHandle, useState, useEffect, forwardRef } from 'react'
import { Box, Button } from '@mui/material'

const SuggestionList = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        if (items[selectedIndex]) {
          command(items[selectedIndex])
          return true
        }
      }
      return false
    },
  }), [items, selectedIndex, command])

  return (
    <Box
      sx={{
        background: '#2c2c2c',
        borderRadius: '8px',
        padding: '6px',
        minWidth: '200px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.1rem',
      }}
    >
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <Button
            key={index}
            onClick={() => command(item)}
            sx={{
              justifyContent: 'flex-start',
              backgroundColor: index === selectedIndex ? '#444' : 'transparent',
              color: '#ccc',
              textTransform: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
              '&:hover': { backgroundColor: '#555' },
            }}
          >
            {item.icon} {item.title}
          </Button>
        ))
      ) : (
        <Box sx={{ padding: '4px 8px', color: '#ccc' }}>No result</Box>
      )}
    </Box>
  )
})

export default SuggestionList