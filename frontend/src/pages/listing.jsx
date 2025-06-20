import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ChatBot from "../components/content/ChatBot";
import CategorySelection from "../components/content/CategorySelections";
import NGOListing from "../components/content/NGOListing";
import "../assets/css/content.css";

const Listing = () => {
    const [categories, setCategories] = useState([]);
    const [ngos, setNgos] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [featuredNGO, setFeaturedNGO] = useState(null);
    const [categorySearch, setCategorySearch] = useState("");
    const [ngoSearch, setNgoSearch] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [role, setRole] = useState("");

    const navigate = useNavigate();
    const { categoryId } = useParams();

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
    }, []);

    useEffect(() => {
        axios.get("http://localhost:5000/api/ngos/categories")
            .then((res) => setCategories(res.data))
            .catch((err) => console.error("Error fetching categories", err));
    }, []);

    useEffect(() => {

        if (categoryId && categories.length > 0) {
            const matchedCategory = categories.find(c => c.id.toString() === categoryId.toString());
            if (matchedCategory) {
                setSelectedCategory(matchedCategory);
            }
        }

        if (!categoryId) {
            setSelectedCategory(null);
            setNgos([]);
            setFeaturedNGO(null);
        }
    }, [categoryId, categories]);

    useEffect(() => {

        if (selectedCategory && selectedCategory.id) {
            axios.get(`http://localhost:5000/api/ngos/featured/${selectedCategory.id}`)
                .then((res) => {
                    if (res.data && Object.keys(res.data).length > 0) {
                        setFeaturedNGO(res.data);
                    } else {
                        setFeaturedNGO(null);
                    }
                })
                .catch((err) => console.error("Error fetching featured NGO", err));

            axios.get(`http://localhost:5000/api/ngos/category/${selectedCategory.id}/ngos`)
                .then((res) => setNgos(res.data))
                .catch((err) => console.error("Error fetching NGOs", err));
        }
    }, [selectedCategory]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        navigate(`/category/${category.id}`);
    };

    const handleBackClick = () => {
        setSelectedCategory(null);
        setNgoSearch("");
        setSelectedCity("");
        setSelectedState("");
        navigate("/categories");
    };

    return (
        <div className="categories-container">
            {!selectedCategory && (
                <>
                    <CategorySelection
                        categories={categories}
                        categorySearch={categorySearch}
                        setCategorySearch={setCategorySearch}
                        onSelectCategory={handleCategorySelect}
                    />
                    <ChatBot />

                    {role === "admin" && (
                        <div className="add">
                            <button
                                onClick={() => navigate("/add-ngo")}
                                className="add-ngo-btn"
                            >
                                Add New NGO
                            </button>
                        </div>
                    )}
                </>
            )}

            {selectedCategory && (
                <NGOListing
                    selectedCategory={selectedCategory}
                    ngos={ngos}
                    featuredNGO={featuredNGO}
                    ngoSearch={ngoSearch}
                    setNgoSearch={setNgoSearch}
                    selectedCity={selectedCity}
                    setSelectedCity={setSelectedCity}
                    selectedState={selectedState}
                    setSelectedState={setSelectedState}
                    onBackClick={handleBackClick}
                />
            )}
        </div>
    );
};

export default Listing;
