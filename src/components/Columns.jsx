// Columns.jsx
import { Node, mergeAttributes } from '@tiptap/core';
import React from 'react';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react';

/* -------------------- Column Node (Filho) -------------------- */
export const Column = Node.create({
    name: 'column',
    // content: 'block+', // Permite múltiplos blocos dentro de uma coluna
    content: '(block | heading)+', // Permite blocos ou cabeçalhos
    group: 'block', // Pertence ao grupo de blocos
    isolating: true, // Isola o conteúdo da coluna

    parseHTML() {
        return [
            {
                // Seleciona divs com o atributo data-type="column"
                tag: 'div[data-type="column"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        // Renderiza como uma div com atributos e data-type
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'column',
                // Estilo é aplicado pelo CSS agora para melhor controle
                // style: 'flex: 1; padding: 8px; border: 1px dashed #555; border-radius: 4px; min-width: 200px;',
                 class: 'tiptap-column', // Adiciona classe para CSS
            }),
            0, // 0 indica onde o conteúdo do nó deve ser renderizado
        ];
    },
});

/* -------------------- Columns Node (Pai) -------------------- */
export const Columns = Node.create({
    name: 'columns',
    group: 'block',
    // Define que o conteúdo deve ser exatamente duas colunas
    content: 'column{2}',
    draggable: true, // Permite arrastar o bloco de colunas
    isolating: true,

    parseHTML() {
        return [
            {
                tag: 'div[data-type="columns"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        // Renderiza o container das colunas
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'columns',
                // Estilo aplicado via CSS
                // style: 'display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 1em; border: 1px dashed #444; border-radius: 4px; padding: 8px;',
                 class: 'tiptap-columns-container', // Adiciona classe para CSS
            }),
            0, // Conteúdo (as duas colunas) vai aqui
        ];
    },

    // Usa um NodeView React para ter mais controle sobre a renderização (opcional, mas bom para complexidade)
    addNodeView() {
        return ReactNodeViewRenderer(ColumnsNodeView);
    },
});

/* -------------------- React NodeView Component para Columns -------------------- */
const ColumnsNodeView = (props) => {
    // NodeViewWrapper gerencia o elemento DOM externo e seleção
    // NodeViewContent renderiza o conteúdo editável de cada coluna filho
    return (
        <NodeViewWrapper
            as="div"
            // Aplica a mesma classe usada no renderHTML para consistência CSS
            className="tiptap-columns-container"
            // Estilos inline podem ser removidos se tudo estiver no CSS
             // style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '1em', border: '1px dashed #444', borderRadius: '4px', padding: '8px' }}
        >
            {/* Renderiza o conteúdo da primeira coluna filha */}
             <NodeViewContent
                 as="div"
                 // Aplica a classe CSS da coluna
                 className="tiptap-column column-left"
                 // Estilos inline podem ser removidos
                 // style={{ flex: 1, padding: '8px', border: '1px dashed #555', borderRadius: '4px', minWidth: '200px' }}
                 // Passa o índice do nó filho (0 para a primeira coluna)
                 // Isso é importante para o Tiptap saber onde renderizar o quê
                 // No entanto, Tiptap geralmente lida com isso automaticamente se a estrutura do conteúdo for simples (column{2})
                 // node-view-content-dom
             />
            {/* Renderiza o conteúdo da segunda coluna filha */}
             <NodeViewContent
                 as="div"
                 className="tiptap-column column-right"
                 // style={{ flex: 1, padding: '8px', border: '1px dashed #555', borderRadius: '4px', minWidth: '200px' }}
                 // Índice 1 para a segunda coluna
             />
        </NodeViewWrapper>
    );
};

// Não precisa exportar ColumnsNodeView diretamente se só for usado aqui
// export default ColumnsNodeView; // Desnecessário