import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/NYU_background.jpg';

// ==============================
// Reusable Form Input Component
// ==============================
const FormInput = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    options = [],
    required = false,
    children
}) => {

    const requiredStar = required ? <span className="text-red-600 ml-1">*</span> : null;

    if (type === "select") {
        return (
            <div className="mb-4">
                <label htmlFor={id} className="inline-block mb-2 font-bold text-gray-800">
                    {label}{requiredStar}
                </label>
                <select
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="block w-full px-3 py-2 text-gray-700 bg-white bg-opacity-90 border rounded focus:outline-none focus:ring-2 focus:border-transparent"
                >
                    <option value="">Select {typeof label === 'string' ? label : ''}</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className="mb-4">
            <label htmlFor={id} className="inline-block mb-2 font-bold text-gray-800">
                {label}{requiredStar}
            </label>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`block w-full px-3 py-2 text-gray-700 bg-white bg-opacity-90 border rounded focus:outline-none focus:ring-2 focus:border-transparent ${type === "number" ? "no-spinner" : ""}`}
            />
            {children}
        </div>
    );
};

// ==============================
// Reusable Button Component
// ==============================
const FormButton = ({ type = "button", onClick, children, className = "" }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`w-full font-medium text-white text-center rounded-md px-3 py-2 transition duration-150 ease-in-out hover:opacity-80 ${className}`}
            style={{ background: '#54058c' }}
        >
            {children}
        </button>
    );
};

// ==============================
// Form Container
// ==============================
const FormContainer = ({ title, children }) => {
    return (
        <div className="w-full max-w-lg bg-white bg-opacity-95 rounded-lg shadow-lg">
            <div
                className="text-white px-4 py-3 rounded-t-lg flex justify-between items-center"
                style={{ background: '#54058c' }}
            >
                <h3 className="text-lg font-normal leading-tight">{title}</h3>
            </div>
            {children}
        </div>
    );
};

// ==============================
// MAIN COMPONENT
// ==============================
const Home2 = () => {

    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        university: '',
        department: '',
        eb: '',
        nb: '',
        em: '',
        nm: '',
        glassType: '',
        trueParticleDensity: '',
        eta: NaN
    });


    // ==============================
    // Handle Input Change
    // ==============================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ==============================
    // Step Navigation
    // ==============================
    const handleNext = (e) => {
        e.preventDefault();
        setCurrentStep(2);
    };

    const handlePrevious = (e) => {
        e.preventDefault();
        setCurrentStep(1);

    };

    // ==============================
    // Eta Calculation
    // ==============================
    const calculateEta = () => {
        if (!formData.glassType || !formData.trueParticleDensity) return NaN;

        const particleDensity = parseFloat(formData.trueParticleDensity);
        if (isNaN(particleDensity)) return NaN;

        const glassDensities = {
            'Soda-lime glass': 2500,
            'Borosilicate glass': 2250
        };

        const glassDensity = glassDensities[formData.glassType];
        if (!glassDensity) return NaN;


        console.log(particleDensity, glassDensity);
        const eta = Math.pow(1 - (particleDensity / glassDensity), 1 / 3);
        return eta;
    };

    const calculatedEta = calculateEta();
    const wallThickness =
        isNaN(calculatedEta) ? NaN : ((1 - calculatedEta) * 100).toFixed(1);

    // ==============================
    // Final Submit
    // ==============================
    const handleSubmit = (e) => {
        e.preventDefault();

        const finalFormData = {
            ...formData,
            eta: calculatedEta
        };

        navigate('/charts-menu', { state: { formData: finalFormData } });
    };

    // ==============================
    // UI
    // ==============================
    return (
        <div
            className="flex justify-center items-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <FormContainer title="Composite Modulus Calculator">

                {currentStep === 1 ? (

                    <form onSubmit={handleNext}>
                        <div className="p-5">

                            <FormInput
                                id="fullName"
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />

                            <FormInput
                                id="email"
                                type="email"
                                label="Email Address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />

                            <FormInput
                                id="university"
                                label="University"
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
                                placeholder="Enter your university"
                                required
                            />

                            <FormInput
                                id="department"
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="Enter your department"
                                required
                            />

                        </div>

                        <div className="p-3">
                            <FormButton type="submit">
                                Next
                            </FormButton>
                        </div>
                    </form>

                ) : (

                    <form onSubmit={handleSubmit}>
                        <div className="p-5">

                            <FormInput
                                id="em"
                                type="number"
                                label={<span>E<sub>m</sub> (Young Modulus of Matrix)</span>}
                                name="em"
                                value={formData.em}
                                onChange={handleChange}
                                required
                            />

                            <FormInput
                                id="nm"
                                type="number"
                                label={<span>N<sub>m</sub> (Poisson's ratio of Matrix)</span>}
                                name="nm"
                                value={formData.nm}
                                onChange={handleChange}
                                required
                            />

                            <FormInput
                                id="eb"
                                type="number"
                                label={<span>E<sub>b</sub> (Young Modulus of Inclusion)</span>}
                                name="eb"
                                value={formData.eb}
                                onChange={handleChange}
                                required
                            />

                            <FormInput
                                id="nb"
                                type="number"
                                label={<span>N<sub>b</sub> (Poisson's ratio of Inclusion)</span>}
                                name="nb"
                                value={formData.nb}
                                onChange={handleChange}
                                required
                            />

                            <FormInput
                                id="glassType"
                                type="select"
                                label="Type of Glass"
                                name="glassType"
                                value={formData.glassType}
                                onChange={handleChange}
                                options={['Soda-lime glass', 'Borosilicate glass']}
                                required
                            />

                            <FormInput
                                id="trueParticleDensity"
                                type="number"
                                label={<span>True Particle Density (kg/m³)</span>}
                                name="trueParticleDensity"
                                value={formData.trueParticleDensity}
                                onChange={handleChange}
                                required
                            >
                                {!isNaN(calculatedEta) && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-gray-600">
                                            <strong>Calculated Eta:</strong> {calculatedEta.toFixed(4)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Wall thickness: {wallThickness}%
                                        </p>
                                    </div>
                                )}
                            </FormInput>

                        </div>

                        <div className="p-3 space-x-2 flex justify-between items-center">
                            <FormButton
                                type="button"
                                onClick={handlePrevious}
                            >
                                Previous
                            </FormButton>

                            <FormButton type="submit">
                                Submit
                            </FormButton>
                        </div>

                    </form>

                )}

            </FormContainer>
        </div>
    );
};

export default Home2;
