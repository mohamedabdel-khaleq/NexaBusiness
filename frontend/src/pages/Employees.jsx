import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "—";
  }

  return `${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name) => {
  if (!name) return "E";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getErrorMessage = (
  error,
  fallback = "Something went wrong"
) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

export default function Employees() {
  const { token } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [departmentsError, setDepartmentsError] =
    useState("");

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalEmployees: 0,
    totalPages: 0,
  });

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [deletingEmployee, setDeletingEmployee] =
    useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    salary: "",
    hireDate: "",
    departmentId: "",
    isActive: true,
  });

  // =========================
  // FETCH DEPARTMENTS
  // =========================

  const fetchDepartments = async () => {
    if (!token) return;

    try {
      setDepartmentsLoading(true);
      setDepartmentsError("");

      const response = await API.get("/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "Departments API response:",
        response.data
      );

      const departmentsData = Array.isArray(
        response.data?.departments
      )
        ? response.data.departments
        : [];

      console.log(
        "Departments loaded:",
        departmentsData
      );

      setDepartments(departmentsData);
    } catch (error) {
      console.error(
        "Fetch departments error:",
        error
      );

      setDepartments([]);

      setDepartmentsError(
        getErrorMessage(
          error,
          "Failed to load departments"
        )
      );
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // =========================
  // FETCH EMPLOYEES
  // =========================

  const fetchEmployees = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (departmentId) {
        params.departmentId = departmentId;
      }

      const response = await API.get("/employees", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEmployees(response.data?.employees || []);

      setPagination(
        response.data?.pagination || {
          page,
          limit,
          totalEmployees: 0,
          totalPages: 0,
        }
      );
    } catch (error) {
      console.error(
        "Fetch employees error:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Failed to load employees"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    if (!token) return;

    fetchDepartments();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetchEmployees();
  }, [
    token,
    page,
    search,
    departmentId,
  ]);

  // =========================
  // MEMOS
  // =========================

  const activeEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => employee.isActive
      ).length,
    [employees]
  );

  const inactiveEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => !employee.isActive
      ).length,
    [employees]
  );

  const currentDepartmentName = useMemo(() => {
    if (!departmentId) {
      return "All departments";
    }

    const department = departments.find(
      (item) =>
        String(item.id) === String(departmentId)
    );

    return (
      department?.name || "Selected department"
    );
  }, [departmentId, departments]);

  // =========================
  // MODALS
  // =========================

  const openCreateModal = () => {
    setEditingEmployee(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      salary: "",
      hireDate: "",
      departmentId: "",
      isActive: true,
    });

    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      salary:
        employee.salary !== null &&
        employee.salary !== undefined
          ? String(employee.salary)
          : "",
      hireDate: employee.hireDate
        ? new Date(employee.hireDate)
            .toISOString()
            .split("T")[0]
        : "",
      departmentId: employee.departmentId
        ? String(employee.departmentId)
        : "",
      isActive: employee.isActive ?? true,
    });

    setFormError("");
    setShowFormModal(true);
  };

  const openViewModal = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const openDeleteModal = (employee) => {
    setDeletingEmployee(employee);
    setShowDeleteModal(true);
  };

  const closeFormModal = () => {
    if (submitting) return;

    setShowFormModal(false);
    setEditingEmployee(null);
    setFormError("");
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedEmployee(null);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setDeletingEmployee(null);
  };

  // =========================
  // FORM
  // =========================

  const handleFormChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!formData.name.trim()) {
      setFormError(
        "Employee name is required."
      );
      return;
    }

    if (!formData.email.trim()) {
      setFormError(
        "Employee email is required."
      );
      return;
    }

    if (!formData.hireDate) {
      setFormError(
        "Hire date is required."
      );
      return;
    }

    if (!formData.departmentId) {
      setFormError(
        "Department is required."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone:
          formData.phone.trim() || undefined,
        salary:
          formData.salary === ""
            ? undefined
            : Number(formData.salary),
        hireDate: formData.hireDate,
        departmentId: Number(
          formData.departmentId
        ),
      };

      if (editingEmployee) {
        payload.isActive =
          formData.isActive;

        await API.put(
          `/employees/${editingEmployee.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await API.post(
          "/employees",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setShowFormModal(false);
      setEditingEmployee(null);
      setFormError("");

      await fetchEmployees();
    } catch (error) {
      console.error(
        "Save employee error:",
        error
      );

      setFormError(
        getErrorMessage(
          error,
          "Failed to save employee"
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async () => {
    if (!deletingEmployee) return;

    try {
      setDeleting(true);

      await API.delete(
        `/employees/${deletingEmployee.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowDeleteModal(false);
      setDeletingEmployee(null);

      if (
        employees.length === 1 &&
        page > 1
      ) {
        setPage(
          (previous) => previous - 1
        );
      } else {
        await fetchEmployees();
      }
    } catch (error) {
      console.error(
        "Delete employee error:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Failed to delete employee"
        )
      );

      setShowDeleteModal(false);
      setDeletingEmployee(null);
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // FILTERS
  // =========================

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleDepartmentChange = (
    event
  ) => {
    setDepartmentId(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setDepartmentId("");
    setPage(1);
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchEmployees(),
      fetchDepartments(),
    ]);
  };

  const canGoPrevious =
    pagination.page > 1;

  const canGoNext =
    pagination.page <
    pagination.totalPages;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Employees
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your employees and departments
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              loading ||
              departmentsLoading
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading ||
                departmentsLoading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Employees
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {pagination.totalEmployees}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active on Page
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {activeEmployees}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Inactive on Page
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {inactiveEmployees}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <span className="h-3 w-3 rounded-full bg-slate-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Current Department
              </p>

              <p
                className="mt-2 truncate text-lg font-bold text-slate-900"
                title={currentDepartmentName}
              >
                {currentDepartmentName}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BriefcaseBusiness size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* DEPARTMENTS ERROR */}
      {departmentsError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{departmentsError}</p>

            <button
              type="button"
              onClick={fetchDepartments}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name, email or phone..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={departmentId}
            onChange={handleDepartmentChange}
            disabled={departmentsLoading}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">
              {departmentsLoading
                ? "Loading departments..."
                : "All departments"}
            </option>

            {departments.map(
              (department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              )
            )}
          </select>

          {(search || departmentId) && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchEmployees}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Employee
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Contact
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Department
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Salary
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Hire Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map(
                  (_, index) => (
                    <tr key={index}>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />

                          <div className="space-y-2">
                            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                            <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="space-y-2">
                          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                          <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
                      </td>

                      <td className="px-5 py-5">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                      </td>

                      <td className="px-5 py-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      </td>

                      <td className="px-5 py-5">
                        <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
                      </td>

                      <td className="px-5 py-5">
                        <div className="ml-auto h-8 w-28 animate-pulse rounded bg-slate-200" />
                      </td>
                    </tr>
                  )
                )
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <UserRound size={26} />
                      </div>

                      <h3 className="mt-4 text-base font-semibold text-slate-900">
                        No employees found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or department
                        filter.
                      </p>

                      {(search ||
                        departmentId) && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map(
                  (employee) => (
                    <tr
                      key={employee.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                            {getInitials(
                              employee.name
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {employee.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              ID #{employee.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Mail
                              size={14}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="max-w-[220px] truncate">
                              {employee.email}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone
                              size={13}
                              className="shrink-0 text-slate-400"
                            />

                            {employee.phone ||
                              "No phone"}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                          {employee.department
                            ?.name ||
                            "No department"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {formatCurrency(
                          employee.salary
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />

                          {formatDate(
                            employee.hireDate
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {employee.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openViewModal(
                                employee
                              )
                            }
                            title="View"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                employee
                              )
                            }
                            title="Edit"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openDeleteModal(
                                employee
                              )
                            }
                            title="Delete"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="divide-y divide-slate-100 lg:hidden">
          {loading ? (
            Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="space-y-4 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200" />

                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>

                  <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                </div>
              )
            )
          ) : employees.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UserRound size={26} />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No employees found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your filters.
              </p>
            </div>
          ) : (
            employees.map(
              (employee) => (
                <div
                  key={employee.id}
                  className="space-y-4 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                        {getInitials(
                          employee.name
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {employee.name}
                        </h3>

                        <p className="text-xs text-slate-500">
                          ID #{employee.id}
                        </p>
                      </div>
                    </div>

                    {employee.isActive ? (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm text-slate-700">
                          {employee.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Phone
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {employee.phone ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {employee.department
                            ?.name ||
                            "No department"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Salary
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatCurrency(
                            employee.salary
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Hire Date
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {formatDate(
                            employee.hireDate
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openViewModal(
                          employee
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <Eye size={15} />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(
                          employee
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                    >
                      <Edit size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openDeleteModal(
                          employee
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* PAGINATION */}
        {!loading &&
          employees.length > 0 &&
          pagination.totalPages > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.totalPages}
                </span>{" "}
                ·{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.totalEmployees}
                </span>{" "}
                employees
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canGoPrevious}
                  onClick={() =>
                    setPage(
                      (previous) =>
                        Math.max(
                          previous - 1,
                          1
                        )
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={() =>
                    setPage(
                      (previous) =>
                        Math.min(
                          previous + 1,
                          pagination.totalPages
                        )
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal &&
        selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Employee Details
                  </h2>

                  <p className="text-sm text-slate-500">
                    Employee #
                    {selectedEmployee.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeViewModal}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
                    {getInitials(
                      selectedEmployee.name
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedEmployee.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {selectedEmployee.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedEmployee.phone ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Department
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedEmployee
                        .department?.name ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Salary
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatCurrency(
                        selectedEmployee.salary
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Hire Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatDate(
                        selectedEmployee.hireDate
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-xs font-medium text-slate-400">
                      Status
                    </p>

                    <div className="mt-2">
                      {selectedEmployee.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ADD / EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

                <p className="text-sm text-slate-500">
                  {editingEmployee
                    ? "Update employee information"
                    : "Create a new employee"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={submitting}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-5">
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* NAME */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Name{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={
                        handleFormChange
                      }
                      placeholder="Enter employee name"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Email{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={
                        handleFormChange
                      }
                      placeholder="employee@example.com"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Phone
                    </label>

                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={
                        handleFormChange
                      }
                      placeholder="Enter phone number"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* SALARY */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Salary
                    </label>

                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={
                        handleFormChange
                      }
                      min="0"
                      step="0.01"
                      placeholder="Enter salary"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* HIRE DATE */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Hire Date{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="date"
                      name="hireDate"
                      value={formData.hireDate}
                      onChange={
                        handleFormChange
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* DEPARTMENT */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Department{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <select
                      name="departmentId"
                      value={
                        formData.departmentId
                      }
                      onChange={
                        handleFormChange
                      }
                      disabled={
                        departmentsLoading ||
                        departments.length ===
                          0
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      <option value="">
                        {departmentsLoading
                          ? "Loading departments..."
                          : departments.length ===
                              0
                            ? "No departments available"
                            : "Select department"}
                      </option>

                      {departments.map(
                        (department) => (
                          <option
                            key={
                              department.id
                            }
                            value={
                              department.id
                            }
                          >
                            {department.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* STATUS */}
                {editingEmployee && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label className="flex cursor-pointer items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Employee Status
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Control whether this employee is active.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-semibold ${
                            formData.isActive
                              ? "text-emerald-600"
                              : "text-slate-500"
                          }`}
                        >
                          {formData.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                        <input
                          type="checkbox"
                          name="isActive"
                          checked={
                            formData.isActive
                          }
                          onChange={
                            handleFormChange
                          }
                          className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    departments.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {submitting
                    ? "Saving..."
                    : editingEmployee
                    ? "Update Employee"
                    : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal &&
        deletingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Trash2 size={22} />
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  Delete Employee?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to
                  delete{" "}
                  <span className="font-semibold text-slate-800">
                    {deletingEmployee.name}
                  </span>
                  ? This action cannot be
                  undone.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={deleting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {deleting
                    ? "Deleting..."
                    : "Delete Employee"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}