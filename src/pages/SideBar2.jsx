// import { useState } from 'react';
// import { NavLink } from 'react-router-dom';

// // ─── Icons ────────────────────────────────────────────────────────────────────
// const HomeIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"
//         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
//         <polyline points="9 22 9 12 15 12 15 22" />
//     </svg>
// );

// const MenuIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"
//         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <line x1="3" y1="12" x2="21" y2="12" />
//         <line x1="3" y1="6" x2="21" y2="6" />
//         <line x1="3" y1="18" x2="21" y2="18" />
//     </svg>
// );

// const ChevronIcon = ({ collapsed }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
//         viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
//         strokeLinecap="round" strokeLinejoin="round">
//         <line x1="19" y1="12" x2="5" y2="12" />
//         <polyline points="12 19 5 12 12 5" />
//     </svg>
// );

// const NAV_ITEMS = [
//     { url: '/', icon: <HomeIcon />, title: 'Home' },
//     { url: '/charts-menu', icon: <MenuIcon />, title: 'Menu' },
// ];

// const NavItem = ({ url, icon, title, collapsed }) => {
//     const base =
//         'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 ' +
//         'hover:bg-white/10 rounded-md mx-2 my-0.5';
//     const activeClass = 'bg-white/15 text-white';
//     const inactiveClass = 'text-gray-300';

//     return (
//         <NavLink to={url}
//             className={({ isActive }) => `${base} ${isActive ? activeClass : inactiveClass}`}>
//             <span className="shrink-0">{icon}</span>
//             {!collapsed && <span className="truncate">{title}</span>}
//         </NavLink>
//     );
// };

// // ─── Stepper number input ─────────────────────────────────────────────────────
// const StepperInput = ({ label, name, value, onChange, step = 0.001, min, collapsed, unit }) => {
//     const handleIncrement = () => {
//         const newVal = parseFloat((parseFloat(value) + step).toFixed(10));
//         onChange(name, newVal);
//     };
//     const handleDecrement = () => {
//         const newVal = parseFloat((parseFloat(value) - step).toFixed(10));
//         if (min !== undefined && newVal < min) return;
//         onChange(name, newVal);
//     };

//     if (collapsed) return null;

//     return (
//         <div className="mb-3">
//             <label className="block text-xs font-semibold text-white-400 mb-1 leading-tight">
//                 {label}
//             </label>
//             <div className="flex items-center bg-[#2a2f35] border border-gray-600 rounded-md overflow-hidden">
//                 <input
//                     type="number"
//                     value={value}
//                     onChange={(e) => onChange(name, e.target.value)}
//                     step={step}
//                     className="flex-1 bg-transparent text-white text-sm px-2 py-1.5 focus:outline-none w-0 min-w-0"
//                 />
//                 {unit && (
//                     <span className="text-gray-400 text-xs px-2 border-l border-gray-600 whitespace-nowrap shrink-0">
//                         {unit}
//                     </span>
//                 )}
//                 <div className="flex flex-col border-l border-gray-600 shrink-0">
//                     <button type="button" onClick={handleDecrement}
//                         className="px-2 py-1 text-gray-400 hover:text-white hover:bg-white/10 text-xs leading-none border-b border-gray-600 transition-colors">−</button>
//                     <button type="button" onClick={handleIncrement}
//                         className="px-2 py-1 text-gray-400 hover:text-white hover:bg-white/10 text-xs leading-none transition-colors">+</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const GLASS_OPTIONS = [
//     { label: 'Soda-Lime Glass', value: 'soda-lime', density: 2500 },
//     { label: 'Borosilicate Glass', value: 'borosilicate', density: 2250 },
// ];

// // ─── Section Header ───────────────────────────────────────────────────────────
// const SectionHeader = ({ children }) => (
//     <p className="text-xs font-bold text-white uppercase tracking-widest mb-2 mt-4 pt-2 border-t border-gray-700">
//         {children}
//     </p>
// );

// // ─── Main Sidebar ─────────────────────────────────────────────────────────────
// const Sidebar2 = ({ collapsed, toggleSidebar, formValues, onFormChange }) => {
//     const [localForm, setLocalForm] = useState({
//         em: 1100, nm: 0.425, eb: 30000, nb: 0.2,
//         glassType: 'soda-lime', particleDensity: 600, phi_rpl: 0.6,
//         epsm: 3.87, alpm: 76.5, dm: 942,
//         epsf: 5.60, alpf: 4.0, wpdf: 1600, c2r: 76,
//         cteVariant: 40, rhoVariant: 920, epsVariant: 2.5,
//     });

