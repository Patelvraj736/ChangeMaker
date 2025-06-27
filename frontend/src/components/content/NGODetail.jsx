import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DonationForm from "../content/DonationForm";
import "../../assets/css/NGODetails.css";
import NGOMap from "../content/NGOMap";

const NGODetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ngo, setNgo] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ user_name: "", rating: 0, comment: "" });
    const [hoverRating, setHoverRating] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedNgo, setEditedNgo] = useState({});
    const [role, setRole] = useState("");

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);

        axios.get(`${import.meta.env.VITE_API_URL}/api/ngos/ngo/${id}`)
            .then((response) => {
                setNgo(response.data);
                setEditedNgo(response.data);
            })
            .catch((error) => console.error("Error fetching NGO details:", error));

        axios.get(`${import.meta.env.VITE_API_URL}/api/ngos/ngo/${id}/reviews`)
            .then((response) => setReviews(response.data))
            .catch((error) => console.error("Error fetching reviews:", error));
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.user_name || newReview.rating === 0 || !newReview.comment) {
            alert("All fields are required.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/ngos/ngo/${id}/reviews`,
                newReview,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const updatedReviews = await axios.get(`${import.meta.env.VITE_API_URL}/api/ngos/ngo/${id}/reviews`);
            setReviews(updatedReviews.data);
            setNewReview({ user_name: "", rating: 0, comment: "" });
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Are you logged in?");
        }
    };

    const handleStarClick = (rating) => setNewReview({ ...newReview, rating });
    const handleStarHover = (rating) => setHoverRating(rating);
    const handleStarLeave = () => setHoverRating(0);
    const renderStars = (rating) => "★".repeat(rating);

    const handleEditToggle = async () => {
        setIsEditing(!isEditing);

        if (isEditing) {
            const ngoId = ngo.id;
            const accessToken = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("name", editedNgo.name);
            formData.append("description", editedNgo.description);
            formData.append("type_id", editedNgo.type_id);
            formData.append("details", editedNgo.details);
            formData.append("address", editedNgo.address);
            formData.append("city", editedNgo.city);
            formData.append("state", editedNgo.state);
            formData.append("country", editedNgo.country);
            formData.append("latitude", editedNgo.latitude);
            formData.append("longitude", editedNgo.longitude);
            formData.append("phone", editedNgo.phone);
            formData.append("email", editedNgo.email);

            try {
                const response = await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/ngos/edit/${ngoId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                setNgo(response.data);
                alert("NGO details updated successfully!");
            } catch (error) {
                console.error("Error updating NGO:", error);

                if (error.response) {
                    if (error.response.status === 401 || error.response.status === 403) {
                        alert("You are not authorized to edit this NGO.");
                    } else {
                        alert(`Failed to update NGO: ${error.response.data?.message || 'Server error.'}`);
                    }
                } else {
                    alert("Network error. Please try again later.");
                }
            }
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this NGO?")) {
            return;
        }

        const ngoId = ngo.id;
        const accessToken = localStorage.getItem("token");

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/ngos/${ngoId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            alert("NGO deleted successfully!");
            navigate("/");
        } catch (error) {
            console.error("Error deleting NGO:", error);

            if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    alert("You are not authorized to delete this NGO.");
                } else {
                    alert(`Failed to delete NGO: ${error.response.data?.message || 'Server error.'}`);
                }
            } else {
                alert("Network error. Please try again later.");
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedNgo((prevNgo) => ({
            ...prevNgo,
            [name]: value,
        }));
    };

    if (!ngo) return <h2>Loading...</h2>;

    return (
        <div className="ngo-detail-container">
            <div className="ngo-name">{ngo.name}</div>
            <div className="img">
                <img src={ngo.image_url || `${import.meta.env.VITE_API_URL}/api/ngos/${ngo.id}/image`} alt={ngo.name} className="ngo-imagee" />
            </div>
            <div className="ngo_title">{ngo.description}</div>

            {role === "admin" && (
                <div className="admin-action-buttons">
                    <button onClick={handleEditToggle} className="edit-btn">
                        {isEditing ? "Save Changes" : "Edit Details"}
                    </button>
                    <button onClick={handleDelete} className="delete-btn">
                        Delete NGO
                    </button>
                </div>
            )}

            {isEditing ? (
                <div className="edit-form">
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={editedNgo.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            name="description"
                            value={editedNgo.description}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Address:</label>
                        <input
                            type="text"
                            name="address"
                            value={editedNgo.address}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>City:</label>
                        <input
                            type="text"
                            name="city"
                            value={editedNgo.city}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>State:</label>
                        <input
                            type="text"
                            name="state"
                            value={editedNgo.state}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Country:</label>
                        <input
                            type="text"
                            name="country"
                            value={editedNgo.country}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Phone:</label>
                        <input
                            type="text"
                            name="phone"
                            value={editedNgo.phone}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={editedNgo.email}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            ) : (
                <div className="info-main">
                    <div className="info">
                        {ngo.details.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </div>
            )}

            <h2>Reviews & Ratings</h2>
            <ul className="reviews-list">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <li key={review.id}>
                            <div className="rate">
                                <div className="rev-user">{review.user_name}</div>
                                <span className="star-rating">{renderStars(review.rating)}</span>
                            </div>
                            <div className="comment">{review.comment}</div>
                        </li>
                    ))
                ) : (
                    <p>No reviews yet.</p>
                )}
            </ul>

            <form onSubmit={handleReviewSubmit} className="review-form">
                <input
                    type="text"
                    placeholder="Your Name"
                    value={newReview.user_name}
                    onChange={(e) => setNewReview({ ...newReview, user_name: e.target.value })}
                    required
                />
                <div className="star-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= (hoverRating || newReview.rating) ? "selected" : ""}`}
                            onClick={() => handleStarClick(star)}
                            onMouseEnter={() => handleStarHover(star)}
                            onMouseLeave={handleStarLeave}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <textarea
                    placeholder="Write a review"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    required
                />
                <button type="submit">Submit Review</button>
            </form>

            <DonationForm ngo={ngo} />

            <NGOMap
                latitude={ngo.latitude}
                longitude={ngo.longitude}
                name={ngo.name}
                address={ngo.address}
            />

            <div className="contact-info">
                <h2>📞 Contact Information</h2>
                <p><span className="contact-icon">📍</span><strong>Address:</strong> {ngo.address}, {ngo.city}, {ngo.state}, {ngo.country}</p>
                <p><span className="contact-icon">✉️</span><strong>Email:</strong> <a href={`mailto:${ngo.email}`}>{ngo.email}</a></p>
                <p><span className="contact-icon">📱</span><strong>Phone:</strong> <a href={`tel:${ngo.phone}`}>{ngo.phone}</a></p>
            </div>

        </div>
    );
};

export default NGODetail;
