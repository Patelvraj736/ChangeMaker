import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../assets/css/DonationForm.css";

const DonationForm = ({ ngo }) => {
    const navigate = useNavigate();
    const [razorpayKey, setRazorpayKey] = useState("");
    const [donationDetails, setDonationDetails] = useState({
        donor_name: "",
        email: "",
        phone: "",
        amount: ""
    });

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_API_URL}/api/config/razorpay-key`)
            .then(res => setRazorpayKey(res.data.key))
            .catch(err => console.error("Error fetching Razorpay key:", err));
    }, []);

    const handleDonationChange = (e) => {
        const { name, value } = e.target;
        setDonationDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDonate = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You must be logged in to donate.");
            navigate("/login");
            return;
        }

        const { donor_name, email, phone, amount } = donationDetails;

        if (
            !donor_name.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !amount ||
            isNaN(amount) ||
            parseFloat(amount) <= 0
        ) {
            alert("Please fill all fields correctly.");
            return;
        }

        const options = {
            key: razorpayKey,
            amount: parseInt(amount) * 100,
            currency: "INR",
            name: ngo?.name || "NGO",
            description: "Donation",
            image: ngo?.image_url || "",
            handler: async function (response) {
                try {
                    await axios.post(`${import.meta.env.VITE_API_URL}/api/donations/save-donation`, {
                        ngo_id: ngo?.id,
                        donor_name: donor_name.trim(),
                        email: email.trim(),
                        phone: phone.trim(),
                        amount: parseFloat(amount),
                        razorpay_payment_id: response.razorpay_payment_id
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    alert("Thank you for your donation!");
                    setDonationDetails({ donor_name: "", email: "", phone: "", amount: "" });
                } catch (err) {
                    console.error("Error saving donation:", err);
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        alert("Session expired or unauthorized. Please login again.");
                    } else {
                        alert("Payment succeeded but error saving donation.");
                    }
                }
            },
            prefill: {
                name: donor_name.trim(),
                email: email.trim(),
                contact: phone.trim(),
            },
            theme: {
                color: "#3399cc",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <div className="donation-form">
            <h3>Make a Donation</h3>
            <input
                type="text"
                name="donor_name"
                placeholder="Your Name"
                value={donationDetails.donor_name}
                onChange={handleDonationChange}
                required
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={donationDetails.email}
                onChange={handleDonationChange}
                required
            />
            <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={donationDetails.phone}
                onChange={handleDonationChange}
                required
            />
            <input
                type="number"
                name="amount"
                placeholder="Amount (INR)"
                value={donationDetails.amount}
                onChange={handleDonationChange}
                required
            />
            <button onClick={handleDonate}>Donate Now</button>
        </div>
    );
};

export default DonationForm;
