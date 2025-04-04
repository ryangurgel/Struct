// src/App.jsx
// Nenhuma mudança necessária aqui, continua usando BrowserRouter e Routes
// Apenas certifique-se que os componentes importados (AppLayout, NotesPage, etc.)
// agora usam seus respectivos CSS Modules internamente.
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout'; // Importa o componente que usa CSS Module
import NotesPage from './components/NotesPage';    // Importa o componente que usa CSS Module
import KnowledgeMap from './components/KnowledgeMap';


// Placeholders
const AgendaPage = () => <div style={{ textAlign: 'center', fontSize: '1.5rem', padding: '2rem' }}>Página da Agenda (em construção)</div>;
const RevisoesPage = () => <div style={{ textAlign: 'center', fontSize: '1.5rem', padding: '2rem' }}>Página de Revisões (em construção)</div>;
const NotFoundPage = () => <div style={{ textAlign: 'center', fontSize: '1.5rem', padding: '2rem' }}>404 - Página não encontrada</div>;


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}> {/* O layout agora usa CSS Modules */}
          <Route index element={<Navigate to="/notas" replace />} />
          <Route path="notas" element={<NotesPage />} /> {/* A página agora usa CSS Modules */}
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="revisoes" element={<RevisoesPage />} />
          <Route path="mapa" element={<KnowledgeMap />} />
           <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;