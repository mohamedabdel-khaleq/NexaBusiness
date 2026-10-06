import { useEffect, useState } from "react";
import {
  Plus,
  X,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Payments() {
  const { user } = useAuth();

  const isAdmin = user?.roleId === 1;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [saleId, setSaleId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPayments: 0,
    totalPages: 1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    saleId: "",
    amount: "",
    method: "CASH",
  });

  // =========================
  // FETCH PAYMENTS
  // =========================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (saleId.trim()) {
        params.saleId = saleId.trim();
      }

      if (from) {
        params.from = from;
      }

      if (to) {
        params.to = to;
      }

      const response = await API.get("/payments", {
        params,
      });

      setPayments(response.data.payments || []);

      setPagination(
        response.data.pagination || {
          page: 1,
          limit: 10,
          totalPayments: 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error("Fetch payments error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load payments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, search, saleId, from, to]);

  // =========================
  // HANDLE FORM
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // OPEN MODAL
  // =========================

  const openModal = () => {
    setForm({
      saleId: "",
      amount: "",
      method: "CASH",
    });

    setError("");
    setModalOpen(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);

    setForm({
      saleId: "",
      amount: "",
      method: "CASH",
    });

    setError("");
  };

  // =========================
  // CREATE PAYMENT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.saleId || !form.amount || !form.method) {
      setError(
        "Sale ID, amount and payment method are required"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await API.post("/payments", {
        saleId: Number(form.saleId),
        amount: Number(form.amount),
        method: form.method,
      });

      closeModal();

      await fetchPayments();
    } catch (error) {
      console.error("Create payment error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create payment"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // =========================
  // FORMAT METHOD
  // =========================

  const formatMethod = (method) => {
    if (!method) return "-";

    return method
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // =========================
  // STATUS
  // =========================

  const getStatusClasses = (status) => {
    if (status === "PAID") {
      return "bg-emerald-500/10 text-emerald-400";
    }

    if (status === "PARTIALLY_PAID") {
      return "bg-amber-500/10 text-amber-400";
    }

    return "bg-red-500/10 text-red-400";
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Payments
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Track and manage customer payments
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openModal}
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl bg-blue-600
              px-4 py-2.5
              text-sm font-semibold text-white
              shadow-lg shadow-blue-600/20
              transition
              hover:bg-blue-500
            "
          >
            <Plus size={18} />
            Add Payment
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">

          {/* SEARCH */}
          <div className="relative xl:col-span-2">
            <Search
              size={17}
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-slate-500
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search customer..."
              className="
                w-full rounded-xl
                border border-slate-700
                bg-slate-950
                py-2.5 pl-10 pr-4
                text-sm text-white
                outline-none
                placeholder:text-slate-600
                focus:border-blue-500
              "
            />
          </div>

          {/* SALE ID */}
          <input
            type="number"
            value={saleId}
            onChange={(event) => {
              setSaleId(event.target.value);
              setPage(1);
            }}
            placeholder="Sale ID"
            className="
              rounded-xl
              border border-slate-700
              bg-slate-950
              px-4 py-2.5
              text-sm text-white
              outline-none
              placeholder:text-slate-600
              focus:border-blue-500
            "
          />

          {/* FROM */}
          <input
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
            className="
              rounded-xl
              border border-slate-700
              bg-slate-950
              px-4 py-2.5
              text-sm text-slate-300
              outline-none
              focus:border-blue-500
            "
          />

          {/* TO */}
          <input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
            className="
              rounded-xl
              border border-slate-700
              bg-slate-950
              px-4 py-2.5
              text-sm text-slate-300
              outline-none
              focus:border-blue-500
            "
          />
        </div>
      </div>

      {/* ERROR */}
      {error && !modalOpen && (
        <div className="
          rounded-xl
          border border-red-500/20
          bg-red-500/10
          px-4 py-3
          text-sm text-red-400
        ">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="
        overflow-hidden
        rounded-2xl
        border border-slate-800
        bg-slate-900
      ">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">

            <thead className="border-b border-slate-800 bg-slate-950/50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sale
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Method
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center"
                  >
                    <CreditCard
                      size={30}
                      className="mx-auto mb-3 text-slate-600"
                    />

                    <p className="text-sm text-slate-400">
                      No payments found
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition hover:bg-slate-800/30"
                  >
                    {/* PAYMENT */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-white">
                          #{payment.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Payment ID
                        </p>
                      </div>
                    </td>

                    {/* SALE */}
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-300">
                        #{payment.saleId}
                      </span>
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {payment.sale?.customer?.name ||
                            "Walk-in Customer"}
                        </p>

                        {payment.sale?.customer?.email && (
                          <p className="mt-1 text-xs text-slate-500">
                            {payment.sale.customer.email}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* AMOUNT */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-white">
                        $
                        {Number(payment.amount).toFixed(2)}
                      </span>
                    </td>

                    {/* METHOD */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-300">
                        {formatMethod(payment.method)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      <span
                        className={`
                          inline-flex rounded-full
                          px-2.5 py-1
                          text-xs font-semibold
                          ${getStatusClasses(
                            payment.status
                          )}
                        `}
                      >
                        {payment.status || "UNKNOWN"}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="
          flex flex-col gap-3
          border-t border-slate-800
          px-5 py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <p className="text-sm text-slate-500">
            Showing page{" "}
            <span className="font-medium text-slate-300">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-300">
              {pagination.totalPages}
            </span>{" "}
            — {pagination.totalPayments} payments
          </p>

          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((previous) =>
                  Math.max(previous - 1, 1)
                )
              }
              className="
                inline-flex items-center gap-1
                rounded-lg
                border border-slate-700
                px-3 py-2
                text-sm text-slate-300
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >= pagination.totalPages ||
                loading
              }
              onClick={() =>
                setPage((previous) =>
                  Math.min(
                    previous + 1,
                    pagination.totalPages
                  )
                )
              }
              className="
                inline-flex items-center gap-1
                rounded-lg
                border border-slate-700
                px-3 py-2
                text-sm text-slate-300
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Next
              <ChevronRight size={16} />
            </button>

          </div>
        </div>
      </div>

      {/* ADD PAYMENT MODAL */}
      {modalOpen && (
        <div className="
          fixed inset-0 z-[100]
          flex items-center justify-center
          bg-slate-950/70
          px-4
          backdrop-blur-sm
        ">
          <div className="
            w-full max-w-lg
            rounded-2xl
            border border-slate-800
            bg-slate-900
            shadow-2xl
          ">

            {/* HEADER */}
            <div className="
              flex items-center justify-between
              border-b border-slate-800
              px-6 py-5
            ">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Add Payment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record a payment for a sale
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="
                  rounded-lg p-2
                  text-slate-500
                  transition
                  hover:bg-slate-800
                  hover:text-white
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {error && (
                <div className="
                  rounded-xl
                  border border-red-500/20
                  bg-red-500/10
                  px-4 py-3
                  text-sm text-red-400
                ">
                  {error}
                </div>
              )}

              {/* SALE ID */}
              <div>
                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-slate-300
                ">
                  Sale ID *
                </label>

                <input
                  type="number"
                  name="saleId"
                  min="1"
                  value={form.saleId}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  disabled={saving}
                  className="
                    w-full rounded-xl
                    border border-slate-700
                    bg-slate-950
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    placeholder:text-slate-600
                    focus:border-blue-500
                  "
                />
              </div>

              {/* AMOUNT */}
              <div>
                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-slate-300
                ">
                  Amount *
                </label>

                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  disabled={saving}
                  className="
                    w-full rounded-xl
                    border border-slate-700
                    bg-slate-950
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    placeholder:text-slate-600
                    focus:border-blue-500
                  "
                />
              </div>

              {/* METHOD */}
              <div>
                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-slate-300
                ">
                  Payment Method *
                </label>

                <select
                  name="method"
                  value={form.method}
                  onChange={handleChange}
                  disabled={saving}
                  className="
                    w-full rounded-xl
                    border border-slate-700
                    bg-slate-950
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    focus:border-blue-500
                  "
                >
                  <option value="CASH">
                    Cash
                  </option>

                  <option value="CARD">
                    Card
                  </option>

                  <option value="BANK_TRANSFER">
                    Bank Transfer
                  </option>

                  <option value="WALLET">
                    Wallet
                  </option>
                </select>
              </div>

              {/* ACTIONS */}
              <div className="
                flex justify-end gap-3
                border-t border-slate-800
                pt-5
              ">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="
                    rounded-xl
                    border border-slate-700
                    px-4 py-2.5
                    text-sm font-medium
                    text-slate-300
                    transition
                    hover:bg-slate-800
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    rounded-xl
                    bg-blue-600
                    px-5 py-2.5
                    text-sm font-semibold
                    text-white
                    transition
                    hover:bg-blue-500
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving
                    ? "Saving..."
                    : "Create Payment"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;