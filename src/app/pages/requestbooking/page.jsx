"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  Check,
  Star,
  Bed,
  Wifi,
  Tv,
  Coffee,
  Bath,
  Wind,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Car,
  Utensils,
  Shield,
  Zap,
  Snowflake,
  Sun,
  Moon,
  Heart,
  Gift,
  Crown,
  Sparkles,
  Home,
  TreePine,
  Waves,
  Mountain,
  Camera,
  Music,
  Gamepad2,
  Dumbbell,
  Plane,
  Clock,
  File,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import generateBookingReport from "@/lib/generateBookingReport";

const steps = [
  { id: 1, title: "Room Selection", icon: Bed },
  { id: 2, title: "Availability", icon: Calendar },
  { id: 3, title: "Personal Info", icon: User },
  { id: 4, title: "Payment", icon: CreditCard },
];

// Map of icon names to Lucide components
const iconMap = {
  Wifi: Wifi,
  Tv: Tv,
  Coffee: Coffee,
  Bath: Bath,
  Wind: Wind,
  Car: Car,
  Utensils: Utensils,
  Shield: Shield,
  Zap: Zap,
  Snowflake: Snowflake,
  Sun: Sun,
  Moon: Moon,
  Heart: Heart,
  Gift: Gift,
  Crown: Crown,
  Sparkles: Sparkles,
  Home: Home,
  TreePine: TreePine,
  Waves: Waves,
  Mountain: Mountain,
  Camera: Camera,
  Music: Music,
  Gamepad2: Gamepad2,
  Dumbbell: Dumbbell,
  Plane: Plane,
  Clock: Clock,
  Star: Star,
  Bed: Bed,
  File: File,
  Pencil: Pencil,
};

// Random icon pool for features without matching icons
const randomIcons = [
  Wifi,
  Tv,
  Coffee,
  Bath,
  Wind,
  Car,
  Utensils,
  Shield,
  Zap,
  Snowflake,
  Sun,
  Moon,
  Heart,
  Gift,
  Crown,
  Sparkles,
  Home,
  TreePine,
  Waves,
  Mountain,
  Camera,
  Music,
  Gamepad2,
  Dumbbell,
  Plane,
  Clock,
  Star,
  Bed,
];

// Color themes instead of gradients
const colorThemes = [
  {
    name: "ocean",
    primary: "bg-blue-500",
    secondary: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    hover: "hover:bg-blue-50",
    accent: "bg-blue-600",
  },
  {
    name: "forest",
    primary: "bg-green-500",
    secondary: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    hover: "hover:bg-green-50",
    accent: "bg-green-600",
  },
  {
    name: "sunset",
    primary: "bg-orange-500",
    secondary: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    hover: "hover:bg-orange-50",
    accent: "bg-orange-600",
  },
  {
    name: "lavender",
    primary: "bg-purple-500",
    secondary: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    hover: "hover:bg-purple-50",
    accent: "bg-purple-600",
  },
  {
    name: "rose",
    primary: "bg-pink-500",
    secondary: "bg-pink-100",
    text: "text-pink-700",
    border: "border-pink-200",
    hover: "hover:bg-pink-50",
    accent: "bg-pink-600",
  },
  {
    name: "slate",
    primary: "bg-slate-500",
    secondary: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    hover: "hover:bg-slate-50",
    accent: "bg-slate-600",
  },
  {
    name: "emerald",
    primary: "bg-emerald-500",
    secondary: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-50",
    accent: "bg-emerald-600",
  },
  {
    name: "indigo",
    primary: "bg-indigo-500",
    secondary: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-200",
    hover: "hover:bg-indigo-50",
    accent: "bg-indigo-600",
  },
];

