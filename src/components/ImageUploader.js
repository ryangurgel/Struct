// ImageUploader.js
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ImageUploaderComponent from './ImageUploaderComponent'; // Adjust path if needed

// Helper function to determine alignment from style string
const getAlignmentFromStyle = (style) => {
    if (!style) return 'center'; // Default if no style
    const hasMarginLeftAuto = style.includes('margin-left: auto') || style.includes('margin: auto');
    const hasMarginRightAuto = style.includes('margin-right: auto') || style.includes('margin: auto');

    if (hasMarginLeftAuto && hasMarginRightAuto) {
        return 'center';
    } else if (hasMarginLeftAuto) {
        return 'right';
    } else if (hasMarginRightAuto) {
        return 'left';
    }
    // Default alignment if specific margins aren't found (could be left or inherit)
    // Let's default to center if unclear from style alone.
    return 'center';
};


export const ImageUploader = Node.create({
    name: 'imageUploader',
    group: 'block',
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            width: { default: '100%' }, // Default to full width initially
            height: { default: 'auto' }, // Height adjusts automatically
            alt: { default: null },
            title: { default: null },
            // NEW: Alignment attribute
            align: {
                default: 'center', // Default alignment
                // Parse alignment from data-align or style attribute
                parseHTML: element => element.getAttribute('data-align') || getAlignmentFromStyle(element.getAttribute('style')),
                // Render alignment into style and data-align attribute
                renderHTML: attributes => {
                    return {
                        'data-align': attributes.align,
                        // Add style for alignment only if not default center or if specific width is set
                         style: `display: block; ${
                            attributes.align === 'left' ? 'margin-right: auto; margin-left: 0;' :
                            attributes.align === 'right' ? 'margin-left: auto; margin-right: 0;' :
                            'margin-left: auto; margin-right: auto;' // Center
                         } width: ${attributes.width}; height: ${attributes.height};` // Include width/height here
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                // Matches the container div we render
                tag: 'div[data-type="image-uploader"]',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) return false; // Type guard
                    const img = dom.querySelector('img');
                    const align = dom.getAttribute('data-align') || getAlignmentFromStyle(dom.getAttribute('style'));
                    const width = dom.style.width || '100%';
                    const height = dom.style.height || 'auto';

                    return {
                        src: img?.getAttribute('src') || dom.getAttribute('data-src'), // Get src from img or data-src
                        alt: img?.getAttribute('alt'),
                        title: img?.getAttribute('title'),
                        width: width,
                        height: height,
                        align: align,
                    };
                },
            },
             // Fallback for pasting simple <img> tags
             {
                 tag: 'img[src]',
                 // Prevent matching if it's inside our component already
                 priority: -1, // Lower priority than the div rule
                 getAttrs: (dom) => {
                      if (!(dom instanceof HTMLImageElement)) return false; // Type guard
                      // Ignore images generated by our component's renderHTML
                      if (dom.getAttribute('data-tiptap-ignore') === 'true') {
                           return false;
                      }
                      // Pasted image: default to center alignment, attempt to get size
                      return {
                           src: dom.getAttribute('src'),
                           alt: dom.getAttribute('alt'),
                           title: dom.getAttribute('title'),
                           width: dom.style.width || dom.getAttribute('width') || '100%',
                           height: dom.style.height || dom.getAttribute('height') || 'auto',
                           align: 'center', // Assume center alignment for pasted images
                      };
                 },
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
         // Base attributes including dynamic style for alignment, width, height
         const mergedAttributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
              'data-type': 'image-uploader',
              // Style is now handled by the 'align' attribute's renderHTML logic
         });

        // Container div structure
        return [
            'div',
            mergedAttributes, // Contains style for width, height, and alignment margins
             // Render a simple img inside for basic display and copy/paste compatibility
             // It will be visually replaced by the React component, but helps with structure
             ['img', {
                 src: HTMLAttributes.src,
                 alt: HTMLAttributes.alt,
                 title: HTMLAttributes.title,
                 // Basic styling, ensures it tries to fit the container
                 style: `display: block; width: 100%; height: 100%; object-fit: contain; ${HTMLAttributes.height === 'auto' ? '' : 'aspect-ratio: auto;'}`, // Maintain aspect ratio if height auto
                 'data-tiptap-ignore': 'true', // Tell Tiptap parse logic to ignore this specific img tag
                 draggable: "false", // Prevent nested dragging
             }]
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageUploaderComponent);
    },
});