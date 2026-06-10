'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motherVaccinationsApi, mothersApi } from '@/lib/healthcare-api';
import { MATERNAL_TD_VACCINES } from '@/lib/maternal-vaccines';

interface Mother {
  _id: string; name: string; phone: string; age: number;
  address: string; status: 'ACTIVE' | 'DELIVERED' | 'INACTIVE';
  healthCenter: { name: string; type: string }; highRisk: boolean; lmp?: string;
}
interface MotherVaccineRecord {
  _id: string; vaccineName: string; doseNumber: number;
  status: 'SCHEDULED' | 'ADMINISTERED' | 'MISSED';
  scheduledDate?: string; administeredDate?: string;
  notes?: string; batchNumber?: string; injectionSite?: string;
}
interface MotherVaccinationSchedule {
  motherId: string; vaccines: MotherVaccineRecord[]; vaccineSchedule: any[];
  nextAppointment?: { doseNumber: number; vaccineName: string; scheduledDate: string; label: string };
  warnings: string[];
}

const TD_BLOCKS = [
  { number: 1, name: 'Block 1: TD1 — Initial Dose',        description: 'First tetanus toxoid dose. Provides initial protection against tetanus for mother and newborn.', doses: [1] },
  { number: 2, name: 'Block 2: TD2 — Early Booster',       description: 'Second dose given 4 weeks after TD1. Provides 3 years of protection.',                          doses: [2] },
  { number: 3, name: 'Block 3: TD3 — Extended Protection', description: 'Third dose given 6 months after TD2. Provides 5 years of protection.',                          doses: [3] },
  { number: 4, name: 'Block 4: TD4 — Long-term Immunity',  description: 'Fourth dose given 1 year after TD3. Provides 10 years of protection.',                          doses: [4] },
  { number: 5, name: 'Block 5: TD5 — Lifetime Protection', description: 'Fifth dose given 1 year after TD4. Provides lifetime protection.',                               doses: [5] },
];

const isResolved = (s: string) => s === 'ADMINISTERED' || s === 'MISSED';

const getBlockStatus = (blockNum: number, records: MotherVaccineRecord[]) => {
  for (let b = 1; b < blockNum; b++) {
    const block = TD_BLOCKS.find(bl => bl.number === b);
    if (!block) continue;
    const prev = records.filter(r => block.doses.includes(r.doseNumber));
    if (prev.length === 0 || prev.filter(r => isResolved(r.status)).length < prev.length) return 'LOCKED';
  }
  const block = TD_BLOCKS.find(bl => bl.number === blockNum);
  if (!block) return 'LOCKED';
  const br = records.filter(r => block.doses.includes(r.doseNumber));
  if (br.length === 0) return 'READY';
  const done = br.filter(r => isResolved(r.status)).length;
  if (done === br.length) return 'COMPLETED';
  if (done > 0) return 'IN_PROGRESS';
  return 'READY';
};

const statusColor = (s: string) => ({
  ADMINISTERED: 'bg-green-100 text-green-800 border-green-200',
  SCHEDULED:    'bg-blue-100 text-blue-800 border-blue-200',
  MISSED:       'bg-red-100 text-red-800 border-red-200',
}[s] ?? 'bg-gray-100 text-gray-800 border-gray-200');

