"use client";

{/*import Link from "next/link";
import { Home, CalendarDays ,BedDouble,Users} from "lucide-react";

const Sidebar = () => {

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <Home size={20} />,
    
  },
  {
    name: "Bookings",
    href: "/bookings",
    icon: <CalendarDays size={20} />,
  },
  {
    name: "Rooms",
    href: "/rooms",
    icon: <BedDouble size={20} />,
  },
  {
    name: "Gallery",
    href: "/gallery",
    icon: <Users size={20} />,
  },
]
  return (
    <div className="h-screen bg-amber-700 text-white p-4 flex flex-col space-y-6">
      <h2 className="text-2xl font-bold">Royal Palms Admin</h2>
      <nav className="flex flex-col space-y-4 mt-8">
        <Link href="/dashboard" className="flex items-center space-x-2 hover:bg-amber-500 p-2 rounded">
          <Home size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/rooms" className="flex items-center space-x-2 hover:bg-amber-500 p-2 rounded">
          <BedDouble size={20} />
          <span>Rooms</span>
        </Link>
        <Link href="/bookings" className="flex items-center space-x-2 hover:bg-amber-500 p-2 rounded">
          <CalendarDays size={20} />
          <span>Bookings</span>
        </Link>
        <Link href="/gallery" className="flex items-center space-x-2 hover:bg-amber-500 p-2 rounded">
          <Users size={20} />
          <span>Gallery</span>
        </Link>
        
      </nav>
    </div>
  );
};

export default Sidebar;*/}



import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  CalendarDays,
  BedDouble, 
  Image as GalleryIcon,
  
  
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/pages/dashboard",
      icon: <Home size={20} />,
    },
    {
      name: "Bookings",
      href: "/pages/admin/adminBookings",
      icon: <CalendarDays size={20} />,
    },
        {
      name: "Category",
      href: "/pages/admin/adminCategory",
      icon: <GalleryIcon size={20} />,
    },
    {
      name: "Rooms",
      href: "/pages/admin/adminRooms",
      icon: <BedDouble size={20} />,
    },

    
  ];

  return (
    <div className="h-screen w-64 bg-amber-700 text-white flex flex-col">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-amber-600">
        <h2 className="text-2xl font-bold">Royal Palms</h2>
        <p className="text-xs text-amber-200">Admin Dashboard</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-amber-600 text-white'
                    : 'hover:bg-amber-600/80 text-amber-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer/Logout */}
      {/*<div className="p-4 border-t border-amber-600">
        <Link
          href="/logout"
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-amber-600/80 text-amber-100"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Link>
      </div>*/}
    </div>
  );
};

export default Sidebar;
