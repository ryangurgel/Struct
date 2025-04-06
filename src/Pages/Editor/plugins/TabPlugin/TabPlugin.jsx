// TabPlugin.js
import React, { useState, useEffect, useRef } from 'react'

export default function TabPlugin({ editor, parentRef }) {
  const [cellRect, setCellRect] = useState(null)
  const [cellElement, setCellElement] = useState(null)
  const [showRowMenu, setShowRowMenu] = useState(false)
  const [showColMenu, setShowColMenu] = useState(false)

  // Refs para as abas (toggles) e menus
  const rowToggleRef = useRef(null)
  const colToggleRef = useRef(null)
  const rowMenuRef = useRef(null)
  const colMenuRef = useRef(null)

  // Função que encontra a célula (<td> ou <th>) que contém o cursor
  const findTableCell = () => {
    if (!editor) return null
    const { state, view } = editor
    const { from } = state.selection
    let dom = view.domAtPos(from).node

    while (dom && dom.nodeName !== 'TD' && dom.nodeName !== 'TH') {
      dom = dom.parentNode
    }
    return dom
  }

  const updateCellRect = () => {
    const cell = findTableCell()
    if (cell && parentRef.current) {
      setCellElement(cell)
      const containerRect = parentRef.current.getBoundingClientRect()
      const rect = cell.getBoundingClientRect()
      setCellRect({
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
      })
    } else {
      setCellRect(null)
      setCellElement(null)
    }
  }

  useEffect(() => {
    if (!editor) return

    updateCellRect()
    const handleSelectionUpdate = () => {
      updateCellRect()
    }
    editor.on('selectionUpdate', handleSelectionUpdate)

    window.addEventListener('resize', updateCellRect)
    window.addEventListener('scroll', updateCellRect, true)

    let resizeObserver
    if (cellElement) {
      resizeObserver = new ResizeObserver(() => {
        updateCellRect()
      })
      resizeObserver.observe(cellElement)
    }

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      window.removeEventListener('resize', updateCellRect)
      window.removeEventListener('scroll', updateCellRect, true)
      if (resizeObserver && cellElement) {
        resizeObserver.unobserve(cellElement)
      }
    }
  }, [editor, cellElement])

  // Fecha os menus se clicar fora dos mesmos e das abas
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Se o clique não ocorrer em nenhuma das abas ou menus, fecha ambos
      if (
        rowMenuRef.current &&
        !rowMenuRef.current.contains(event.target) &&
        rowToggleRef.current &&
        !rowToggleRef.current.contains(event.target)
      ) {
        setShowRowMenu(false)
      }
      if (
        colMenuRef.current &&
        !colMenuRef.current.contains(event.target) &&
        colToggleRef.current &&
        !colToggleRef.current.contains(event.target)
      ) {
        setShowColMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!cellRect) return null

  // Funções que executam os comandos do editor para linha e coluna
  const insertRowAbove = () => {
    editor.chain().focus().addRowBefore().run()
    setShowRowMenu(false)
  }

  const insertRowBelow = () => {
    editor.chain().focus().addRowAfter().run()
    setShowRowMenu(false)
  }

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run()
    setShowRowMenu(false)
  }

  const insertColumnLeft = () => {
    editor.chain().focus().addColumnBefore().run()
    setShowColMenu(false)
  }

  const insertColumnRight = () => {
    editor.chain().focus().addColumnAfter().run()
    setShowColMenu(false)
  }

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run()
    setShowColMenu(false)
  }

  // Alterna os menus (exibe um de cada vez)
  const toggleRowMenu = (e) => {
    e.stopPropagation() // impede que o clique se propague para o document
    setShowRowMenu((prev) => !prev)
    setShowColMenu(false)
  }

  const toggleColMenu = (e) => {
    e.stopPropagation()
    setShowColMenu((prev) => !prev)
    setShowRowMenu(false)
  }

  return (
    <>
      {/* Aba superior para opções de linha */}
      <div
        ref={rowToggleRef}
        style={{
          position: 'absolute',
          top: cellRect.top - 20, // 20px acima da célula
          left: cellRect.left,
          width: cellRect.width,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          cursor: 'pointer'
        }}
        onClick={toggleRowMenu}
      >
        <span style={{ color: '#000', fontWeight: 'bold' }}>...</span>
      </div>

      {/* Aba lateral esquerda para opções de coluna */}
      <div
        ref={colToggleRef}
        style={{
          position: 'absolute',
          top: cellRect.top,
          left: cellRect.left - 20, // 20px à esquerda da célula
          width: 20,
          height: cellRect.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          cursor: 'pointer'
        }}
        onClick={toggleColMenu}
      >
        <span style={{ transform: 'rotate(-90deg)', color: '#000', fontWeight: 'bold' }}>...</span>
      </div>

      {/* Menu flutuante para opções de linha */}
      {showRowMenu && (
        <div
          ref={rowMenuRef}
          style={{
            position: 'absolute',
            top: cellRect.top - 60, // ajuste conforme necessário
            left: cellRect.left,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            zIndex: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '5px'
          }}
        >
          <div style={{ padding: '5px', cursor: 'pointer' }} onClick={insertRowAbove}>
            Inserir linha acima
          </div>
          <div style={{ padding: '5px', cursor: 'pointer' }} onClick={insertRowBelow}>
            Inserir linha abaixo
          </div>
          <div style={{ padding: '5px', cursor: 'pointer' }} onClick={deleteRow}>
            Apagar linha
          </div>
        </div>
      )}

      {/* Menu flutuante para opções de coluna */}
      {showColMenu && (
        <div
          ref={colMenuRef}
          style={{
            position: 'absolute',
            top: cellRect.top,
            left: cellRect.left - 140, // ajuste conforme necessário
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            zIndex: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '5px'
          }}
        >
          <div style={{ padding: '5px', cursor: 'pointer' }} onClick={insertColumnLeft}>
            Inserir coluna à esquerda
          </div>
          <div style={{ padding: '5px', cursor: 'pointer' }} onClick={insertColumnRight}>
            Inserir coluna à direita
          </div>
          <div style={{ padding: '5px', cursor: 'pointer' }} onClick={deleteColumn}>
            Apagar coluna
          </div>
        </div>
      )}
    </>
  )
}