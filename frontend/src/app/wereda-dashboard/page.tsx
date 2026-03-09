'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function WeredDashboard() {
  return (
    <ProtectedRoute requiredRole="wered">
      <div className="min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="flex">
        <div className="w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-6">
            <h2 className="text-2xl font-bold">Wered Panel</h2>
            <p className="text-gray-400 text-sm mt-1">Administrative Services</p>
          </div>
          <nav className="mt-8">
            <a href="#" className="block px-6 py-3 hover:bg-gray-800 bg-gray-800 border-l-4 border-purple-500">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Facilities
              </span>
            </a>
            <a href="#" className="block px-6 py-3 hover:bg-gray-800">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Staff Management
              </span>
            </a>
            <a href="#" className="block px-6 py-3 hover:bg-gray-800">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Reports
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
                <h1 className="text-2xl font-semibold text-gray-800">Wered Dashboard</h1>
                <p className="text-sm text-gray-500">Administrative Oversight & System Management</p>
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
                    <p className="text-sm font-medium text-gray-700">Administrator</p>
                    <p className="text-xs text-gray-500">Wered Office</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600">Total Facilities</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">12</p>
            <p className="text-sm text-gray-500 mt-1">8 hospitals, 4 clinics</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600">Active Staff</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">156</p>
            <p className="text-sm text-gray-500 mt-1">45 midwives, 28 drivers</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600">Total Patients</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">1,247</p>
            <p className="text-sm text-gray-500 mt-1">Active this month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600">System Uptime</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">99.8%</p>
            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Facility Overview</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-purple-800">Central Medical Center</p>
                    <p className="text-sm text-gray-600">Capacity: 85% | 342 patients</p>
                    <p className="text-xs text-gray-500">Director: Dr. Alemu Tadesse</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Operational</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-blue-800">West Side Hospital</p>
                    <p className="text-sm text-gray-600">Capacity: 72% | 288 patients</p>
                    <p className="text-xs text-gray-500">Director: Dr. Sofia Mehari</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Operational</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-yellow-800">North District Clinic</p>
                    <p className="text-sm text-gray-600">Capacity: 91% | 145 patients</p>
                    <p className="text-xs text-gray-500">Director: Nurse Kebedech Assefa</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Near Capacity</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">System Performance Metrics</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Response Time</span>
                    <span className="text-sm text-gray-600">8.5 min avg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Patient Satisfaction</span>
                    <span className="text-sm text-gray-600">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Resource Utilization</span>
                    <span className="text-sm text-gray-600">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">System Reliability</span>
                    <span className="text-sm text-gray-600">99.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '99.8%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Recent System Alerts</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-red-800">Critical: North District at Capacity</p>
                      <p className="text-sm text-gray-600">Facility operating at 91% capacity</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                      Action Required
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-yellow-800">Warning: Ambulance Maintenance Due</p>
                      <p className="text-sm text-gray-600">3 vehicles require scheduled maintenance</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                    <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                      Schedule
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-blue-800">Info: System Update Completed</p>
                      <p className="text-sm text-gray-600">Database optimization successful</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Administrative Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700">
                  <p className="font-semibold">Staff Management</p>
                  <p className="text-sm text-purple-100">Manage personnel</p>
                </button>
                <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700">
                  <p className="font-semibold">Resource Allocation</p>
                  <p className="text-sm text-blue-100">Distribute resources</p>
                </button>
                <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700">
                  <p className="font-semibold">Reports</p>
                  <p className="text-sm text-green-100">Generate analytics</p>
                </button>
                <button className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700">
                  <p className="font-semibold">Settings</p>
                  <p className="text-sm text-yellow-100">System configuration</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Regional Statistics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">North Region</p>
                  <p className="text-gray-600 mt-2">4 Facilities</p>
                  <p className="text-sm text-gray-500">523 Patients</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time:</span>
                      <span className="font-medium">9.2 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Satisfaction:</span>
                      <span className="font-medium">92%</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">South Region</p>
                  <p className="text-gray-600 mt-2">5 Facilities</p>
                  <p className="text-sm text-gray-500">612 Patients</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time:</span>
                      <span className="font-medium">7.8 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Satisfaction:</span>
                      <span className="font-medium">95%</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">East Region</p>
                  <p className="text-gray-600 mt-2">3 Facilities</p>
                  <p className="text-sm text-gray-500">112 Patients</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time:</span>
                      <span className="font-medium">6.5 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Satisfaction:</span>
                      <span className="font-medium">97%</span>
                    </div>
                  </div>
                </div>
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
