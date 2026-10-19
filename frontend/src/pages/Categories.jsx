import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Tags,
  Search,
  RefreshCw,
  FolderPlus,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";

import API from "../services/api";

const EMPTY_FORM = {
  name: "",
  description: "",
};

function getErrorMessage(error, fallback) {
  if (error.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }

  return (
    error.response?.data?.message ||
    error.message ||
    fallback
  );
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/categories");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.categories)
        ? data.categories
        : [];

      setCategories(list);
    } catch (err) {
      console.error("Fetch categories error:", err);
      setError(getErrorMessage(err, "Failed to load categories."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) => {
      const name = String(category.name || "").toLowerCase();
      const description = String(
        category.description || ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        description.includes(query) ||
        String(category.id).includes(query)
      );
    });
  }, [categories, search]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      description: category.description || "",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError("Please enter a category name.");
      return;
    }

    if (name.length > 100) {
      setError("Category name must be 100 characters or fewer.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = { name, description };

      if (editingCategory) {
        await API.put(
          `/categories/${editingCategory.id}`,
          payload
        );
      } else {
        await API.post("/categories", payload);
      }

      setModalOpen(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);

      setSuccess(
        editingCategory
          ? "Category updated successfully."
          : "Category created successfully."
      );

      await fetchCategories();
    } catch (err) {
      console.error("Save category error:", err);
      setError(getErrorMessage(err, "Failed to save category."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(category.id);
      setError("");
      setSuccess("");

      await API.delete(`/categories/${category.id}`);

      setSuccess("Category deleted successfully.");
      await fetchCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      setError(getErrorMessage(err, "Failed to delete category."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-full space-y-7 bg-white p-1 text-slate-900">
      {/* Header */}
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
            <Tags size={16} />
            Product Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Categories
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Organize your products and keep your catalog structured.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <Plus size={18} />
          Add Category
        </button>
      </header>

      {/* Feedback */}
      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p className="flex-1">{success}</p>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && !modalOpen && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Categories
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {categories.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Categories in your catalog
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Tags size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Search Results
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {filteredCategories.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Categories matching your search
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Package size={23} />
            </div>
          </div>
        </div>
      </section>

      {/* Category List */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              All Categories
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your product category information.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                aria-label="Search categories"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 sm:w-64"
              />
            </div>

            <button
              type="button"
              onClick={fetchCategories}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-8">
            <LoaderCircle
              size={30}
              className="animate-spin text-blue-600"
            />
            <p className="text-sm text-slate-500">
              Loading categories...
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              {search ? <Search size={27} /> : <FolderPlus size={29} />}
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              {search ? "No matching categories" : "No categories yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {search
                ? "Try another search term."
                : "Create your first category to organize your products."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={17} />
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category) => (
              <article
                key={category.id}
                className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <Tags size={22} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words font-semibold text-slate-900">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Category #{category.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(category)}
                      aria-label={`Edit ${category.name}`}
                      title="Edit category"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category.id}
                      aria-label={`Delete ${category.name}`}
                      title="Delete category"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === category.id ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex-1 border-t border-slate-100 pt-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                    {category.description || "No description provided."}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filteredCategories.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
            Showing {filteredCategories.length} of {categories.length} categories
          </div>
        )}
      </section>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  {editingCategory ? (
                    <Pencil size={19} />
                  ) : (
                    <FolderPlus size={21} />
                  )}
                </div>

                <h2
                  id="category-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingCategory
                    ? "Update the category details below."
                    : "Enter the details for your new category."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="category-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Office Furniture"
                  maxLength={100}
                  required
                  autoFocus
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Choose a clear name for your category.
                </p>
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the products in this category..."
                  rows={4}
                  maxLength={500}
                  disabled={saving}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.description.length}/500
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingCategory ? (
                        <Pencil size={17} />
                      ) : (
                        <Plus size={18} />
                      )}
                      {editingCategory
                        ? "Save Changes"
                        : "Create Category"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;