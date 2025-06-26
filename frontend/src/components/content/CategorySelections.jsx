import React from "react";

const CategorySelection = ({ categories, categorySearch, setCategorySearch, onSelectCategory }) => {
    const filteredCategories = categories.filter(category =>
        category.name?.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
        <div>
            <h2 className="head">Select NGO Category</h2>
            <input
                type="text"
                placeholder="Search NGO Type..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="search-input"
            />
            <div className="flex">
                {filteredCategories.map((category) => (
                    <div key={category.id} className="category-card" onClick={() => onSelectCategory(category)}>
                        <img src={`${import.meta.env.VITE_API_URL}/${category.image_url}`} alt={category.name} className="ngo-image" />
                        <div className="ngos-name">{category.name}</div>
                        <div className="ngo-des">{category.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySelection;
