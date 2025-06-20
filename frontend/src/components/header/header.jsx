import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/icons/logo.svg";
import userIcon from "../../assets/icons/user.svg";
import "../../assets/css/header.css";

function Header({ isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("role");
    const [showHeader, setShowHeader] = useState(true);
    const [prevScrollY, setPrevScrollY] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [userId, setUserId] = useState(null);

    const menuRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            handleLogout();
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setShowHeader(currentScrollY < prevScrollY);
            setPrevScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [prevScrollY]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const storedUserId = localStorage.getItem("user_id");
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!userId) return;

        const fetchProfileImage = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/users/profile/image/${userId}`);
                if (response.ok) {
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);
                    setProfileImage(imageUrl);
                }
            } catch (err) {
                console.error("Error fetching profile image:", err);
            }
        };

        fetchProfileImage();

        return () => {
            if (profileImage) {
                URL.revokeObjectURL(profileImage);
            }
        };
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        localStorage.removeItem("userName");
        localStorage.removeItem("profileImage");
        navigate("/");
        setIsAuthenticated(false);
    };

    return (
        <div className={`header-container ${showHeader ? "visible" : "hidden"}`}>
            <div className="header-wrapper">
                <div className="logo-container">
                    <Link className="title-link" to="/">
                        <img className="logo-img" src={logo} alt="ChangeMaker Logo" />
                        <div className="site-name">ChangeMaker</div>
                    </Link>
                </div>

                <div ref={menuRef} className={`nav-container ${menuOpen ? "menu-open" : ""}`}>
                    <ul className="nav-list">
                        <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>

                        {isAuthenticated && userRole === "admin" && (
                            <li className="nav-item"><Link className="nav-link" to="/admin/donations">View Donations</Link></li>
                        )}

                        {!isAuthenticated && (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>

                <div className="menu-icons-container">
                    <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
                        ☰
                    </button>

                    {isAuthenticated && (
                        <div
                            className="user-menu-container"
                            ref={dropdownRef}
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <img
                                src={profileImage || userIcon}
                                alt="User"
                                className="user-img"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = userIcon;
                                }}
                            />
                            {showDropdown && (
                                <ul className="dropdown-list">
                                    {userRole === "admin" && (
                                        <li className="dropdown-item" onClick={() => navigate("/myngos")}>
                                            My NGOs
                                        </li>
                                    )}
                                    <li className="dropdown-item" onClick={handleLogout}>
                                        Logout
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;