//     const isControlled = formValues !== undefined && onFormChange !== undefined;
//     const form = isControlled ? formValues : localForm;

//     const handleChange = (name, value) => {
//         if (isControlled) onFormChange(name, value);
//         else setLocalForm(prev => ({ ...prev, [name]: value }));
//     };

//     const handleGlassTypeChange = (e) => {
//         handleChange('glassType', e.target.value);
//         if (!form.particleDensity) {
//             const selected = GLASS_OPTIONS.find(o => o.value === e.target.value);
//             handleChange('particleDensity', selected?.density ?? '');
//         }
//     };

//     const glassDensity = GLASS_OPTIONS.find(o => o.value === form.glassType)?.density ?? 2500;
//     const rhoP = parseFloat(form.particleDensity);
//     const etaComputed =
//         !isNaN(rhoP) && rhoP > 0 && glassDensity > 0
//             ? Math.pow(1 - rhoP / glassDensity, 1 / 3)
//             : null;

//     const selectedGlass = GLASS_OPTIONS.find(o => o.value === form.glassType);

//     return (
//         <div className={`${collapsed ? 'w-16' : 'w-72'} the-sidebar h-screen bg-[#343a40] text-white shrink-0 transition-all duration-300 flex flex-col`}>
//             {/* Header */}
//             <div className="flex items-center p-4 border-b border-gray-700 shrink-0">
//                 {!collapsed && <h1 className="text-white text-xl font-semibold">Options</h1>}
//                 <button onClick={toggleSidebar}
//                     className="rounded-full ml-auto p-1 bg-white text-black focus:outline-none transition-transform duration-300">
//                     <ChevronIcon collapsed={collapsed} />
//                 </button>
//             </div>

//             {/* Nav */}
//             <nav className="py-2 border-b border-gray-700 shrink-0">
//                 {NAV_ITEMS.map((item) => (
//                     <NavItem key={item.url} {...item} collapsed={collapsed} />
//                 ))}
//             </nav>

//             {/* Form */}
//             {!collapsed && (
//                 <div className="form-scroll flex-1 overflow-y-auto px-3 py-4 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4b5563 #2a2f35' }}>
//                     <style>{`
//                         .the-sidebar .form-scroll::-webkit-scrollbar { width: 5px; }
//                         .the-sidebar .form-scroll::-webkit-scrollbar-track { background: #2a2f35; border-radius: 4px; }
//                         .the-sidebar .form-scroll::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 4px; }
//                         .the-sidebar .form-scroll::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
//                     `}</style>

//                     {/* ── Matrix Properties ── */}
//                     <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">Matrix Properties</p>
//                     <StepperInput label="Young's Modulus (Em) [MPa]" name="em" value={form.em} step={100} min={0} onChange={handleChange} collapsed={collapsed} />
//                     <StepperInput label="Poisson's Ratio (nm)" name="nm" value={form.nm} step={0.001} min={0} onChange={handleChange} collapsed={collapsed} />
//                     <StepperInput label="Dielectric Constant (εm)" name="epsm" value={form.epsm} step={0.01} min={0} onChange={handleChange} collapsed={collapsed} />
//                     <StepperInput label="CTE (αm)" name="alpm" value={form.alpm} step={0.5} min={0} onChange={handleChange} collapsed={collapsed} unit="×10⁻⁶/°C" />
//                     <StepperInput label="Density (dm)" name="dm" value={form.dm} step={10} min={0} onChange={handleChange} collapsed={collapsed} unit="kg/m³" />

//                     {/* ── Inclusion Properties ── */}
//                     <SectionHeader>Inclusion Properties</SectionHeader>
//                     <StepperInput label="Young's Modulus (Eb) [MPa]" name="eb" value={form.eb} step={1000} min={0} onChange={handleChange} collapsed={collapsed} />
//                     <StepperInput label="Poisson's Ratio (nb)" name="nb" value={form.nb} step={0.001} min={0} onChange={handleChange} collapsed={collapsed} />
//                     <StepperInput label="Dielectric Constant (εf)" name="epsf" value={form.epsf} step={0.01} min={0} onChange={handleChange} collapsed={collapsed} />
//                     <StepperInput label="CTE (αf)" name="alpf" value={form.alpf} step={0.5} min={0} onChange={handleChange} collapsed={collapsed} unit="×10⁻⁶/°C" />
//                     <StepperInput label="Wall Particle Density" name="wpdf" value={form.wpdf} step={50} min={0} onChange={handleChange} collapsed={collapsed} unit="kg/m³" />
//                     <StepperInput label="Cenosphere Diameter" name="c2r" value={form.c2r} step={1} min={0} onChange={handleChange} collapsed={collapsed} unit="×10⁻⁶m" />

