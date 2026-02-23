import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/NYU_background.jpg';

const FormInput = ({ id, label, type = "text", value, onChange, placeholder, required = false }) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="inline-block mb-2 font-bold text-gray-800">
                {label}{required && <span className="text-red-600 ml-1">*</span>}
            </label>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="block w-full px-3 py-2 text-gray-700 bg-white bg-opacity-90 border rounded focus:outline-none focus:ring-2 focus:border-transparent"
                required={required}
            />
        </div>
    );
};

const FormButton = ({ type = "submit", children }) => (
    <button
        type={type}
        className="w-full font-medium text-white text-center rounded-md px-3 py-2 transition duration-150 ease-in-out hover:opacity-70"
        style={{ background: '#54058c' }}
    >
        {children}
    </button>
);

const FormContainer = ({ title, children }) => (
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

const Home3 = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        university: '',
        department: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/charts-menu', { state: { userInfo: formData } });
    };

    return (
        <div
            className="flex justify-center items-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <FormContainer title="Composite Modulus Calculator — User Info">
                <form onSubmit={handleSubmit}>
                    <div className="p-5">
                        <FormInput
                            id="fullName"
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                        <FormInput
                            id="email"
                            label="Email Address"
                            type="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <FormInput
                            id="university"
                            label="University"
                            placeholder="Enter your university"
                            value={formData.university}
                            onChange={handleChange}
                            required
                        />
                        <FormInput
                            id="department"
                            label="Department"
                            placeholder="Enter your department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="p-3">
                        <FormButton type="submit">Continue to Calculator</FormButton>
                    </div>
                </form>
            </FormContainer>
        </div>
    );
};

export default Home3;