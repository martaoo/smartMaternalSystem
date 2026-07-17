'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vaccinationsApi, childrenApi } from '@/lib/healthcare-api';

interface VaccinationRecord {
  _id: string;
  childId: {
    _id: string;
    name: string;
    birthDate: string;
    motherId?: { name: string; phone: string };
  };
  vaccineId: {
    _id: string;
    name: string;
    code: string;
    category: string;
    recommendedAge: string;
  };
  doseNumber: number;
  scheduledDate: string;
  administeredDate?: string;
  status: 'SCHEDULED' | 'ADMINISTERED' | 'MISSED' | 'DEFERRED' | 'CONTRAINDICATED';
  administeredBy?: { name: string; role: string };
  batchNumber?: string;
  manufacturer?: string;
  injectionSite?: string;
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

interface AdministerForm {
  administeredDate: string;
  nextScheduledDate: string;
  batchNumber: string;
  manufacturer: string;
  injectionSite: string;
  notes: string;
}

export default function ChildVaccinations() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;

  const [child, setChild] = useState<any>(null);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [allVaccines, setAllVaccines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Administer modal
  const [showAdministerModal, setShowAdministerModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VaccinationRecord | null>(null);
  const [administerForm, setAdministerForm] = useState<AdministerForm>({
    administeredDate: new Date().toISOString().split('T')[0],
    nextScheduledDate: '',
    batchNumber: '',
    manufacturer: '',
    injectionSite: 'Left Thigh',
    notes: '',
  });
  const [administerLoading, setAdministerLoading] = useState(false);
  const [administerError, setAdministerError] = useState<string | null>(null);

  // Add new vaccination modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    vaccineId: '',
    doseNumber: '1',
    scheduledDate: '',
    administeredDate: new Date().toISOString().split('T')[0],
    nextScheduledDate: '',
    batchNumber: '',
    manufacturer: '',
    injectionSite: 'Left Thigh',
    notes: '',
    status: 'ADMINISTERED' as 'ADMINISTERED' | 'SCHEDULED',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Auto-calculate next vaccination date
  const calculateNextVaccinationDate = (vaccineId: string, administeredDate: string, currentDose: string) => {
    if (!vaccineId || !administeredDate) return '';
    
    const vaccine = allVaccines.find(v => v._id === vaccineId);
    if (!vaccine) return '';
    
    const doseNumber = parseInt(currentDose);
    if (doseNumber >= vaccine.dosesRequired) return ''; // No next dose needed
    
    const administered = new Date(administeredDate);
    const intervalWeeks = vaccine.intervalWeeks || 4; // Default 4 weeks
    const nextDate = new Date(administered);
    nextDate.setDate(nextDate.getDate() + (intervalWeeks * 7));
    
    return nextDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Handle vaccine selection change
  const handleVaccineChange = (vaccineId: string) => {
    setAddForm(p => ({ ...p, vaccineId }));
    
    // Auto-calculate next dose date if status is ADMINISTERED
    if (addForm.status === 'ADMINISTERED' && addForm.administeredDate) {
      const nextDate = calculateNextVaccinationDate(vaccineId, addForm.administeredDate, addForm.doseNumber);
      setAddForm(p => ({ ...p, nextScheduledDate: nextDate }));
    }
  };

  // Handle administered date change
  const handleAdministeredDateChange = (date: string) => {
    setAddForm(p => ({ ...p, administeredDate: date }));
    
    // Auto-calculate next dose date if status is ADMINISTERED and vaccine is selected
    if (addForm.status === 'ADMINISTERED' && addForm.vaccineId) {
      const nextDate = calculateNextVaccinationDate(addForm.vaccineId, date, addForm.doseNumber);
      setAddForm(p => ({ ...p, nextScheduledDate: nextDate }));
    }
  };

  // Handle dose number change
  const handleDoseNumberChange = (doseNumber: string) => {
    setAddForm(p => ({ ...p, doseNumber }));
    
    // Auto-calculate next dose date if status is ADMINISTERED
    if (addForm.status === 'ADMINISTERED' && addForm.vaccineId && addForm.administeredDate) {
      const nextDate = calculateNextVaccinationDate(addForm.vaccineId, addForm.administeredDate, doseNumber);
      setAddForm(p => ({ ...p, nextScheduledDate: nextDate }));
    }
  };

  useEffect(() => {
    if (childId) fetchData();
  }, [childId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [childData, vaccinationData, vaccineList] = await Promise.all([
        childrenApi.getById(childId),
        vaccinationsApi.getVaccinationRecordsByChild(childId),
        vaccinationsApi.getAllVaccines().catch(() => []),
      ]);
      setChild(childData);
      setVaccinationRecords(vaccinationData);
      setAllVaccines(Array.isArray(vaccineList) ? vaccineList : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load vaccination data');
    } finally {
      setLoading(false);
    }
  };

  const openAdministerModal = (record: VaccinationRecord) => {
    setSelectedRecord(record);
    setAdministerForm({
      administeredDate: new Date().toISOString().split('T')[0],
      nextScheduledDate: '',
      batchNumber: '',
      manufacturer: '',
      injectionSite: 'Left Thigh',
      notes: '',
    });
    setAdministerError(null);
    setShowAdministerModal(true);
  };

  const handleAdminister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setAdministerLoading(true);
    setAdministerError(null);
    try {
      await vaccinationsApi.markVaccinationAdministered(selectedRecord._id, {
        administeredDate: administerForm.administeredDate,
        batchNumber: administerForm.batchNumber || undefined,
        manufacturer: administerForm.manufacturer || undefined,
        injectionSite: administerForm.injectionSite || undefined,
        notes: administerForm.notes || undefined,
      });

      // If health worker set a next dose date, create a new scheduled record
      if (administerForm.nextScheduledDate) {
        await vaccinationsApi.createVaccinationRecord({
          childId,
          vaccineId: selectedRecord.vaccineId._id,
          doseNumber: selectedRecord.doseNumber + 1,
          scheduledDate: administerForm.nextScheduledDate,
          status: 'SCHEDULED',
        });
      }

      setShowAdministerModal(false);
      await fetchData();
    } catch (err: any) {
      setAdministerError(err.message || 'Failed to record vaccination');
    } finally {
      setAdministerLoading(false);
    }
  };

  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.vaccineId) { setAddError('Please select a vaccine.'); return; }
    setAddLoading(true);
    setAddError(null);
    try {
      await vaccinationsApi.createVaccinationRecord({
        childId,
        vaccineId: addForm.vaccineId,
        doseNumber: parseInt(addForm.doseNumber),
        scheduledDate: addForm.status === 'SCHEDULED' ? addForm.scheduledDate : addForm.administeredDate,
        administeredDate: addForm.status === 'ADMINISTERED' ? addForm.administeredDate : undefined,
        status: addForm.status,
        batchNumber: addForm.batchNumber || undefined,
        manufacturer: addForm.manufacturer || undefined,
        injectionSite: addForm.injectionSite || undefined,
        notes: addForm.notes || undefined,
      });

      // If next dose date provided, create a scheduled follow-up
      if (addForm.nextScheduledDate && addForm.status === 'ADMINISTERED') {
        await vaccinationsApi.createVaccinationRecord({
          childId,
          vaccineId: addForm.vaccineId,
          doseNumber: parseInt(addForm.doseNumber) + 1,
          scheduledDate: addForm.nextScheduledDate,
          status: 'SCHEDULED',
        });
      }

      setShowAddModal(false);
      setAddForm({
        vaccineId: '', doseNumber: '1', scheduledDate: '',
        administeredDate: new Date().toISOString().split('T')[0],
        nextScheduledDate: '', batchNumber: '', manufacturer: '',
        injectionSite: 'Left Thigh', notes: '', status: 'ADMINISTERED',
      });
      await fetchData();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add vaccination');
    } finally {
      setAddLoading(false);
    }
  };

  const handleMarkMissed = async (recordId: string) => {
    const reason = prompt('Reason for missed vaccination:');
    if (!reason) return;
    try {
      await vaccinationsApi.markVaccinationMissed(recordId, reason);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to mark as missed');
    }
  };

  const calculateAge = (birthDate: string) => {
    const days = Math.floor((Date.now() - new Date(birthDate).getTime()) / 86400000);
    if (days < 28) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    const y = Math.floor(days / 365);
    return `${y}y ${Math.floor((days % 365) / 30)}m`;
  };

  const statusColor = (s: string) => ({
    ADMINISTERED: 'bg-green-100 text-green-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
    MISSED: 'bg-red-100 text-red-800',
    DEFERRED: 'bg-yellow-100 text-yellow-800',
    CONTRAINDICATED: 'bg-gray-100 text-gray-800',
  }[s] ?? 'bg-gray-100 text-gray-800');

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (error || !child) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-lg mb-4">{error || 'Child not found'}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
      </div>
    </div>
  );