//                     {/* ── Glass & Geometry ── */}
//                     <SectionHeader>Glass & Geometry</SectionHeader>
//                     <div className="mb-3">
//                         <label className="block text-xs font-semibold text-white-400 mb-1">Type of Glass</label>
//                         <select value={form.glassType} onChange={handleGlassTypeChange}
//                             className="w-full bg-[#2a2f35] border border-gray-600 text-white text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500">
//                             {GLASS_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
//                         </select>
//                         <p className="text-xs text-gray-400 mt-1">ρ<sub>glass</sub> = {selectedGlass?.density?.toLocaleString()} kg/m³</p>
//                     </div>
//                     <div className="mb-3">
//                         <label className="block text-xs font-semibold text-white-400 mb-1 leading-tight">True Particle Density [kg/m³]</label>
//                         <div className="flex items-center bg-[#2a2f35] border border-gray-600 rounded-md overflow-hidden">
//                             <input type="number" value={form.particleDensity}
//                                 onChange={(e) => handleChange('particleDensity', e.target.value)}
//                                 placeholder="e.g. 600"
//                                 className="flex-1 bg-transparent text-white text-sm px-2 py-1.5 focus:outline-none w-0 min-w-0 placeholder-gray-600" />
//                         </div>
//                         {etaComputed !== null && (
//                             <p className="text-xs text-gray-400 mt-1">
//                                 Eta (r<sub>i</sub>/r<sub>o</sub>) ≈ <strong className="text-white">{etaComputed.toFixed(4)}</strong>
//                             </p>
//                         )}
//                     </div>
//                     <div className="pt-2 border-t border-gray-700">
//                         <p className="text-xs font-semibold text-gray-400">
//                             Packaging Limit (Φ<sub>max</sub>) = 0.6g/cm<sup>3</sup>
//                         </p>
//                     </div>

//                     {/* ── Chart Variant Sliders ── */}
//                     <SectionHeader>Chart Variants</SectionHeader>

//                     {/* CTE variant */}
//                     <div className="mb-4">
//                         <label className="block text-xs font-semibold text-gray-300 mb-1">
//                             CTE Target: <span className="text-white font-mono">{parseFloat(form.cteVariant).toFixed(1)} ×10⁻⁶/°C</span>
//                         </label>
//                         <input type="range" min={10} max={70} step={1}
//                             value={form.cteVariant}
//                             onChange={(e) => handleChange('cteVariant', parseFloat(e.target.value))}
//                             className="w-full accent-purple-500 cursor-pointer" />
//                         <div className="flex justify-between text-xs text-gray-500 mt-0.5"><span>10</span><span>70</span></div>
//                     </div>

//                     {/* Density variant */}
//                     <div className="mb-4">
//                         <label className="block text-xs font-semibold text-gray-300 mb-1">
//                             Target Density: <span className="text-white font-mono">{parseFloat(form.rhoVariant).toFixed(0)} kg/m³</span>
//                         </label>
//                         <input type="range" min={200} max={1600} step={10}
//                             value={form.rhoVariant}
//                             onChange={(e) => handleChange('rhoVariant', parseFloat(e.target.value))}
//                             className="w-full accent-purple-500 cursor-pointer" />
//                         <div className="flex justify-between text-xs text-gray-500 mt-0.5"><span>200</span><span>1600</span></div>
//                     </div>

//                     {/* Dielectric variant */}
//                     <div className="mb-4">
//                         <label className="block text-xs font-semibold text-gray-300 mb-1">
//                             Target Dielectric: <span className="text-white font-mono">{parseFloat(form.epsVariant).toFixed(2)}</span>
//                         </label>
//                         <input type="range" min={1.0} max={5.0} step={0.1}
//                             value={form.epsVariant}
//                             onChange={(e) => handleChange('epsVariant', parseFloat(e.target.value))}
//                             className="w-full accent-purple-500 cursor-pointer" />
//                         <div className="flex justify-between text-xs text-gray-500 mt-0.5"><span>1.0</span><span>5.0</span></div>
//                     </div>

//                 </div>
//             )}
//         </div>
//     );
// };

