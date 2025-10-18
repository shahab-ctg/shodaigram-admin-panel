"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  X,
  Check,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";

import {
  useListProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/services/products.api";
import { useListCategoriesQuery } from "@/services/categories.api";

import type {
  CreateProductDTO,
  UpdateProductDTO,
  Product,
} from "@/types/product";

// --- helpers --------------------------------------------------------
const n = (v: unknown, fallback = 0): number =>
  typeof v === "number" ? v : Number(v ?? fallback);

type HttpError = { status: number; data?: { code?: string; message?: string } };
const isHttpError = (e: unknown): e is HttpError =>
  typeof e === "object" &&
  !!e &&
  typeof (e as { status?: unknown }).status === "number";

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

// --- tiny confirm modal --------------------------------------------
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

// --- page -----------------------------------------------------------
export default function ProductsContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || ""
  );

  // modal + edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // minimal form (image optional)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    price: 0,
    discountPrice: 0,
    stock: 0,
    categorySlug: "",
    imageUrl: "",
    isActive: true,
  });

  // RTK Query
  const {
    data: productsData,
    isLoading,
    error,
    isFetching,
  } = useListProductsQuery({ q: searchQuery, category: categoryFilter });
  const { data: categoriesData } = useListCategoriesQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products: Product[] = productsData?.data?.items ?? [];
  const categories = categoriesData?.data ?? [];

  // DTOs
  const buildCreateDTO = (f: typeof form): CreateProductDTO => {
    const hasDiscount = f.discountPrice > 0 && f.discountPrice < f.price;
    return {
      title: f.title,
      slug: f.slug,
      price: hasDiscount ? f.discountPrice : f.price,
      compareAtPrice: hasDiscount ? f.price : undefined,
      isDiscounted: hasDiscount,
      stock: f.stock,
      image: f.imageUrl.trim() || undefined,
      status: f.isActive ? "ACTIVE" : "DRAFT",
      categorySlug: f.categorySlug || undefined,
      tagSlugs: [],
    };
  };
  const buildUpdateDTO = (f: typeof form): UpdateProductDTO =>
    buildCreateDTO(f);

  // CRUD
  const createNew = async () => {
    const body = buildCreateDTO(form);
    await createProduct(body).unwrap();
    toast.success("Product created");
  };
  const updateExisting = async (id: string) => {
    const body = buildUpdateDTO(form);
    await updateProduct({ id, body }).unwrap();
    toast.success("Product updated");
  };
  const requestDelete = (id: string) => setConfirmId(id);
  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteProduct(confirmId).unwrap();
      toast.success("Product deleted");
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

  // UI helpers
  const openCreate = () => {
    setEditingProduct(null);
    setForm({
      title: "",
      slug: "",
      price: 0,
      discountPrice: 0,
      stock: 0,
      categorySlug: "",
      imageUrl: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };
  const openEdit = (p: Product) => {
    const priceNum = n(p.price);
    const compareNum =
      p.compareAtPrice != null ? n(p.compareAtPrice) : undefined;
    const hasCompare = typeof compareNum === "number" && compareNum > priceNum;
    setEditingProduct(p);
    setForm({
      title: p.title,
      slug: p.slug,
      price: hasCompare ? compareNum! : priceNum,
      discountPrice: hasCompare ? priceNum : 0,
      stock: n(p.stock),
      categorySlug: p.categorySlug ?? "",
      imageUrl: p.image ?? "",
      isActive: p.status === "ACTIVE",
    });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateExisting(editingProduct._id);
      } else {
        await createNew();
      }
      closeModal();
    } catch (err: unknown) {
      if (isHttpError(err) && err.status === 409) {
        toast.error("Title/Slug already exists. Please change and try again.");
        return;
      }
      toast.error("Failed to save product");
      console.error(err);
    }
  };

  const discountPct = (price: number, compareAt?: number) => {
    if (!compareAt || compareAt <= price) return 0;
    return Math.round(((compareAt - price) / compareAt) * 100);
  };

  // skeleton card
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-emerald-100/60" />
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
              <Package className="w-10 h-10 text-emerald-600" />
              Products Management
            </h1>
            <p className="text-gray-600">Create, update & delete products</p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                />
              </div>

              {/* Category filter (slug) */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition lg:w-64"
              >
                <option value="">All Categories</option>
                {categories.map(
                  (cat: { _id: string; slug: string; title: string }) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.title}
                    </option>
                  )
                )}
              </select>

              {/* Add */}
              <button
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* States */}
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
                Failed to load products. Please try again.
              </p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => {
                const pct = discountPct(
                  n(p.price),
                  p.compareAtPrice != null ? n(p.compareAtPrice) : undefined
                );
                const showImage = isValidImageUrl(p.image);
                return (
                  <div
                    key={p._id}
                    className="bg-white rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-green-100 overflow-hidden">
                      {showImage ? (
                        <Image
                          src={p.image as string}
                          alt={p.title}
                          width={640}
                          height={480}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {pct > 0 && (
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            -{pct}%
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        {p.status === "ACTIVE" ? (
                          <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            {p.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-emerald-700/80 font-medium mb-2">
                        Stock: {n(p.stock)}
                      </p>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-emerald-600">
                          ৳{n(p.price)}
                        </span>
                        {p.compareAtPrice != null &&
                          n(p.compareAtPrice) > n(p.price) && (
                            <span className="text-sm text-gray-400 line-through">
                              ৳{n(p.compareAtPrice)}
                            </span>
                          )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="text-sm">Edit</span>
                        </button>
                        <button
                          onClick={() => requestDelete(p._id)}
                          disabled={isDeleting}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 disabled:opacity-50 transition"
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
              <Package className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || categoryFilter
                  ? "Try adjusting your filters"
                  : "Add your first product to get started"}
              </p>
              {!searchQuery && !categoryFilter && (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Add First Product
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create / Update Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-emerald-100">
              <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
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
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Fresh Tomato"
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
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated-slug"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={form.categorySlug}
                    onChange={(e) =>
                      setForm({ ...form, categorySlug: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                  >
                    <option value="">Select Category</option>
                    {categories.map(
                      (cat: { _id: string; slug: string; title: string }) => (
                        <option key={cat._id} value={cat.slug}>
                          {cat.title}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (৳) *
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: Number(e.target.value) })
                      }
                      placeholder="100"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Price (optional)
                    </label>
                    <input
                      type="number"
                      value={form.discountPrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          discountPrice: Number(e.target.value),
                        })
                      }
                      placeholder="80"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: Number(e.target.value) })
                    }
                    placeholder="100"
                    required
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image URL <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                  />
                  {isValidImageUrl(form.imageUrl) && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-emerald-100">
                      <Image
                        src={form.imageUrl}
                        alt="Preview"
                        width={800}
                        height={400}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
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
                        {editingProduct ? "Update Product" : "Create Product"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={!!confirmId}
        title="Delete this product?"
        subtitle="This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
