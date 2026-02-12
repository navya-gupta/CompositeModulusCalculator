import { useLocation } from 'react-router-dom';
import { HomeIcon, ManualIcon, MenuIcon, UploadIcon } from '../../../assets/svgs/SidebarIconsSVG';
import SidebarMenuItem from './SidebarMenuItem';

const Sidebar = ({ collapsed, toggleSidebar }) => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const urlParams = new URLSearchParams(window.location.search);
    const uploadIdFromUrl = urlParams.get('upload_id');
    // Menu items data with imported icons
    const menuItems = [
        { url: '/', title: 'Home', icon: HomeIcon },
        { url: '/upload', title: 'Upload CSV', icon: UploadIcon },
        { url: `/menu?upload_id=${uploadIdFromUrl}`, title: 'Menu', icon: MenuIcon },
        // { url: '/graph', title: 'Graph', icon: GraphIcon }
    ];

    // Add the manual item with an external URL
    const manualItem = {
        url: '/Software Manual.pdf', // Replace with your actual PDF path
        title: 'See Manual',
        icon: ManualIcon,
        isExternal: true // Flag to indicate this is an external link
    };

    return (
        <div className={`${collapsed ? 'w-16' : 'w-64'} the-sidebar min-h-screen bg-[#343a40] text-white shrink-0 transition-all duration-300`}>
            {/* Header */}
            <div className="flex items-center p-4 border-b-[3px] border-gray-700">
                {!collapsed && <h1 className="text-white text-xl font-semibold">Options</h1>}
                <button
                    onClick={toggleSidebar}
                    className={`rounded-full ml-auto p-1 bg-white text-black focus:outline-none transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
            </div>

            {/* Menu Items */}
            <div className="overflow-y-auto h-[calc(100vh-72px)]">
                <ul>
                    {menuItems.map((item, index) => (
                        <SidebarMenuItem
                            key={index}
                            url={item.url}
                            icon={item.icon}
                            title={item.title}
                            collapsed={collapsed}
                            isActive={isActive}
                        />
                    ))}
                    {/* Add manual item separately */}
                    <SidebarMenuItem
                        key="manual"
                        url={manualItem.url}
                        icon={manualItem.icon}
                        title={manualItem.title}
                        collapsed={collapsed}
                        isActive={isActive}
                        isExternal={manualItem.isExternal}
                    />
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;