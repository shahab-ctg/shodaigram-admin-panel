
"use client";

import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  
  const stats = [
    {
      title: "Total Revenue",
      value: "৳২,৪৫,৬৭৮",
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      bgColor: "from-emerald-500 to-green-600",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Total Orders",
      value: "১,২৩৪",
      change: "+8.2%",
      isPositive: true,
      icon: ShoppingCart,
      bgColor: "from-blue-500 to-cyan-600",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Total Products",
      value: "৫৬৭",
      change: "+5.1%",
      isPositive: true,
      icon: Package,
      bgColor: "from-purple-500 to-pink-600",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Total Customers",
      value: "৮৯০",
      change: "-2.4%",
      isPositive: false,
      icon: Users,
      bgColor: "from-orange-500 to-amber-600",
      lightBg: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  const recentOrders = [
    {
      id: "#ORD-1234",
      customer: "আব্দুল করিম",
      amount: "৳১,২৫০",
      status: "pending",
      time: "২ ঘন্টা আগে",
    },
    {
      id: "#ORD-1233",
      customer: "ফাতেমা বেগম",
      amount: "৳৮৫০",
      status: "delivered",
      time: "৫ ঘন্টা আগে",
    },
    {
      id: "#ORD-1232",
      customer: "রহিম মিয়া",
      amount: "৳২,১০০",
      status: "processing",
      time: "১ দিন আগে",
    },
    {
      id: "#ORD-1231",
      customer: "সালমা খাতুন",
      amount: "৳৬৫০",
      status: "cancelled",
      time: "১ দিন আগে",
    },
    {
      id: "#ORD-1230",
      customer: "করিম উদ্দিন",
      amount: "৳১,৪৫০",
      status: "delivered",
      time: "২ দিন আগে",
    },
  ];

  const topProducts = [
    { name: "টমেটো (১ কেজি)", sold: 450, revenue: "৳১৮,০০০", image: "🍅" },
    { name: "আম (১ ডজন)", sold: 320, revenue: "৳৩৮,৪০০", image: "🥭" },
    { name: "রুই মাছ (১ কেজি)", sold: 280, revenue: "৳৯৮,০০০", image: "🐟" },
    {
      name: "খাঁটি ঘি (৫০০ গ্রাম)",
      sold: 150,
      revenue: "৳৮২,৫০০",
      image: "🧈",
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      processing: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: AlertCircle,
      },
      delivered: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
      },
      cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };

    const style = styles[status as keyof typeof styles];
    const Icon = style.icon;
    const labels = {
      pending: "Pending",
      processing: "Processing",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-600 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Welcome back! Here is what is happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        stat.isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
                Recent Orders
              </h2>
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:shadow-md transition-all duration-200 border border-emerald-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-800">
                        {order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      {order.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                Top Products
              </h2>
            </div>

            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:shadow-md transition-all duration-200 border border-emerald-100"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                    {product.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Sold: {product.sold}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">
                      {product.revenue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
