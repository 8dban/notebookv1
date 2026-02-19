import React from 'react';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      {/* Simple Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="pharmacy-logo-text">صيدلية د.محمد ناصر</div>
          <h1 className="header-title">كراسة الطلبات</h1>
        </div>
        <div className="header-version">v1.1.0</div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
}
