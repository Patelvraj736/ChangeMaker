import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/css/AddNGOForm.css";
import NGOMappr from "../content/NGOMappr";

const AddNGOForm = ({ onNGOAdded }) => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [typeId, setTypeId] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [details, setDetails] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("India");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mapCoords, setMapCoords] = useState(null);

    const OPENCAGE_API_KEY = "afb360fb6a1e4251aeca02c4512f8bb1";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ngos/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error.response?.data || error.message);
                alert("Failed to fetch NGO categories.");
            }
        };
        fetchCategories();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const getCoordinates = async (address, city, state, country) => {
        try {
            const query = `${address}, ${city}, ${state}, ${country}`;
            const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}`);
            const result = response.data.results[0];
            if (result) {
                return {
                    latitude: result.geometry.lat,
                    longitude: result.geometry.lng,
                };
            } else {
                throw new Error("No coordinates found for the location.");
            }
        } catch (error) {
            console.error("Geocoding error:", error.message);
            return null;
        }
    };

    const previewLocationOnMap = async () => {
        const coords = await getCoordinates(address, city, state, country);
        if (coords) {
            setMapCoords(coords);
        } else {
            alert("Could not preview location. Please check the address.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !description || !typeId || !imageFile || !details || !address || !city || !state || !country || !phone || !email) {
            alert("Please fill all fields");
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            alert("Invalid phone number. Please enter a 10-digit number.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            alert("Invalid email address.");
            return;
        }

        const accessToken = localStorage.getItem("token");
        if (!accessToken) {
            alert("Unauthorized! Please log in first.");
            return;
        }

        setLoading(true);

        const coords = await getCoordinates(address, city, state, country);
        if (!coords) {
            alert("Could not get coordinates for the location. Please check the address.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("description", description.trim());
        formData.append("type_id", typeId);
        formData.append("image", imageFile);
        formData.append("details", details.trim());
        formData.append("address", address.trim());
        formData.append("city", city.trim().toLowerCase());
        formData.append("state", state.trim().toLowerCase());
        formData.append("country", country.trim());
        formData.append("latitude", coords.latitude);
        formData.append("longitude", coords.longitude);
        formData.append("phone", phone.trim());
        formData.append("email", email.trim());

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ngos/add`, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            alert("✅ NGO added successfully!");
            if (onNGOAdded) {
                onNGOAdded(response.data);
            }
            setName(""); setDescription(""); setTypeId(""); setImageFile(null);
            setDetails(""); setAddress(""); setCity(""); setState("");
            setCountry("India"); setPhone(""); setEmail(""); setPreview(null);
            setMapCoords(null);
        } catch (error) {
            console.error("❌ Error adding NGO:", error.response?.data || error.message);
            alert(`Error: ${error.response?.data?.message || "Failed to add NGO"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-ngo-form-container">
            <div className="add-ngo-form-wrapper">
                <form className="add-ngo-form" onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-title">Add New NGO</div>

                    <div className="form-group">
                        <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="NGO Name" required />
                    </div>

                    <div className="form-group">
                        <textarea className="form-textarea" rows="1" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short Description" required />
                    </div>

                    <div className="form-group">
                        <select className="form-select" value={typeId} onChange={(e) => setTypeId(e.target.value)} required>
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <input type="file" className="form-file-input" accept="image/*" onChange={handleImageChange} required />
                        {preview && <img src={preview} alt="Preview" className="image-preview" />}
                    </div>

                    <div className="form-group">
                        <textarea className="form-textarea" rows="6" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Detailed Information" required />
                    </div>

                    <div className="form-group">
                        <input type="text" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" required />
                    </div>

                    <div className="form-group">
                        <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
                    </div>

                    <div className="form-group">
                        <input type="text" className="form-input" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" required />
                    </div>

                    <div className="form-group">
                        <input type="text" className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" required />
                    </div>

                    <div className="form-group">
                        <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" required />
                    </div>

                    <div className="form-group">
                        <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />
                    </div>

                    <div className="form-group">
                        <button type="button" className="form-preview-button" onClick={previewLocationOnMap}>Preview Location on Map</button>
                    </div>

                    {mapCoords && (
                        <div style={{ marginTop: "10px" }}>
                            <NGOMappr
                                lat={mapCoords.latitude}
                                lng={mapCoords.longitude}
                                name={name}
                                address={`${address}, ${city}, ${state}, ${country}`}
                            />
                        </div>
                    )}

                    <div className="form-button-container">
                        <button type="submit" className="form-submit-button" disabled={loading}>
                            {loading ? "Submitting..." : "Add NGO"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNGOForm;
