"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Home,
  Inbox,
  User,
  LogOut,
  MessageCircle,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Layers,
  Image,
  Gift,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ContainerProps } from "@/HOC/Container";

export function Sidebar({ children }:ContainerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Consultation",
      url: "/consultation",
      icon: Inbox,
    },
    {
      title: "Products",
      url: "/products",
      icon: ShoppingBag,
    },
    {
      title: "User",
      url: "/user",
      icon: User,
    },
    {
      title: "Review",
      url: "/review",
      icon: MessageCircle,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: Boxes,
    },
    {
      title:"Variant",
      url:"/variant",
      icon:Layers
    },
    {
      title: "Orders",
      url: "/orders",
      icon: Inbox,
    },
    {
      title:"Gallery",
      url:"/gallery",
      icon: Image
    },
    {
      title:"Promocode",
      url:"/promocode",
      icon:Gift
    }
  ];

  const handleLogout = async () => {
    localStorage.removeItem("token");
    
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside 
        className={`bg-white shadow-md transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        } flex flex-col h-full`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!collapsed && (
            <h1 className="text-xl font-bold text-gray-800">Khandbari Admin</h1>
          )}
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {items.map((item) => {
              const isActive = pathname === item.url;
              return (
                <li key={item.title}>
                  <Link
                    href={item.url}
                    className={`flex items-center px-3 py-3 rounded-md transition-all ${
                      isActive 
                        ? "bg-primaryColor text-white" 
                        : "text-gray-700 hover:bg-primaryColor hover:bg-opacity-50"
                    }`}
                  >
                    <item.icon className={`${collapsed ? "mx-auto" : "mr-3"}`} size={20} />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-2 border-t border-gray-100 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 rounded-md text-gray-700 hover:bg-primaryColor hover:bg-opacity-10 transition-colors"
          >
            <LogOut className={`${collapsed ? "mx-auto" : "mr-3"}`} size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}