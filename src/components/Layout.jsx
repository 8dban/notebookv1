import React, { useState } from 'react';
import { ClipboardList, Menu, X, PlusCircle, BookOpen, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import './Layout.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button onClick={toggleSidebar} className="btn-icon">
          <Menu size={24} />
        </button>
        <h1 className="header-title">كراسة الطلبات</h1>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className={`logo-area ${isCollapsed ? 'justify-center' : ''}`}>
            <img src="/src/assets/logo.png" alt="شعار الصيدلية" className="brand-logo" />
          </div>
        </div>

        <button
          className="collapse-btn desktop-only"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
        >
          {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <nav className="sidebar-nav">
          <button
            className={`nav-item active ${isCollapsed ? 'justify-center p-2' : ''}`}
            onClick={() => setSidebarOpen(false)}
            title={isCollapsed ? "كراسة الطلبات" : ""}
            data-tooltip="كراسة الطلبات"
          >
            <div className="nav-item-content">
              <BookOpen size={20} />
              {!isCollapsed && <span>كراسة الطلبات</span>}
            </div>
          </button>
        </nav>

        <div className="sidebar-footer">
          {!isCollapsed && <p className="footer-text">v1.1.0</p>}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
}
