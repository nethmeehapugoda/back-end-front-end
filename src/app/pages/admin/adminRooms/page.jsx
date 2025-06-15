"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL, { IMG_URL } from "@/API/config";
import AdminLayout from "@/components/Layouts/adminLayout";

const AdminRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    _id: null,
    roomNumber: "",
    category: "",
    status: "available",
    images: [], // Array of { url, filename } objects
    imagesToDelete: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]); // For previewing new images

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    fetchRooms();
    fetchCategories();

    // Cleanup image previews on component unmount
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/room`);
      setRooms(res.data || []);
    } catch (err) {
      setError(
        "Failed to load rooms: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/category`);
      setCategories(res.data || []);
      if (res.data.length === 0) {
        setError("No categories found. Please add a category first.");
      }
    } catch (err) {
      setError(
        "Failed to fetch categories: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Function to get image URL
  const getImageUrl = (image) => {
    return image.url ? `${IMG_URL}${image.url}` : "/path/to/default-image.jpg";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = [...e.target.files];
    setImageFiles(files);
    // Generate previews for new images
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => {
      // Revoke previous preview URLs to prevent memory leaks
      prev.forEach((url) => URL.revokeObjectURL(url));
      return previews;
    });
  };

  const validateForm = () => {
    if (!form.roomNumber) {
      setError("Room number is required.");
      return false;
    }
    if (!form.category) {
      setError("Please select a category.");
      return false;
    }
    if (!form.status) {
      setError("Status is required.");
      return false;
    }
    return true;
  };

  const handleAddRoom = async () => {
    if (!categories.length) {
      setError("No categories available. Please add a category first.");
      return;
    }
    if (!validateForm()) return;
    try {
      const formData = new FormData();
      formData.append("roomNumber", form.roomNumber);
      formData.append("category", form.category);
      formData.append("status", form.status);
      imageFiles.forEach((file) => formData.append("images", file));

      const res = await axios.post(`${BASE_URL}/room`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRooms((prev) => [...prev, res.data.room]);
      setIsSubmitted(true);
      setError("");
      setImagePreviews([]); // Clear previews after successful upload
      setImageFiles([]);
    } catch (err) {
      setError(
        "Failed to add room: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleUpdateRoom = async () => {
    if (!categories.length) {
      setError("No categories available. Please add a category first.");
      return;
    }
    if (!validateForm()) return;
    try {
      const formData = new FormData();
      formData.append("roomNumber", form.roomNumber);
      formData.append("category", form.category);
      formData.append("status", form.status);
      imageFiles.forEach((file) => formData.append("images", file));
      if (form.imagesToDelete?.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(form.imagesToDelete));
      }

      const res = await axios.put(`${BASE_URL}/room/${form._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRooms((prev) =>
        prev.map((r) => (r._id === form._id ? res.data.room : r))
      );
      setImagePreviews([]); // Clear previews after successful update
      setImageFiles([]);
      resetForm();
    } catch (err) {
      setError(
        "Failed to update room: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await axios.delete(`${BASE_URL}/room/${id}`);
      setRooms((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(
        "Failed to delete room: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const startEditRoom = (room) => {
    setForm({
      _id: room._id,
      roomNumber: room.roomNumber,
      category: room.category?._id || room.category || "",
      status: room.status,
      images: room.images || [], // Array of { url, filename } objects
      imagesToDelete: [],
    });
    setImageFiles([]);
    setImagePreviews([]); // Clear previews when editing
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setForm({
      _id: null,
      roomNumber: "",
      category: "",
      status: "available",
      images: [],
      imagesToDelete: [],
    });
    setImageFiles([]);
    setImagePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setIsSubmitted(false);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setError("");
  };

  const handleImageDelete = (filename) => {
    setForm((prev) => ({
      ...prev,
      imagesToDelete: [...(prev.imagesToDelete || []), filename],
      images: prev.images.filter((img) => img.filename !== filename),
    }));
  };

  const handleRemoveNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      prev.forEach((url, i) => {
        if (i === index) URL.revokeObjectURL(url);
      });
      return newPreviews;
    });
  };

  const renderInput = (label, name, value, type = "text", placeholder) => (
    <div className="mb-4">
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">Room Management</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-800 transition duration-200"
            disabled={!categories.length}
            title={!categories.length ? "Add a category first" : ""}
          >
            Add Room
          </button>
        </div>

        {error && !isAddModalOpen && !isEditModalOpen && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Room Table */}
        {loading && <p className="text-gray-600">Loading rooms...</p>}
        {!loading && rooms.length === 0 && (
          <p className="text-gray-600">No rooms found.</p>
        )}
        {!loading && rooms.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full table-auto text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Room Number
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Images
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr
                    key={room._id}
                    className="border-t hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4">{room.roomNumber}</td>
                    <td className="px-6 py-4">{room.category?.name || "-"}</td>
                    <td className="px-6 py-4 capitalize">{room.status}</td>
                    <td className="px-6 py-4">
                      {room.images?.length > 0 ? (
                        <div className="flex items-center space-x-2">
                          <span>{room.images.length} image(s)</span>
                          <img
                            src={getImageUrl(room.images[0])}
                            alt="Room preview"
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              e.target.src = "/path/to/default-image.jpg";
                              e.target.alt = "Image not found";
                            }}
                          />
                        </div>
                      ) : (
                        "No images"
                      )}
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => startEditRoom(room)}
                        className="bg-yellow-500 text-white px-4 py-1 rounded-lg hover:bg-yellow-600 transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room._id)}
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
        )}

        {/* Add Room Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Add New Room
              </h2>
              {!isSubmitted ? (
                <>
                  <div className="grid grid-cols-1 gap-6">
                    {renderInput(
                      "Room Number",
                      "roomNumber",
                      form.roomNumber,
                      "text",
                      "Enter room number"
                    )}
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {!categories.length && (
                        <p className="text-red-600 text-sm mt-1">
                          No categories available. Please add a category first.
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-700">
                        Upload Images
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <button
                                onClick={() => handleRemoveNewImage(index)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 text-sm"
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {error && (
                    <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddRoom}
                      className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition duration-200"
                      disabled={!categories.length}
                    >
                      Submit
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-orange-600 mb-4">
                    Room added successfully!
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={resetForm}
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

        {/* Edit Room Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Edit Room
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {renderInput(
                  "Room Number",
                  "roomNumber",
                  form.roomNumber,
                  "text",
                  "Enter room number"
                )}
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {!categories.length && (
                    <p className="text-red-600 text-sm mt-1">
                      No categories available. Please add a category first.
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Current Images
                  </label>
                  {form.images?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {form.images.map((image, index) => (
                        <div key={image.filename} className="relative">
                          <img
                            src={getImageUrl(image)}
                            alt={`Room image ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                            onError={(e) => {
                              e.target.src = "/path/to/default-image.jpg";
                              e.target.alt = "Image not found";
                            }}
                          />
                          <button
                            onClick={() => handleImageDelete(image.filename)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 text-sm"
                            title="Delete image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No images</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Upload New Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 text-sm"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {imageFiles.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {imageFiles.length} new file(s) selected
                    </p>
                  )}
                </div>
              </div>
              {error && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRoom}
                  className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition duration-200"
                  disabled={!categories.length}
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

export default AdminRoomsPage;
