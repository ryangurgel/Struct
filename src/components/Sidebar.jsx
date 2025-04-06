// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LuCalendarDays, LuClipboardList, LuStickyNote } from 'react-icons/lu';
import styles from './Sidebar.module.css'; // Importa o CSS Module

const navItems = [
  { name: 'Agenda', path: '/agenda', icon: LuCalendarDays },
  { name: 'Revisões', path: '/revisoes', icon: LuClipboardList },
  { name: 'Notas', path: '/notas', icon: LuStickyNote },
];

// Adicionamos a classe 'react-icon' para estilização global opcional
const IconWrapper = ({ children }) => <span className={`${styles.navIcon} react-icon`}>{children}</span>;

function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* Overlay para fechar sidebar em mobile */}
      {isOpen && (
        <div
          className={styles.overlay} // Estilo do overlay
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarContent}>
          <h2 className={styles.sidebarHeader}>Meu App</h2>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                // Usa uma função para determinar a classe - NavLink adiciona 'active' por padrão
                // Combinamos nossas classes do module com a classe 'active' potencial
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
                onClick={window.innerWidth < 1024 ? toggleSidebar : undefined} // Fecha ao clicar só em mobile
              >
                <IconWrapper><item.icon size={20} /></IconWrapper>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;