import React from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/content.css";

const NGOListing = ({
    selectedCategory,
    ngos,
    featuredNGO,
    ngoSearch,
    setNgoSearch,
    selectedState,
    setSelectedState,
    selectedCity,
    setSelectedCity,
}) => {
    const navigate = useNavigate();

    const handleNGOClick = (ngo) => {
        navigate(`/ngo/${ngo.id}`);
    };

    const filteredNGOs = ngos.filter((ngo) => {
        const nameMatch = ngo.name?.toLowerCase().includes(ngoSearch.toLowerCase());
        const cityMatch = selectedCity === "" || ngo.city?.toLowerCase() === selectedCity.toLowerCase();
        const stateMatch = selectedState === "" || ngo.state?.toLowerCase() === selectedState.toLowerCase();
        return nameMatch && cityMatch && stateMatch;
    });

    const uniqueStates = [...new Set(ngos.map(ngo => ngo.state?.toLowerCase()).filter(Boolean))];
    const uniqueCities = [...new Set(
        ngos.filter(ngo => selectedState === "" || ngo.state?.toLowerCase() === selectedState.toLowerCase())
            .map(ngo => ngo.city?.toLowerCase()).filter(Boolean)
    )];

    const formatText = (text) =>
        text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

    return (
        <div>
            {featuredNGO && featuredNGO.name ? (
                <div className="featured-ngo">
                    <h2 className="head">NGO of the Week</h2>
                    <div key={featuredNGO.id} className="category-card" onClick={() => handleNGOClick(featuredNGO)}>
                        <img
                            src={featuredNGO.image_url || `${import.meta.env.VITE_API_URL}/api/ngos/${featuredNGO.id}/image`}
                            alt={featuredNGO.name}
                            className="ngo-image"
                        />
                        <div className="ngos-name">{featuredNGO.name}</div>
                        <div className="ngo-des">{featuredNGO.description}</div>
                        <div className="address">
                            <div className="ad-title">Address:</div>
                            {featuredNGO.address || "Not Available"}
                            {featuredNGO.city ? `, ${featuredNGO.city}` : ""}
                            {featuredNGO.state ? `, ${featuredNGO.state}` : ""}
                            {featuredNGO.country ? `, ${featuredNGO.country}` : ""}
                        </div>
                        <div className="star-rating">
                            {"★".repeat(Math.round(featuredNGO.avg_rating || 0))}
                            {"☆".repeat(5 - Math.round(featuredNGO.avg_rating || 0))}
                        </div>
                    </div>
                </div>
            ) : (
             <p>Loading featured NGO...</p>
            )}

            <h2 className="head">{selectedCategory?.name || "NGO"} NGOs</h2>

            <div className="filter-row">
                <input
                    type="text"
                    placeholder="Search NGOs..."
                    value={ngoSearch}
                    onChange={(e) => setNgoSearch(e.target.value)}
                    className="search-input"
                />

                <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="filter-dropdown"
                >
                    <option value="">All States</option>
                    {uniqueStates.map((state) => (
                        <option key={state} value={state}>
                            {formatText(state)}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="filter-dropdown"
                >
                    <option value="">All Cities</option>
                    {uniqueCities.map((city) => (
                        <option key={city} value={city}>
                            {formatText(city)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex">
                {filteredNGOs.length > 0 ? (
                    filteredNGOs.map((ngo) => (
                        <div key={ngo.id} className="category-card" onClick={() => handleNGOClick(ngo)}>
                            <img
                                src={ngo.image_url || `${import.meta.env.VITE_API_URL}/api/ngos/${ngo.id}/image`}
                                alt={ngo.name}
                                className="ngo-image"
                            />
                            <div className="ngos-name">{ngo.name}</div>
                            <div className="ngo-des">{ngo.description}</div>
                            <div className="address">
                                <div className="ad-title">Address:</div>
                                {ngo.address || "Not Available"}
                                {ngo.city ? `, ${ngo.city}` : ""}
                                {ngo.state ? `, ${ngo.state}` : ""}
                                {ngo.country ? `, ${ngo.country}` : ""}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No NGOs found for this category with current filters.</p>
                )}
            </div>
        </div>
    );
};

export default NGOListing;
