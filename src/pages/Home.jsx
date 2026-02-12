import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/NYU_background.jpg';

// Reusable form input component with required field indicator
const FormInput = ({ id, label, type = "text", value, onChange, placeholder, options = [], required = false, children }) => {
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
                    className={`block w-full px-3 py-2 text-gray-700 bg-white bg-opacity-90 border rounded focus:outline-none focus:ring-2 focus:border-transparent`}
                    required={required}
                >
                    <option value="">Select {label}</option>
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
                className={`block w-full px-3 py-2 text-gray-700 bg-white bg-opacity-90 border rounded focus:outline-none focus:ring-2 focus:border-transparent ${type === "number" ? "no-spinner" : ""}`}
                required={required}
            />
            {children}
        </div>
    );
};

// Reusable form button component
const FormButton = ({ type = "submit", onClick, children, className = "" }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`w-full font-medium text-white text-center rounded-md px-3 py-2 transition duration-150 ease-in-out hover:opacity-70 ${className}`}
            style={{ background: '#54058c' }}
        >
            {children}
        </button>
    );
};

// Reusable form container component
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

const Home = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        eb: NaN,
        nb: NaN,
        em: NaN,
        nm: NaN,
        eta: NaN
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pass form data as state to Upload.jsx
        navigate('/charts-menu', { state: { formData } });
    };


    const wallThickness = isNaN(formData.eta) ? NaN : ((1 - formData.eta) * 100).toFixed(1);

    return (
        <div
            className="flex justify-center items-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <FormContainer title="Composite Modulus Calculator">
                <form onSubmit={handleSubmit}>
                    <div className="p-5">
                        <FormInput
                            id="em"
                            type="number"
                            label={<span>E<sub>m</sub>&nbsp;&#40;Young Modulus of Matrix&#41;</span>}
                            name="em"
                            value={formData.em}
                            placeholder={'Young Modulus of Matrix'}
                            onChange={handleChange}
                            required={true}
                        />

                        <FormInput
                            id="nm"
                            type="number"
                            label={<span>N<sub>m</sub>&nbsp;&#40;Poisson's ratio of Matrix&#41;</span>}
                            name="nm"
                            value={formData.nm}
                            placeholder="Poisson's ratio of Matrix"
                            onChange={handleChange}
                            required={true}
                        />


                        <FormInput
                            id="eb"
                            type="number"
                            label={<span>E<sub>b</sub>&nbsp;&#40;Young Modulus of Inclusion&#41;</span>}
                            placeholder="Young Modulus of Inclusion"
                            name="eb"
                            value={formData.eb}
                            onChange={handleChange}
                            required={true}
                        />


                        <FormInput
                            id="nb"
                            type="number"
                            label={<span>N<sub>m</sub>&nbsp;&#40;Poisson's ratio of Inclusion&#41;</span>}
                            name="nb"
                            value={formData.nb}
                            placeholder="Poisson's ratio of Inclusion"
                            onChange={handleChange}
                            required={true}
                        />

                        <FormInput
                            id="eta"
                            label={<span>Eta&nbsp;&#40;Radius Ratio - R<sub>i</sub>/R<sub>o</sub>&#41;</span>}
                            name="eta"
                            value={isNaN(wallThickness) ? '' : formData.eta}
                            placeholder="Radius Ratio"
                            onChange={handleChange}
                            required={true}
                        >
                            {!isNaN(wallThickness) && <p className={`text-sm text-gray-500 mt-1`}>Wall thickness: {wallThickness}%</p>}
                        </FormInput>

                    </div>

                    <div className="p-3">
                        <FormButton type="submit">
                            Submit
                        </FormButton>
                    </div>
                </form>

            </FormContainer>
        </div>
    );
};

export default Home;