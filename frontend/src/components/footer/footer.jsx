import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa"; 
import logo from "../../assets/icons/logo.svg";
import "../../assets/css/footer.css"; 

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-wrapper">
                    <div className="footer-section footer-logo-container">
                    <img className="footer-logo" src={logo} alt="ChangeMaker Logo" />
                    <h2 className="footer-brand">ChangeMaker</h2>
                    <p className="footer-tagline">Empowering NGOs, Connecting People</p>
                </div>

                <div className="footer-section footer-links-container">
                    <h3 className="footer-title">Quick Links</h3>
                    <ul className="footer-links-list">
                        <li className="footer-link-item"><Link className="footer-link" to="/">Home</Link></li>
                        <li className="footer-link-item"><Link className="footer-link" to="/">NGO Categories</Link></li>
                        <li className="footer-link-item"><Link className="footer-link" to="/about">About Us</Link></li>
                    </ul>
                </div>


                <div className="footer-section footer-social-container">
                    <h3 className="footer-title">Follow Us</h3>
                    <div className="footer-social-icons">
                        <a className="social-icon-link" href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <FaFacebook className="fa social-icon"  />
                        </a>
                        <a className="social-icon-link" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <FaTwitter className="tw social-icon" /> 
                        </a>
                        <a className="social-icon-link" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <FaInstagram className="ins social-icon"/> 
                        </a>
                        <a className="social-icon-link" href="https://wa.me" target="_blank" rel="noopener noreferrer">
                            <FaWhatsapp className="wa social-icon" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="footer-bottom-text">© {new Date().getFullYear()} ChangeMaker | All Rights Reserved</p>
            </div>
        </footer>
    );
}

export default Footer;
