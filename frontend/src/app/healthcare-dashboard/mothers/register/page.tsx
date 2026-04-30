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
  region: string;
  woredaId: string;
  healthCenter: string;
  motherId: string; // For existing mother selection
}

export default function RegisterMother() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    age: '',
    region: '',
    woredaId: '',
    healthCenter: '',
    motherId: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    expectedDeliveryDate: '',
    gravida: '',
    para: '',
    lmp: '',
  });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userHospital, setUserHospital] = useState<any>(null);
  const [availableHospitals, setAvailableHospitals] = useState<any[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);
  const [mothers, setMothers] = useState<any[]>([]);
  const [filteredMothers, setFilteredMothers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [woredas, setWoredas] = useState<any[]>([]);
  const [filteredWoredas, setFilteredWoredas] = useState<any[]>([]);
  const [loadingWoredas, setLoadingWoredas] = useState(true);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingMothers, setLoadingMothers] = useState(true);
  const [selectedWoredaName, setSelectedWoredaName] = useState('');

  // Ethiopian regions
  const ethiopianRegions = [
    'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 
    'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali', 'South West Ethiopia Peoples', 
    'Southern Nations, Nationalities, and Peoples\' (SNNPR)', 'Tigray'
  ];

  useEffect(() => {
    getCurrentUser();
    fetchWoredasFromDatabase();
    fetchHospitalsFromDatabase();
    fetchMothersFromDatabase();
  }, []);

  useEffect(() => {
    console.log('=== CURRENT STATE ===');
    console.log('Woredas array length:', woredas.length);
    console.log('Woredas data:', woredas);
    console.log('FormData woredaId:', formData.woredaId);
    console.log('Selected Woreda Name:', selectedWoredaName);
    console.log('Loading woredas:', loadingWoredas);
  }, [woredas, formData.woredaId, loadingWoredas, selectedWoredaName]);

  // Update filtered data when dependencies change
  useEffect(() => {
    // Filter woredas based on selected region
    if (formData.region && woredas.length > 0) {
      const woredasInRegion = woredas.filter(woreda => woreda.region === formData.region);
      setFilteredWoredas(woredasInRegion);
    } else if (!formData.region) {
      setFilteredWoredas(woredas);
    }
  }, [formData.region, woredas]);

  useEffect(() => {
    // Filter hospitals based on selected woreda
    if (formData.woredaId && availableHospitals.length > 0) {
      const hospitalsInWoreda = availableHospitals.filter(hospital => {
        return hospital.woreda === formData.woredaId || hospital.woredaId === formData.woredaId;
      });
      setFilteredHospitals(hospitalsInWoreda);
    } else {
      setFilteredHospitals([]);
    }
  }, [formData.woredaId, availableHospitals]);

  useEffect(() => {
    // Filter mothers based on selected health center
    if (formData.healthCenter && mothers.length > 0) {
      const mothersInFacility = mothers.filter(mother => {
        return mother.healthCenter === formData.healthCenter || mother.assignedHealthCenter === formData.healthCenter;
      });
      setFilteredMothers(mothersInFacility);
    } else {
      setFilteredMothers([]);
    }
  }, [formData.healthCenter, mothers]);

  const getCurrentUser = async () => {
    try {
      const userStr = localStorage.getItem('user');
      console.log('=== USER DEBUG START ===');
      console.log('Raw user string:', userStr);
      
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('Parsed user object:', user);
        setCurrentUser(user);
        
        if (user.hospitalId) {
          setFormData(prev => ({
            ...prev,
            healthCenter: user.hospitalId
          }));
        }
      }
      console.log('=== USER DEBUG END ===');
    } catch (err) {
      console.error('Error getting current user:', err);
    }
  };

  const fetchWoredasFromDatabase = async () => {
    setLoadingWoredas(true);
    try {
      console.log('Fetching woredas from API...');
      const woredaData = await api.getWoredas();
      console.log('Woredas fetched successfully:', woredaData);
      
      if (woredaData && Array.isArray(woredaData) && woredaData.length > 0) {
        setWoredas(woredaData);
        console.log('First woreda ID example:', woredaData[0]._id);
        console.log('First woreda ID type:', typeof woredaData[0]._id);
      } else {
        console.error('No woreda data received or empty array');
        setWoredas([]);
      }
    } catch (err) {
      console.error('Failed to fetch woredas from database:', err);
      setWoredas([]);
    } finally {
      setLoadingWoredas(false);
    }
  };

  const fetchHospitalsFromDatabase = async () => {
    setLoadingHospitals(true);
    try {
      console.log('Fetching hospitals from API...');
      const hospitalData = await api.getHospitals();
      console.log('Hospitals fetched successfully:', hospitalData);
      
      if (hospitalData && Array.isArray(hospitalData)) {
        setAvailableHospitals(hospitalData);
        
        // Initially set filtered hospitals to all hospitals
        setFilteredHospitals(hospitalData);
        
        if (currentUser?.hospitalId) {
          const foundHospital = hospitalData.find((h: any) => h._id === currentUser.hospitalId);
          if (foundHospital) {
            setUserHospital(foundHospital);
            setFormData(prev => ({
              ...prev,
              healthCenter: foundHospital._id
            }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const fetchMothersFromDatabase = async () => {
    setLoadingMothers(true);
    try {
      console.log('Fetching mothers from API...');
      const mothersData = await mothersApi.getAll();
      console.log('Mothers fetched successfully:', mothersData);
      
      if (mothersData && Array.isArray(mothersData)) {
        setMothers(mothersData);
        setFilteredMothers(mothersData);
      }
    } catch (err) {
      console.error('Failed to fetch mothers:', err);
      setMothers([]);
      setFilteredMothers([]);
    } finally {
      setLoadingMothers(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Input changed - ${name}:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Implement 4-level cascading logic
    if (name === 'region') {
      // Filter woredas based on selected region
      if (value) {
        const woredasInRegion = woredas.filter(woreda => woreda.region === value);
        setFilteredWoredas(woredasInRegion);
        console.log('Woredas in region:', woredasInRegion);
        
        // Clear dependent selections
        setFormData(prev => ({
          ...prev,
          woredaId: '',
          healthCenter: '',
          motherId: ''
        }));
        setFilteredHospitals([]);
        setFilteredMothers([]);
      } else {
        // If no region selected, show all woredas
        setFilteredWoredas(woredas);
        setFilteredHospitals([]);
        setFilteredMothers([]);
      }
    }
    
    if (name === 'woredaId') {
      const selectedWoreda = woredas.find(w => w._id === value);
      setSelectedWoredaName(selectedWoreda?.name || '');
      console.log('Selected woreda name:', selectedWoreda?.name);
      
      // Filter hospitals based on selected woreda
      if (value) {
        const hospitalsInWoreda = availableHospitals.filter(hospital => {
          return hospital.woreda === value || hospital.woredaId === value;
        });
        console.log('Hospitals in woreda:', hospitalsInWoreda);
        setFilteredHospitals(hospitalsInWoreda);
        
        // Clear dependent selections
        setFormData(prev => ({
          ...prev,
          healthCenter: '',
          motherId: ''
        }));
        setFilteredMothers([]);
      } else {
        // If no woreda selected, clear hospitals and mothers
        setFilteredHospitals([]);
        setFilteredMothers([]);
      }
    }
    
    if (name === 'healthCenter') {
      // Filter mothers based on selected health center
      if (value) {
        const mothersInFacility = mothers.filter(mother => {
          return mother.healthCenter === value || mother.assignedHealthCenter === value;
        });
        console.log('Mothers in facility:', mothersInFacility);
        setFilteredMothers(mothersInFacility);
        
        // Clear mother selection
        setFormData(prev => ({
          ...prev,
          motherId: ''
        }));
      } else {
        // If no health center selected, clear mothers
        setFilteredMothers([]);
        setFormData(prev => ({
          ...prev,
          motherId: ''
        }));
      }
    }
  };

  const handleHospitalSelect = (hospitalId: string) => {
    const selectedHospital = filteredHospitals.find(h => h._id === hospitalId);
    if (selectedHospital) {
      setUserHospital(selectedHospital);
      setFormData(prev => ({
        ...prev,
        healthCenter: hospitalId
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('=== FORM SUBMIT DEBUG ===');
      console.log('Current formData before validation:', formData);
      
      if (!formData.region) {
        throw new Error('Please select a region first');
      }
      
      if (!formData.woredaId) {
        console.error('woredaId is empty! Available woredas:', woredas);
        throw new Error('Please select a woreda');
      }
      
      if (!formData.healthCenter) {
        if (filteredHospitals.length === 0) {
          throw new Error(`No health centers found in ${selectedWoredaName}. Please contact administrator to add health centers to this woreda.`);
        } else {
          throw new Error('Please select a health center from the available options');
        }
      }

      // Validate that the woredaId is a valid MongoDB ObjectId
      const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
      if (!isValidObjectId(formData.woredaId)) {
        console.error('Invalid woredaId format:', formData.woredaId);
        throw new Error(`Invalid woreda ID format. Received: "${formData.woredaId}"`);
      }

      const motherData = {
        name: formData.name,
        phone: formData.phone,
        age: parseInt(formData.age),
        address: formData.address,
        emergencyContact: formData.emergencyContact || undefined,
        medicalHistory: formData.medicalHistory || undefined,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        gravida: formData.gravida ? parseInt(formData.gravida) : undefined,
        para: formData.para ? parseInt(formData.para) : undefined,
        lmp: formData.lmp || undefined,
        woredaId: formData.woredaId,
        healthCenter: formData.healthCenter,
        registeredBy: currentUser?.name || 'Unknown',
      };

      console.log('Submitting mother data:', JSON.stringify(motherData, null, 2));
      console.log('woredaId being sent:', motherData.woredaId);
      console.log('woredaId type:', typeof motherData.woredaId);

      const result = await mothersApi.create(motherData);
      console.log('API Response:', result);
      
      setSuccess(true);
      setFormData({
        name: '',
        phone: '',
        age: '',
        region: '',
        woredaId: '',
        healthCenter: '',
        motherId: '',
        address: '',
        emergencyContact: '',
        medicalHistory: '',
        expectedDeliveryDate: '',
        gravida: '',
        para: '',
        lmp: '',
      });
      setSelectedWoredaName('');
    } catch (err: any) {
      console.error('Registration error details:', err);
      setError(err.message || 'Failed to register mother');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mother Registered Successfully!</h2>
            <p className="text-gray-600 mb-6">The mother has been registered in the system.</p>
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

            {/* 4-Level Cascading Dropdown Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Facility Assignment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Region Dropdown */}
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                    Region *
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Region</option>
                    {ethiopianRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Woreda Dropdown */}
                <div>
                  <label htmlFor="woredaId" className="block text-sm font-medium text-gray-700 mb-2">
                    Woreda *
                  </label>
                  <select
                    id="woredaId"
                    name="woredaId"
                    value={formData.woredaId}
                    onChange={handleInputChange}
                    required
                    disabled={loadingWoredas || !formData.region}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {!formData.region 
                        ? 'Please select a region first' 
                        : loadingWoredas 
                        ? 'Loading woredas...' 
                        : filteredWoredas.length === 0
                        ? 'No woredas found in this region'
                        : 'Select Woreda'
                      }
                    </option>
                    {filteredWoredas.map((woreda) => (
                      <option key={woreda._id} value={woreda._id}>
                        {woreda.name}
                      </option>
                    ))}
                  </select>
                  {formData.region && filteredWoredas.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      No woredas found in this region. Please check if woredas are properly assigned to regions.
                    </p>
                  )}
                  {formData.region && filteredWoredas.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Found {filteredWoredas.length} woreda(s) in {formData.region}
                    </p>
                  )}
                </div>

                {/* Health Center Dropdown */}
                <div>
                  <label htmlFor="healthCenter" className="block text-sm font-medium text-gray-700 mb-2">
                    Health Center *
                  </label>
                  <select
                    id="healthCenter"
                    name="healthCenter"
                    value={formData.healthCenter}
                    onChange={(e) => handleHospitalSelect(e.target.value)}
                    required
                    disabled={loadingHospitals || !formData.woredaId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {!formData.woredaId 
                        ? 'Please select a woreda first' 
                        : loadingHospitals 
                        ? 'Loading health centers...' 
                        : filteredHospitals.length === 0
                        ? 'No health centers found in this woreda'
                        : 'Select Health Center'
                      }
                    </option>
                    {filteredHospitals.map((hospital) => (
                      <option key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                  {formData.woredaId && filteredHospitals.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      No health centers found in this woreda. Please contact administrator to add health centers to this woreda.
                    </p>
                  )}
                  {formData.woredaId && filteredHospitals.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Found {filteredHospitals.length} health center(s) in {selectedWoredaName}
                    </p>
                  )}
                </div>

                {/* Mother Dropdown */}
                <div>
                  <label htmlFor="motherId" className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Mother (Optional)
                  </label>
                  <select
                    id="motherId"
                    name="motherId"
                    value={formData.motherId}
                    onChange={handleInputChange}
                    disabled={loadingMothers || !formData.healthCenter}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {!formData.healthCenter 
                        ? 'Please select a health center first' 
                        : loadingMothers 
                        ? 'Loading mothers...' 
                        : filteredMothers.length === 0
                        ? 'No mothers found in this facility'
                        : 'Select Existing Mother (Optional)'
                      }
                    </option>
                    {filteredMothers.map((mother) => (
                      <option key={mother._id} value={mother._id}>
                        {mother.name} - {mother.phone}
                      </option>
                    ))}
                  </select>
                  {formData.healthCenter && filteredMothers.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Found {filteredMothers.length} mother(s) in this facility
                    </p>
                  )}
                  {formData.motherId && (
                    <p className="text-xs text-blue-600 mt-1">
                      Selected mother will be updated. Leave blank to register new mother.
                    </p>
                  )}
                </div>
              </div>
            </div>

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

            <div className="flex justify-end space-x-4">
              <a
                href="/healthcare-dashboard"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={loading || loadingWoredas || loadingHospitals}
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