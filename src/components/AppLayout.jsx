// src/components/AppLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { LuMenu, LuX } from 'react-icons/lu';
import styles from '../styles/AppLayout.module.css'; // Importa o CSS Module

function AppLayout() {
  // Estado para controlar a visibilidade do sidebar em mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fecha o sidebar se a tela for redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false); // Fecha o menu se a tela ficar grande
      }
    };
    window.addEventListener('resize', handleResize);
    // Limpeza ao desmontar
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.appLayout}>
      {/* Sidebar (controlado por estado e CSS Modules) */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Área de Conteúdo Principal */}
      <div className={styles.mainContent}>
        {/* Cabeçalho Mobile com botão de menu */}
        <header className={styles.mobileHeader}>
          <h1 className={styles.mobileTitle}>Meu App</h1>
          <button
            onClick={toggleSidebar}
            className={styles.menuButton}
            aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isSidebarOpen ? <LuX size={24} className="react-icon" /> : <LuMenu size={24} className="react-icon"/>}
          </button>
        </header>

        {/* Conteúdo da página atual */}
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;