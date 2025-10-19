import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const location = useLocation();

  // Don't show layout on onboarding and auth pages
  const authPaths = ['/signin', '/signup', '/verify-email', '/onboarding'];
  const isAuthPage = authPaths.includes(location.pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Close mobile sidebar when tab changes
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Desktop Layout - fixed sidebar, scrollable content */}
      <div className="hidden lg:block">
        {/* Desktop Sidebar - fixed position, doesn't scroll */}
        <aside className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-40 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <Sidebar
            isOpen={true}
            onClose={handleCloseSidebar}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </aside>

        {/* Desktop Main Content - scrollable, accounts for sidebar width */}
        <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          {/* Desktop Header - fixed at top */}
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-slate-700/60 sticky top-0 z-30">
            <Header
              onMenuToggle={handleToggleSidebar}
              isSidebarOpen={sidebarOpen}
              isSidebarCollapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleCollapse}
              activeTab={activeTab}
            />
          </header>

          {/* Desktop Page Content - scrollable */}
          <main className="flex-1 overflow-y-auto">
            <div className="h-full p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout - overlay system */}
      <div className="lg:hidden min-h-screen">
        {/* Mobile Main Content (includes header) */}
        <div className="flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-slate-700/60">
            <Header
              onMenuToggle={handleToggleSidebar}
              isSidebarOpen={sidebarOpen}
              isSidebarCollapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleCollapse}
              activeTab={activeTab}
            />
          </header>

          {/* Mobile Page Content */}
          <main className="flex-1">
            <div className="h-full p-4">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay - only when open */}
        {sidebarOpen && (
          <>
            {/* Mobile backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-30"
              onClick={handleCloseSidebar}
            />
            {/* Mobile sidebar */}
            <aside className={`fixed left-0 top-0 h-full w-64 z-40 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <Sidebar
                isOpen={sidebarOpen}
                onClose={handleCloseSidebar}
                isCollapsed={false}
                onToggleCollapse={handleToggleCollapse}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
