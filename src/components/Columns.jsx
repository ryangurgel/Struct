// Columns.jsx
import { Node, mergeAttributes } from '@tiptap/core'
import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

/* -------------------- Column Node -------------------- */
export const Column = Node.create({
  name: 'column',
  group: 'block',
  content: 'block+',
  isolating: true,
  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'column',
        style: 'flex: 1; padding: 8px; border: 1px dashed #ccc;',
      }),
      0,
    ]
  },
})

/* -------------------- Columns Node -------------------- */
export const Columns = Node.create({
  name: 'columns',
  group: 'block',
  // Garante que exatamente dois nós do tipo "column" sejam filhos
  content: 'column{2}',
  draggable: true,
  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'columns',
        style: 'display: flex; gap: 16px; margin-bottom: 16px;',
      }),
      0,
    ]
  },
  addNodeView() {
    return ({ node, getPos, editor, decorations }) => {
      return <ColumnsNodeView node={node} getPos={getPos} editor={editor} decorations={decorations} />
    }
  },
})

/* -------------------- React NodeView Component -------------------- */
const ColumnsNodeView = (props) => {
  return (
    <NodeViewWrapper
      as="div"
      className="columns-node"
      style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}
    >
      <NodeViewContent
        as="div"
        className="column-left"
        style={{ flex: 1, padding: '8px', border: '1px dashed #ccc' }}
      />
      <NodeViewContent
        as="div"
        className="column-right"
        style={{ flex: 1, padding: '8px', border: '1px dashed #ccc' }}
      />
    </NodeViewWrapper>
  )
}