// export default Sidebar2;











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

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const ChevronIcon = ({ collapsed }) => (
    <svg xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const AccordionChevron = ({ open }) => (
    <svg xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

// // ─── Material presets ─────────────────────────────────────────────────────────

// /**
//  * Matrix material presets.
//  * Vinyl Ester values are from Django (confirmed).
//  * Epoxy and HDPE use standard engineering literature values.
//  */
// export const MATRIX_PRESETS = {
//     'vinyl-ester': {
//         label: 'Vinyl Ester',
//         em: 2820,
//         nm: 0.35,
//         epsm: 3.87,
//         alpm: 76.5,
//         dm: 942,
//     },
//     'epoxy': {
//         label: 'Epoxy',
//         em: 3500,
//         nm: 0.38,
//         epsm: 3.60,
//         alpm: 55.0,
//         dm: 1200,
//     },
//     'hdpe': {
//         label: 'HDPE',
//         em: 800,
//         nm: 0.46,
//         epsm: 2.30,
//         alpm: 150.0,
//         dm: 955,
//     },
// };

// /**
//  * Hollow particle presets.
//  * Only Borosilicate Glass and Soda-Lime Glass (no generic Glass or Carbon).
//  * glassDensity is used to derive eta from true particle density.
//  */
// export const HOLLOW_PARTICLE_PRESETS = {
//     'borosilicate': {
//         label: 'BoroSilicate Glass',
//         eb: 63000,
//         nb: 0.20,
//         epsf: 4.70,
//         alpf: 3.3,
//         wpdf: 1600,
//         c2r: 76,
//         glassDensity: 2250,
//     },
//     'sodalime': {
//         label: 'SodaLime Glass',
//         eb: 70000,
//         nb: 0.23,
//         epsf: 7.20,
//         alpf: 9.0,
//         wpdf: 1600,
//         c2r: 76,
//         glassDensity: 2500,
//     },
// };
import {
    HOLLOW_PARTICLE_PRESETS,
    MATRIX_PRESETS
} from '../constants/materialPresets';
// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { url: '/', icon: <HomeIcon />, title: 'Home' },
    { url: '/charts-menu', icon: <MenuIcon />, title: 'Menu' },
];

const NavItem = ({ url, icon, title, collapsed }) => {
    const base =
        'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 ' +
        'hover:bg-white/10 rounded-md mx-2 my-0.5';
    return (
        <NavLink to={url}
            className={({ isActive }) =>
                `${base} ${isActive ? 'bg-white/15 text-white' : 'text-gray-300'}`}>
            <span className="shrink-0">{icon}</span>
            {!collapsed && <span className="truncate">{title}</span>}
        </NavLink>
    );
};

// ─── Field input ──────────────────────────────────────────────────────────────
const FieldInput = ({ label, name, value, onChange, step = 0.001, unit }) => (
    <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-300 mb-1 leading-tight">
            {label}
        </label>
        <div className="flex items-center bg-[#1e2328] border border-gray-600 rounded overflow-hidden">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                step={step}
                className="flex-1 bg-transparent text-white text-sm px-2 py-1.5 focus:outline-none w-0 min-w-0"
            />
            {unit && (
                <span
                    className="text-gray-400 text-xs px-2 py-1.5 border-l border-gray-600 whitespace-nowrap shrink-0 bg-[#2a2f35]"
                    dangerouslySetInnerHTML={{ __html: unit }}
                />
            )}
        </div>
    </div>
);

// ─── Accordion panel ──────────────────────────────────────────────────────────
const Accordion = ({ title, children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-600 rounded overflow-hidden mb-2">
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-[#2a2f35] hover:bg-[#31373e] transition-colors text-left"
            >
                <span className="text-sm font-semibold text-white">{title}</span>
                <AccordionChevron open={open} />
            </button>
            {open && (
                <div className="px-3 pt-3 pb-1 bg-[#1e2328]">
                    {children}
                </div>
            )}
        </div>
    );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar2 = ({ collapsed, toggleSidebar, formValues, onFormChange }) => {
    // Default form state (used when sidebar is uncontrolled)
    const [localForm, setLocalForm] = useState({
        matrixType: 'vinyl-ester',
        em: 2820, nm: 0.35, epsm: 3.87, alpm: 76.5, dm: 942,
        hollowType: 'borosilicate',
        eb: 63000, nb: 0.20, epsf: 4.70, alpf: 3.3, wpdf: 1600, c2r: 76,
        particleDensity: 600,
        phi_rpl: 0.6,
        cteVariant: 40, rhoVariant: 920, epsVariant: 2.5,
    });

    const isControlled = formValues !== undefined && onFormChange !== undefined;
    const form = isControlled ? formValues : localForm;

    // Single-field change
    const handleChange = (name, value) => {
        if (isControlled) onFormChange(name, value);
        else setLocalForm(prev => ({ ...prev, [name]: value }));
    };

    // Batch-apply multiple fields at once
    const applyBatch = (updates) => {
        if (isControlled) {
            Object.entries(updates).forEach(([k, v]) => onFormChange(k, v));
        } else {
            setLocalForm(prev => ({ ...prev, ...updates }));
        }
    };

    const handleMatrixTypeChange = (e) => {
        const type = e.target.value;
        const p = MATRIX_PRESETS[type];
        if (!p) return;
        applyBatch({ matrixType: type, em: p.em, nm: p.nm, epsm: p.epsm, alpm: p.alpm, dm: p.dm });
    };

    const handleHollowTypeChange = (e) => {
        const type = e.target.value;
        const p = HOLLOW_PARTICLE_PRESETS[type];
        if (!p) return;
        applyBatch({ hollowType: type, eb: p.eb, nb: p.nb, epsf: p.epsf, alpf: p.alpf, wpdf: p.wpdf, c2r: p.c2r });
    };

    // Derive eta
    const hollowPreset = HOLLOW_PARTICLE_PRESETS[form.hollowType];
    const glassDensity = hollowPreset?.glassDensity ?? 2500;
    const rhoP = parseFloat(form.particleDensity);
    const etaComputed =
        !isNaN(rhoP) && rhoP > 0 ? Math.pow(1 - rhoP / glassDensity, 1 / 3) : null;

    return (
        <div className={`${collapsed ? 'w-16' : 'w-72'} the-sidebar h-screen bg-[#343a40] text-white shrink-0 transition-all duration-300 flex flex-col`}>

            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-700 shrink-0">
                {!collapsed && <h1 className="text-white text-xl font-semibold">Options</h1>}
                <button onClick={toggleSidebar}
                    className="rounded-full ml-auto p-1 bg-white text-black focus:outline-none transition-transform duration-300">
                    <ChevronIcon collapsed={collapsed} />
                </button>
            </div>

            {/* Nav */}
            <nav className="py-2 border-b border-gray-700 shrink-0">
                {NAV_ITEMS.map(item => <NavItem key={item.url} {...item} collapsed={collapsed} />)}
            </nav>

            {/* Scrollable form */}
            {!collapsed && (
                <div
                    className="form-scroll flex-1 overflow-y-auto px-3 py-4"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#4b5563 #2a2f35' }}
                >
                    <style>{`
                        .the-sidebar .form-scroll::-webkit-scrollbar { width: 5px; }
                        .the-sidebar .form-scroll::-webkit-scrollbar-track { background: #2a2f35; border-radius: 4px; }
                        .the-sidebar .form-scroll::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 4px; }
                        .the-sidebar .form-scroll::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
                    `}</style>

                    {/* ── Matrix Material dropdown ── */}
                    <div className="mb-3">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-1">
                            Matrix Material
                        </label>
                        <select
                            value={form.matrixType}
                            onChange={handleMatrixTypeChange}
                            className="w-full bg-[#2a2f35] border border-gray-600 text-white text-sm rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                        >
                            {Object.entries(MATRIX_PRESETS).map(([key, p]) => (
                                <option key={key} value={key}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* ── Hollow Particle Material dropdown ── */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-1">
                            Hollow Particle Material
                        </label>
                        <select
                            value={form.hollowType}
                            onChange={handleHollowTypeChange}
                            className="w-full bg-[#2a2f35] border border-gray-600 text-white text-sm rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                        >
                            {Object.entries(HOLLOW_PARTICLE_PRESETS).map(([key, p]) => (
                                <option key={key} value={key}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* ── Specify Custom Material label ── */}
                    <p className="text-xs font-semibold text-gray-400 text-center mb-3 border-t border-gray-700 pt-3">
                        Specify Custom Material:
                    </p>

                    {/* ── Matrix Material accordion ── */}
                    <Accordion title="Matrix Material">
                        <FieldInput label="Modulus of Elasticity" name="em"
                            value={form.em} step={100} onChange={handleChange} unit="MPa" />
                        <FieldInput label="Poisson's Ratio" name="nm"
                            value={form.nm} step={0.001} onChange={handleChange} />
                        <FieldInput label="Dielectric Constant" name="epsm"
                            value={form.epsm} step={0.01} onChange={handleChange} />
                        <FieldInput label="Coefficient of Thermal Expansion" name="alpm"
                            value={form.alpm} step={0.5} onChange={handleChange} unit="10<sup>-6</sup>/°C" />
                        <FieldInput label="Density" name="dm"
                            value={form.dm} step={10} onChange={handleChange} unit="Kg/m<sup>3</sup>" />
                    </Accordion>

                    {/* ── Hollow Particle Material accordion ── */}
                    <Accordion title="Hollow Particle Material">
                        <FieldInput label="Modulus of Elasticity" name="eb"
                            value={form.eb} step={1000} onChange={handleChange} unit="MPa" />
                        <FieldInput label="Poisson's Ratio" name="nb"
                            value={form.nb} step={0.001} onChange={handleChange} />
                        <FieldInput label="Dielectric Constant" name="epsf"
                            value={form.epsf} step={0.01} onChange={handleChange} />
                        <FieldInput label="Coefficient of Thermal Expansion" name="alpf"
                            value={form.alpf} step={0.1} onChange={handleChange} unit="10<sup>-6</sup>/°C" />
                        <FieldInput label="Cenosphere Diameter" name="c2r"
                            value={form.c2r} step={1} onChange={handleChange} unit="10<sup>-6</sup>m" />
                        <FieldInput label="Wall Particle Density" name="wpdf"
                            value={form.wpdf} step={50} onChange={handleChange} unit="Kg/m<sup>3</sup>" />

                        {/* True Particle Density with eta display */}
                        <div className="mb-3">
                            <label className="block text-xs font-semibold text-gray-300 mb-1 leading-tight">
                                True Particle Density
                            </label>
                            <div className="flex items-center bg-[#1e2328] border border-gray-600 rounded overflow-hidden">
                                <input
                                    type="number"
                                    value={form.particleDensity}
                                    onChange={(e) => handleChange('particleDensity', e.target.value)}
                                    placeholder="e.g. 600"
                                    className="flex-1 bg-transparent text-white text-sm px-2 py-1.5 focus:outline-none w-0 min-w-0 placeholder-gray-600"
                                />
                                <span className="text-gray-400 text-xs px-2 py-1.5 border-l border-gray-600 whitespace-nowrap shrink-0 bg-[#2a2f35]">
                                    Kg/m<sup>3</sup>
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                ρ<sub>glass</sub> = {glassDensity.toLocaleString()} kg/m³
                            </p>
                            {etaComputed !== null && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Eta (r<sub>i</sub>/r<sub>o</sub>) ≈{' '}
                                    <strong className="text-white">{etaComputed.toFixed(4)}</strong>
                                </p>
                            )}
                        </div>

                        <div className="pb-1 border-t border-gray-700 pt-2">
                            <p className="text-xs text-gray-400">
                                Packaging Limit (Φ<sub>max</sub>) = 0.6 g/cm<sup>3</sup>
                            </p>
                        </div>
                    </Accordion>

                    {/* ── Chart Variant Sliders ── */}
                    <div className="border-t border-gray-700 pt-3 mt-2 space-y-4">
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                            Chart Variants
                        </p>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                CTE Target:{' '}
                                <span className="text-white font-mono">
                                    {parseFloat(form.cteVariant).toFixed(1)} ×10⁻⁶/°C
                                </span>
                            </label>
                            <input type="range" min={10} max={70} step={1}
                                value={form.cteVariant}
                                onChange={(e) => handleChange('cteVariant', parseFloat(e.target.value))}
                                className="w-full accent-purple-500 cursor-pointer" />
                            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                                <span>10</span><span>70</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                Target Density:{' '}
                                <span className="text-white font-mono">
                                    {parseFloat(form.rhoVariant).toFixed(0)} kg/m³
                                </span>
                            </label>
                            <input type="range" min={200} max={1600} step={10}
                                value={form.rhoVariant}
                                onChange={(e) => handleChange('rhoVariant', parseFloat(e.target.value))}
                                className="w-full accent-purple-500 cursor-pointer" />
                            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                                <span>200</span><span>1600</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                Target Dielectric:{' '}
                                <span className="text-white font-mono">
                                    {parseFloat(form.epsVariant).toFixed(2)}
                                </span>
                            </label>
                            <input type="range" min={1.0} max={6.0} step={0.1}
                                value={form.epsVariant}
                                onChange={(e) => handleChange('epsVariant', parseFloat(e.target.value))}
                                className="w-full accent-purple-500 cursor-pointer" />
                            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                                <span>1.0</span><span>6.0</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Sidebar2;