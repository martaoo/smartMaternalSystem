'use client';

import { useState, useEffect } from 'react';
import { mothersApi, pregnancyApi } from '@/lib/healthcare-api';
import { useParams, useRouter } from 'next/navigation';

interface PregnancyFormData {
  motherId: string;
  week: string;
  gestationalAge: string;
  systolicBP: string;
  diastolicBP: string;
  weight: string;
  fundalHeight: string;
  fetalHeartRate: string;
  presentation: string;
  notes: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  symptoms: string;
  medications: string;
  nextVisitDate: string;
  ultrasoundFindings: string;
  complications: string;
  recommendations: string;
  emergency: boolean;
  emergencyReason: string;
  bloodType: string;
}

export default function NewPregnancyVisit() {
  const params = useParams();
  const router = useRouter();
  const motherId = params.motherId as string;
  
  const [formData, setFormData] = useState<PregnancyFormData>({
    motherId: motherId || '',
    week: '',
    gestationalAge: '',
    systolicBP: '',
    diastolicBP: '',
    weight: '',
    fundalHeight: '',
    fetalHeartRate: '',
    presentation: '',
    notes: '',
    riskLevel: 'LOW',
    symptoms: '',
    medications: '',
    nextVisitDate: '',
    ultrasoundFindings: '',
    complications: '',
    recommendations: '',
    emergency: false,
    emergencyReason: '',
    bloodType: '',
  });

  const [selectedMother, setSelectedMother] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMotherData();
  }, []);

  const fetchMotherData = async () => {
    try {
      const data = await mothersApi.getAll();
      const mother = data.find((m: any) => m._id === motherId);
      setSelectedMother(mother);
      if (mother && mother.bloodType) {
        setFormData(prev => ({
          ...prev,
          bloodType: mother.bloodType
        }));
      }
    } catch (err: any) {
      console.error('Error fetching mother:', err);
      setError(err.message || 'Failed to load mother data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const pregnancyData = {
        ...formData,
        week: parseInt(formData.week),
        gestationalAge: parseInt(formData.gestationalAge),
        systolicBP: formData.systolicBP ? parseInt(formData.systolicBP) : undefined,
        diastolicBP: formData.diastolicBP ? parseInt(formData.diastolicBP) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        fundalHeight: formData.fundalHeight ? parseFloat(formData.fundalHeight) : undefined,
        fetalHeartRate: formData.fetalHeartRate ? parseInt(formData.fetalHeartRate) : undefined,
        presentation: formData.presentation || undefined,
        notes: formData.notes || undefined,
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : [],
        medications: formData.medications ? formData.medications.split(',').map(m => m.trim()) : [],
        nextVisitDate: formData.nextVisitDate || undefined,
        ultrasoundFindings: formData.ultrasoundFindings || undefined,
        complications: formData.complications ? formData.complications.split(',').map(c => c.trim()) : [],
        recommendations: formData.recommendations || undefined,
        emergencyReason: formData.emergency ? formData.emergencyReason : undefined,
      };

      await pregnancyApi.create(pregnancyData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to record pregnancy visit');
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pregnancy Visit Recorded!</h2>
            <p className="text-gray-600 mb-6">The pregnancy visit has been successfully recorded.</p>
            <div className="space-y-3">
              <a
                href="/healthcare-dashboard/pregnancy"
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Visits
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
              <h1 className="text-2xl font-bold text-gray-900">New Pregnancy Visit</h1>
              <p className="text-sm text-gray-600">
                Recording visit for {selectedMother?.name || 'selected mother'}
              </p>
            </div>
            <div className="flex space-x-3">
              <a
                href="/healthcare-dashboard/pregnancy/new"
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Mother Selection
              </a>
              <a
                href="/healthcare-dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          /* Pregnancy Form */
          <div className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">❌</span>
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Selected Mother Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mother Information</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Recording visit for:</div>
                      <div className="text-lg font-semibold text-blue-900">
                        {selectedMother?.name} - {selectedMother?.phone}
                      </div>
                      {selectedMother?.bloodType && (
                        <div className="text-sm text-gray-600 mt-1">
                          Blood Type: {selectedMother.bloodType}
                        </div>
                      )}
                    </div>
                                      </div>
                </div>
              </div>

              {/* Pregnancy Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pregnancy Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="week" className="block text-sm font-medium text-gray-700 mb-2">
                      Pregnancy Week *
                    </label>
                    <input
                      type="number"
                      id="week"
                      name="week"
                      value={formData.week}
                      onChange={handleInputChange}
                      required
                      min="1"
                      max="42"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gestationalAge" className="block text-sm font-medium text-gray-700 mb-2">
                      Gestational Age (weeks) *
                    </label>
                    <input
                      type="number"
                      id="gestationalAge"
                      name="gestationalAge"
                      value={formData.gestationalAge}
                      onChange={handleInputChange}
                      required
                      min="1"
                      max="42"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Level *
                    </label>
                    <select
                      id="riskLevel"
                      name="riskLevel"
                      value={formData.riskLevel}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="LOW">Low Risk</option>
                      <option value="MODERATE">Moderate Risk</option>
                      <option value="HIGH">High Risk</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="nextVisitDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Next Visit Date
                    </label>
                    <input
                      type="date"
                      id="nextVisitDate"
                      name="nextVisitDate"
                      value={formData.nextVisitDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label htmlFor="systolicBP" className="block text-sm font-medium text-gray-700 mb-2">
                      Systolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      id="systolicBP"
                      name="systolicBP"
                      value={formData.systolicBP}
                      onChange={handleInputChange}
                      min="80"
                      max="200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="diastolicBP" className="block text-sm font-medium text-gray-700 mb-2">
                      Diastolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      id="diastolicBP"
                      name="diastolicBP"
                      value={formData.diastolicBP}
                      onChange={handleInputChange}
                      min="40"
                      max="130"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      step="0.1"
                      min="30"
                      max="200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="fundalHeight" className="block text-sm font-medium text-gray-700 mb-2">
                      Fundal Height (cm)
                    </label>
                    <input
                      type="number"
                      id="fundalHeight"
                      name="fundalHeight"
                      value={formData.fundalHeight}
                      onChange={handleInputChange}
                      step="0.1"
                      min="10"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="fetalHeartRate" className="block text-sm font-medium text-gray-700 mb-2">
                      Fetal Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      id="fetalHeartRate"
                      name="fetalHeartRate"
                      value={formData.fetalHeartRate}
                      onChange={handleInputChange}
                      min="100"
                      max="180"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="presentation" className="block text-sm font-medium text-gray-700 mb-2">
                      Fetal Presentation
                    </label>
                    <select
                      id="presentation"
                      name="presentation"
                      value={formData.presentation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Presentation</option>
                      <option value="Cephalic">Cephalic</option>
                      <option value="Breech">Breech</option>
                      <option value="Transverse">Transverse</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Clinical Assessment */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Assessment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="symptoms"
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      placeholder="e.g., Nausea, Back pain, Swelling"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-2">
                      Medications (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="medications"
                      name="medications"
                      value={formData.medications}
                      onChange={handleInputChange}
                      placeholder="e.g., Iron supplements, Folic acid"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="ultrasoundFindings" className="block text-sm font-medium text-gray-700 mb-2">
                      Ultrasound Findings
                    </label>
                    <textarea
                      id="ultrasoundFindings"
                      name="ultrasoundFindings"
                      value={formData.ultrasoundFindings}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="complications" className="block text-sm font-medium text-gray-700 mb-2">
                      Complications (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="complications"
                      name="complications"
                      value={formData.complications}
                      onChange={handleInputChange}
                      placeholder="e.g., Anemia, Hypertension, Gestational diabetes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 mb-2">
                      Recommendations
                    </label>
                    <textarea
                      id="recommendations"
                      name="recommendations"
                      value={formData.recommendations}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Assessment</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emergency"
                      name="emergency"
                      checked={formData.emergency}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emergency" className="ml-2 block text-sm font-medium text-gray-700">
                      This is an emergency visit
                    </label>
                  </div>

                  {formData.emergency && (
                    <div>
                      <label htmlFor="emergencyReason" className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Reason *
                      </label>
                      <textarea
                        id="emergencyReason"
                        name="emergencyReason"
                        value={formData.emergencyReason}
                        onChange={handleInputChange}
                        required={formData.emergency}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe the emergency situation..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <a
                  href="/healthcare-dashboard/pregnancy"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {loading ? 'Recording...' : 'Record Visit'}
                </button>
              </div>
            </form>
          </div>
      </main>
    </div>
  );
}
