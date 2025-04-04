// ImageUploader.js
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ImageUploaderComponent from './ImageUploaderComponent';

export const ImageUploader = Node.create({
    name: 'imageUploader',
    group: 'block',
    atom: true, // É um bloco único, não editável diretamente
    draggable: true, // Permite arrastar o bloco

    addAttributes() {
        return {
            src: { default: null },
            // Armazena as dimensões como string (ex: '500px' ou '100%')
            width: { default: '100%' }, // Começa com largura total
            height: { default: 'auto' }, // Altura automática por padrão
            alt: { default: null }, // Atributo alt para acessibilidade
            title: { default: null }, // Atributo title (tooltip)
        };
    },

    parseHTML() {
        return [
            {
                // Reconhece o container pelo data-type
                tag: 'div[data-type="image-uploader"]',
                getAttrs: (dom) => {
                    const img = dom.querySelector('img'); // Pega a imagem interna se houver
                    const width = dom.style.width || '100%'; // Pega do estilo do container
                    const height = dom.style.height || 'auto'; // Pega do estilo do container
                    return {
                         // Pega o src da imagem interna ou do atributo data-src do container
                        src: img?.getAttribute('src') || dom.getAttribute('data-src'),
                        alt: img?.getAttribute('alt'),
                        title: img?.getAttribute('title'),
                        width: width,
                        height: height,
                    };
                },
            },
             // Fallback para reconhecer apenas a tag img (se colar HTML externo)
             // Ajuste se precisar de lógica mais complexa para importar imagens coladas
             {
                 tag: 'img[src]',
                 getAttrs: (dom) => ({
                     src: dom.getAttribute('src'),
                     alt: dom.getAttribute('alt'),
                     title: dom.getAttribute('title'),
                     // Tenta pegar width/height do style ou atributos, senão usa padrão
                     width: dom.style.width || dom.getAttribute('width') || '100%',
                     height: dom.style.height || dom.getAttribute('height') || 'auto',
                 }),
             },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        // Renderiza um DIV container que terá o estilo e o resize.
        // A imagem real será renderizada pelo ReactNodeViewComponent.
        // Guarda o src no data-src para o parseHTML encontrar.
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-type': 'image-uploader',
                'data-src': HTMLAttributes.src, // Guarda o src aqui
                style: `width: ${HTMLAttributes.width}; height: ${HTMLAttributes.height};`,
            }),
            // Não renderiza a tag <img> aqui, o NodeView faz isso.
            // Poderia renderizar um placeholder se o NodeView falhar.
             ['img', { // Adiciona uma imagem básica para o caso de o JS falhar ou para cópia/cola
                 src: HTMLAttributes.src,
                 alt: HTMLAttributes.alt,
                 title: HTMLAttributes.title,
                 style: "display: block; width: 100%; height: 100%; object-fit: contain;", // Estilo básico
                 'data-tiptap-ignore': 'true' // Diz ao Tiptap para ignorar esta imagem interna ao editar
            }]
        ];
    },

    addNodeView() {
        // Usa o componente React para renderizar a interface de upload/redimensionamento
        return ReactNodeViewRenderer(ImageUploaderComponent);
    },
});