"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from "@/services/notification";
import { format } from "date-fns";
import { Button } from "@heroui/button";
import { toast } from "sonner";
import useSWR from "swr";

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
};

export default function NotificationDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const token = (session?.user as any)?.jwt || "";
  const [open, setOpen] = useState(false);

  // Fetch unread count
  const { data: unreadData, mutate: mutateUnread } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_BASE_URL}/notification/unread-count`, token] : null,
    ([url, token]) => fetcher(url, token),
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Fetch notifications when dropdown is open
  const { data: notificationsData, mutate: mutateNotifications } = useSWR(
    open && token ? [`${process.env.NEXT_PUBLIC_BASE_URL}/notification?page=1&limit=10&unreadOnly=false`, token] : null,
    ([url, token]) => fetcher(url, token),
    { revalidateOnFocus: true }
  );

  const unreadCount = unreadData?.count || 0;
  const notifications = notificationsData?.data || [];

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id, token);
      mutateNotifications();
      mutateUnread();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(token);
      toast.success("All notifications marked as read");
      mutateNotifications();
      mutateUnread();
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return "📦";
      case "contact":
        return "✉️";
      default:
        return "🔔";
    }
  };

  const getNotificationLink = (notification: any) => {
    switch (notification.type) {
      case "order":
        return "/orders";
      case "contact":
        return "/contact-submissions";
      default:
        return "#";
    }
  };

  return (
    <Dropdown isOpen={open} onOpenChange={setOpen} placement="bottom-end">
      <DropdownTrigger>
        <button className="relative p-2 rounded-md hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Notifications"
        className="w-80 p-0"
        itemClasses={{
          base: "px-0 py-0",
        }}
        classNames={{
          base: "max-h-[500px] overflow-y-auto",
        }}
      >
        <DropdownItem
          key="header"
          textValue="header"
          className="cursor-default"
          classNames={{
            base: "p-4 border-b rounded-none",
          }}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="light"
                size="sm"
                onPress={handleMarkAllAsRead}
                className="text-xs h-7 min-w-0"
              >
                Mark all read
              </Button>
            )}
          </div>
        </DropdownItem>
        {notifications.length === 0 ? (
          <DropdownItem
            key="empty"
            textValue="empty"
            className="cursor-default"
            classNames={{
              base: "p-8 rounded-none",
            }}
          >
            <div className="text-center text-sm text-gray-500 w-full">
              No notifications
            </div>
          </DropdownItem>
        ) : (
          <>
            {notifications.map((notification: any) => (
              <DropdownItem
                key={notification._id}
                textValue={notification.title}
                onPress={() => {
                  if (!notification.read) {
                    handleMarkAsRead(notification._id);
                  }
                  setOpen(false);
                  router.push(getNotificationLink(notification));
                }}
                className={`${!notification.read ? "bg-blue-50" : ""}`}
                classNames={{
                  base: "p-4 rounded-none border-b border-gray-100",
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      !notification.read ? "text-gray-900" : "text-gray-700"
                    }`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {format(new Date(notification.createdAt), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              </DropdownItem>
            ))}
            <DropdownItem
              key="view-all"
              textValue="view-all"
              onPress={() => {
                setOpen(false);
                router.push("/notifications");
              }}
              classNames={{
                base: "p-2 border-t rounded-none text-center",
              }}
            >
              <span className="text-xs text-gray-600 hover:text-gray-900">
                View all notifications
              </span>
            </DropdownItem>
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