export default function MotherVaccinationDetails() {
  const params = useParams();
  const router = useRouter();
  const motherId = params.id as string;
  const tomorrowStr = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

  const [mother,   setMother]   = useState<Mother | null>(null);
  const [schedule, setSchedule] = useState<MotherVaccinationSchedule | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // ── Administer modal (same fields as child) ──────────────────────────────
  const [showAdministerModal, setShowAdministerModal] = useState(false);
  const [selectedDose,        setSelectedDose]        = useState<number>(1);
  const [selectedRecord,      setSelectedRecord]      = useState<MotherVaccineRecord | null>(null);
  const [adminForm, setAdminForm] = useState({
    administeredDate: new Date().toISOString().split('T')[0],
    nextScheduledDate: '',
    batchNumber: '',
    injectionSite: 'Left Arm',
    notes: '',
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError,   setAdminError]   = useState<string | null>(null);

  // ── Add TD Dose modal (same as child Add Vaccination modal) ──────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    doseNumber: '1',
    status: 'ADMINISTERED' as 'ADMINISTERED' | 'SCHEDULED',
    administeredDate: new Date().toISOString().split('T')[0],
    scheduledDate: '',
    nextScheduledDate: '',
    batchNumber: '',
    injectionSite: 'Left Arm',
    notes: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError,   setAddError]   = useState<string | null>(null);

  useEffect(() => { if (motherId) fetchData(); }, [motherId]);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const [motherData, scheduleData] = await Promise.all([
        mothersApi.getById(motherId),
        motherVaccinationsApi.getSchedule(motherId),
      ]);
      setMother(motherData);
      setSchedule(scheduleData);
    } catch (err: any) {
      setError(err?.message || 'Unable to load mother vaccination details');
    } finally { setLoading(false); }
  };

  const openAdministerModal = (record: MotherVaccineRecord) => {
    setSelectedRecord(record);
    setSelectedDose(record.doseNumber);
    setAdminForm({ administeredDate: new Date().toISOString().split('T')[0], nextScheduledDate: '', batchNumber: '', injectionSite: 'Left Arm', notes: '' });
    setAdminError(null);
    setShowAdministerModal(true);
  };

  const handleAdminister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminForm.nextScheduledDate) {
      const next = new Date(adminForm.nextScheduledDate);
      const today = new Date(); today.setHours(0,0,0,0);
      if (next <= today) { setAdminError('Next dose date must be in the future.'); return; }
    }
    setAdminLoading(true); setAdminError(null);
    try {
      await motherVaccinationsApi.recordDose({
        motherId, doseNumber: selectedDose,
        administeredDate: adminForm.administeredDate,
        batchNumber: adminForm.batchNumber || undefined,
        notes: adminForm.notes ? `[Site: ${adminForm.injectionSite}] ${adminForm.notes}` : `[Site: ${adminForm.injectionSite}]`,
      });
      // If next dose date set, schedule it
      if (adminForm.nextScheduledDate) {
        await motherVaccinationsApi.recordDose({
          motherId, doseNumber: selectedDose + 1,
          administeredDate: adminForm.nextScheduledDate,
          notes: 'Scheduled',
        });
      }
      setShowAdministerModal(false);
      await fetchData();
    } catch (err: any) {
      setAdminError(err?.message || 'Failed to record vaccination');
    } finally { setAdminLoading(false); }
  };

  const handleAddDose = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date(); today.setHours(0,0,0,0);
    if (addForm.status === 'SCHEDULED' && addForm.scheduledDate) {
      if (new Date(addForm.scheduledDate) <= today) { setAddError('Scheduled date must be in the future.'); return; }
    }
    if (addForm.nextScheduledDate && new Date(addForm.nextScheduledDate) <= today) {
      setAddError('Next dose date must be in the future.'); return;
    }
    setAddLoading(true); setAddError(null);
    try {
      await motherVaccinationsApi.recordDose({
        motherId,
        doseNumber: parseInt(addForm.doseNumber),
        administeredDate: addForm.status === 'ADMINISTERED' ? addForm.administeredDate : addForm.scheduledDate,
        batchNumber: addForm.batchNumber || undefined,
        notes: addForm.notes ? `[Site: ${addForm.injectionSite}] ${addForm.notes}` : `[Site: ${addForm.injectionSite}]`,
      });
      if (addForm.nextScheduledDate && addForm.status === 'ADMINISTERED') {
        await motherVaccinationsApi.recordDose({
          motherId, doseNumber: parseInt(addForm.doseNumber) + 1,
          administeredDate: addForm.nextScheduledDate, notes: 'Scheduled',
        });
      }
      setShowAddModal(false);
      setAddForm({ doseNumber:'1', status:'ADMINISTERED', administeredDate: new Date().toISOString().split('T')[0], scheduledDate:'', nextScheduledDate:'', batchNumber:'', injectionSite:'Left Arm', notes:'' });
      await fetchData();
    } catch (err: any) {
      setAddError(err?.message || 'Failed to add dose');
    } finally { setAddLoading(false); }
  };

  const handleMarkMissed = async (record: MotherVaccineRecord) => {
    const reason = prompt(`Reason for missing TD${record.doseNumber}:`);
    if (!reason) return;
    try {
      await motherVaccinationsApi.recordDose({
        motherId, doseNumber: record.doseNumber,
        administeredDate: new Date().toISOString().split('T')[0],
        notes: `MISSED: ${reason}`,
      });
      await fetchData();
    } catch (err: any) { alert(err?.message || 'Failed to mark as missed'); }
  };

  const fmt = (v?: string) => v ? new Date(v).toLocaleDateString() : '—';

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
  if (error || !mother) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-lg mb-4">{error || 'Mother not found'}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
      </div>
    </div>
  );

  const allRecords: MotherVaccineRecord[] = schedule?.vaccines ?? [];
  const administered = allRecords.filter(r => r.status === 'ADMINISTERED').length;
  const scheduled    = allRecords.filter(r => r.status === 'SCHEDULED').length;
  const missed       = allRecords.filter(r => r.status === 'MISSED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — same as child */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center py-4 gap-y-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mother Vaccinations</h1>
              <p className="text-sm text-gray-600">{mother.name} — TD Tetanus Toxoid Schedule</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                + Add TD Dose
              </button>
              <a href={`/healthcare-dashboard/mothers/${motherId}`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                Back to Mother
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Mother info card — same as child info card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{mother.name}</h2>
              <p className="text-sm text-gray-600">Age {mother.age} · {mother.phone}</p>
              <p className="text-sm text-gray-600">Facility: {mother.healthCenter?.name ?? '—'}</p>
              {mother.lmp && <p className="text-sm text-gray-600">LMP: {fmt(mother.lmp)}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                mother.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                mother.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>{mother.status}</span>
              {mother.highRisk && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">⚠ High Risk</span>}
            </div>
          </div>
        </div>

        {/* Stats — identical to child */}
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

        {/* Warnings */}
        {schedule?.warnings?.length ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="font-semibold text-yellow-800 mb-2">⚠ Warnings</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
              {schedule.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        ) : null}

        {/* Next appointment */}
        {schedule?.nextAppointment && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
            <span className="text-3xl">📅</span>
            <div>
              <p className="font-semibold text-blue-900">Next: {schedule.nextAppointment.label}</p>
              <p className="text-sm text-blue-700">{schedule.nextAppointment.vaccineName} · {fmt(schedule.nextAppointment.scheduledDate)}</p>
            </div>
          </div>
        )}

        {/* TD Milestone Blocks — identical structure to child blocks */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Maternal TD Immunization Milestone Blocks</h2>
          {TD_BLOCKS.map(block => {
            const blockRecords = allRecords.filter(r => block.doses.includes(r.doseNumber));
            const blockStatus  = getBlockStatus(block.number, allRecords);
            const completedCount = blockRecords.filter(r => isResolved(r.status)).length;
            const totalCount     = blockRecords.length;
            const percent        = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            let blockStatusColor = 'bg-gray-100 text-gray-700 border-gray-200';
            let statusText = 'Locked';
            let bgStyle    = 'bg-gray-50 border-dashed border-gray-200 grayscale-[50%]';
            if (blockStatus === 'COMPLETED')   { blockStatusColor = 'bg-green-100 text-green-800 border-green-200';  statusText = 'Completed';      bgStyle = 'bg-white border-green-200 shadow-sm'; }
            else if (blockStatus === 'IN_PROGRESS') { blockStatusColor = 'bg-blue-100 text-blue-800 border-blue-200'; statusText = 'In Progress';    bgStyle = 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-50'; }
            else if (blockStatus === 'READY')  { blockStatusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200'; statusText = 'Ready to Begin'; bgStyle = 'bg-white border-yellow-200 shadow-sm ring-1 ring-yellow-50'; }

            return (
              <div key={block.number} className={`border rounded-2xl p-6 transition-all duration-300 ${bgStyle}`}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-gray-900">{block.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${blockStatusColor}`}>{statusText}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{block.description}</p>
                  </div>
                  {blockRecords.length > 0 && (
                    <div className="text-right flex flex-col items-end">
                      <div className="text-xs text-gray-500 font-medium mb-1">Doses Administered: {completedCount} / {totalCount}</div>
                      <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${blockStatus === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {blockStatus === 'LOCKED' ? (
                  <div className="bg-red-50/50 border border-red-200/50 rounded-xl p-4 flex items-center space-x-3 text-red-800 text-sm">
                    <span className="text-lg">🛑</span>
                    <span><strong>Clinical Constraint:</strong> You must complete all previous TD doses before administering this dose.</span>
                  </div>
                ) : blockRecords.length === 0 ? (
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <span className="text-sm text-yellow-800">TD{block.doses[0]} not yet recorded.</span>
                    <button onClick={() => { setSelectedDose(block.doses[0]); setSelectedRecord(null); setAdminForm({ administeredDate: new Date().toISOString().split('T')[0], nextScheduledDate:'', batchNumber:'', injectionSite:'Left Arm', notes:'' }); setAdminError(null); setShowAdministerModal(true); }}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium shadow-sm">
                      Administer TD{block.doses[0]}
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto mt-4 border border-gray-100 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50">
                        <tr>
                          {['Vaccine','Dose','Scheduled Date','Administered Date','Batch / Site','Status','Actions'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {blockRecords.map(record => (
                          <tr key={record._id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-4 whitespace-nowrap">
                              <p className="text-sm font-bold text-gray-900">{record.vaccineName}</p>
                              <p className="text-xs text-blue-600 font-mono mt-0.5">TD{record.doseNumber}</p>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">Dose {record.doseNumber}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{fmt(record.scheduledDate)}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                              {fmt(record.administeredDate)}
                              {record.batchNumber && <p className="text-xs text-gray-400 mt-0.5">Batch: {record.batchNumber}</p>}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-600">
                              {record.status === 'ADMINISTERED' ? (
                                <div className="space-y-0.5">
                                  {record.batchNumber && <p>Batch: <span className="font-semibold text-gray-900">{record.batchNumber}</span></p>}
                                  {record.injectionSite && <p>Site: <span className="font-semibold text-gray-900">{record.injectionSite}</span></p>}
                                  {!record.batchNumber && !record.injectionSite && <span className="text-gray-400">—</span>}
                                </div>
                              ) : '—'}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${statusColor(record.status)}`}>{record.status}</span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold">
                              <div className="flex gap-2">
                                {record.status === 'SCHEDULED' && (
                                  <>
                                    <button onClick={() => openAdministerModal(record)}
                                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                                      Administer
                                    </button>
                                    <button onClick={() => handleMarkMissed(record)}
                                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors shadow-sm">
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
            );
          })}
        </div>
      </main>

      {/* ── Administer Modal — identical fields to child ── */}
      {showAdministerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Record TD Vaccination</h3>
            <p className="text-sm text-gray-500 mb-4">TD{selectedDose} — {mother.name}</p>
            {adminError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">❌ {adminError}</div>}
            <form onSubmit={handleAdminister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Administered *</label>
                <input type="date" required value={adminForm.administeredDate}
                  onChange={e => setAdminForm(p => ({ ...p, administeredDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Dose Date <span className="text-gray-400 font-normal">(optional — leave blank if no next dose)</span>
                </label>
                <input type="date" value={adminForm.nextScheduledDate} min={tomorrowStr}
                  onChange={e => setAdminForm(p => ({ ...p, nextScheduledDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">If set, a new scheduled record will be created for the next dose.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input type="text" value={adminForm.batchNumber} placeholder="Optional"
                    onChange={e => setAdminForm(p => ({ ...p, batchNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Injection Site</label>
                  <select value={adminForm.injectionSite}
                    onChange={e => setAdminForm(p => ({ ...p, injectionSite: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option>Left Arm</option>
                    <option>Right Arm</option>
                    <option>Left Thigh</option>
                    <option>Right Thigh</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} value={adminForm.notes} placeholder="Optional"
                  onChange={e => setAdminForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={adminLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60">
                  {adminLoading ? 'Saving…' : '✓ Save Record'}
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

      {/* ── Add TD Dose Modal — identical to child Add Vaccination modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add TD Dose Record</h3>
            {addError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">❌ {addError}</div>}
            <form onSubmit={handleAddDose} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dose Number *</label>
                  <select required value={addForm.doseNumber}
                    onChange={e => setAddForm(p => ({ ...p, doseNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    {MATERNAL_TD_VACCINES.map(v => (
                      <option key={v.code} value={v.doseNumber}>{v.label}</option>
                    ))}
                  </select>
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
                      onChange={e => setAddForm(p => ({ ...p, administeredDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                    <input type="date" required value={addForm.scheduledDate} min={tomorrowStr}
                      onChange={e => setAddForm(p => ({ ...p, scheduledDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Dose Date <span className="text-gray-400 font-normal">{addForm.status === 'ADMINISTERED' ? '(recommended for next dose)' : '(if part of a series)'}</span>
                  </label>
                  <input type="date" value={addForm.nextScheduledDate} min={tomorrowStr}
                    onChange={e => setAddForm(p => ({ ...p, nextScheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  <p className="text-xs text-gray-500 mt-1">💡 If set, a new scheduled record will be created for the next dose.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input type="text" value={addForm.batchNumber} placeholder="Optional"
                    onChange={e => setAddForm(p => ({ ...p, batchNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Injection Site</label>
                  <select value={addForm.injectionSite}
                    onChange={e => setAddForm(p => ({ ...p, injectionSite: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option>Left Arm</option>
                    <option>Right Arm</option>
                    <option>Left Thigh</option>
                    <option>Right Thigh</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea rows={2} value={addForm.notes} placeholder="Optional"
                    onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60">
                  {addLoading ? 'Saving…' : '✓ Save TD Dose'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)}
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