  const administered = vaccinationRecords.filter(r => r.status === 'ADMINISTERED').length;
  const scheduled = vaccinationRecords.filter(r => r.status === 'SCHEDULED').length;
  const missed = vaccinationRecords.filter(r => r.status === 'MISSED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center py-4 gap-y-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Child Vaccinations</h1>
              <p className="text-sm text-gray-600">
                {child.name} — {calculateAge(child.birthDate)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                + Add Vaccination
              </button>
              <a href={`/healthcare-dashboard/children/${childId}`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                Back to Child
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Child info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{child.name}</h2>
              <p className="text-sm text-gray-600">
                {calculateAge(child.birthDate)} · {child.gender === 'MALE' ? 'Male' : 'Female'}
              </p>
              <p className="text-sm text-gray-600">
                Mother: {child.motherId?.name ?? '—'} · {child.motherId?.phone ?? '—'}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              child.healthStatus === 'HEALTHY' ? 'bg-green-100 text-green-800' :
              child.healthStatus === 'NEEDS_ATTENTION' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {child.healthStatus?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500 text-center">
            <p className="text-2xl font-bold text-gray-900">{administered}</p>
            <p className="text-sm text-gray-500">Administered</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500 text-center">
            <p className="text-2xl font-bold text-gray-900">{scheduled}</p>
            <p className="text-sm text-gray-500">Scheduled</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500 text-center">
            <p className="text-2xl font-bold text-gray-900">{missed}</p>
            <p className="text-sm text-gray-500">Missed</p>
          </div>
        </div>

        {/* Records table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Vaccination Records</h2>
          </div>
          {vaccinationRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-2">No vaccination records yet</p>
              <button onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                Add First Vaccination
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Vaccine', 'Dose', 'Scheduled', 'Administered', 'Next Dose', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vaccinationRecords.map(record => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">{record.vaccineId?.name ?? '—'}</p>
                        <p className="text-xs text-gray-500">{record.vaccineId?.code ?? ''}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Dose {record.doseNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.scheduledDate ? new Date(record.scheduledDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.administeredDate ? new Date(record.administeredDate).toLocaleDateString() : '—'}
                        {record.batchNumber && <p className="text-xs text-gray-400">Batch: {record.batchNumber}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.followUpDate ? (
                          <span className="text-blue-600">{new Date(record.followUpDate).toLocaleDateString()}</span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {record.status === 'SCHEDULED' && (
                            <>
                              <button onClick={() => openAdministerModal(record)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                Administer
                              </button>
                              <button onClick={() => handleMarkMissed(record._id)}
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
                                Missed
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Administer Modal ── */}
      {showAdministerModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Record Vaccination</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedRecord.vaccineId?.name} — Dose {selectedRecord.doseNumber}
            </p>
            {administerError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">❌ {administerError}</div>
            )}
            <form onSubmit={handleAdminister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Administered *</label>
                <input type="date" required value={administerForm.administeredDate}
                  onChange={e => setAdministerForm(p => ({ ...p, administeredDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Dose Date <span className="text-gray-400 font-normal">(optional — leave blank if no next dose)</span>
                </label>
                <input type="date" value={administerForm.nextScheduledDate}
                  onChange={e => setAdministerForm(p => ({ ...p, nextScheduledDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">If set, a new scheduled record will be created for the next dose.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input type="text" value={administerForm.batchNumber}
                    onChange={e => setAdministerForm(p => ({ ...p, batchNumber: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Injection Site</label>
                  <select value={administerForm.injectionSite}
                    onChange={e => setAdministerForm(p => ({ ...p, injectionSite: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option>Left Thigh</option>
                    <option>Right Thigh</option>
                    <option>Left Arm</option>
                    <option>Right Arm</option>
                    <option>Oral</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} value={administerForm.notes}
                  onChange={e => setAdministerForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={administerLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60">
                  {administerLoading ? 'Saving…' : '✓ Save Record'}
                </button>
                <button type="button" onClick={() => setShowAdministerModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Vaccination Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Vaccination Record</h3>
            {addError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">❌ {addError}</div>
            )}
            <form onSubmit={handleAddVaccination} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine *</label>
                  <select required value={addForm.vaccineId}
                    onChange={e => handleVaccineChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="">Select vaccine…</option>
                    {allVaccines.map((v: any) => (
                      <option key={v._id} value={v._id}>{v.name} ({v.code})</option>
                    ))}
                  </select>
                  {addForm.vaccineId && (() => {
                    const vaccine = allVaccines.find(v => v._id === addForm.vaccineId);
                    return vaccine ? (
                      <p className="text-xs text-gray-500 mt-1">
                        💉 {vaccine.dosesRequired} doses required, {vaccine.intervalWeeks || 4} weeks apart
                      </p>
                    ) : null;
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dose Number *</label>
                  <input type="number" required min="1" max="10" value={addForm.doseNumber}
                    onChange={e => handleDoseNumberChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select value={addForm.status}
                    onChange={e => setAddForm(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="ADMINISTERED">Administered (given today)</option>
                    <option value="SCHEDULED">Scheduled (future date)</option>
                  </select>
                </div>
                {addForm.status === 'ADMINISTERED' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Administered *</label>
                    <input type="date" required value={addForm.administeredDate}
                      onChange={e => handleAdministeredDateChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                    <input type="date" required value={addForm.scheduledDate}
                      onChange={e => setAddForm(p => ({ ...p, scheduledDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Vaccination Date <span className="text-gray-400 font-normal">
                      {addForm.status === 'ADMINISTERED' ? '(recommended for next dose)' : '(if this is part of a series)'}
                    </span>
                  </label>
                  <input type="date" value={addForm.nextScheduledDate}
                    onChange={e => setAddForm(p => ({ ...p, nextScheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  {addForm.status === 'ADMINISTERED' && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Recommended: Calculate based on vaccine schedule (usually 4-8 weeks apart)
                    </p>
                  )}
                  {addForm.status === 'SCHEDULED' && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Optional: Only if this vaccination has follow-up doses
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input type="text" value={addForm.batchNumber}
                    onChange={e => setAddForm(p => ({ ...p, batchNumber: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Injection Site</label>
                  <select value={addForm.injectionSite}
                    onChange={e => setAddForm(p => ({ ...p, injectionSite: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option>Left Thigh</option>
                    <option>Right Thigh</option>
                    <option>Left Arm</option>
                    <option>Right Arm</option>
                    <option>Oral</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea rows={2} value={addForm.notes}
                    onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60">
                  {addLoading ? 'Saving…' : 'Save Vaccination'}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setAddError(null); }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
