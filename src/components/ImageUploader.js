// ImageUploader.js
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ImageUploaderComponent from './ImageUploaderComponent'

export const ImageUploader = Node.create({
  name: 'imageUploader',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: '100%' },
      height: { default: 'auto' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-uploader"]',
        getAttrs: (dom) => {
          const style = dom.getAttribute('style') || ''
          console.log('[ImageUploader.parseHTML] style encontrado:', style)

          const widthMatch = style.match(/width:\s*([^;]+);?/)
          const heightMatch = style.match(/height:\s*([^;]+);?/)
          const widthVal = widthMatch ? widthMatch[1] : '100%'
          const heightVal = heightMatch ? heightMatch[1] : 'auto'

          console.log('[ImageUploader.parseHTML] widthVal:', widthVal, 'heightVal:', heightVal)
          return {
            width: widthVal,
            height: heightVal,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { width, height, ...rest } = HTMLAttributes
    console.log('[ImageUploader.renderHTML] Recebido:', HTMLAttributes)
    console.log('[ImageUploader.renderHTML] width:', width, 'height:', height)

    return [
      'div',
      mergeAttributes(rest, {
        'data-type': 'image-uploader',
        style: `width: ${width}; height: ${height}; overflow: hidden;`,
      }),
    ]
  },

  addNodeView() {
    console.log('[ImageUploader.addNodeView] Criando NodeView para ImageUploader')
    return ReactNodeViewRenderer(ImageUploaderComponent)
  },
})
