import { useState } from 'react';
import { NavLink } from 'react-router-dom';

// ─── Icons ────────────────────────────────────────────────────────────────────
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const ManualIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

const ChevronIcon = ({ collapsed }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

// ─── Shared nav items (top section) ──────────────────────────────────────────
const NAV_ITEMS = [
    { url: '/', icon: <HomeIcon />, title: 'Home' },
    // { url: '/upload', icon: <UploadIcon />, title: 'Upload CSV' },
    { url: '/charts-menu', icon: <MenuIcon />, title: 'Menu' },
];

const MANUAL_ITEM = {
    url: 'https://docs.example.com',
    icon: <ManualIcon />,
    title: 'See Manual',
    isExternal: true,
};

// ─── Nav link item ────────────────────────────────────────────────────────────
const NavItem = ({ url, icon, title, collapsed, isExternal = false }) => {
    const base =
        'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 ' +
        'hover:bg-white/10 rounded-md mx-2 my-0.5';
    const activeClass = 'bg-white/15 text-white';
    const inactiveClass = 'text-gray-300';

    if (isExternal) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer"
                className={`${base} ${inactiveClass}`}>
                <span className="shrink-0">{icon}</span>
                {!collapsed && <span className="truncate">{title}</span>}
            </a>
        );
    }

    return (
        <NavLink to={url}
            className={({ isActive }) => `${base} ${isActive ? activeClass : inactiveClass}`}>
            <span className="shrink-0">{icon}</span>
            {!collapsed && <span className="truncate">{title}</span>}
        </NavLink>
    );
};

