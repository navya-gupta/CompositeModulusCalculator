// src/components/Layout.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './SideBar/SideBar';

const Layout = ({ children, sidebarRoutes = [] }) => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if current route should have sidebar
    const showSidebar = sidebarRoutes.includes(location.pathname);

    // Toggle sidebar collapsed state
    const toggleSidebar = () => {
        setCollapsed(prev => !prev);
    };

    // Handle responsive behavior
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setCollapsed(true);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    return (
        <div className="flex min-h-screen min-w-screen">
            {showSidebar && (
                <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
            )}
            <div className={`flex-1 grow transition-all duration-300 ${showSidebar ? (collapsed ? 'ml-0' : 'ml-0') : 'ml-0'}`}>
                {children}
            </div>
        </div>
    );
};

export default Layout;