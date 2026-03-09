'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AmbulanceDashboard() {
  return (
    <ProtectedRoute requiredRole="ambulance">
      <div className="min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="flex">
        <div className="w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-6">
            <h2 className="text-2xl font-bold">Ambulance Panel</h2>
            <p className="text-gray-400 text-sm mt-1">Emergency Services</p>
          </div>
          <nav className="mt-8">
            <a href="#" className="block px-6 py-3 hover:bg-gray-800 bg-gray-800 border-l-4 border-blue-500">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </span>
            </a>
            <a href="#" className="block px-6 py-3 hover:bg-gray-800">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Fleet
              </span>
            </a>
            <a href="#" className="block px-6 py-3 hover:bg-gray-800">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Dispatch Log
              </span>
            </a>
            <a href="#" className="block px-6 py-3 hover:bg-gray-800">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </span>
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Ambulance Dashboard</h1>
                <p className="text-sm text-gray-500">Emergency Medical Services Management</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dispatcher</p>
                    <p className="text-xs text-gray-500">Emergency Services</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600">Active Emergencies</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
            <p className="text-sm text-gray-500 mt-1">Requires immediate attention</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600">Available Ambulances</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">8</p>
            <p className="text-sm text-gray-500 mt-1">Ready for dispatch</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600">In Transit</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">5</p>
            <p className="text-sm text-gray-500 mt-1">Currently on route</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600">Avg Response Time</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">12min</p>
            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Recent Emergency Calls</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-red-800">High Priority - Labor Complications</p>
                    <p className="text-sm text-gray-600">Location: Central Hospital Area</p>
                    <p className="text-xs text-gray-500">Time: 5 mins ago</p>
                  </div>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Dispatch
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-yellow-800">Medium Priority - Prenatal Emergency</p>
                    <p className="text-sm text-gray-600">Location: North District</p>
                    <p className="text-xs text-gray-500">Time: 12 mins ago</p>
                  </div>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                    Dispatch
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-green-800">Low Priority - Routine Check</p>
                    <p className="text-sm text-gray-600">Location: East Side Clinic</p>
                    <p className="text-xs text-gray-500">Time: 25 mins ago</p>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Dispatch
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Ambulance Fleet Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold">AMB-001</p>
                      <p className="text-sm text-gray-600">Available - Central Base</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Ready</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold">AMB-002</p>
                      <p className="text-sm text-gray-600">In Transit - North District</p>
                    </div>
                  </div>
                  <span className="text-sm text-yellow-600 font-medium">Busy</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold">AMB-003</p>
                      <p className="text-sm text-gray-600">Maintenance - Garage</p>
                    </div>
                  </div>
                  <span className="text-sm text-red-600 font-medium">Unavailable</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700">
                  <p className="font-semibold">New Emergency Call</p>
                  <p className="text-sm text-blue-100">Log new emergency</p>
                </button>
                <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700">
                  <p className="font-semibold">Fleet Management</p>
                  <p className="text-sm text-green-100">Manage vehicles</p>
                </button>
                <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700">
                  <p className="font-semibold">Reports</p>
                  <p className="text-sm text-purple-100">View analytics</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
