"use client";

import { useMemo, useState } from "react";
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
import { Toaster, toast } from "react-hot-toast";
import type { Category } from "@/types/category";
import { isActive } from "@/types/category";

/** allow absolute http/https + site-relative */
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

/** tiny confirm modal */
function ConfirmDialog({
  open,
  title,
  subtitle,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-100">
        <div className="px-6 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle ? (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex gap-3 p-6">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-2.5 rounded-xl border border-emerald-200 text-gray-700 font-medium hover:bg-emerald-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // form (backend-aligned)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    image: "",
    isActive: true,
  });

  // RTK
  const { data, isLoading, error, isFetching } = useListCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  //  fix ESLint warning: memoize categories derived from data
  const categories = useMemo<Category[]>(() => data?.data ?? [], [data]);

  // filtered list (memoized)
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  // modal open/close
  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        title: category.title,
        slug: category.slug,
        image: category.image || "",
        isActive: isActive(category),
      });
    } else {
      setEditingCategory(null);
      setFormData({ title: "", slug: "", image: "", isActive: true });
    }
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ title: "", slug: "", image: "", isActive: true });
  };

  // slug from title
  const handleTitleChange = (title: string) => {
    setFormData((s) => ({
      ...s,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  };

  // submit (create/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.success("Category updated");
      } else {
        await createCategory(payload).unwrap();
        toast.success("Category created");
      }
      closeModal();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(
        String(
          err?.data?.message ||
            err?.data?.code ||
            (editingCategory ? "Update failed" : "Create failed")
        )
      );
      console.error(err);
    }
  };

  // ask confirmation, then delete
  const requestDelete = (id: string) => setConfirmId(id);
  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteCategory(confirmId).unwrap();
      toast.success("Category deleted");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(
        String(err?.data?.message || err?.data?.code || "Delete failed")
      );
      console.error(err);
    } finally {
      setConfirmId(null);
    }
  };

  // skeleton
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-40 bg-emerald-100/60" />
      <div className="p-5 space-y-2">
        <div className="h-4 bg-emerald-100 rounded w-3/4" />
        <div className="h-3 bg-emerald-100 rounded w-1/3" />
        <div className="flex gap-2 pt-3">
          <div className="h-9 bg-emerald-100 rounded flex-1" />
          <div className="h-9 bg-emerald-100 rounded flex-1" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-600 mb-2 flex items-center gap-3">
              <FolderTree className="w-10 h-10 text-emerald-600" />
              Categories Management
            </h1>
            <p className="text-gray-600">
              Organize your products with clean, SEO-friendly categories
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                />
              </div>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Grid / States */}
          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">
                Failed to load categories. Please try again.
              </p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((category) => {
                const showImage = isValidImageUrl(category.image);
                return (
                  <div
                    key={category._id}
                    className="bg-white rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-green-100 overflow-hidden">
                      {showImage ? (
                        <Image
                          src={category.image as string}
                          alt={category.title}
                          width={600}
                          height={400}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          // leave optimization ON; configure domains in next.config.js
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-emerald-300" />
                        </div>
                      )}

                      {/* Status */}
                      <div className="absolute top-3 right-3">
                        {isActive(category) ? (
                          <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                        {category.title}
                      </h3>
                      <p className="text-sm text-emerald-700/80 font-medium mb-3">
                        /{category.slug}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(category)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="text-sm">Edit</span>
                        </button>
                        <button
                          onClick={() => requestDelete(category._id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center">
              <FolderTree className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Add First Category
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create/Update Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-emerald-100">
              <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-emerald-50 rounded-xl transition"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

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
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
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
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image URL <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData((s) => ({ ...s, image: e.target.value }))
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                  />
                  {isValidImageUrl(formData.image) && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-emerald-100">
                      <Image
                        src={formData.image}
                        alt="Preview"
                        width={800}
                        height={400}
                        className="w-full h-40 object-cover"
                        // keep optimization ON; configure allowed domains in next.config.js
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
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
                    className="text-sm font-semibold text-gray-700"
                  >
                    Active (Visible to customers)
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 rounded-xl border border-emerald-200 text-gray-700 font-semibold hover:bg-emerald-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition"
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

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!confirmId}
        title="Delete this category?"
        subtitle="This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
