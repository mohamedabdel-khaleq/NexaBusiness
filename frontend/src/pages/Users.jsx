import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  ShieldCheck,
  UserRound,
  Mail,
  X,
  AlertCircle,
  CheckCircle2,
  LockKeyhole,
  CalendarDays,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  roleId: "2",
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
};

function UsersPage() {
  const { user } = useAuth();

  const isAdmin = Number(user?.roleId) === 1;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/users");

      setUsers(response.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((item) =>
      [
        item.name,
        item.email,
        item.role?.name,
        String(item.id),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [users, search]);

  const adminCount = users.filter(
    (item) => Number(item.roleId) === 1
  ).length;

  const regularUserCount = users.filter(
    (item) => Number(item.roleId) === 2
  ).length;

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingUser(item);

    setForm({
      name: item.name || "",
      email: item.email || "",
      password: "",
      roleId: String(item.roleId ?? 2),
    });

    setFormError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccess("");

    if (!form.name.trim()) {
      setFormError("Please enter the user's name.");
      return;
    }

    if (!form.email.trim()) {
      setFormError("Please enter an email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!editingUser && !form.password) {
      setFormError("Please enter a password for the new user.");
      return;
    }

    if (!editingUser && form.password.length < 8) {
      setFormError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password && form.password.length < 8) {
      setFormError("Password must contain at least 8 characters.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      roleId: Number(form.roleId),
    };

    if (form.password) {
      payload.password = form.password;
    }

    setSaving(true);

    try {
      if (editingUser) {
        await API.put(`/users/${editingUser.id}`, payload);
        setSuccess("User updated successfully.");
      } else {
        await API.post("/users", payload);
        setSuccess("User created successfully.");
      }

      setModalOpen(false);
      setEditingUser(null);
      setForm(emptyForm);

      await fetchUsers();
    } catch (err) {
      console.error("Failed to save user:", err);

      setFormError(
        err.response?.data?.message ||
          "Unable to save user. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (item, nextRoleId) => {
    const roleId = Number(nextRoleId);

    if (roleId === Number(item.roleId)) return;

    const confirmed = window.confirm(
      `Change ${item.name}'s role to ${
        roleId === 1 ? "ADMIN" : "USER"
      }?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await API.put(`/users/${item.id}/role`, { roleId });

      setSuccess(`${item.name}'s role was updated successfully.`);

      await fetchUsers();
    } catch (err) {
      console.error("Failed to update user role:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update the user's role."
      );
    }
  };

  const handleDelete = async (item) => {
    if (Number(item.id) === Number(user?.id)) {
      setError("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${item.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await API.delete(`/users/${item.id}`);

      setSuccess(`${item.name} was deleted successfully.`);

      await fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete user. Please try again."
      );
    }
  };

  return (
    <div className="min-h-full space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <ShieldCheck size={17} />
            Administration
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Users Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage user accounts, roles, and access to your business.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div className="flex-1">{error}</div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">{success}</div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Users"
          value={loading ? "—" : users.length}
          description="All registered accounts"
          icon={Users}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Administrators"
          value={loading ? "—" : adminCount}
          description="Accounts with the ADMIN role"
          icon={ShieldCheck}
          iconClass="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Regular Users"
          value={loading ? "—" : regularUserCount}
          description="Accounts with the USER role"
          icon={UserRound}
          iconClass="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Users Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading users..."
                : `${filteredUsers.length} ${
                    filteredUsers.length === 1 ? "user" : "users"
                  } found`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, role..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Users size={24} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {users.length === 0
                ? "No users found"
                : "No matching users"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {users.length === 0
                ? "Users will appear here when accounts are available."
                : "Try searching with a different name, email, or role."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4">Last Updated</th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((item) => {
                  const isCurrentUser =
                    Number(item.id) === Number(user?.id);

                  const roleName =
                    item.role?.name ||
                    (Number(item.roleId) === 1
                      ? "ADMIN"
                      : "USER");

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                            {(item.name || "?")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900">
                                {item.name}
                              </p>

                              {isCurrentUser && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail size={13} />
                              {item.email}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              ID: {item.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isAdmin && !isCurrentUser ? (
                          <select
                            aria-label={`Role for ${item.name}`}
                            value={String(item.roleId)}
                            onChange={(event) =>
                              handleRoleChange(item, event.target.value)
                            }
                            className="max-w-[150px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          >
                            <option value="1">ADMIN</option>
                            <option value="2">USER</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              Number(item.roleId) === 1
                                ? "bg-violet-50 text-violet-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {Number(item.roleId) === 1 ? (
                              <ShieldCheck size={14} />
                            ) : (
                              <UserRound size={14} />
                            )}
                            {roleName}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />
                          {formatDate(item.createdAt)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(item.updatedAt)}
                      </td>

                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title="Edit user"
                              aria-label={`Edit ${item.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              disabled={isCurrentUser}
                              title={
                                isCurrentUser
                                  ? "You cannot delete your own account"
                                  : "Delete user"
                              }
                              aria-label={`Delete ${item.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredUsers.length} of {users.length} users
            </span>

            <span>Sorted by user ID</span>
          </div>
        )}
      </section>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  id="user-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {editingUser ? "Edit User" : "Create User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingUser
                    ? "Update account information and role."
                    : "Add a new account to your business."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-6">
                {formError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />
                    {formError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="user-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="user-name"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    autoComplete="name"
                    required
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="user-email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="user-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="user-password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password{" "}
                    {editingUser && (
                      <span className="font-normal text-slate-400">
                        (leave blank to keep unchanged)
                      </span>
                    )}
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="user-password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleInputChange}
                      placeholder={
                        editingUser
                          ? "Enter a new password (optional)"
                          : "At least 8 characters"
                      }
                      autoComplete="new-password"
                      required={!editingUser}
                      minLength={8}
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="user-role"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    User Role
                  </label>

                  <select
                    id="user-role"
                    name="roleId"
                    value={form.roleId}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                  >
                    <option value="1">ADMIN — Administrator</option>
                    <option value="2">USER — Regular User</option>
                  </select>

                  <p className="mt-2 text-xs text-slate-500">
                    Access is determined by the permissions assigned
                    to this role on the backend.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingUser
                      ? "Save Changes"
                      : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{description}</p>
    </div>
  );
}

export default UsersPage;