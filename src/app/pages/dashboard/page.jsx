"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/components/Layouts/adminLayout";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import BASE_URL from "@/API/config";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeGuests: 0,
    availableRooms: 0,
    monthlyRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [roomStatus, setRoomStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // First fetch bookings and rooms in parallel
        const [bookingsRes, roomsRes] = await Promise.all([
          axios.get(`${BASE_URL}/booking`, config),
          axios.get(`${BASE_URL}/room`, config),
        ]);

        // Calculate monthly revenue from bookings data
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyRevenue = bookingsRes.data
          .filter((booking) => {
            const bookingDate = new Date(booking.createdAt);
            return (
              bookingDate.getMonth() === currentMonth &&
              bookingDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        // Process data for stats
        const totalBookings = bookingsRes.data.length;
        const activeGuests = bookingsRes.data.filter(
          (booking) =>
            booking.status === "confirmed" &&
            new Date(booking.checkOutDate) > new Date()
        ).length;
        const availableRooms = roomsRes.data.filter(
          (room) => room.status === "available"
        ).length;

        // Get recent bookings (last 5)
        const sortedBookings = [...bookingsRes.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // Get room statuses
        const roomStatuses = roomsRes.data.slice(0, 6).map((room) => ({
          number: room.roomNumber,
          status: room.status,
        }));

        setStats({
          totalBookings,
          activeGuests,
          availableRooms,
          monthlyRevenue,
        });
        setRecentBookings(sortedBookings);
        setRoomStatus(roomStatuses);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex min-h-screen bg-white-80">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <section className="bg-amber-50 py-10 rounded-2xl text-center">
              <h1 className="text-5xl font-extrabold text-amber-700 font-serif drop-shadow-md mb-6">
                Hotel Admin Dashboard
              </h1>
            </section>

            {/* Booking Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                title="Total Bookings"
                value={stats.totalBookings.toLocaleString()}
              />
              <Card
                title="Active Guests"
                value={stats.activeGuests.toLocaleString()}
              />
              <Card
                title="Available Rooms"
                value={stats.availableRooms.toLocaleString()}
              />
              <Card
                title="Revenue This Month"
                value={`$${stats.monthlyRevenue.toLocaleString()}`}
              />
            </div>

            {/* Recent Bookings */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Recent Bookings
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-3">Guest</th>
                      <th className="py-3">Room</th>
                      <th className="py-3">Check-In</th>
                      <th className="py-3">Check-Out</th>
                      <th className="py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => (
                        <Row
                          key={booking._id}
                          guest={`${booking.user?.email || "N/A"} ${
                            booking.user?.lastName || ""
                          }`}
                          room={booking.room?.roomNumber || "N/A"}
                          inDate={format(
                            new Date(booking.checkInDate),
                            "MMM d"
                          )}
                          outDate={format(
                            new Date(booking.checkOutDate),
                            "MMM d"
                          )}
                          status={booking.status}
                        />
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-4 text-center text-gray-500"
                        >
                          No recent bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Room Availability */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Room Availability
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {roomStatus.length > 0 ? (
                  roomStatus.map((room) => (
                    <RoomCard
                      key={room.number}
                      number={room.number}
                      status={room.status}
                    />
                  ))
                ) : (
                  <div className="col-span-6 text-center text-gray-500 py-4">
                    No room data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-2">{value}</p>
    </div>
  );
}

function Row({ guest, room, inDate, outDate, status }) {
  const statusColor =
    {
      confirmed: "text-green-600",
      pending: "text-amber-600",
      cancelled: "text-red-600",
      completed: "text-indigo-600",
    }[status] || "text-gray-600";

  const formattedStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3">{guest}</td>
      <td className="py-3">{room}</td>
      <td className="py-3">{inDate}</td>
      <td className="py-3">{outDate}</td>
      <td className={`py-3 font-medium ${statusColor}`}>{formattedStatus}</td>
    </tr>
  );
}

function RoomCard({ number, status }) {
  const colors = {
    available: "bg-green-100 text-green-800",
    occupied: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
    maintenance: "bg-gray-100 text-gray-800",
  };

  const formattedStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <div
      className={`p-4 rounded-xl text-center font-medium transition-transform hover:scale-105 ${
        colors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      <div className="text-lg font-semibold">Room {number}</div>
      <div className="text-sm mt-1">{formattedStatus}</div>
    </div>
  );
}
