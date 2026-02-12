import { Link } from "react-router-dom";

// SidebarMenuItem component
const SidebarMenuItem = ({ url, icon, title, collapsed, isActive, isExternal }) => {
    // If it's an external link, we'll use a regular anchor tag instead of the Link component
    if (isExternal) {
        return (
            <li>
                <div className='px-2 py-0.75'>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded-md flex items-center py-3 px-1 text-white hover:text-white ${collapsed ? 'justify-center px-2' : 'px-4'} hover:bg-[#494e53]`}
                    >
                        <div className={`${collapsed ? 'w-8' : 'w-6 mr-3'} flex justify-center ${collapsed ? '' : 'ml-2'}`}>
                            {icon}
                        </div>
                        {!collapsed && <span className="ml-2">{title}</span>}
                    </a>
                </div>
            </li>
        );
    }

    // For internal links, use the original Link component
    return (
        <li>
            <div className='px-2 py-0.75'>
                <Link
                    to={url}
                    className={`rounded-md flex items-center py-3 px-1 text-white hover:text-white ${collapsed ? 'justify-center px-2' : 'px-4'} hover:bg-${isActive(url) ? '[#54058c]' : '[#494e53]'} ${isActive(url) ? 'bg-[#54058c]' : ''}`}
                >
                    <div className={`${collapsed ? 'w-8' : 'w-6 mr-3'} flex justify-center ${collapsed ? '' : 'ml-2'}`}>
                        {icon}
                    </div>
                    {!collapsed && <span className="ml-2">{title}</span>}
                </Link>
            </div>
        </li>
    );
};

export default SidebarMenuItem;