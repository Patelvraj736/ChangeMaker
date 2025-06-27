import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Custom Leaflet marker icon
const customIcon = new L.Icon({
    iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const RoutingComponent = ({ from, to }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!from || !to) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        const control = L.Routing.control({
            waypoints: [L.latLng(from), L.latLng(to)],
            lineOptions: {
                styles: [{ color: 'blue', weight: 4 }]
            },
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            showAlternatives: false,
            createMarker: () => null
        }).addTo(map);

        routingControlRef.current = control;

        setTimeout(() => {
            const container = control.getContainer();
            if (container) {
                L.DomUtil.remove(container);
            }
        }, 500);

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
        };
    }, [from, to, map]);

    return null;
};

const NGOMap = ({ latitude, longitude, name, address }) => {
    const defaultPosition = [23.0225, 72.5714]; // Ahmedabad
    const ngoPosition =
        latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)
            ? [parseFloat(latitude), parseFloat(longitude)]
            : defaultPosition;

    const [userLocation, setUserLocation] = useState(null);
    const [showRoute, setShowRoute] = useState(false);
    const [distance, setDistance] = useState(null);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userPos = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(userPos);
                    setShowRoute(true);
                    calculateDistance(userPos, ngoPosition);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Unable to get your current location.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const calculateDistance = (from, to) => {
        const R = 6371; // Earth's radius in km
        const [lat1, lon1] = from;
        const [lat2, lon2] = to;

        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        setDistance(d.toFixed(2)); // in kilometers
    };

    return (
        <div>
            {distance && (
                <div style={distanceStyle}>
                    Distance: <strong>{distance} km</strong>
                </div>
            )}

            <MapContainer center={ngoPosition} zoom={12} style={{ height: "400px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <Marker position={ngoPosition} icon={customIcon}>
                    <Popup>
                        <strong>{name || "NGO Location"}</strong> <br />
                        {address || "Address not available"}
                    </Popup>
                </Marker>

                {userLocation && (
                    <Marker position={userLocation} icon={customIcon}>
                        <Popup>Your Location</Popup>
                    </Marker>
                )}

                {userLocation && showRoute && (
                    <RoutingComponent from={userLocation} to={ngoPosition} />
                )}
            </MapContainer>

            <button onClick={getUserLocation} style={buttonStyle}>
                Get Directions from Current Location
            </button>
        </div>
    );
};

// Inline styles
const buttonStyle = {
    marginTop: "10px",
    padding: "10px 15px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
};

const distanceStyle = {
    padding: "10px",
    fontSize: "18px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "5px",
    marginBottom: "10px",
    textAlign: "center",
    fontWeight: "bold",
};

export default NGOMap;
