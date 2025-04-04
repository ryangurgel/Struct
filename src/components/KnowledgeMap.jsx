// KnowledgeMap.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Box, ThemeProvider, Typography, Paper, Chip, IconButton, Tooltip } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import NoteIcon from '@mui/icons-material/Note';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// Importa o CSS customizado
import './knowledge-map.css';

// Tema dark customizado
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#bb86fc' },
    secondary: { main: '#03dac6' },
    background: { default: '#121212', paper: '#1E1E1E' },
    text: { primary: '#E0E0E0', secondary: '#B0B0B0' },
    divider: '#424242',
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    body2: { fontSize: '0.8rem' },
    caption: { fontSize: '0.7rem' },
  },
});

// =====================
// Função para atualizar a árvore (toggle de expansão)
// =====================
function toggleInTree(tree, id) {
  return tree.map((node) => {
    if (node.id === id && node.type === 'folder') {
      return { ...node, expanded: !node.expanded };
    } else if (node.children && node.children.length > 0) {
      return { ...node, children: toggleInTree(node.children, id) };
    }
    return node;
  });
}

// =====================
// Função para "achatar" a árvore hierárquica conforme estado de expansão e zoom
// =====================
const ZOOM_THRESHOLD_CHILDREN = 0.7; // A partir deste zoom, filhos são exibidos

