"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "@/components/Layouts/adminLayout";
import { format } from "date-fns";
import {
  Pencil,
  Trash,
  Eye,
  X,
  Circle,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react";
import BASE_URL from "@/API/config";

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch bookings, rooms, and categories
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingsRes, roomsRes, categoriesRes] = await Promise.all([
        axios.get(`${BASE_URL}/booking`),
        axios.get(`${BASE_URL}/room`),
        axios.get(`${BASE_URL}/category`),
      ]);

      setBookings(bookingsRes.data);
      setRooms(roomsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError("Failed to load data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle booking deletion
  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;

    try {
      await axios.delete(`${BASE_URL}/booking/${bookingId}`);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch {
      setError("Failed to delete booking. Please try again.");
    }
  };

  // Handle booking update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedBooking = {
        ...editModal,
        checkInDate: new Date(editModal.checkInDate).toISOString(),
        checkOutDate: new Date(editModal.checkOutDate).toISOString(),
      };

      const response = await axios.put(
        `${BASE_URL}/booking/${editModal._id}`,
        updatedBooking
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === editModal._id ? response.data : b))
      );
      setEditModal(null);
    } catch (err) {
      setError("Failed to update booking. Please try again.");
      console.error(err);
    }
  };

  // Open edit modal
  const openEditModal = (booking) => {
    setEditModal({
      ...booking,
      checkInDate: format(new Date(booking.checkInDate), "yyyy-MM-dd"),
      checkOutDate: format(new Date(booking.checkOutDate), "yyyy-MM-dd"),
    });
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800",
      confirmed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-rose-100 text-rose-800",
      completed: "bg-indigo-100 text-indigo-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Toggle booking details
  const toggleBookingDetails = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  // Filter bookings
  const filteredBookings = bookings
    .filter((booking) => {
      const matchesSearch =
        booking.user?.firstName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.user?.lastName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room?.roomNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-4 md:mb-0">
            Booking Management
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && filteredBookings.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No bookings found
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "There are currently no bookings in the system"}
            </p>
          </div>
        )}

        {!loading && filteredBookings.length > 0 && (
          <div className="bg-white shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <React.Fragment key={booking._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{booking._id.slice(-6)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(booking.createdAt), "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user?.firstName} {booking.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.user?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.room?.roomNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.category?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(booking.checkInDate), "MMM d")} -{" "}
                            {format(
                              new Date(booking.checkOutDate),
                              "MMM d, yyyy"
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.ceil(
                              (new Date(booking.checkOutDate) -
                                new Date(booking.checkInDate)) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            nights
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => toggleBookingDetails(booking._id)}
                              className="text-gray-500 hover:text-amber-600 p-1 rounded-full hover:bg-gray-100"
                              title="View Details"
                            >
                              {expandedBooking === booking._id ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => openEditModal(booking)}
                              className="text-gray-500 hover:text-emerald-600 p-1 rounded-full hover:bg-gray-100"
                              title="Edit Booking"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(booking._id)}
                              className="text-gray-500 hover:text-rose-600 p-1 rounded-full hover:bg-gray-100"
                              title="Delete Booking"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedBooking === booking._id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                  Booking Details
                                </h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                      Booking ID:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {booking._id}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                      Created:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {format(
                                        new Date(booking.createdAt),
                                        "MMM d, yyyy h:mm a"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                      Check-in:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {format(
                                        new Date(booking.checkInDate),
                                        "EEEE, MMM d, yyyy"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                      Check-out:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {format(
                                        new Date(booking.checkOutDate),
                                        "EEEE, MMM d, yyyy"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                      Total Nights:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {Math.ceil(
                                        (new Date(booking.checkOutDate) -
                                          new Date(booking.checkInDate)) /
                                          (1000 * 60 * 60 * 24)
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                      Guests:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {booking.numberOfAdults} adult
                                      {booking.numberOfAdults !== 1 ? "s" : ""}
                                      {booking.numberOfChildren > 0 &&
                                        `, ${booking.numberOfChildren} child${
                                          booking.numberOfChildren !== 1
                                            ? "ren"
                                            : ""
                                        }`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                  Payment Information
                                </h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                      Room Price:
                                    </span>
                                    <span className="text-sm font-medium">
                                      ${booking.category?.price}/night
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                      Total Amount:
                                    </span>
                                    <span className="text-sm font-medium">
                                      $
                                      {Math.ceil(
                                        (new Date(booking.checkOutDate) -
                                          new Date(booking.checkInDate)) /
                                          (1000 * 60 * 60 * 24)
                                      ) * booking.category?.price}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                      Payment Method:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {booking.paymentMethod || "Credit Card"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                      Card Number:
                                    </span>
                                    <span className="text-sm font-medium">
                                      **** **** ****{" "}
                                      {booking.billing?.cardNumber?.slice(-4)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Booking
                </h2>
                <button
                  onClick={() => setEditModal(null)}
                  className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={editModal.checkInDate}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          checkInDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={editModal.checkOutDate}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          checkOutDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room
                    </label>
                    <select
                      value={editModal.room?._id}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          room: { _id: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    >
                      <option value="">Select Room</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.roomNumber} ({room.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editModal.category?._id}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          category: { _id: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name} (${category.price}/night)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Adults
                    </label>
                    <input
                      type="number"
                      value={editModal.numberOfAdults}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          numberOfAdults: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Children
                    </label>
                    <input
                      type="number"
                      value={editModal.numberOfChildren}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          numberOfChildren: parseInt(e.target.value),
                        })
                      }
                      min="0"
                      max="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editModal.status}
                    onChange={(e) =>
                      setEditModal({ ...editModal, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Billing Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editModal.billing?.fullName || ""}
                        onChange={(e) =>
                          setEditModal({
                            ...editModal,
                            billing: {
                              ...editModal.billing,
                              fullName: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editModal.billing?.email || ""}
                        onChange={(e) =>
                          setEditModal({
                            ...editModal,
                            billing: {
                              ...editModal.billing,
                              email: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={editModal.billing?.address || ""}
                        onChange={(e) =>
                          setEditModal({
                            ...editModal,
                            billing: {
                              ...editModal.billing,
                              address: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={editModal.billing?.city || ""}
                        onChange={(e) =>
                          setEditModal({
                            ...editModal,
                            billing: {
                              ...editModal.billing,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={editModal.billing?.state || ""}
                        onChange={(e) =>
                          setEditModal({
                            ...editModal,
                            billing: {
                              ...editModal.billing,
                              state: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={editModal.billing?.zip || ""}
                        onChange={(e) =>
                          setEditModal({
                            ...editModal,
                            billing: {
                              ...editModal.billing,
                              zip: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={editModal.billing?.cardNumber || ""}
                        onChange={(e) =>
                          setEditModal({
                            ...editModal,
                            billing: {
                              ...editModal.billing,
                              cardNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setEditModal(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookingsPage;
