'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { childrenApi } from '@/lib/healthcare-api';

interface GrowthFormData {
  ageMonths: string;
  weight: string;
  height: string;
  headCircumference: string;
  chestCircumference: string;
  muac: string;
  growthStatus: 'SEVERE_UNDERWEIGHT' | 'MODERATE_UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE';
  heightStatus: 'SEVERE_STUNTING' | 'MODERATE_STUNTING' | 'NORMAL' | 'TALL';
  weightStatus: 'SEVERE_WASTING' | 'MODERATE_WASTING' | 'NORMAL' | 'OVERWEIGHT';
  muacStatus: 'RED' | 'YELLOW' | 'GREEN';
  feedingPattern: string;
  developmentalMilestones: string;
  immunizationsReceived: string;
  healthConcerns: string;
  recommendations: string;
  followUpDate: string;
  notes: string;
}

export default function GrowthTracking() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;

  const [formData, setFormData] = useState<GrowthFormData>({
    ageMonths: '',
    weight: '',
    height: '',
    headCircumference: '',
    chestCircumference: '',
    muac: '',
    growthStatus: 'NORMAL',
    heightStatus: 'NORMAL',
    weightStatus: 'NORMAL',
    muacStatus: 'GREEN',
    feedingPattern: '',
    developmentalMilestones: '',
    immunizationsReceived: '',
    healthConcerns: '',
    recommendations: '',
    followUpDate: '',
    notes: '',
  });

  const [child, setChild] = useState<any>(null);
  const [growthHistory, setGrowthHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (childId) {
      fetchChildData();
      fetchGrowthHistory();
    }
  }, [childId]);

  const fetchChildData = async () => {
    try {
      const data = await childrenApi.getById(childId);
      setChild(data);
    } catch (err) {
      console.error('Error fetching child:', err);
      setError('Failed to load child data');
    }
  };

  const fetchGrowthHistory = async () => {
    try {
      const data = await childrenApi.getGrowthRecords(childId);
      setGrowthHistory(data);
    } catch (err) {
      console.error('Error fetching growth history:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const growthData = {
        ...formData,
        ageMonths: parseInt(formData.ageMonths),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        headCircumference: formData.headCircumference ? parseFloat(formData.headCircumference) : undefined,
        chestCircumference: formData.chestCircumference ? parseFloat(formData.chestCircumference) : undefined,
        muac: formData.muac ? parseFloat(formData.muac) : undefined,
        developmentalMilestones: formData.developmentalMilestones ? formData.developmentalMilestones.split(',').map(m => m.trim()) : [],
        immunizationsReceived: formData.immunizationsReceived ? formData.immunizationsReceived.split(',').map(i => i.trim()) : [],
        healthConcerns: formData.healthConcerns ? formData.healthConcerns.split(',').map(h => h.trim()) : [],
        followUpDate: formData.followUpDate || undefined,
      };

      await childrenApi.createGrowthRecord(childId, growthData);
      setSuccess(true);
      setFormData({
        ageMonths: '',
        weight: '',
        height: '',
        headCircumference: '',
        chestCircumference: '',
        muac: '',
        growthStatus: 'NORMAL',
        heightStatus: 'NORMAL',
        weightStatus: 'NORMAL',
        muacStatus: 'GREEN',
        feedingPattern: '',
        developmentalMilestones: '',
        immunizationsReceived: '',
        healthConcerns: '',
        recommendations: '',
        followUpDate: '',
        notes: '',
      });
      fetchGrowthHistory(); // Refresh the history
    } catch (err: any) {
      setError(err.message || 'Failed to record growth measurement');
    } finally {
      setLoading(false);
    }
  };

  if (error && !child) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">error</div>
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">growth</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Growth Record Added!</h2>
            <p className="text-gray-600 mb-6">The growth measurement has been successfully recorded.</p>
            <div className="space-y-3">
              <button
                onClick={() => setSuccess(false)}
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Another Measurement
              </button>
              <a
                href={`/healthcare-dashboard/children/${childId}`}
                className="block w-full px-4 py-2 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition-colors"
              >
                View Child Details
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
              <h1 className="text-2xl font-bold text-gray-900">Growth Tracking</h1>
              <p className="text-sm text-gray-600">
                {child ? `Record growth for ${child.name}` : 'Loading...'}
              </p>
            </div>
            <a
              href={`/healthcare-dashboard/children/${childId}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Child
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Growth Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">error</span>
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Measurements */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Measurements</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="ageMonths" className="block text-sm font-medium text-gray-700 mb-2">
                        Age (months) *
                      </label>
                      <input
                        type="number"
                        id="ageMonths"
                        name="ageMonths"
                        value={formData.ageMonths}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="60"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg) *
                      </label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        required
                        step="0.1"
                        min="1"
                        max="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm) *
                      </label>
                      <input
                        type="number"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        required
                        step="0.1"
                        min="30"
                        max="150"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="headCircumference" className="block text-sm font-medium text-gray-700 mb-2">
                        Head Circumference (cm)
                      </label>
                      <input
                        type="number"
                        id="headCircumference"
                        name="headCircumference"
                        value={formData.headCircumference}
                        onChange={handleInputChange}
                        step="0.1"
                        min="20"
                        max="60"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="chestCircumference" className="block text-sm font-medium text-gray-700 mb-2">
                        Chest Circumference (cm)
                      </label>
                      <input
                        type="number"
                        id="chestCircumference"
                        name="chestCircumference"
                        value={formData.chestCircumference}
                        onChange={handleInputChange}
                        step="0.1"
                        min="20"
                        max="80"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="muac" className="block text-sm font-medium text-gray-700 mb-2">
                        MUAC (cm)
                      </label>
                      <input
                        type="number"
                        id="muac"
                        name="muac"
                        value={formData.muac}
                        onChange={handleInputChange}
                        step="0.1"
                        min="8"
                        max="25"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Growth Assessment */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Growth Assessment</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="growthStatus" className="block text-sm font-medium text-gray-700 mb-2">
                        Growth Status *
                      </label>
                      <select
                        id="growthStatus"
                        name="growthStatus"
                        value={formData.growthStatus}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="SEVERE_UNDERWEIGHT">Severely Underweight</option>
                        <option value="MODERATE_UNDERWEIGHT">Moderately Underweight</option>
                        <option value="NORMAL">Normal</option>
                        <option value="OVERWEIGHT">Overweight</option>
                        <option value="OBESE">Obese</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="heightStatus" className="block text-sm font-medium text-gray-700 mb-2">
                        Height Status *
                      </label>
                      <select
                        id="heightStatus"
                        name="heightStatus"
                        value={formData.heightStatus}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="SEVERE_STUNTING">Severe Stunting</option>
                        <option value="MODERATE_STUNTING">Moderate Stunting</option>
                        <option value="NORMAL">Normal</option>
                        <option value="TALL">Tall</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="weightStatus" className="block text-sm font-medium text-gray-700 mb-2">
                        Weight Status *
                      </label>
                      <select
                        id="weightStatus"
                        name="weightStatus"
                        value={formData.weightStatus}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="SEVERE_WASTING">Severe Wasting</option>
                        <option value="MODERATE_WASTING">Moderate Wasting</option>
                        <option value="NORMAL">Normal</option>
                        <option value="OVERWEIGHT">Overweight</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="muacStatus" className="block text-sm font-medium text-gray-700 mb-2">
                        MUAC Status *
                      </label>
                      <select
                        id="muacStatus"
                        name="muacStatus"
                        value={formData.muacStatus}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="RED">Red (Severe)</option>
                        <option value="YELLOW">Yellow (Moderate)</option>
                        <option value="GREEN">Green (Normal)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Development Assessment */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Development Assessment</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="feedingPattern" className="block text-sm font-medium text-gray-700 mb-2">
                        Feeding Pattern
                      </label>
                      <input
                        type="text"
                        id="feedingPattern"
                        name="feedingPattern"
                        value={formData.feedingPattern}
                        onChange={handleInputChange}
                        placeholder="e.g., Exclusive breastfeeding, Mixed feeding"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        id="followUpDate"
                        name="followUpDate"
                        value={formData.followUpDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="developmentalMilestones" className="block text-sm font-medium text-gray-700 mb-2">
                        Developmental Milestones (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="developmentalMilestones"
                        name="developmentalMilestones"
                        value={formData.developmentalMilestones}
                        onChange={handleInputChange}
                        placeholder="e.g., Can sit without support, Babbling"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="immunizationsReceived" className="block text-sm font-medium text-gray-700 mb-2">
                        Immunizations Received (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="immunizationsReceived"
                        name="immunizationsReceived"
                        value={formData.immunizationsReceived}
                        onChange={handleInputChange}
                        placeholder="e.g., BCG, OPV 1, DTP 1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="healthConcerns" className="block text-sm font-medium text-gray-700 mb-2">
                        Health Concerns (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="healthConcerns"
                        name="healthConcerns"
                        value={formData.healthConcerns}
                        onChange={handleInputChange}
                        placeholder="e.g., Mild fever, Diaper rash"
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

                    <div className="md:col-span-2">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <a
                    href={`/healthcare-dashboard/children/${childId}`}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </a>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                  >
                    {loading ? 'Recording...' : 'Record Growth'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Growth History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Growth History</h2>
              {growthHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">growth</div>
                  <p className="text-gray-600">No growth records yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {growthHistory.map((record) => (
                    <div key={record._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.ageMonths} months
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(record.measurementDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {record.weight} kg
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.height} cm
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.growthStatus === 'NORMAL' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.growthStatus.replace('_', ' ')}
                        </span>
                        {record.needsFollowUp && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Follow-up
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