export default function ModernBooking() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState({});

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    phone: "",
    email: "",
  });

  const [bookingData, setBookingData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfAdults: 1,
    numberOfChildren: 0,
  });

  const [billingData, setBillingData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
  });

  const createAxiosInstance = () => {
    const token = localStorage.getItem("token");
    console.log(
      "Creating axios instance with token:",
      token ? `${token.substring(0, 20)}...` : "No token"
    );

    const instance = axios.create({
      baseURL: "http://localhost:5000/api",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return instance;
  };

  // Get random theme for each room
  const getRoomTheme = (roomId) => {
    const hash = roomId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colorThemes[Math.abs(hash) % colorThemes.length];
  };

  // Get icon for feature
  const getIconForFeature = (feature) => {
    // Try to use the icon specified in the feature
    if (feature.icon && iconMap[feature.icon]) {
      return iconMap[feature.icon];
    }

    // Fallback to random icon based on label
    const hash = feature.label.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return randomIcons[Math.abs(hash) % randomIcons.length];
  };

  // Fetch rooms and their category details
  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);

      // First fetch all rooms
      const roomsResponse = await axios.get("http://localhost:5000/api/room");
      const availableRooms = roomsResponse.data.filter(
        (room) => room.status === "available"
      );

      // Then fetch category details for each unique category
      const uniqueCategoryIds = [
        ...new Set(
          availableRooms.map((room) =>
            typeof room.category === "object"
              ? room.category._id
              : room.category
          )
        ),
      ];

      const categoryDetailsObj = {};

      // Fetch each category's details
      await Promise.all(
        uniqueCategoryIds.map(async (categoryId) => {
          try {
            const categoryResponse = await axios.get(
              `http://localhost:5000/api/category/${categoryId}`
            );
            categoryDetailsObj[categoryId] = categoryResponse.data;
          } catch (err) {
            console.error(`Failed to fetch category ${categoryId}:`, err);
          }
        })
      );

      setCategoryDetails(categoryDetailsObj);
      setRooms(availableRooms);
      setError("");
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Failed to load rooms. Please try again later.");
    } finally {
      setRoomsLoading(false);
    }
  };

  // Get category details for a room
  const getCategoryForRoom = (room) => {
    if (!room || !room.category) return null;

    const categoryId =
      typeof room.category === "object" ? room.category._id : room.category;
    return categoryDetails[categoryId] || null;
  };

  // Check authentication and fetch rooms
  useEffect(() => {
    const checkAuth = () => {
      if (!authLoading) {
        if (user) {
          setIsAuthenticated(true);
          console.log("User authenticated:", user);
        } else {
          setIsAuthenticated(false);
          console.log("User not authenticated");
        }
        setIsLoading(false);
      }
    };

    checkAuth();
    fetchRooms();
  }, [user, authLoading]);

  // Calculate total price based on selected room and dates
  const calculateTotalPrice = () => {
    if (
      !selectedRoom ||
      !bookingData.checkInDate ||
      !bookingData.checkOutDate
    ) {
      return 0;
    }

    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const category = getCategoryForRoom(selectedRoom);
    const price = category?.price || 0;

    return nights * price;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomSelect = (room) => {
    if (isAuthenticated) {
      setSelectedRoom(room);
      setStep(2);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please register or log in to book a room.",
        confirmButtonColor: "#3b82f6",
        background: "#eff6ff",
      }).then(() => {
        router.push("/pages/auth");
      });
    }
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();

    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setError("Check-in date cannot be in the past");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in date");
      return;
    }

    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get("/booking/check-availability", {
        params: {
          roomId: selectedRoom._id,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
        },
      });

      if (response.data.available) {
        setError("");
        setStep(3);
      } else {
        setError(
          "Room is not available for the selected dates. Please choose different dates."
        );
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setError("");
      setStep(3);
    }
  };

  const handlePersonalSubmit = (e) => {
    e.preventDefault();
    setStep(4);
  };

  const resetBooking = () => {
    setFormData({
      firstName: "",
      lastName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      phone: "",
      email: "",
    });
    setBookingData({
      checkInDate: "",
      checkOutDate: "",
      numberOfAdults: 1,
      numberOfChildren: 0,
    });
    setBillingData({
      fullName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      cardNumber: "",
    });
    setSelectedRoom(null);
    setStep(1);
    setError("");
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Verify authentication
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const totalPrice = calculateTotalPrice();
      const categoryId =
        typeof selectedRoom.category === "object"
          ? selectedRoom.category._id
          : selectedRoom.category;

      const finalBookingData = {
        room: selectedRoom._id,
        category: categoryId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        numberOfAdults: bookingData.numberOfAdults,
        numberOfChildren: bookingData.numberOfChildren,
        totalPrice: totalPrice,
        billing: billingData,
      };

      // Test token validity first
      try {
        const testResponse = await axios.get(
          "http://localhost:5000/api/booking/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (testError) {
        throw new Error("Authentication token is invalid");
      }

      // Make the actual booking request
      const response = await axios.post(
        "http://localhost:5000/api/booking",
        finalBookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Booking Successful!",
        text: `Your booking has been confirmed!`,
        timer: 5000,
        showConfirmButton: false,
        background: "#f0fdf4",
        color: "#166534",
      });

      // Generate and download the detailed report
      generateBookingReport({
        booking: {
          reference: response.data.bookingReference || response.data._id,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          numberOfAdults: bookingData.numberOfAdults,
          numberOfChildren: bookingData.numberOfChildren,
          totalPrice: calculateTotalPrice(),
        },
        guest: formData,
        room: selectedRoom,
        billing: billingData,
      });

      resetBooking();
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "Your session has expired. Please log in again.";
        // Clear invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => {
          router.push("/pages/auth");
        }, 2000);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: errorMessage,
        background: "#fef2f2",
        color: "#dc2626",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-amber-700">
            Loading Booking System...
          </h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-200 py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mb-12"
        >
          <Card className="overflow-hidden shadow-2xl border-0">
            <div className="relative h-64 md:h-80 bg-gradient-to-r from-orange-600 to-orange-400">
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-center text-white"
                >
                  <h1 className="text-4xl md:text-6xl font-bold font-serif mb-4 drop-shadow-lg">
                    Book Your Stay
                  </h1>
                  <p className="text-xl md:text-2xl font-light">
                    Experience comfort and Luxury
                  </p>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12"
        >
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                {steps.map((stepItem, index) => {
                  const IconComponent = stepItem.icon;
                  const isActive = step === stepItem.id;
                  const isCompleted = step > stepItem.id;
                  const isAccessible = step >= stepItem.id;

                  return (
                    <div key={stepItem.id} className="flex items-center">
                      <motion.div
                        whileHover={isAccessible ? { scale: 1.05 } : {}}
                        className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-amber-500 text-white shadow-lg"
                            : isCompleted
                            ? "bg-orange-200 text-orange-700"
                            : "bg-black-100 text-black-500"
                        } ${
                          isAccessible ? "cursor-pointer" : "cursor-not-allowed"
                        }`}
                        onClick={() => isAccessible && setStep(stepItem.id)}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <IconComponent className="w-5 h-5" />
                        )}
                        <span className="font-medium hidden md:block">
                          {stepItem.title}
                        </span>
                      </motion.div>
                      {index < steps.length - 1 && (
                        <ChevronRight className="w-5 h-5 text-gray-400 mx-2 hidden md:block" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Room Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-2xl border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-700 font-serif mb-4">
                      Choose Your Perfect Room
                    </h2>
                    <p className="text-xl text-gray-600">
                      Select from our available accommodations
                    </p>
                  </div>

                  {roomsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                      <span className="ml-2 text-lg text-gray-600">
                        Loading Rooms...
                      </span>
                    </div>
                  ) : rooms.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No Rooms Available
                      </h3>
                      <p className="text-gray-500">
                        Please check back later or contact us for assistance.
                      </p>
                      <Button
                        onClick={fetchRooms}
                        variant="outline"
                        className="mt-4"
                      >
                        Refresh Rooms
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-12">
                      {rooms.map((room, index) => {
                        const theme = getRoomTheme(room._id);
                        const category = getCategoryForRoom(room);
                        const isPopular = category?.popular || false;

                        return (
                          <motion.div
                            key={room._id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="group relative"
                          >
                            <Card
                              className={`h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden ${theme.secondary}`}
                            >
                              <CardContent className="p-0 h-full flex flex-col">
                                {isPopular && (
                                  <Badge
                                    className={`absolute top-4 right-4 z-10 ${theme.primary} text-white`}
                                  >
                                    <Star className="w-3 h-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}

                                {/* Room Image */}
                                <div className="relative h-48 bg-gray-200 overflow-hidden">
                                  {room.images && room.images.length > 0 ? (
                                    <img
                                      src={`http://localhost:5000${room.images[0].url}`}
                                      alt={category?.name || "Room"}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display =
                                          "flex";
                                      }}
                                    />
                                  ) : null}
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100">
                                    <Bed className="w-12 h-12" />
                                  </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3
                                        className={`text-xl font-bold ${theme.text}`}
                                      >
                                        {category?.name || "Room Category"}
                                      </h3>
                                      <span className="text-sm text-gray-500">
                                        Room {room.roomNumber}
                                      </span>
                                    </div>

                                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                                      {category?.description ||
                                        "Comfortable accommodation with modern amenities."}
                                    </p>

                                    {/* Category Features */}
                                    {category?.features &&
                                    category.features.length > 0 ? (
                                      <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                          Features:
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                          {category.features.map(
                                            (feature, featureIndex) => {
                                              const FeatureIcon =
                                                getIconForFeature(feature);
                                              return (
                                                <div
                                                  key={featureIndex}
                                                  className="flex items-center gap-2 text-xs text-gray-600"
                                                >
                                                  <div
                                                    className={`p-1 rounded ${theme.primary}`}
                                                  >
                                                    <FeatureIcon className="w-3 h-3 text-white" />
                                                  </div>
                                                  <span className="truncate">
                                                    {feature.label}
                                                  </span>
                                                </div>
                                              );
                                            }
                                          )}
                                        </div>
                                      </div>
                                    ) : null}

                                    <div className="mb-6">
                                      <div className="flex items-baseline gap-2">
                                        <span
                                          className={`text-2xl font-bold ${theme.text}`}
                                        >
                                          LKR{" "}
                                          {category?.price?.toLocaleString() ||
                                            "N/A"}
                                        </span>
                                        <span className="text-gray-500">
                                          / night
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    onClick={() => handleRoomSelect(room)}
                                    className={`w-full ${theme.primary} hover:${theme.accent} hover:shadow-lg hover:scale-105 transition-all duration-300 text-white font-semibold`}
                                  >
                                    Select Room
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Availability */}
          {step === 2 && selectedRoom && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-2xl border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-700 font-serif mb-4">
                      Check Availability
                    </h2>
                    <p className="text-xl text-gray-600">
                      Selected:{" "}
                      <span className="font-semibold text-amber-600">
                        {getCategoryForRoom(selectedRoom)?.name || "Room"} -
                        Room {selectedRoom.roomNumber}
                      </span>
                    </p>
                  </div>

                  <form
                    onSubmit={handleAvailabilitySubmit}
                    className="max-w-4xl mx-auto"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-amber-600" />
                          Check-in Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          name="checkInDate"
                          value={bookingData.checkInDate}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              checkInDate: e.target.value,
                            })
                          }
                          required
                          min={new Date().toISOString().split("T")[0]}
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-amber-600" />
                          Check-out Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          name="checkOutDate"
                          value={bookingData.checkOutDate}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              checkOutDate: e.target.value,
                            })
                          }
                          required
                          min={
                            bookingData.checkInDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Users className="w-5 h-5 text-amber-600" />
                          Number of Adults{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={bookingData.numberOfAdults.toString()}
                          onValueChange={(value) =>
                            setBookingData({
                              ...bookingData,
                              numberOfAdults: Number.parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} Adult{num > 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Users className="w-5 h-5 text-amber-600" />
                          Number of Children
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={bookingData.numberOfChildren.toString()}
                          onValueChange={(value) =>
                            setBookingData({
                              ...bookingData,
                              numberOfChildren: Number.parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? "Child" : "Children"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>

                    {bookingData.checkInDate && bookingData.checkOutDate && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 rounded-2xl p-6 mb-8"
                      >
                        <h3 className="text-xl font-bold text-blue-700 mb-4">
                          Price Estimate
                        </h3>
                        <div className="space-y-2 text-gray-700">
                          <div className="flex justify-between">
                            <span>Room Rate per night:</span>
                            <span className="font-semibold">
                              LKR{" "}
                              {getCategoryForRoom(
                                selectedRoom
                              )?.price?.toLocaleString() || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Number of nights:</span>
                            <span className="font-semibold">
                              {Math.ceil(
                                (new Date(bookingData.checkOutDate) -
                                  new Date(bookingData.checkInDate)) /
                                  (1000 * 60 * 60 * 24)
                              )}
                            </span>
                          </div>
                          <div className="border-t pt-2 flex justify-between text-lg font-bold text-amber-700">
                            <span>Total:</span>
                            <span>
                              LKR {calculateTotalPrice().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="flex gap-4"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 text-lg border-amber-300 text-amber-600 hover:bg-amber-50"
                      >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 text-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                      >
                        Next: Personal Info
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Personal Info */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-2xl border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-700 font-serif mb-4">
                      Personal Information
                    </h2>
                    <p className="text-xl text-gray-600">
                      Please provide your details for the booking
                    </p>
                  </div>

                  <form
                    onSubmit={handlePersonalSubmit}
                    className="max-w-4xl mx-auto"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <User className="w-5 h-5 text-amber-600" />
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter your first name"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <User className="w-5 h-5 text-amber-600" />
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter your last name"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Mail className="w-5 h-5 text-amber-600" />
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter your email"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Phone className="w-5 h-5 text-amber-600" />
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter your phone number"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="md:col-span-2"
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-amber-600" />
                          Address Line 1 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="address1"
                          value={formData.address1}
                          onChange={handleChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter your street address"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3">
                          Address Line 2
                        </Label>
                        <Input
                          type="text"
                          name="address2"
                          value={formData.address2}
                          onChange={handleChange}
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter your city"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3">
                          State/Province <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter your state/province"
                        />
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                      className="flex gap-4"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1 h-12 text-lg border-amber-300 text-amber-600 hover:bg-amber-50"
                      >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 text-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                      >
                        Next: Payment
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && selectedRoom && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-2xl border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-700 font-serif mb-4">
                      Payment Information
                    </h2>
                    <p className="text-xl text-gray-600">
                      Complete your booking with secure payment
                    </p>
                  </div>

                  <form
                    onSubmit={handleFinalSubmit}
                    className="max-w-4xl mx-auto"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <User className="w-5 h-5 text-amber-600" />
                          Full Name on Card{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="fullName"
                          value={billingData.fullName}
                          onChange={handleBillingChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter cardholder name"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Mail className="w-5 h-5 text-amber-600" />
                          Billing Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="email"
                          name="email"
                          value={billingData.email}
                          onChange={handleBillingChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter billing email"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="md:col-span-2"
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-amber-600" />
                          Card Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="cardNumber"
                          value={billingData.cardNumber}
                          onChange={handleBillingChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="1234 5678 9012 3456"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="md:col-span-2"
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-amber-600" />
                          Billing Address{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="address"
                          value={billingData.address}
                          onChange={handleBillingChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter billing address"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="city"
                          value={billingData.city}
                          onChange={handleBillingChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter city"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3">
                          State <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="state"
                          value={billingData.state}
                          onChange={handleBillingChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter state"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                      >
                        <Label className="text-lg font-medium text-gray-700 mb-3">
                          ZIP Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="zip"
                          value={billingData.zip}
                          onChange={handleBillingChange}
                          required
                          className="h-12 text-lg border-gray-300 focus:border-amber-500 focus:ring-amber-700"
                          placeholder="Enter ZIP code"
                        />
                      </motion.div>
                    </div>

                    {/* Booking Summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      className="bg-blue-50 rounded-2xl p-6 mb-8"
                    >
                      <h3 className="text-xl font-bold text-amber-700 mb-4">
                        Booking Summary
                      </h3>
                      <div className="space-y-2 text-gray-700">
                        <div className="flex justify-between">
                          <span>Room:</span>
                          <span className="font-semibold">
                            {getCategoryForRoom(selectedRoom)?.name || "Room"} -
                            Room {selectedRoom.roomNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Check-in:</span>
                          <span className="font-semibold">
                            {bookingData.checkInDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Check-out:</span>
                          <span className="font-semibold">
                            {bookingData.checkOutDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guests:</span>
                          <span className="font-semibold">
                            {bookingData.numberOfAdults} Adults,{" "}
                            {bookingData.numberOfChildren} Children
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-lg font-bold text-amber-700">
                          <span>Total Amount:</span>
                          <span>
                            LKR {calculateTotalPrice().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                      className="flex gap-4"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(3)}
                        className="flex-1 h-12 text-lg border-amber-300 text-amber-600 hover:bg-amber-50"
                        disabled={submitting}
                      >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 h-12 text-lg bg-orange-500 hover:bg-orange-700 text-white font-semibold disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Complete Booking
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
