'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleDashboardClick = (role: string) => {
    router.push(`/${role}`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Smart Maternal System</h1>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name} ({user.role})
              </span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login / Register
            </button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!user ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to Smart Maternal System
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Please login or register to access your dashboard
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 text-lg font-medium"
            >
              Get Started
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Select Your Dashboard
              </h2>
              <p className="text-lg text-gray-600">
                Choose the appropriate dashboard for your role
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">Ambulance Dashboard</h2>
                <p className="text-gray-600 mb-4">Manage emergency medical services and ambulance dispatch</p>
                <button
                  onClick={() => handleDashboardClick('ambulance')}
                  className={`inline-block px-4 py-2 rounded ${
                    user.role === 'ambulance' 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={user.role !== 'ambulance'}
                >
                  Access Dashboard
                </button>
                {user.role !== 'ambulance' && (
                  <p className="text-xs text-red-500 mt-2">Access restricted to Ambulance staff</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-semibold mb-4 text-green-600">Midwife Dashboard</h2>
                <p className="text-gray-600 mb-4">Patient management and maternal care coordination</p>
                <button
                  onClick={() => handleDashboardClick('midwife')}
                  className={`inline-block px-4 py-2 rounded ${
                    user.role === 'midwife' 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={user.role !== 'midwife'}
                >
                  Access Dashboard
                </button>
                {user.role !== 'midwife' && (
                  <p className="text-xs text-red-500 mt-2">Access restricted to Midwife staff</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-semibold mb-4 text-purple-600">Wered Dashboard</h2>
                <p className="text-gray-600 mb-4">Administrative oversight and system management</p>
                <button
                  onClick={() => handleDashboardClick('wered')}
                  className={`inline-block px-4 py-2 rounded ${
                    user.role === 'wered' 
                      ? 'bg-purple-500 text-white hover:bg-purple-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={user.role !== 'wered'}
                >
                  Access Dashboard
                </button>
                {user.role !== 'wered' && (
                  <p className="text-xs text-red-500 mt-2">Access restricted to Wered administrators</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
