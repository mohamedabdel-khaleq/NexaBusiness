import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const { user } = useAuth();

  const isAdmin = user?.roleId === 1;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalProducts: 0,
    totalPages: 1,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    price: "",
    costPrice: "",
    stock: "",
    categoryId: "",
    isActive: true,
  });

  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts = async () => {
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

      if (categoryId) {
        params.categoryId = categoryId;
      }

      const response = await API.get("/products", {
        params,
      });

      setProducts(response.data.products || []);
      setPagination(
        response.data.pagination || {
          page: 1,
          limit,
          totalProducts: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Fetch products error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await API.get("/categories");

      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Fetch categories error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load categories"
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryId]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // FORM HANDLERS
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      barcode: "",
      description: "",
      price: "",
      costPrice: "",
      stock: "",
      categoryId: "",
      isActive: true,
    });

    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
    setError("");
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      barcode: product.barcode || "",
      description: product.description || "",
      price: product.price ?? "",
      costPrice: product.costPrice ?? "",
      stock: product.stock ?? "",
      categoryId: product.categoryId ?? "",
      isActive: product.isActive ?? true,
    });

    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      if (!formData.name.trim()) {
        setError("Product name is required");
        return;
      }

      if (!formData.sku.trim()) {
        setError("SKU is required");
        return;
      }

      if (formData.price === "") {
        setError("Selling price is required");
        return;
      }

      if (formData.costPrice === "") {
        setError("Cost price is required");
        return;
      }

      if (!formData.categoryId) {
        setError("Category is required");
        return;
      }

      if (
        Number(formData.costPrice) >
        Number(formData.price)
      ) {
        setError(
          "Cost price cannot be greater than selling price"
        );
        return;
      }

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || undefined,
        description:
          formData.description.trim() || undefined,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        stock:
          formData.stock === ""
            ? 0
            : Number(formData.stock),
        categoryId: Number(formData.categoryId),
      };

      if (editingProduct) {
        payload.isActive = formData.isActive;

        await API.put(
          `/products/${editingProduct.id}`,
          payload
        );

        setSuccess("Product updated successfully");
      } else {
        await API.post("/products", payload);

        setSuccess("Product created successfully");
      }

      closeModal();
      await fetchProducts();
    } catch (err) {
      console.error("Save product error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save product"
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await API.delete(`/products/${productId}`);

      setSuccess("Product deleted successfully");

      if (
        products.length === 1 &&
        page > 1
      ) {
        setPage((prev) => prev - 1);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      console.error("Delete product error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  // =========================
  // PAGINATION
  // =========================

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (page < pagination.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  // =========================
  // FORMATTERS
  // =========================

  const formatPrice = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0.00";
    }

    return number.toFixed(2);
  };

  const getStockClass = (stock) => {
    if (stock <= 0) {
      return "text-red-600 bg-red-50";
    }

    if (stock <= 5) {
      return "text-orange-600 bg-orange-50";
    }

    return "text-green-600 bg-green-50";
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Products
              </h1>

              <p className="text-sm text-gray-500">
                Manage your products and inventory
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        )}
      </div>

      {/* ALERTS */}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* FILTERS */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* SEARCH */}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, SKU or barcode..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* CATEGORY */}

          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            disabled={categoriesLoading}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PRODUCTS TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Product
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  SKU
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Category
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Stock
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Price
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                {isAdmin && (
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* PRODUCT */}

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>

                        {product.barcode && (
                          <p className="mt-1 text-xs text-gray-500">
                            Barcode: {product.barcode}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* SKU */}

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.sku}
                    </td>

                    {/* CATEGORY */}

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category?.name || "—"}
                    </td>

                    {/* STOCK */}

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStockClass(
                          product.stock
                        )}`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    {/* PRICE */}

                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${formatPrice(product.price)}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      {product.isActive ? (
                        <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(product)
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(product.id)
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        {!loading && products.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing page{" "}
              <span className="font-medium text-gray-700">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-700">
                {pagination.totalPages}
              </span>{" "}
              — {pagination.totalProducts} products
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={
                  page >= pagination.totalPages
                }
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingProduct
                    ? "Update product information"
                    : "Create a new product"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* NAME */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* SKU */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    SKU *
                  </label>

                  <input
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g. PROD-001"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* BARCODE */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Barcode
                  </label>

                  <input
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="Enter barcode"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* CATEGORY */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Category *
                  </label>

                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PRICE */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Selling Price *
                  </label>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* COST */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Cost Price *
                  </label>

                  <input
                    type="number"
                    name="costPrice"
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* STOCK */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter product description"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* ACTIVE */}

              {editingProduct && (
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Product is active
                  </span>
                </label>
              )}

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
