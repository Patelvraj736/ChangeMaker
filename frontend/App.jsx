import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/header/header";
import Listing from "./pages/listing";
import NGODetail from "./components/content/NGODetail";
import Footer from "./components/footer/footer";
import Login from "./components/content/Login";
import Register from "./components/content/Register";
import AdminDonations from "./components/content/AdminDonation";
import AddNGOForm from "./components/content/AddNGOForm";
import EditNGOForm from "./components/content/EditNGOForm";
import About from "./components/content/About";
import MyNGOs from "./components/content/MyNGOs";
import 'leaflet/dist/leaflet.css';

export const API_BASE_URL = process.env.REACT_APP_API_URL;

function ScrollToTop() {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return null;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <Router>
            <ScrollToTop />
            <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />

            <Routes>
                <Route path="/" element={<Listing />} />
                <Route path="/ngo/:id" element={<NGODetail />} />
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/admin/donations" element={<AdminDonations />} />
                <Route path="/add-ngo" element={<AddNGOForm />} />
                <Route path="/category/:categoryId" element={<Listing />} />
                <Route path="/edit/:id" element={<EditNGOForm />} />
                <Route path="/myngos" element={<MyNGOs />} />
            </Routes>

            <Footer />
        </Router>
    );
}

export default App;
