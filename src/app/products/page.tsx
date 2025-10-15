// app/products/page.tsx
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
  DollarSign,
  Tag,
  Eye,
} from "lucide-react";
import {
  useListProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/services/products.api";
import { useListCategoriesQuery } from "@/services/categories.api";
import Image from "next/image";

interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  stock: number;
  unit: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || ""
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: 0,
    discountPrice: 0,
    category: "",
    images: [""],
    stock: 0,
    unit: "kg",
    isActive: true,
    isFeatured: false,
  });

  // RTK Query hooks
  const {
    data: productsData,
    isLoading,
    error,
  } = useListProductsQuery({
    q: searchQuery,
    category: categoryFilter,
  });
  const { data: categoriesData } = useListCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products: Product[] = productsData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  // Open modal
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || 0,
        category: product.category,
        images: product.images,
        stock: product.stock,
        unit: product.unit,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: "",
        slug: "",
        description: "",
        price: 0,
        discountPrice: 0,
        category: "",
        images: [""],
        stock: 0,
        unit: "kg",
        isActive: true,
        isFeatured: false,
      });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Auto-generate slug
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

  // Handle image input
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageInput = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageInput = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ""),
      };

      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, ...payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };

  // Delete product
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
      } catch (err) {
        console.error("Failed to delete product:", err);
      }
    }
  };

  // Calculate discount percentage
  const getDiscountPercentage = (price: number, discountPrice: number) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-600 mb-2 flex items-center gap-3">
            <Package className="w-10 h-10 text-emerald-600" />
            Products Management
          </h1>
          <p className="text-gray-600">Manage your organic product inventory</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all lg:w-64"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.title}
                </option>
              ))}
            </select>

            {/* Add Button */}
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">
              Failed to load products. Please try again.
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const discount = getDiscountPercentage(
                product.price,
                product.discountPrice || 0
              );

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-green-100 overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-emerald-300" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.isFeatured && (
                        <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          ⭐ Featured
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      {product.isActive ? (
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

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-xs text-emerald-600 font-medium mb-2">
                      Stock: {product.stock} {product.unit}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-emerald-600">
                        ৳{product.discountPrice || product.price}
                      </span>
                      {product.discountPrice &&
                        product.discountPrice < product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            ৳{product.price}
                          </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        disabled={isDeleting}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
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
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || categoryFilter
                ? "Try adjusting your filters"
                : "Add your first product to get started"}
            </p>
            {!searchQuery && !categoryFilter && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add First Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-emerald-50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Column */}
                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g., Fresh Tomato"
                      required
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="auto-generated-slug"
                      required
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-mono text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price & Discount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price (৳) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: Number(e.target.value),
                          })
                        }
                        placeholder="100"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Discount Price (৳)
                      </label>
                      <input
                        type="number"
                        value={formData.discountPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountPrice: Number(e.target.value),
                          })
                        }
                        placeholder="80"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Stock & Unit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock: Number(e.target.value),
                          })
                        }
                        placeholder="100"
                        required
                        min="0"
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Unit *
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                      >
                        <option value="kg">Kilogram (kg)</option>
                        <option value="gram">Gram (g)</option>
                        <option value="liter">Liter (L)</option>
                        <option value="piece">Piece (pcs)</option>
                        <option value="dozen">Dozen</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Detailed product description..."
                      required
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Images
                    </label>
                    <div className="space-y-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            value={img}
                            onChange={(e) =>
                              handleImageChange(index, e.target.value)
                            }
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-4 py-2.5 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                          />
                          {formData.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImageInput(index)}
                              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addImageInput}
                        className="w-full px-4 py-2.5 border-2 border-dashed border-emerald-300 text-emerald-600 font-medium rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Image
                      </button>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-xl">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
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

                    <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-xl">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isFeatured: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <label
                        htmlFor="isFeatured"
                        className="text-sm font-semibold text-gray-700 cursor-pointer"
                      >
                        ⭐ Featured Product
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-emerald-100">
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
  );
}