function flattenTree(tree, parentAbsPos = { x: 0, y: 0 }, zoom, level = 0) {
  let flatNodes = [];
  let flatEdges = [];

  tree.forEach((node) => {
    // Calcula posição absoluta: soma a posição do pai com a posição relativa do nó
    const absPos = { x: parentAbsPos.x + node.position.x, y: parentAbsPos.y + node.position.y };

    flatNodes.push({
      id: node.id,
      type: node.type,
      position: absPos,
      data: {
        label: node.label,
        expanded: node.expanded,
        isFolder: node.type === 'folder',
        childCount: node.children ? node.children.length : 0,
        level,
      },
    });

    // Se o nó for uma pasta e estiver expandida **e** o zoom for suficiente, achata seus filhos
    if (node.type === 'folder' && node.expanded && zoom >= ZOOM_THRESHOLD_CHILDREN) {
      // Processa recursivamente os filhos
      const result = flattenTree(node.children, absPos, zoom, level + 1);
      flatNodes = flatNodes.concat(result.nodes);
      // Cria aresta (conexão) do nó pai para cada filho
      node.children.forEach((child) => {
        flatEdges.push({
          id: `e-${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          type: 'smoothstep',
          style: {
            strokeWidth: level === 0 ? 3 : 2,
            stroke: '#90A4AE',
          },
        });
      });
      flatEdges = flatEdges.concat(result.edges);
    }
  });
  return { nodes: flatNodes, edges: flatEdges };
}

// =====================
// Nó customizado para pastas (folders)
// =====================
const FolderNode = React.memo(({ data, selected, id }) => {
  const { zoom } = useReactFlow();
  const showDetails = zoom > 0.6; // Exibe detalhes em zoom maior

  return (
    <Paper
      onDoubleClick={() => data.onToggle(id)}
      elevation={selected ? 8 : 3}
      sx={{
        padding: showDetails ? '12px 18px' : '8px 10px',
        borderRadius: '12px',
        border: selected ? `2px solid ${darkTheme.palette.primary.main}` : `1px solid ${darkTheme.palette.divider}`,
        backgroundColor: 'background.paper',
        minWidth: showDetails ? 180 : 80,
        maxWidth: 300,
        textAlign: 'center',
        transition: 'all 0.3s ease',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: selected ? `0 0 15px ${darkTheme.palette.primary.main}` : 'none',
      }}
    >
      {/* Handles para conexões */}
      <Handle type="source" position={Position.Right} style={{ background: '#777', top: '30%' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#777', top: '30%' }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
        {showDetails && (data.expanded ? <FolderOpenIcon /> : <FolderIcon />)}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {data.label}
        </Typography>
      </Box>
      {showDetails && data.childCount > 0 && (
        <Chip label={`${data.childCount} itens`} size="small" variant="outlined" />
      )}
    </Paper>
  );
});

// =====================
// Nó customizado para notas
// =====================
const NoteNode = React.memo(({ data, selected, id }) => {
  const { zoom } = useReactFlow();

  if (zoom < 0.5) {
    // Em zoom baixo, exibe como um ponto simples
    return (
      <Box sx={{ width: 6, height: 6, backgroundColor: '#666', borderRadius: '50%' }}>
        <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: '8px 12px',
        borderRadius: '6px',
        background: selected
          ? 'linear-gradient(135deg, rgba(187,134,252,0.3), rgba(3,218,198,0.3))'
          : 'rgba(255,255,255,0.05)',
        border: selected ? `1px solid ${darkTheme.palette.primary.main}` : '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        gap: 0.8,
        minWidth: 120,
        maxWidth: 250,
        boxShadow: selected ? '0 0 8px rgba(187,134,252,0.5)' : 'none',
        transition: 'all 0.2s ease-in-out',
        transform: selected ? 'scale(1.03)' : 'scale(1)',
        opacity: Math.max(0, (zoom - 0.4) * 3),
        cursor: 'pointer',
        '&:hover': {
          borderColor: darkTheme.palette.primary.light,
          background: 'rgba(255,255,255,0.08)',
        },
      }}
    >
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <NoteIcon sx={{ color: darkTheme.palette.secondary.main, fontSize: '1rem', opacity: 0.8 }} />
      <Typography
        variant="body2"
        sx={{
          color: 'text.primary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {data.label}
      </Typography>
    </Box>
  );
});

// Mapeamento dos tipos de nós
const nodeTypes = {
  folder: FolderNode,
  note: NoteNode,
};

// =====================
// Dados iniciais da árvore hierárquica
// (As posições dos filhos são relativas à posição do pai)
// =====================
const initialTreeData = [
  {
    id: 'fisica',
    type: 'folder',
    label: 'Física',
    position: { x: 100, y: 100 },
    expanded: true, // Começa expandida
    children: [
      {
        id: 'termo',
        type: 'folder',
        label: 'Termodinâmica',
        position: { x: 100, y: 50 },
        expanded: true,
        children: [
          { id: 'entropia', type: 'note', label: 'Entropia e Desordem', position: { x: 50, y: 50 } },
          { id: 'leiGases', type: 'note', label: 'Leis dos Gases Ideais', position: { x: 150, y: 50 } },
        ],
      },
      {
        id: 'cinematica',
        type: 'folder',
        label: 'Cinemática',
        position: { x: 100, y: 150 },
        expanded: false,
        children: [
          { id: 'mecanica', type: 'note', label: 'Mecânica Clássica', position: { x: 50, y: 50 } },
        ],
      },
    ],
  },
  {
    id: 'quimica',
    type: 'folder',
    label: 'Química',
    position: { x: 400, y: 100 },
    expanded: true,
    children: [
      { id: 'ligacoes', type: 'note', label: 'Ligações Químicas', position: { x: 50, y: 50 } },
    ],
  },
  {
    id: 'portugues',
    type: 'folder',
    label: 'Português',
    position: { x: 400, y: 300 },
    expanded: false,
    children: [],
  },
];

// =====================
// Componente principal do mapa de conhecimento
// =====================
function KnowledgeMapComponent() {
  const { zoomIn, zoomOut, fitView, getViewport } = useReactFlow();
  const [treeData, setTreeData] = useState(initialTreeData);
  const [currentZoom, setCurrentZoom] = useState(1);

  // Atualiza o zoom atual quando o viewport se move
  const onMove = useCallback(() => {
    const viewport = getViewport();
    setCurrentZoom(viewport.zoom);
  }, [getViewport]);

  // Achata a árvore conforme o zoom atual
  const { nodes: flattenedNodes, edges: internalEdges } = useMemo(() => {
    return flattenTree(treeData, { x: 0, y: 0 }, currentZoom, 0);
  }, [treeData, currentZoom]);

  // Exemplo de aresta externa: conecta a nota “Leis dos Gases Ideais” (dentro de Termodinâmica) à pasta “Química”
  const externalEdges = [
    {
      id: 'ext-leiGases-quimica',
      source: 'leiGases',
      target: 'quimica',
      type: 'smoothstep',
      style: { stroke: '#4FC3F7', strokeDasharray: '3 3', strokeWidth: 2 },
    },
  ];

  // Junta as arestas internas com as externas
  const flattenedEdges = [...internalEdges, ...externalEdges];

  // Função para alternar a expansão de uma pasta
  const toggleFolder = useCallback((nodeId) => {
    setTreeData((prevTree) => toggleInTree(prevTree, nodeId));
  }, []);

  // Injeta a função de toggle nos dados de nós do tipo pasta
  const nodesWithToggle = flattenedNodes.map((node) => {
    if (node.type === 'folder') {
      return { ...node, data: { ...node.data, onToggle: toggleFolder } };
    }
    return node;
  });

  const onNodeDoubleClick = useCallback(
    (event, node) => {
      if (node.type === 'folder') {
        toggleFolder(node.id);
      }
    },
    [toggleFolder]
  );

  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node);
    // Aqui você pode implementar outras ações, por exemplo, abrir detalhes da nota.
  }, []);

  // Ajusta a visão quando o componente monta
  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView]);

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 100px)', position: 'relative' }}>
      <ReactFlow
        nodes={nodesWithToggle}
        edges={flattenedEdges}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={onNodeClick}
        onMove={onMove}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 2.5 }}
        minZoom={0.1}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
        className="knowledge-map-flow"
      >
        <Controls showInteractive={false} style={{ bottom: 15, left: 15 }} />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'folder':
                return darkTheme.palette.primary.main;
              case 'note':
                return darkTheme.palette.secondary.main;
              default:
                return '#eee';
            }
          }}
          nodeStrokeWidth={3}
          pannable
          zoomable
          style={{
            backgroundColor: darkTheme.palette.background.paper,
            border: `1px solid ${darkTheme.palette.divider}`,
            borderRadius: '4px',
            bottom: 15,
            right: 15,
          }}
        />
        <Background variant="dots" gap={20} size={1} color={darkTheme.palette.divider} />
        <Box
          sx={{
            position: 'absolute',
            top: 15,
            right: 15,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            zIndex: 5,
            backgroundColor: 'background.paper',
            padding: '5px',
            borderRadius: '4px',
            boxShadow: 1,
          }}
        >
          <Tooltip title="Zoom In" placement="left">
            <IconButton size="small" onClick={() => zoomIn({ duration: 300 })}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out" placement="left">
            <IconButton size="small" onClick={() => zoomOut({ duration: 300 })}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit View" placement="left">
            <IconButton size="small" onClick={() => fitView({ padding: 0.2, duration: 500 })}>
              <FitScreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </ReactFlow>
    </Box>
  );
}

// Componente wrapper que fornece o contexto do React Flow e do tema
export default function KnowledgeMapPage() {
  return (
    <ThemeProvider theme={darkTheme}>
      <ReactFlowProvider>
        <Box sx={{ p: 2, backgroundColor: 'background.default', minHeight: '100vh' }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', textAlign: 'center', mb: 3 }}>
            Mapa do Conhecimento
          </Typography>
          <KnowledgeMapComponent />
        </Box>
      </ReactFlowProvider>
    </ThemeProvider>
  );
}
