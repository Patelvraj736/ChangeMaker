import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

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

const NGOMappr = ({ lat, lng, name, address }) => {
    const defaultPosition = [23.0225, 72.5714]; 
    const ngoPosition = lat && lng ? [parseFloat(lat), parseFloat(lng)] : defaultPosition;


    return (
        <div>

            <MapContainer center={ngoPosition} zoom={12} style={{ height: "400px", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <Marker position={ngoPosition} icon={customIcon}>
                    <Popup>
                        <strong>{name || "NGO Location"}</strong> <br />
                        {address || "Address not available"}
                    </Popup>
                </Marker>

               
            </MapContainer>

        </div>
    );
};

export default NGOMappr;
