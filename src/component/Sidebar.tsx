"use client";

import { useState } from "react";
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
  ChevronDown,
  ChevronUp,
  Layers,
  Image,
  Gift,
  Calendar,
  Phone,
  HelpCircle,
  FileImage,
  UserCircle,
  Truck,
  Bell,
  Mail,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ContainerProps } from "@/HOC/Container";
import NotificationDropdown from "./notification-dropdown";

interface SidebarItem {
  title: string;
  url: string;
  icon: any;
}

interface SidebarGroup {
  title: string;
  icon: any;
  items: SidebarItem[];
}

export function Sidebar({ children }:ContainerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    products: true,
    orders: true,
    content: true,
    reviews: true,
    settings: true,
  });
  const pathname = usePathname();
  
  const groups: SidebarGroup[] = [
    {
      title: "Products",
      icon: ShoppingBag,
      items: [
        {
          title: "Products",
          url: "/products",
          icon: ShoppingBag,
        },
        {
          title: "Categories",
          url: "/categories",
          icon: Boxes,
        },
        {
          title: "Variant",
          url: "/variant",
          icon: Layers,
        },
      ],
    },
    {
      title: "Orders & Users",
      icon: Inbox,
      items: [
        {
          title: "Orders",
          url: "/orders",
          icon: Inbox,
        },
        {
          title: "Users",
          url: "/user",
          icon: User,
        },
      ],
    },
    {
      title: "Content",
      icon: FileImage,
      items: [
        {
          title: "Blogs",
          url: "/blog",
          icon: MessageCircle,
        },
        {
          title: "Events",
          url: "/event",
          icon: Calendar,
        },
        {
          title: "Banners",
          url: "/banner",
          icon: FileImage,
        },
        {
          title: "Gallery",
          url: "/gallery",
          icon: Image,
        },
      ],
    },
    {
      title: "Reviews & Feedback",
      icon: MessageCircle,
      items: [
        {
          title: "Reviews",
          url: "/review",
          icon: MessageCircle,
        },
        {
          title: "Product Reviews",
          url: "/product-reviews",
          icon: MessageCircle,
        },
        {
          title: "Contact",
          url: "/contact",
          icon: Phone,
        },
        {
          title: "Contact Submissions",
          url: "/contact-submissions",
          icon: Mail,
        },
        {
          title: "FAQ",
          url: "/faq",
          icon: HelpCircle,
        },
      ],
    },
    {
      title: "Settings",
      icon: Gift,
      items: [
        {
          title: "Promocode",
          url: "/promocode",
          icon: Gift,
        },
        {
          title: "Personal Info",
          url: "/personal-info",
          icon: UserCircle,
        },
        {
          title: "Shipping Info",
          url: "/shipping-info",
          icon: Truck,
        },
      ],
    },
  ];

  const standaloneItems: SidebarItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
  ];

  const handleLogout = async () => {
    localStorage.removeItem("token");
    
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleGroup = (groupTitle: string) => {
    if (collapsed) return;
    setOpenGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const isItemActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/");
  };

  const isGroupActive = (group: SidebarGroup) => {
    return group.items.some((item) => isItemActive(item.url));
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
          <div className="flex items-center gap-2">
            {!collapsed && <NotificationDropdown />}
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
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {/* Standalone Items */}
            {standaloneItems.map((item) => {
              const isActive = isItemActive(item.url);
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

            {/* Grouped Items */}
            {groups.map((group) => {
              const groupKey = group.title.toLowerCase().replace(/\s+/g, "-");
              const isOpen = collapsed ? false : openGroups[groupKey] !== false;
              const hasActiveItem = isGroupActive(group);

              return (
                <li key={group.title} className="mt-2">
                  {!collapsed ? (
                    <>
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all ${
                          hasActiveItem
                            ? "bg-primaryColor/10 text-primaryColor"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center">
                          <group.icon className="mr-3" size={18} />
                          <span className="text-sm font-medium">{group.title}</span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {isOpen && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {group.items.map((item) => {
                            const isActive = isItemActive(item.url);
                            return (
                              <li key={item.title}>
                                <Link
                                  href={item.url}
                                  className={`flex items-center px-3 py-2 rounded-md text-sm transition-all ${
                                    isActive
                                      ? "bg-primaryColor text-white"
                                      : "text-gray-600 hover:bg-primaryColor hover:bg-opacity-50"
                                  }`}
                                >
                                  <item.icon className="mr-3" size={16} />
                                  <span>{item.title}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <div className="relative group">
                      <div className="flex items-center justify-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                        <group.icon size={20} />
                      </div>
                      <div className="absolute left-full ml-2 top-0 hidden group-hover:block z-50">
                        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {group.title}
                        </div>
                      </div>
                    </div>
                  )}
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