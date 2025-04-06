import React, { useImperativeHandle, useState, useEffect, forwardRef } from 'react'
import { Box, Typography } from '@mui/material'

const SuggestionList = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      const visibleItems = items.filter(item => item.type !== 'category')
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + visibleItems.length) % visibleItems.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % visibleItems.length)
        return true
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        const item = visibleItems[selectedIndex]
        if (item) {
          command(item)
          return true
        }
      }
      return false
    },
  }), [items, selectedIndex, command])

  let visualIndex = -1

  return (
    <Box
      sx={{
        background: '#2c2c2c',
        borderRadius: '8px',
        padding: '6px',
        minWidth: '220px',
        maxHeight: '300px',
        overflowY: 'auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {items.map((item, index) => {
        if (item.type === 'category') {
          return (
            <Typography
              key={`cat-${item.title}-${index}`}
              sx={{
                fontSize: '0.75rem',
                color: '#aaa',
                textTransform: 'uppercase',
                padding: '4px 8px',
                marginTop: index === 0 ? 0 : '6px',
              }}
            >
              {item.title}
            </Typography>
          )
        } else {
          visualIndex++
          const isSelected = visualIndex === selectedIndex
          return (
            <Box
              key={`item-${index}`}
              onClick={() => command(item)}
              onMouseEnter={() => setSelectedIndex(visualIndex)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#444' : 'transparent',
                '&:hover': {
                  backgroundColor: '#555',
                },
              }}
            >
              <Box>{item.icon}</Box>
              <Typography sx={{ fontSize: '0.9rem', color: '#ccc' }}>{item.title}</Typography>
            </Box>
          )
        }
      })}
    </Box>
  )
})

export default SuggestionList
