// SlashCommand.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import SuggestionList from './SuggestionList'; // Componente da lista

// Ícones MUI (adicione mais se precisar)
import TextFieldsIcon from '@mui/icons-material/TextFields'; // Ícone genérico para parágrafo
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'; // Ícone para Task List
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code'; // Ícone para Code Block
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'; // Ícone para Tabela
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'; // Ícone para Imagem (Upload)
import LinkIcon from '@mui/icons-material/Link'; // Ícone para Imagem via Link (Opcional)
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined'; // Ícone para Colunas
import FormatTextdirectionLToRIcon from '@mui/icons-material/FormatTextdirectionLToR'; // Ícone para Placeholder (exemplo)


// Função auxiliar para criar os itens do comando
const getSuggestionItems = ({ query }) => {
    const items = [
         {
            icon: <TextFieldsIcon fontSize="small" />,
            title: 'Texto',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('paragraph').run();
            },
            keywords: ['paragrafo', 'paragraph', 'p', 'texto', 'normal'],
        },
        {
            icon: <LooksOneIcon fontSize="small" />,
            title: 'Título 1',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
            },
            keywords: ['titulo 1', 'heading 1', 'h1', 'cabecalho 1'],
        },
        {
            icon: <LooksTwoIcon fontSize="small" />,
            title: 'Título 2',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
            },
             keywords: ['titulo 2', 'heading 2', 'h2', 'cabecalho 2'],
        },
         {
            icon: <Looks3Icon fontSize="small" />,
            title: 'Título 3',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
            },
             keywords: ['titulo 3', 'heading 3', 'h3', 'cabecalho 3'],
        },
        {
            icon: <FormatListBulletedIcon fontSize="small" />,
            title: 'Lista (Marcadores)',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
            },
             keywords: ['lista marcador', 'bullet list', 'ul', 'pontos'],
        },
        {
            icon: <FormatListNumberedIcon fontSize="small" />,
            title: 'Lista (Numerada)',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
            },
             keywords: ['lista numerada', 'ordered list', 'ol', 'numeros'],
        },
        {
            icon: <CheckBoxOutlineBlankIcon fontSize="small" />,
            title: 'Lista de Tarefas',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleTaskList().run();
            },
             keywords: ['lista tarefa', 'task list', 'checklist', 'todo'],
        },
        {
            icon: <FormatQuoteIcon fontSize="small" />,
            title: 'Citação',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run();
            },
             keywords: ['citacao', 'quote', 'blockquote', 'bloco de citacao'],
        },
        {
            icon: <CodeIcon fontSize="small" />,
            title: 'Bloco de Código',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
            },
             keywords: ['codigo', 'code block', 'bloco de codigo', 'programacao', 'pre'],
        },
        {
            icon: <HorizontalRuleIcon fontSize="small" />,
            title: 'Divisor Horizontal',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run();
            },
             keywords: ['divisor', 'horizontal rule', 'hr', 'linha', 'separador'],
        },
        {
            icon: <TableChartOutlinedIcon fontSize="small" />,
            title: 'Tabela',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range)
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run();
            },
             keywords: ['tabela', 'table', 'grade'],
        },
         {
             icon: <ImageOutlinedIcon fontSize="small" />,
             title: 'Imagem (Upload)',
             command: ({ editor, range }) => {
                 // Insere o nó 'imageUploader' que contém a lógica de upload/resize
                 editor.chain().focus().deleteRange(range).insertContent({
                     type: 'imageUploader', // Nome do nó definido em ImageUploader.js
                     attrs: { src: null, width: '100%', height: 'auto' }, // Atributos iniciais
                 }).run();
             },
             keywords: ['imagem', 'image', 'upload', 'foto', 'picture', 'img'],
         },
         { // Opcional: Inserir imagem via URL
             icon: <LinkIcon fontSize="small" />,
             title: 'Imagem (URL)',
             command: ({ editor, range }) => {
                const url = window.prompt('URL da imagem:');
                if (url) {
                    editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
                }
             },
             keywords: ['imagem url', 'image link', 'foto web'],
         },
         {
             icon: <ViewColumnOutlinedIcon fontSize="small" />,
             title: 'Duas Colunas',
             command: ({ editor, range }) => {
                 editor
                     .chain()
                     .focus()
                     .deleteRange(range)
                      // Insere a estrutura de colunas definida em Columns.jsx
                     .insertContent({
                         type: 'columns', // Nó pai
                         content: [
                             { type: 'column', content: [{ type: 'paragraph' }] }, // Coluna 1 com parágrafo vazio
                             { type: 'column', content: [{ type: 'paragraph' }] }, // Coluna 2 com parágrafo vazio
                         ]
                     })
                     // Coloca o cursor no início da primeira coluna (opcional)
                     // .setTextSelection(range.from + 2) // Ajuste a posição se necessário
                     .run();
             },
              keywords: ['colunas', 'columns', 'layout', 'dividir'],
         },
        // { // Exemplo: Placeholder (se necessário manualmente)
        //     icon: <FormatTextdirectionLToRIcon fontSize="small" />,
        //     title: 'Placeholder',
        //     command: ({ editor, range }) => {
        //         editor.chain().focus().deleteRange(range).toggleNode('placeholder', 'paragraph').run()
        //     },
        //      keywords: ['placeholder', 'texto exemplo'],
        // }
    ];

    // Filtra os itens baseado na query (case-insensitive)
    if (!query) {
        return items; // Retorna todos se não houver query
    }

    const lowerCaseQuery = query.toLowerCase();
    return items.filter(item =>
         item.title.toLowerCase().includes(lowerCaseQuery) ||
         (item.keywords && item.keywords.some(kw => kw.includes(lowerCaseQuery)))
     );
};


