import React, { useState, useEffect } from 'react';
import './LoginPage.css';

// Task 1: Import urlConfig
import { urlConfig } from '../../config';

// Task 2: Import useAppContext
import { useAppContext } from '../../context/AuthContext';

// Task 3: Import useNavigate
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    // State hooks for email and password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Task 4: Include a state for incorrect password
    const [incorrect, setIncorrect] = useState('');

    // Task 5: Local variables
    const navigate = useNavigate();
    const bearerToken = sessionStorage.getItem('auth-token');
    const { setIsLoggedIn } = useAppContext();

    // Task 6: If already logged in, navigate to MainPage
    useEffect(() => {
        if (bearerToken) {
            navigate('/app');
        }
    }, [navigate, bearerToken]);

    // Login button handler
    const handleLogin = async () => {
        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
                method: 'POST', // Task 7
                headers: {
                    'Content-Type': 'application/json', // Task 8
                    'Authorization': bearerToken ? `Bearer ${bearerToken}` : ''
                },
                body: JSON.stringify({ // Task 9
                    email: email,
                    password: password,
                }),
            });

            const json = await response.json(); // Step 2 - Task 1

            if (json.authtoken) {
                // Task 2: Set user details
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', json.userName);
                sessionStorage.setItem('email', json.userEmail);

                setIsLoggedIn(true); // Task 3
                navigate('/app');    // Task 4
            } else {
                // Task 5: If incorrect password
                document.getElementById("email").value = "";
                document.getElementById("password").value = "";
                setIncorrect("Wrong password. Try again.");

                // Optional: Clear error after delay
                setTimeout(() => {
                    setIncorrect("");
                }, 2000);
            }

        } catch (e) {
            console.error("Error during login:", e.message);
            setIncorrect("Something went wrong. Try again.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="login-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Login</h2>

                        <div className="mb-3">
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

                        <div className="mb-3">
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

                        {/* Task 6: Display error message */}
                        <span style={{
                            color: 'red',
                            height: '.5cm',
                            display: 'block',
                            fontStyle: 'italic',
                            fontSize: '12px'
                        }}>{incorrect}</span>

                        <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>
                            Login
                        </button>

                        <p className="mt-4 text-center">
                            New here? <a href="/app/register" className="text-primary">Register Here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
