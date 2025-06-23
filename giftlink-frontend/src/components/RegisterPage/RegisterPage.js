import React, { useState } from 'react';
import './RegisterPage.css';
// Task 1: Import urlConfig
import { urlConfig } from '../../config';

// Task 2: Import useAppContext
import { useAppContext } from '../../context/AuthContext';

// Task 3: Import useNavigate
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    // useState hooks for form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Task 4: Include a state for error message
const [showerr, setShowerr] = useState('');

// Task 5: Create local variables for navigate and setIsLoggedIn
const navigate = useNavigate();
const { setIsLoggedIn } = useAppContext();

    // Register button handler
    const handleRegister = async () => {
        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                }),
            });
    
            const json = await response.json(); // Task 1: Access data in JSON format
    
            if (!response.ok || json.error) {
                setShowerr(json.error || 'Registration failed'); // Task 5: Set an error message
                return;
            }
    
            // Task 2: Set user details in sessionStorage
            if (json.authtoken) {
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', firstName);
                sessionStorage.setItem('email', json.email);
    
                setIsLoggedIn(true);        // Task 3: Mark as logged in
                navigate('/app');           // Task 4: Navigate to main page
            }
    
        } catch (e) {
            setShowerr(e.message); // Task 5: Catch block error message
            console.error('Error during registration:', e.message);
        }
    };
    

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="register-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Register</h2>

                        <div className="mb-4">
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                className="form-control"
                                placeholder="Enter your first name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="lastName" className="form-label">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                className="form-control"
                                placeholder="Enter your last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {showerr && <div className="text-danger mt-1">{showerr}</div>}

                        <button className="btn btn-primary w-100 mb-3" onClick={handleRegister}>
                            Register
                        </button>

                        <p className="mt-4 text-center">
                            Already a member? <a href="/app/login" className="text-primary">Login</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
