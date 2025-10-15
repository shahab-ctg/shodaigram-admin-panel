// src/app/categories/page.tsx
"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  FolderTree,
  X,
  Check,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/services/categories.api";
import Image from "next/image";

import type { Category } from "@/types/category";
import { isActive } from "@/types/category";

const isValidImageUrl = (url?: string) => {
  if (!url) return false;
  try {
    const u = new URL(
      url,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    );
    return (
      u.protocol === "http:" || u.protocol === "https:" || url.startsWith("/")
    );
  } catch {
    return false;
  }
};

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state (description ফেলে দিলাম BE-র সাথে align করতে)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    image: "",
    isActive: true,
  });

  // RTK Query hooks
  const { data, isLoading, error } = useListCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const categories: Category[] = data?.data ?? [];

  // Filter categories
  const filteredCategories = categories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal for create/edit
  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        title: category.title,
        slug: category.slug,
        image: category.image || "",
        isActive: isActive(category), // derived from status
      });
    } else {
      setEditingCategory(null);
      setFormData({
        title: "",
        slug: "",
        image: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      title: "",
      slug: "",
      image: "",
      isActive: true,
    });
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // FE → BE payload mapping
    const payload = {
      title: formData.title,
      slug: formData.slug,
      image: formData.image || undefined,
      status: formData.isActive ? ("ACTIVE" as const) : ("HIDDEN" as const),
    };

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          body: payload,
        }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save category:", err);
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id).unwrap();
      } catch (err) {
        console.error("Failed to delete category:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-600 mb-2 flex items-center gap-3">
            <FolderTree className="w-10 h-10 text-emerald-600" />
            Categories Management
          </h1>
          <p className="text-gray-600">
            Organize your products into categories
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">
              Failed to load categories. Please try again.
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-green-100 overflow-hidden">
                  {isValidImageUrl(category.image) ? (
                    <Image
                      src={category.image as string}
                      alt={category.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-emerald-300" />
                    </div>
                  )}

                  {/* Status */}
                  <div className="absolute top-3 right-3">
                    {isActive(category) ? (
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-emerald-600 font-medium mb-2">
                    /{category.slug}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openModal(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filteredCategories.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FolderTree className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Create your first category to get started"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add First Category
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-emerald-50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Vegetables, Fruits"
                  required
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, slug: e.target.value }))
                  }
                  placeholder="auto-generated-slug"
                  required
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, image: e.target.value }))
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, isActive: e.target.checked }))
                  }
                  className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  Active (Visible to customers)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border-2 border-emerald-200 text-gray-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingCategory ? "Update" : "Create"}
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
