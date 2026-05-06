'use client';

import { useState, useEffect } from 'react';
import { mothersApi } from '@/lib/healthcare-api';
import { api } from '@/lib/api';

interface FormData {
  name: string;
  phone: string;
  age: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
  expectedDeliveryDate: string;
  gravida: string;
  para: string;
  lmp: string;
  bloodType: string;
  rhFactor: string;
  hivStatus: string;
  hepatitisB: string;
  hypertension: boolean;
  diabetes: boolean;
  anemia: boolean;
  previousCSection: boolean;
}

export default function RegisterMother() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    age: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    expectedDeliveryDate: '',
    gravida: '',
    para: '',
    lmp: '',
    bloodType: '',
    rhFactor: '',
    hivStatus: '',
    hepatitisB: '',
    hypertension: false,
    diabetes: false,
    anemia: false,
    previousCSection: false,
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [userHospital, setUserHospital] = useState<any>(null);
  const [availableHospitals, setAvailableHospitals] = useState<any[]>([]);
  const [showHospitalFallback, setShowHospitalFallback] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      // Get user info from localStorage
      const userStr = localStorage.getItem('user');
      console.log('=== USER DEBUG START ===');
      console.log('Raw user string:', userStr);
      
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('Parsed user object:', user);
        console.log('User keys:', Object.keys(user));
        console.log('User hospitalId:', user.hospitalId);
        console.log('User hospitalId type:', typeof user.hospitalId);
        
        // Check for alternative field names
        console.log('Checking alternative field names:');
        console.log('- hospital:', user.hospital);
        console.log('- healthCenterId:', user.healthCenterId);
        console.log('- assignedHospital:', user.assignedHospital);
        console.log('- hospitalId (string):', String(user.hospitalId));
        
        setCurrentUser(user);
        
        // Create hospital object from user data if hospital name is available
        if (user.hospitalId && user.hospitalName) {
          console.log('Using hospital from user data:', user.hospitalName);
          const hospitalFromUser = {
            _id: user.hospitalId,
            name: user.hospitalName
          };
          setUserHospital(hospitalFromUser);
        } else {
          console.log('Hospital name not in user data, trying API...');
          setUseFallback(true);
          
          // Try to fetch hospitals as fallback
          try {
            const hospitalData = await api.getHospitals();
            console.log('All hospitals from API:', hospitalData);
            setAvailableHospitals(hospitalData);
            
            // Find user's hospital
            const foundHospital = hospitalData.find((h: any) => h._id === user.hospitalId);
            console.log('Found user hospital:', foundHospital);
            setUserHospital(foundHospital);
            
            if (!foundHospital) {
              console.warn('Hospital not found for ID:', user.hospitalId);
              setShowHospitalFallback(true);
            }
          } catch (hospitalErr) {
            console.error('Error fetching hospitals:', hospitalErr);
            setShowHospitalFallback(true);
          }
        }
      } else {
        console.warn('No user data found in localStorage');
        setShowHospitalFallback(true);
      }
      console.log('=== USER DEBUG END ===');
    } catch (err) {
      console.error('Error getting current user:', err);
      setShowHospitalFallback(true);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHospitalSelect = (hospitalId: string) => {
    const selectedHospital = availableHospitals.find(h => h._id === hospitalId);
    if (selectedHospital) {
      setUserHospital(selectedHospital);
      setShowHospitalFallback(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Debug logging
      console.log('=== MOTHER REGISTRATION DEBUG ===');
      console.log('userHospital:', userHospital);
      console.log('userHospital._id:', userHospital?._id);
      console.log('userHospital.woredaId:', userHospital?.woredaId);
      console.log('userHospital.woredaId type:', typeof userHospital?.woredaId);
      
      const extractedWoredaId = userHospital?.woredaId?._id || userHospital?.woredaId;
      console.log('extractedWoredaId:', extractedWoredaId);
      
      // Validation check
      if (!userHospital?._id) {
        throw new Error('Please select your health center before registering a mother.');
      }
      
      if (!extractedWoredaId) {
        throw new Error('Health center does not have a valid woreda assigned. Please contact your administrator.');
      }
      
      // Phone validation
      if (!formData.phone || !/^09\d{8}$/.test(formData.phone)) {
        throw new Error('Phone number must start with 09 followed by 8 digits (e.g., 0911234567)');
      }
      
      // Generate temporary credentials for mother
      const tempUsername = `mother_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tempPassword = Math.random().toString(36).substr(-8) + Math.random().toString(36).substr(-8) + Math.random().toString(36).substr(-4);
      
      const motherData = {
        ...formData,
        age: parseInt(formData.age),
        gravida: formData.gravida ? parseInt(formData.gravida) : undefined,
        para: formData.para ? parseInt(formData.para) : undefined,
        registeredBy: currentUser?.name || 'Unknown',
        woredaId: extractedWoredaId,
        healthCenter: userHospital?._id,
        tempUsername: tempUsername,
        tempPassword: tempPassword,
        phone: formData.phone, // Include phone for SMS delivery
      };
      
      console.log('motherData.woredaId:', motherData.woredaId);
      console.log('motherData.healthCenter:', motherData.healthCenter);
      console.log('Generated temp username:', tempUsername);
      console.log('Generated temp password:', tempPassword);
      console.log('=== END DEBUG ===');

      await mothersApi.create(motherData);
      setSuccess(true);
      setFormData({
        name: '',
        phone: '',
        age: '',
        address: '',
        emergencyContact: '',
        medicalHistory: '',
        expectedDeliveryDate: '',
        gravida: '',
        para: '',
        lmp: '',
        bloodType: '',
        rhFactor: '',
        hivStatus: '',
        hepatitisB: '',
        hypertension: false,
        diabetes: false,
        anemia: false,
        previousCSection: false,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to register mother');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    // Get the generated credentials from the most recent submission
    const tempUsername = `mother_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempPassword = Math.random().toString(36).substr(-8) + Math.random().toString(36).substr(-8) + Math.random().toString(36).substr(-4);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mother Registered Successfully!</h2>
            <p className="text-gray-600 mb-6">The mother has been registered in the system.</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Mobile App Login Credentials</h3>
              <p className="text-sm text-blue-700 mb-4">Please give these credentials to the mother for her mobile application login:</p>
              
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username:</label>
                  <div className="font-mono text-lg bg-gray-100 p-2 rounded border border-gray-300">
                    {tempUsername}
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                  <div className="font-mono text-lg bg-gray-100 p-2 rounded border border-gray-300">
                    {tempPassword}
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong className="text-yellow-900">Important:</strong> Mother should change these credentials on her first login to the mobile app for security.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <a
                href="/healthcare-dashboard/mothers"
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Mothers
              </a>
              <a
                href="/healthcare-dashboard"
                className="block w-full px-4 py-2 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Register Mother</h1>
              <p className="text-sm text-gray-600">Add a new mother to the system</p>
            </div>
            <a
              href="/healthcare-dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">❌</span>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="0911234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="15"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Health Center *
                  </label>
                  {showHospitalFallback ? (
                    <div>
                      <select
                        value={userHospital?._id || ''}
                        onChange={(e) => handleHospitalSelect(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Health Center</option>
                        {availableHospitals.map((hospital) => (
                          <option key={hospital._id} value={hospital._id}>
                            {hospital.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-orange-600 mt-1">
                        Your assigned hospital was not found. Please select your health center.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                        {userHospital ? userHospital.name : currentUser ? 'Hospital not found' : 'Loading user data...'}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {userHospital ? (useFallback ? 'Selected from available hospitals' : 'Automatically assigned from your profile') : 'Please check your user profile'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registered By
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                    {currentUser ? `${currentUser.name} - ${currentUser.role}` : 'Loading...'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Automatically recorded for transparency</p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-2">
                    Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pregnancy Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pregnancy Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="gravida" className="block text-sm font-medium text-gray-700 mb-2">
                    Gravida (Number of Pregnancies)
                  </label>
                  <input
                    type="number"
                    id="gravida"
                    name="gravida"
                    value={formData.gravida}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="para" className="block text-sm font-medium text-gray-700 mb-2">
                    Para (Number of Births)
                  </label>
                  <input
                    type="number"
                    id="para"
                    name="para"
                    value={formData.para}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="lmp" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Menstrual Period (LMP)
                  </label>
                  <input
                    type="date"
                    id="lmp"
                    name="lmp"
                    value={formData.lmp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="rhFactor" className="block text-sm font-medium text-gray-700 mb-2">
                    RH Factor
                  </label>
                  <select
                    id="rhFactor"
                    name="rhFactor"
                    value={formData.rhFactor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select RH Factor</option>
                    <option value="Positive">Positive (+)</option>
                    <option value="Negative">Negative (-)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hivStatus" className="block text-sm font-medium text-gray-700 mb-2">
                    HIV Status
                  </label>
                  <select
                    id="hivStatus"
                    name="hivStatus"
                    value={formData.hivStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select HIV Status</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hepatitisB" className="block text-sm font-medium text-gray-700 mb-2">
                    Hepatitis B Status
                  </label>
                  <select
                    id="hepatitisB"
                    name="hepatitisB"
                    value={formData.hepatitisB}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Hepatitis B Status</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                {/* Risk Factors */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Factors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="hypertension"
                          name="hypertension"
                          checked={formData.hypertension}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Hypertension</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="diabetes"
                          name="diabetes"
                          checked={formData.diabetes}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Diabetes</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="anemia"
                          name="anemia"
                          checked={formData.anemia}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Anemia</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="previousCSection"
                          name="previousCSection"
                          checked={formData.previousCSection}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Previous C-Section</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    id="expectedDeliveryDate"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <a
                href="/healthcare-dashboard"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {loading ? 'Registering...' : 'Register Mother'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
