import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../App";
import "../../assets/css/MyNGOs.css";

const MyNGOs = () => {
    const [ngos, setNgos] = useState([]);
    const navigate = useNavigate();
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        const fetchNGOs = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) return;

                const res = await axios.get(`${API_BASE_URL}/api/ngos/user/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setNgos(res.data || []);
            } catch (err) {
                console.error("Error fetching NGOs:", err.response ? err.response.data : err.message);
            }
        };

        fetchNGOs();
    }, [userId]);

    const handleNGOClick = (ngo) => {
        navigate(`/ngo/${ngo.id}`);
    };

    return (
        <div className="ngo-container">
            <h2 className="section-title">My NGOs</h2>

            <div className="flexx">
                {ngos.length > 0 ? (
                    ngos.map((ngo) => (
                        <div
                            key={ngo.id}
                            className="category-card cursor-pointer"
                            onClick={() => handleNGOClick(ngo)}
                        >
                            <img
                                src={ngo.image_url || `${API_BASE_URL}/api/ngos/${ngo.id}/image`}
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
                    <div className="text-gray-500">No NGOs found.</div>
                )}
            </div>
        </div>
    );
};

export default MyNGOs;
