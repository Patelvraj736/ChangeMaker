import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../../assets/css/AdminDonations.css";

const AdminDonations = () => {
    const [donations, setDonations] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${import.meta.env.VITE_API_URL}/api/donations/admin/all-donations`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setDonations(res.data))
        .catch(err => {
            console.error("Error fetching donations:", err);
            alert("Failed to fetch donations. Make sure you are logged in as admin.");
        });
    }, []);

    return (
        <div className="admin-donation-container">
            <h2>All Donations</h2>
            {donations.length === 0 ? (
                <p>No donations yet.</p>
            ) : (
                <div className="donation-cards-container">
                    {donations.map((donation) => (
                        <div key={donation.id} className="donation-card">
                            <div className="donation-header">
                                <h3>{donation.donor_name}</h3>
                                <span className="amount">₹{donation.amount}</span>
                            </div>
                            <p><strong>NGO:</strong> {donation.ngo_name}</p>
                            <p><strong>NGO Type:</strong> {donation.ngo_type}</p>
                            <p><strong>Email:</strong> {donation.email}</p>
                            <p><strong>Phone:</strong> {donation.phone}</p>
                            <p><strong>Payment ID:</strong> {donation.razorpay_payment_id}</p>
                            <p><strong>Date:</strong> {new Date(donation.donated_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDonations;
