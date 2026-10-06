import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Tags,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Categories() {
  const { user } = useAuth();

  const isAdmin = user?.roleId === 1;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/categories");

      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Fetch categories error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // OPEN CREATE MODAL
  // =========================

  const openCreateModal = () => {
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
    });

    setError("");
    setModalOpen(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
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
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
    });

    setError("");
  };

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingCategory) {
        await API.put(
          `/categories/${editingCategory.id}`,
          {
            name: form.name.trim(),
            description: form.description.trim(),
          }
        );
      } else {
        await API.post("/categories", {
          name: form.name.trim(),
          description: form.description.trim(),
        });
      }

      closeModal();
      await fetchCategories();
    } catch (error) {
      console.error("Save category error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE CATEGORY
  // =========================

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await API.delete(`/categories/${category.id}`);

      await fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to delete category"
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Organize your products into categories
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreateModal}
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl bg-blue-600 px-4 py-2.5
              text-sm font-semibold text-white
              shadow-lg shadow-blue-600/20
              transition
              hover:bg-blue-500
            "
          >
            <Plus size={18} />
            Add Category
          </button>
        )}
      </div>

      {/* ERROR */}
      {error && !modalOpen && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* CATEGORY GRID */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-sm text-slate-400">
            Loading categories...
          </p>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
            <Tags
              size={26}
              className="text-slate-500"
            />
          </div>

          <h3 className="text-base font-semibold text-white">
            No categories found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Create your first category to organize your products.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="
                rounded-2xl border border-slate-800
                bg-slate-900 p-5
                transition
                hover:border-slate-700
              "
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10">
                    <Tags
                      size={20}
                      className="text-blue-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white">
                      {category.name}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Category #{category.id}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(category)
                      }
                      className="
                        rounded-lg p-2
                        text-slate-500
                        transition
                        hover:bg-slate-800
                        hover:text-blue-400
                      "
                      title="Edit category"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(category)
                      }
                      className="
                        rounded-lg p-2
                        text-slate-500
                        transition
                        hover:bg-red-500/10
                        hover:text-red-400
                      "
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="mt-5 border-t border-slate-800 pt-4">
                <p className="text-sm leading-6 text-slate-400">
                  {category.description ||
                    "No description provided."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-slate-950/70
            px-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full max-w-lg
              rounded-2xl
              border border-slate-800
              bg-slate-900
              shadow-2xl
            "
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingCategory
                    ? "Update category information"
                    : "Create a new product category"}
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
                  disabled:cursor-not-allowed
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
              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Category Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  disabled={saving}
                  className="
                    w-full rounded-xl
                    border border-slate-700
                    bg-slate-950
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    transition
                    placeholder:text-slate-600
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/10
                  "
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this category..."
                  rows={4}
                  disabled={saving}
                  className="
                    w-full resize-none rounded-xl
                    border border-slate-700
                    bg-slate-950
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    transition
                    placeholder:text-slate-600
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/10
                  "
                />
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
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
                    disabled:cursor-not-allowed
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
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
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