// Lógica de renderização do popup (mantida similar, mas com tratamento de erro)
const suggestionRender = () => {
    let component;
    let popup;
    let root; // Para React 18+

    return {
        onStart: props => {
            const container = document.createElement('div');
            // Cria a raiz React no container
            root = createRoot(container);

            // Cria o componente React com forwardRef
            component = React.forwardRef((p, ref) => <SuggestionList {...p} {...props} ref={ref} />);

             // Renderiza o componente na raiz
             // Usamos React.createElement para passar a ref corretamente
             root.render(React.createElement(component, { ref: React.createRef() }));


            popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: container,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                theme: 'dark-suggestion', // Pode criar um tema tippy customizado
                 arrow: false, // Sem seta
                 maxWidth: 300, // Largura máxima
                 offset: [0, 5], // Pequeno deslocamento vertical
                 popperOptions: {
                     modifiers: [{ name: 'flip', enabled: true }], // Permite inverter se não couber
                 },
            });
        },

        onUpdate(props) {
            // Atualiza as props do componente React (se necessário, mas SuggestionList já pega de props)
             // Atualiza a posição do popup
             if (popup && popup[0] && !popup[0].state.isDestroyed) {
                 popup[0].setProps({
                     getReferenceClientRect: props.clientRect,
                 });
             } else {
                 // Recria se foi destruído (pode acontecer em alguns casos)
                 this.onStart(props);
             }
             // Re-renderiza o componente se a lista de itens mudar
             if (root && component) {
                 root.render(React.createElement(component, { ref: React.createRef(), ...props }));
             }
        },

        onKeyDown(props) {
            // Tenta chamar o onKeyDown do SuggestionList (se ele expor via ref)
            // A implementação atual de SuggestionList usa useImperativeHandle
            const suggestionListRef = component?.ref?.current; // Acessa a ref
            if (suggestionListRef && suggestionListRef.onKeyDown) {
                return suggestionListRef.onKeyDown(props);
            }

            // Fallback ou se o componente não tratar
             if (props.event.key === 'Escape') {
                 popup[0]?.hide();
                 return true;
             }
            return false; // Deixa o Tiptap tratar outras teclas
        },

        onExit() {
             if (popup && popup[0] && !popup[0].state.isDestroyed) {
                 popup[0].destroy();
             }
             if (root) {
                 // Desmonta o componente React corretamente
                 root.unmount();
             }
             component = null;
             popup = null;
             root = null;
        },
    };
};


// Configuração da Extensão SlashCommand
const SlashCommand = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }) => {
                    // Executa o comando do item selecionado
                    props.command({ editor, range });
                },
                items: getSuggestionItems, // Usa a função para obter os itens
                render: suggestionRender, // Usa a função de renderização
                allowSpaces: false, // Não permite espaços na query do comando
                startOfLine: false, // Permite '/' em qualquer lugar da linha (ajuste se necessário)
                 // Debounce para evitar chamadas excessivas ao digitar rápido (opcional)
                 // debounce: 150,
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

export default SlashCommand;