// ─── Stepper number input ─────────────────────────────────────────────────────
const StepperInput = ({ label, name, value, onChange, step = 0.001, min, collapsed }) => {
    const handleIncrement = () => {
        const newVal = parseFloat((parseFloat(value) + step).toFixed(10));
        onChange(name, newVal);
    };
    const handleDecrement = () => {
        const newVal = parseFloat((parseFloat(value) - step).toFixed(10));
        if (min !== undefined && newVal < min) return;
        onChange(name, newVal);
    };
    const handleInputChange = (e) => {
        onChange(name, e.target.value);
    };

    if (collapsed) return null;

    return (
        <div className="mb-3">
            <label className="block text-xs font-semibold text-white-400 mb-1 leading-tight">
                {label}
            </label>
            <div className="flex items-center bg-[#2a2f35] border border-gray-600 rounded-md overflow-hidden">
                <input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    step={step}
                    className="flex-1 bg-transparent text-white text-sm px-2 py-1.5 focus:outline-none w-0 min-w-0"
                />
                <div className="flex flex-col border-l border-gray-600 shrink-0">
                    <button
                        type="button"
                        onClick={handleDecrement}
                        className="px-2 py-1 text-gray-400 hover:text-white hover:bg-white/10 text-xs leading-none border-b border-gray-600 transition-colors"
                    >
                        −
                    </button>
                    <button
                        type="button"
                        onClick={handleIncrement}
                        className="px-2 py-1 text-gray-400 hover:text-white hover:bg-white/10 text-xs leading-none transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Glass type dropdown ──────────────────────────────────────────────────────
const GLASS_OPTIONS = [
    { label: 'Soda-Lime Glass', value: 'soda-lime', density: 2500 },
    { label: 'Borosilicate Glass', value: 'borosilicate', density: 2250 },
];

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
/**
 * Props:
 *   collapsed        {boolean}
 *   toggleSidebar    {() => void}
 *   formValues       {object}   — controlled from parent (charts page)
 *   onFormChange     {(name, value) => void}
 */
const Sidebar2 = ({ collapsed, toggleSidebar, formValues, onFormChange }) => {
    // Local state only used when Sidebar owns the form (fallback)
    const [localForm, setLocalForm] = useState({
        em: 1100,
        nm: 0.425,
        eb: 30000,
        nb: 0.2,
        glassType: 'soda-lime',
        particleDensity: 600,
        phi_rpl: 0.6,
    });

    const isControlled = formValues !== undefined && onFormChange !== undefined;
    const form = isControlled ? formValues : localForm;

    const handleChange = (name, value) => {
        if (isControlled) {
            onFormChange(name, value);
        } else {
            setLocalForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleGlassTypeChange = (e) => {
        const selected = GLASS_OPTIONS.find(o => o.value === e.target.value);
        handleChange('glassType', e.target.value);
        // Auto-update particle density field only if blank
        if (!form.particleDensity) {
            handleChange('particleDensity', selected?.density ?? '');
        }
    };

    // Compute eta whenever glass density or particle density changes
    const glassDensity = GLASS_OPTIONS.find(o => o.value === form.glassType)?.density ?? 2500;
    const rhoP = parseFloat(form.particleDensity);
    const etaComputed =
        !isNaN(rhoP) && rhoP > 0 && glassDensity > 0
            ? Math.pow(1 - rhoP / glassDensity, 1 / 3)
            : null;

    const selectedGlass = GLASS_OPTIONS.find(o => o.value === form.glassType);

    return (
        <div
            className={`${collapsed ? 'w-16' : 'w-72'} the-sidebar min-h-screen bg-[#343a40] text-white shrink-0 transition-all duration-300 flex flex-col`}
        >
            {/* ── Header ── */}
            <div className="flex items-center p-4 border-b border-gray-700 shrink-0">
                {!collapsed && <h1 className="text-white text-xl font-semibold">Options</h1>}
                <button
                    onClick={toggleSidebar}
                    className="rounded-full ml-auto p-1 bg-white text-black focus:outline-none transition-transform duration-300"
                >
                    <ChevronIcon collapsed={collapsed} />
                </button>
            </div>

            {/* ── Nav links ── */}
            <nav className="py-2 border-b border-gray-700 shrink-0">
                {NAV_ITEMS.map((item) => (
                    <NavItem key={item.url} {...item} collapsed={collapsed} />
                ))}
                {/* <NavItem {...MANUAL_ITEM} collapsed={collapsed} /> */}
            </nav>

            {/* ── Scientific Form (hidden when collapsed) ── */}
            {!collapsed && (
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {/* Matrix Properties */}
                    <p className="text-xs font-bold text-white-400 uppercase tracking-widest mb-2">
                        Matrix Properties
                    </p>
                    <StepperInput
                        label="Young's Modulus (Em) [MPa]"
                        name="em"
                        value={form.em}
                        step={100}
                        min={0}
                        onChange={handleChange}
                        collapsed={collapsed}
                    />
                    <StepperInput
                        label="Poisson's Ratio (nm)"
                        name="nm"
                        value={form.nm}
                        step={0.001}
                        min={0}
                        onChange={handleChange}
                        collapsed={collapsed}
                    />

                    {/* Inclusion Properties */}
                    <p className="text-xs font-bold text-white-400 uppercase tracking-widest mb-2 mt-4 pt-2 border-t border-gray-700">
                        Inclusion Properties
                    </p>
                    <StepperInput
                        label="Young's Modulus (Eb) [MPa]"
                        name="eb"
                        value={form.eb}
                        step={1000}
                        min={0}
                        onChange={handleChange}
                        collapsed={collapsed}
                    />
                    <StepperInput
                        label="Poisson's Ratio (nb)"
                        name="nb"
                        value={form.nb}
                        step={0.001}
                        min={0}
                        onChange={handleChange}
                        collapsed={collapsed}
                    />

                    {/* Glass Type */}
                    <p className="text-xs font-bold text-white-400 uppercase tracking-widest mb-2 mt-4 pt-2 border-t border-gray-700">
                        Glass & Geometry
                    </p>
                    <div className="mb-3">
                        <label className="block text-xs font-semibold text-white-400 mb-1">
                            Type of Glass
                        </label>
                        <select
                            value={form.glassType}
                            onChange={handleGlassTypeChange}
                            className="w-full bg-[#2a2f35] border border-gray-600 text-white text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                            {GLASS_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <p className="text-s text-white-500 mt-1">
                            ρ<sub>glass</sub> = {selectedGlass?.density?.toLocaleString()} kg/m³
                        </p>
                    </div>

                    {/* True Particle Density */}
                    <div className="mb-3">
                        <label className="block text-xs font-semibold text-white-400 mb-1 leading-tight">
                            True Particle Density [kg/m³]
                        </label>
                        <div className="flex items-center bg-[#2a2f35] border border-gray-600 rounded-md overflow-hidden">
                            <input
                                type="number"
                                value={form.particleDensity}
                                onChange={(e) => handleChange('particleDensity', e.target.value)}
                                placeholder="e.g. 600"
                                className="flex-1 bg-transparent text-white text-sm px-2 py-1.5 focus:outline-none w-0 min-w-0 placeholder-gray-600"
                            />
                        </div>
                        {etaComputed !== null && (
                            <p className="text-s text-white-400 mt-1">
                                Eta (r<sub>i</sub>/r<sub>o</sub>) ≈ <strong>{etaComputed.toFixed(4)}</strong>
                            </p>
                        )}
                    </div>

                    {/* Packaging Limit Slider */}
                    <div className="mb-3 pt-2 border-t border-gray-700">
                        <label className="block text-xs font-semibold text-white-400 mb-1">
                            Packaging Limit (Φ<sub>max</sub>)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min={0.1}
                                max={0.74}
                                step={0.01}
                                value={form.phi_rpl}
                                onChange={(e) =>
                                    handleChange('phi_rpl', parseFloat(e.target.value))
                                }
                                className="flex-1 accent-purple-500 cursor-pointer"
                            />
                            <span className="text-white text-sm font-mono w-10 text-right shrink-0">
                                {parseFloat(form.phi_rpl).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-s text-white-600 mt-0.5">
                            <span>0.10</span>
                            <span>0.74</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar2;