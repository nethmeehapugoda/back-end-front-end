"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "@/API/config";
import AdminLayout from "@/components/Layouts/adminLayout";

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    price: "",
    currency: "LKR",
    popular: false,
    features: [{ label: "", icon: "" }],
  });
  const [editingId, setEditingId] = useState(null);
  const [editingCategory, setEditingCategory] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/category`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories", err);
      setError("Failed to load categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCategory((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...newCategory.features];
    updatedFeatures[index][field] = value;
    setNewCategory((prev) => ({
      ...prev,
      features: updatedFeatures,
    }));
  };

  const addFeatureField = () => {
    setNewCategory((prev) => ({
      ...prev,
      features: [...prev.features, { label: "", icon: "" }],
    }));
  };

  const removeFeatureField = (index) => {
    setNewCategory((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (category) => {
    if (!category.name || !category.description || !category.price) {
      setError("Name, description, and price are required");
      return false;
    }
    if (category.features.some((f) => !f.label || !f.icon)) {
      setError("All features must have a label and icon");
      return false;
    }
    return true;
  };

  const handleAddCategory = async () => {
    if (!validateForm(newCategory)) return;
    try {
      const res = await axios.post(`${BASE_URL}/category`, newCategory);
      setCategories([...categories, res.data.category]);
      setIsSubmitted(true);
      setError("");
    } catch (err) {
      console.error("Error adding category", err);
      setError("Failed to add category");
    }
  };

  const resetAddForm = () => {
    setNewCategory({
      name: "",
      description: "",
      price: "",
      currency: "LKR",
      popular: false,
      features: [{ label: "", icon: "" }],
    });
    setIsSubmitted(false);
    setError("");
    setIsAddModalOpen(false);
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${BASE_URL}/category/${id}`);
      setCategories(categories.filter((cat) => cat._id !== id));
    } catch {
      setError("Failed to delete category");
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setEditingCategory({ ...cat });
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!validateForm(editingCategory)) return;
    try {
      const res = await axios.put(
        `${BASE_URL}/category/${editingId}`,
        editingCategory
      );
      setCategories(
        categories.map((cat) =>
          cat._id === editingId ? res.data.category : cat
        )
      );
      setIsEditModalOpen(false);
      setEditingId(null);
      setError("");
    } catch {
      setError("Failed to update category");
    }
  };

  const handleEditFeatureChange = (index, field, value) => {
    const updatedFeatures = [...editingCategory.features];
    updatedFeatures[index][field] = value;
    setEditingCategory((prev) => ({
      ...prev,
      features: updatedFeatures,
    }));
  };

  const addEditFeatureField = () => {
    setEditingCategory((prev) => ({
      ...prev,
      features: [...prev.features, { label: "", icon: "" }],
    }));
  };

  const removeEditFeatureField = (index) => {
    setEditingCategory((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const renderInput = (
    label,
    name,
    value,
    type = "text",
    onChange,
    placeholder
  ) => (
    <div className="mb-4">
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-600"
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">
            Category Management
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-800 transition duration-200"
          >
            Add Category
          </button>
        </div>

        {error && !isAddModalOpen && !isEditModalOpen && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Category List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full table-auto text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Description
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Popular
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="border-t hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4">{cat.name}</td>
                  <td className="px-6 py-4">{cat.description}</td>
                  <td className="px-6 py-4">
                    {cat.price} {cat.currency}
                  </td>
                  <td className="px-6 py-4">{cat.popular ? "Yes" : "No"}</td>
                  <td className="px-6 py-4 space-x-3">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="bg-yellow-500 text-white px-4 py-1 rounded-lg hover:bg-yellow-600 transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Category Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Add New Category
              </h2>
           
              {!isSubmitted ? (
                <>
                  <div className="grid grid-cols-1 gap-6">
                    {renderInput(
                      "Name",
                      "name",
                      newCategory.name,
                      "text",
                      handleInputChange,
                      "Enter category name"
                    )}
                    {renderInput(
                      "Description",
                      "description",
                      newCategory.description,
                      "text",
                      handleInputChange,
                      "Enter description"
                    )}
                    {renderInput(
                      "Price",
                      "price",
                      newCategory.price,
                      "number",
                      handleInputChange,
                      "Enter price"
                    )}
                    {renderInput(
                      "Currency",
                      "currency",
                      newCategory.currency,
                      "text",
                      handleInputChange,
                      "Enter currency (e.g., LKR)"
                    )}
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-700">
                        Popular
                      </label>
                      <input
                        type="checkbox"
                        name="popular"
                        checked={newCategory.popular}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-amber-600 rounded focus:ring-amber-500"
                      />
                      
                    
                  </div>
                  </div>

                  {/* Features */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Features
                    </h3>
                    {newCategory.features.map((feature, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 gap-4 mb-3 items-center"
                      >
                        <input
                          type="text"
                          placeholder="Feature Label"
                          value={feature.label}
                          onChange={(e) =>
                            handleFeatureChange(index, "label", e.target.value)
                          }
                          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Icon (e.g., fa-check)"
                            value={feature.icon}
                            onChange={(e) =>
                              handleFeatureChange(index, "icon", e.target.value)
                            }
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 flex-1"
                          />
                          {newCategory.features.length > 1 && (
                            <button
                              onClick={() => removeFeatureField(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addFeatureField}
                      className="text-sm text-amber-700 hover:text-amber-800 font-medium"
                    >
                      + Add Feature
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={resetAddForm}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCategory}
                      className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition duration-200"
                    >
                      Submit
                    </button>
                  </div>
                </>
              
              ) : (
              
                <div>
                  <p className="text-amber-600 mb-4">
                    Category added successfully!
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={resetAddForm}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Edit Category
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {renderInput(
                  "Name",
                  "name",
                  editingCategory.name,
                  "text",
                  (e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    }),
                  "Enter category name"
                )}
                {renderInput(
                  "Description",
                  "description",
                  editingCategory.description,
                  "text",
                  (e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    }),
                  "Enter description"
                )}
                {renderInput(
                  "Price",
                  "price",
                  editingCategory.price,
                  "number",
                  (e) =>
                    setEditingCategory({
                      ...editingCategory,
                      price: e.target.value,
                    }),
                  "Enter price"
                )}
                {renderInput(
                  "Currency",
                  "currency",
                  editingCategory.currency,
                  "text",
                  (e) =>
                    setEditingCategory({
                      ...editingCategory,
                      currency: e.target.value,
                    }),
                  "Enter currency"
                )}
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Popular
                  </label>
                  <input
                    type="checkbox"
                    name="popular"
                    checked={editingCategory.popular}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        popular: e.target.checked,
                      })
                    }
                    className="h-5 w-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Features
                </h3>
                {editingCategory.features.map((feature, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-4 mb-3 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Feature Label"
                      value={feature.label}
                      onChange={(e) =>
                        handleEditFeatureChange(index, "label", e.target.value)
                      }
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Icon (e.g., fa-check)"
                        value={feature.icon}
                        onChange={(e) =>
                          handleEditFeatureChange(index, "icon", e.target.value)
                        }
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 flex-1"
                      />
                      {editingCategory.features.length > 1 && (
                        <button
                          onClick={() => removeEditFeatureField(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addEditFeatureField}
                  className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                >
                  + Add Feature
                </button>
              </div>
              {error && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategoryPage;
