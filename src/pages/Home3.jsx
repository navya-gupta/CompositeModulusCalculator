/**
 * src/pages/Home3.jsx
 * User-info form — saves to MySQL via Express API, then navigates to calculator.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/NYU_background.jpg';
import { saveUser } from '../services/userService';

// ── Reusable sub-components ───────────────────────────────────────────────────

const FormInput = ({
    id, label, type = 'text', value, onChange,
    placeholder, required = false, disabled = false,
}) => (
    <div className="mb-4">
        <label htmlFor={id} className="inline-block mb-2 font-bold text-gray-800">
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="block w-full px-3 py-2 text-gray-700 bg-white bg-opacity-90
                 border rounded focus:outline-none focus:ring-2 focus:border-transparent
                 disabled:opacity-50 disabled:cursor-not-allowed"
        />
    </div>
);

const FormButton = ({ disabled = false, children }) => (
    <button
        type="submit"
        disabled={disabled}
        className="w-full font-medium text-white text-center rounded-md px-3 py-2
               transition duration-150 ease-in-out hover:opacity-70
               disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: '#54058c' }}
    >
        {children}
    </button>
);

const FormContainer = ({ title, children }) => (
    <div className="w-full max-w-lg bg-white bg-opacity-95 rounded-lg shadow-lg">
        <div
            className="text-white px-4 py-3 rounded-t-lg"
            style={{ background: '#54058c' }}
        >
            <h3 className="text-lg font-normal leading-tight">{title}</h3>
        </div>
        {children}
    </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const INITIAL_FORM = { fullName: '', email: '', university: '', department: '' };

const Home3 = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (apiError) setApiError(''); // clear error when user starts typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setApiError('');

        try {
            const { userId } = await saveUser(formData);
            navigate('/charts-menu', { state: { userInfo: formData, userId } });
        } catch (err) {
            setApiError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="flex justify-center items-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <FormContainer title="Composite Modulus Calculator — User Info">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-5">
                        <FormInput
                            id="fullName"
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                        />
                        <FormInput
                            id="email"
                            label="Email Address"
                            type="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                        />
                        <FormInput
                            id="university"
                            label="University"
                            placeholder="Enter your university"
                            value={formData.university}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                        />
                        <FormInput
                            id="department"
                            label="Department"
                            placeholder="Enter your department"
                            value={formData.department}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                        />

                        {/* API error banner */}
                        {apiError && (
                            <div
                                role="alert"
                                className="mt-1 mb-2 px-3 py-2 text-sm text-red-800
                           bg-red-50 border border-red-300 rounded"
                            >
                                {apiError}
                            </div>
                        )}
                    </div>

                    <div className="p-3">
                        <FormButton disabled={isSubmitting}>
                            {isSubmitting ? 'Saving…' : 'Continue to Calculator'}
                        </FormButton>
                    </div>
                </form>
            </FormContainer>
        </div>
    );
};

export default Home3;