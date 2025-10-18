import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            ShodaiGram Admin
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Welcome to your admin panel
          </p>

          {/* Test Tailwind classes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6 border border-green-200">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Users
              </h3>
              <p className="text-gray-600">Manage your users</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-green-200">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Products
              </h3>
              <p className="text-gray-600">Manage your products</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-green-200">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Analytics
              </h3>
              <p className="text-gray-600">View your analytics</p>
            </div>
          </div>

          {/* Test button with Tailwind */}
          <Link href={"/login"}>
            <button className="mt-8 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
