
import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  Settings,
  Trash2,
  X,
  CreditCard,
  ShoppingCart,
  Package,
  AlertCircle,
  Info,
  LoaderCircle,
  Users,
  ArrowUpRight,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function Navbar({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile
  const [profileOpen, setProfileOpen] = useState(false);

  // Notifications
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  // Global search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    customers: [],
    products: [],
    sales: [],
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Theme
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchRequestRef = useRef(0);

  const displayName = user?.name || "Mohamed";

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const totalSearchResults =
    searchResults.customers.length +
    searchResults.products.length +
    searchResults.sales.length;

  // --------------------------------------------------
  // THEME
  // --------------------------------------------------

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleThemeToggle = () => {
    setDarkMode((previous) => !previous);
  };

  // --------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------

  const fetchNotifications = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setNotificationsLoading(true);
    }

    try {
      const response = await API.get("/notifications");
      const data = response.data?.notifications;

      setNotifications(Array.isArray(data) ? data : []);
      setNotificationError("");
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotificationError(
        "Could not load notifications. Please try again."
      );
    } finally {
      if (showLoader) {
        setNotificationsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications(true);

    const intervalId = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    setProcessingId(notificationId);

    try {
      await API.put(`/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setNotificationError("");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setNotificationError("Could not update this notification.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    setMarkingAll(true);

    try {
      await API.put("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setNotificationError("");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      setNotificationError("Could not update all notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    setProcessingId(notificationId);

    try {
      await API.delete(`/notifications/${notificationId}`);

      setNotifications((previous) =>
        previous.filter(
          (notification) => notification.id !== notificationId
        )
      );

      setNotificationError("");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setNotificationError("Could not delete this notification.");
    } finally {
      setProcessingId(null);
    }
  };

  const getNotificationIcon = (type) => {
    const normalizedType = String(type || "").toUpperCase();

    if (normalizedType.includes("PAYMENT")) {
      return <CreditCard size={17} />;
    }

    if (
      normalizedType.includes("SALE") ||
      normalizedType.includes("ORDER")
    ) {
      return <ShoppingCart size={17} />;
    }

    if (
      normalizedType.includes("PRODUCT") ||
      normalizedType.includes("INVENTORY") ||
      normalizedType.includes("STOCK")
    ) {
      return <Package size={17} />;
    }

    if (
      normalizedType.includes("WARNING") ||
      normalizedType.includes("ERROR")
    ) {
      return <AlertCircle size={17} />;
    }

    return <Info size={17} />;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  // --------------------------------------------------
  // GLOBAL SEARCH
  // --------------------------------------------------

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setNotificationsOpen(false);
    setProfileOpen(false);

    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  }, []);

  const clearSearch = () => {
    searchRequestRef.current += 1;
    setSearchQuery("");
    setSearchResults({
      customers: [],
      products: [],
      sales: [],
    });
    setSearchLoading(false);
    setSearchError("");
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyboardShortcut = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        openSearch();
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setSearchError("");
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyboardShortcut);

    return () => {
      document.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, [openSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (!searchOpen || query.length < 2) {
      searchRequestRef.current += 1;
      setSearchResults({
        customers: [],
        products: [],
        sales: [],
      });
      setSearchLoading(false);
      setSearchError("");
      return;
    }

    const requestId = ++searchRequestRef.current;

    setSearchLoading(true);
    setSearchError("");

    const timeoutId = window.setTimeout(async () => {
      // Each request is independent: one permission error should not
      // prevent the other resource types from returning results.
      const requests = await Promise.allSettled([
        API.get("/customers", {
          params: { search: query, page: 1, limit: 5 },
        }),
        API.get("/products", {
          params: { search: query, page: 1, limit: 5 },
        }),
        API.get("/sales", {
          params: { search: query, page: 1, limit: 5 },
        }),
      ]);

      if (requestId !== searchRequestRef.current) return;

      const [customersResult, productsResult, salesResult] = requests;

      const customers =
        customersResult.status === "fulfilled"
          ? customersResult.value.data?.customers || []
          : [];

      const products =
        productsResult.status === "fulfilled"
          ? productsResult.value.data?.products || []
          : [];

      const sales =
        salesResult.status === "fulfilled"
          ? salesResult.value.data?.sales || []
          : [];

      setSearchResults({
        customers: Array.isArray(customers) ? customers : [],
        products: Array.isArray(products) ? products : [],
        sales: Array.isArray(sales) ? sales : [],
      });

      const failedCount = requests.filter(
        (result) => result.status === "rejected"
      ).length;

      if (failedCount === requests.length) {
        setSearchError(
          "Search is unavailable. Check your connection and permissions."
        );
      } else if (failedCount > 0) {
        setSearchError(
          "Some results may be unavailable because of permissions or a connection issue."
        );
      } else {
        setSearchError("");
      }

      setSearchLoading(false);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, searchOpen]);

  const handleSearchNavigation = (path) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults({
      customers: [],
      products: [],
      sales: [],
    });
    setSearchError("");
    navigate(path);
  };

  const formatMoney = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) return "";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // --------------------------------------------------
  // PROFILE
  // --------------------------------------------------

  const handleLogout = () => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    setSearchOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  // --------------------------------------------------
  // SEARCH RESULT COMPONENT
  // --------------------------------------------------

  const renderSearchResult = ({
    key,
    icon,
    title,
    subtitle,
    path,
    badge,
  }) => (
    <button
      key={key}
      type="button"
      onClick={() => handleSearchNavigation(path)}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </p>

        {subtitle && (
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {badge}
        </span>
      )}

      <ArrowUpRight
        size={15}
        className="shrink-0 text-slate-400"
      />
    </button>
  );

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-slate-200 bg-white/90 px-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
        {/* LEFT */}
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          <div className="hidden min-w-0 sm:block">
            <p className="text-xs font-medium text-slate-400">
              Welcome back
            </p>

            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              Good morning, {displayName}
            </h2>
          </div>
        </div>

        {/* GLOBAL SEARCH */}
        <div
          ref={searchRef}
          className="relative flex min-w-0 flex-1 justify-center px-1 sm:px-3"
        >
          <div
            className={`flex w-full max-w-[430px] items-center gap-2 rounded-xl border px-3 py-2.5 transition ${
              searchOpen
                ? "border-blue-400 bg-white ring-4 ring-blue-500/10 dark:border-blue-500 dark:bg-slate-800"
                : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800"
            }`}
          >
            <Search
              size={17}
              className="shrink-0 text-slate-400"
            />

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search customers, products, orders..."
              aria-label="Search customers, products and orders"
              aria-expanded={searchOpen}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />

            {searchLoading && (
              <LoaderCircle
                size={16}
                className="shrink-0 animate-spin text-blue-500"
              />
            )}

            {!searchLoading && searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}

            {!searchQuery && (
              <kbd className="hidden shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-400 xl:block dark:border-slate-700 dark:bg-slate-900">
                Ctrl K
              </kbd>
            )}
          </div>

          {/* SEARCH DROPDOWN */}
          {searchOpen && (
            <div className="absolute left-1 right-1 top-[54px] z-[60] max-h-[min(70vh,520px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 sm:left-3 sm:right-3">
              {!searchQuery.trim() ? (
                <div className="px-5 py-7 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <Search size={22} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-white">
                    Search your workspace
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Find customers, products and sales.
                  </p>
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <p className="px-4 py-5 text-center text-xs text-slate-500 dark:text-slate-400">
                  Type at least 2 characters to search.
                </p>
              ) : searchLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
                  <LoaderCircle size={18} className="animate-spin" />
                  Searching your data...
                </div>
              ) : (
                <>
                  {searchError && (
                    <div className="mx-3 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                      {searchError}
                    </div>
                  )}

                  {/* CUSTOMERS */}
                  {searchResults.customers.length > 0 && (
                    <section className="py-2">
                      <div className="flex items-center gap-2 px-4 py-2">
                        <Users
                          size={14}
                          className="text-slate-400"
                        />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Customers
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {searchResults.customers.length}
                        </span>
                      </div>

                      {searchResults.customers.map((customer) =>
                        renderSearchResult({
                          key: `customer-${customer.id}`,
                          icon: <User size={18} />,
                          title: customer.name || "Unnamed customer",
                          subtitle:
                            customer.email ||
                            customer.phone ||
                            "Customer record",
                          badge: "Customer",
                          path: "/customers",
                        })
                      )}
                    </section>
                  )}

                  {/* PRODUCTS */}
                  {searchResults.products.length > 0 && (
                    <section className="border-t border-slate-100 py-2 dark:border-slate-800">
                      <div className="flex items-center gap-2 px-4 py-2">
                        <Package
                          size={14}
                          className="text-slate-400"
                        />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Products
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {searchResults.products.length}
                        </span>
                      </div>

                      {searchResults.products.map((product) =>
                        renderSearchResult({
                          key: `product-${product.id}`,
                          icon: <Package size={18} />,
                          title: product.name || "Unnamed product",
                          subtitle: [
                            product.sku ? `SKU: ${product.sku}` : null,
                            product.barcode
                              ? `Barcode: ${product.barcode}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "Product record",
                          badge:
                            product.price !== undefined
                              ? formatMoney(product.price)
                              : "Product",
                          path: "/products",
                        })
                      )}
                    </section>
                  )}

                  {/* SALES / ORDERS */}
                  {searchResults.sales.length > 0 && (
                    <section className="border-t border-slate-100 py-2 dark:border-slate-800">
                      <div className="flex items-center gap-2 px-4 py-2">
                        <ShoppingCart
                          size={14}
                          className="text-slate-400"
                        />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Orders / Sales
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {searchResults.sales.length}
                        </span>
                      </div>

                      {searchResults.sales.map((sale) =>
                        renderSearchResult({
                          key: `sale-${sale.id}`,
                          icon: <ShoppingCart size={18} />,
                          title: `Order #${sale.id}`,
                          subtitle: [
                            sale.customer?.name || "Unknown customer",
                            sale.status || null,
                          ]
                            .filter(Boolean)
                            .join(" · "),
                          badge:
                            sale.totalAmount !== undefined
                              ? formatMoney(sale.totalAmount)
                              : "Order",
                          path: "/sales",
                        })
                      )}
                    </section>
                  )}

                  {/* NO RESULTS */}
                  {totalSearchResults === 0 && !searchError && (
                    <div className="px-5 py-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <Search size={22} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-white">
                        No results found
                      </p>

                      <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                        No customers, products or orders matched "
                        {searchQuery.trim()}".
                      </p>
                    </div>
                  )}

                  {/* FOOTER */}
                  {totalSearchResults > 0 && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                        Showing up to 5 results per category
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={handleThemeToggle}
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:flex"
            aria-label="Toggle theme"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* NOTIFICATIONS */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => {
                const willOpen = !notificationsOpen;

                setNotificationsOpen(willOpen);
                setProfileOpen(false);
                setSearchOpen(false);

                if (willOpen) {
                  fetchNotifications(true);
                }
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              aria-expanded={notificationsOpen}
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Notifications
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {unreadCount} unread notification
                      {unreadCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        disabled={markingAll}
                        title="Mark all as read"
                        className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-950/40"
                      >
                        {markingAll ? (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCheck size={15} />
                        )}
                        <span className="hidden sm:inline">Read all</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      aria-label="Close notifications"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {notificationError && (
                    <div className="mx-3 mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                      <p>{notificationError}</p>

                      <button
                        type="button"
                        onClick={() => fetchNotifications(true)}
                        className="mt-1 font-semibold underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {notificationsLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-slate-400">
                      <LoaderCircle
                        size={24}
                        className="animate-spin"
                      />
                      <p className="text-sm">
                        Loading notifications...
                      </p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <Bell size={24} />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-white">
                        You&apos;re all caught up
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        New notifications will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`group flex gap-3 border-b border-slate-100 px-4 py-4 transition last:border-b-0 dark:border-slate-800 ${
                          notification.isRead
                            ? "bg-white dark:bg-slate-900"
                            : "bg-blue-50/70 dark:bg-blue-950/20"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            notification.isRead
                              ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                              : "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <p className="flex-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {notification.title}
                            </p>

                            {!notification.isRead && (
                              <span
                                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600"
                                title="Unread"
                              />
                            )}
                          </div>

                          <p className="mt-1 break-words text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-[10px] text-slate-400">
                            {formatDate(notification.createdAt)}
                          </p>

                          <div className="mt-2 flex items-center gap-3">
                            {!notification.isRead && (
                              <button
                                type="button"
                                disabled={processingId === notification.id}
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 dark:text-blue-400"
                              >
                                <Check size={13} />
                                Mark as read
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={processingId === notification.id}
                              onClick={() =>
                                handleDeleteNotification(notification.id)
                              }
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-red-600 disabled:opacity-50"
                            >
                              {processingId === notification.id ? (
                                <LoaderCircle
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={13} />
                              )}
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                      Refreshes automatically every 30 seconds
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mx-1 hidden h-7 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

          {/* PROFILE */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((previous) => !previous);
                setNotificationsOpen(false);
                setSearchOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                {initials || "U"}
              </div>

              <div className="hidden text-left xl:block">
                <p className="max-w-[120px] truncate text-xs font-semibold text-slate-800 dark:text-white">
                  {displayName}
                </p>

                <p className="text-[10px] text-slate-400">
                  {user?.role?.name || user?.role || "Account"}
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`hidden text-slate-400 transition-transform xl:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
                <div className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {displayName}
                  </p>

                  <p className="mt-0.5 break-all text-xs text-slate-400">
                    {user?.email || "Signed in"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <User size={17} className="text-slate-400" />
                  Profile Settings
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Settings size={17} className="text-slate-400" />
                  Account Preferences
                </button>

                <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
