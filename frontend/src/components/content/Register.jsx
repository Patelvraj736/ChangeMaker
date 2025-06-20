import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [otp, setOtp] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [registerError, setRegisterError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError("");

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5000/api/auth/send-otp', { email });

            if (response.status === 200) {
                setOtpSent(true);
            } else {
                setRegisterError("Error sending OTP. Please try again.");
            }
        } catch (error) {
            setRegisterError("Error sending OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOtp = async (e) => {
        e.preventDefault();
        setOtpError("");

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("role", role);
            formData.append("otp", otp);
            if (profileImage) {
                formData.append("image", profileImage);
            }

            const response = await axios.post('http://localhost:5000/api/auth/register', formData);

            if (response.status === 201) {
                alert("Registration successful!");
                navigate("/login");
            }
        } catch (error) {
            console.error("Registration error:", error);
            setOtpError("Invalid or expired OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='auth-container'>
            <h2>Register</h2>
            <form onSubmit={otpSent ? handleSubmitOtp : handleRegister}>
                <div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={otpSent}
                        placeholder="Name"
                    />
                </div>
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={otpSent}
                        placeholder="Email"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={otpSent}
                        placeholder="Password"
                    />
                </div>
                <div>

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        disabled={otpSent}
                        placeholder="Role"
                    >
                        <option value="">Select Role</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfileImage(e.target.files[0])}
                        disabled={otpSent}
                        placeholder="Profile Image"
                    />
                </div>

                {registerError && <div style={{ color: 'red' }}>{registerError}</div>}

                {!otpSent ? (
                    <button type="submit" disabled={loading}>
                        {loading ? "Sending OTP..." : "Register"}
                    </button>
                ) : (
                    <>
                        <div>
                            <label>Enter OTP:</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        {otpError && <div style={{ color: 'red' }}>{otpError}</div>}
                        <button type="submit" disabled={loading}>
                            {loading ? "Verifying OTP..." : "Submit OTP"}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
};

export default RegisterForm;
