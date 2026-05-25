'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motherVaccinationsApi, mothersApi } from '@/lib/healthcare-api';
import { MATERNAL_TD_VACCINES } from '@/lib/maternal-vaccines';

interface Mother {
  _id: string;
  name: string;
  phone: string;
  age: number;
  address: string;
  status: 'ACTIVE' | 'DELIVERED' | 'INACTIVE';
  healthCenter: { name: string; type: string };
  highRisk: boolean;
}

interface MotherVaccineRecord {
  _id: string;
  vaccineName: string;
  doseNumber: number;
  status: 'SCHEDULED' | 'ADMINISTERED' | 'MISSED';
  scheduledDate?: string;
  administeredDate?: string;
  notes?: string;
  batchNumber?: string;
  hospitalId?: string;
}

interface MotherVaccinationSchedule {
  motherId: string;
  vaccines: MotherVaccineRecord[];
  vaccineSchedule: any[];
  nextAppointment?: {
    doseNumber: number;
    vaccineName: string;
    scheduledDate: string;
    label: string;
  };
  warnings: string[];
}

export default function MotherVaccinationDetails() {
  const params = useParams();
  const router = useRouter();
  const motherId = params.id as string;

  const [mother, setMother] = useState<Mother | null>(null);
  const [schedule, setSchedule] = useState<MotherVaccinationSchedule | null>(null);
  const [history, setHistory] = useState<MotherVaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    doseNumber: 1,
    administeredDate: new Date().toISOString().split('T')[0],
    batchNumber: '',
    notes: '',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (motherId) {
      fetchData();
    }
  }, [motherId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [motherData, scheduleData, historyData] = await Promise.all([
        mothersApi.getById(motherId),
        motherVaccinationsApi.getSchedule(motherId),
        motherVaccinationsApi.getHistory(motherId),
      ]);
      setMother(motherData);
      setSchedule(scheduleData);
      setHistory(historyData || []);
    } catch (err: any) {
      console.error('Error loading mother vaccination details:', err);
      setError(err?.message || 'Unable to load mother vaccination details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ADMINISTERED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'MISSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!motherId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await motherVaccinationsApi.recordDose({
        motherId,
        doseNumber: Number(form.doseNumber),
        administeredDate: form.administeredDate,
        batchNumber: form.batchNumber || undefined,
        notes: form.notes || undefined,
      });

      setSuccessMessage(`TD${form.doseNumber} recorded successfully.`);
      setForm(prev => ({
        ...prev,
        batchNumber: '',
        notes: '',
      }));
      await fetchData();
    } catch (err: any) {
      console.error('Error recording maternal vaccination:', err);
      setError(err?.message || 'Unable to record the vaccination dose');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mother vaccination data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
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

  if (!mother) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👩</div>
          <p className="text-gray-600">Mother profile not found.</p>
          <button
            onClick={() => router.push('/healthcare-dashboard/mothers')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Mothers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mother Vaccinations</h1>
              <p className="text-sm text-gray-600">TD vaccination schedule and records for {mother.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/healthcare-dashboard/mothers/${motherId}`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Mother Profile
              </a>
              <a
                href={`/healthcare-dashboard/mothers`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Back to Mothers
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Mother details</h2>
            <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Name:</span> {mother.name}</p>
            <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Phone:</span> {mother.phone || '-'}</p>
            <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Age:</span> {mother.age || '-'}</p>
            <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Health center:</span> {mother.healthCenter?.name || '-'}</p>
            <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Location:</span> {mother.address || '-'}</p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Status:</span>{' '}
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${mother.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : mother.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {mother.status}
              </span>
            </p>
            {mother.highRisk && (
              <p className="text-sm text-red-700 mt-2">High-risk pregnancy - vaccination should be tracked carefully.</p>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Upcoming schedule</h2>
                <p className="text-sm text-gray-600">Next TD appointment and warnings</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Next vaccination</p>
                {schedule?.nextAppointment ? (
                  <div className="mt-2">
                    <p className="text-xl font-semibold text-gray-900">{schedule.nextAppointment.label}</p>
                    <p className="text-sm text-gray-600">{schedule.nextAppointment.vaccineName}</p>
                    <p className="mt-1 text-sm text-gray-700">{formatDate(schedule.nextAppointment.scheduledDate)}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-gray-600">No upcoming dose scheduled yet.</p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Warnings</p>
                {schedule?.warnings?.length ? (
                  <ul className="mt-2 space-y-2 list-disc list-inside text-sm text-gray-700">
                    {schedule.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-gray-600">No warnings at this time.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Maternal vaccination schedule</h2>
              <p className="text-sm text-gray-600">Scheduled and administered TD doses for this mother.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule?.vaccines?.length ? (
                    schedule.vaccines.map(record => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TD{record.doseNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(record.scheduledDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(record.administeredDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.batchNumber || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        No maternal vaccination schedule available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Record TD dose</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dose number</label>
                <select
                  value={form.doseNumber}
                  onChange={(event) => setForm(prev => ({ ...prev, doseNumber: Number(event.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {MATERNAL_TD_VACCINES.map(v => (
                    <option key={v.code} value={v.doseNumber}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Administered date</label>
                <input
                  type="date"
                  value={form.administeredDate}
                  onChange={(event) => setForm(prev => ({ ...prev, administeredDate: event.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Batch number</label>
                <input
                  type="text"
                  value={form.batchNumber}
                  onChange={(event) => setForm(prev => ({ ...prev, batchNumber: event.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm(prev => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Recording...' : 'Record TD Dose'}
              </button>

              {successMessage && (
                <p className="text-sm text-green-700">{successMessage}</p>
              )}
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Administered history</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.length ? (
                  history.map(record => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TD{record.doseNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(record.administeredDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.batchNumber || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      No administered doses recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
