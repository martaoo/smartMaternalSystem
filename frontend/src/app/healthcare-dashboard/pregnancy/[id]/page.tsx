'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pregnancyApi } from '@/lib/healthcare-api';

interface PregnancyRecord {
  _id: string;
  motherId: { _id: string; name: string; phone: string; };
  week: number;
  gestationalAge: number;
  systolicBP?: number;
  diastolicBP?: number;
  weight?: number;
  fundalHeight?: number;
  fetalHeartRate?: number;
  presentation?: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  symptoms: string[];
  medications: string[];
  nextVisitDate?: string;
  ultrasoundFindings?: string;
  complications: string[];
  recommendations?: string;
  emergency: boolean;
  emergencyReason?: string;
  visitDate: string;
  notes?: string;
  healthWorkerId?: { name: string; role: string; };
}

interface EditForm {
  week: string;
  gestationalAge: string;
  systolicBP: string;
  diastolicBP: string;
  weight: string;
  fundalHeight: string;
  fetalHeartRate: string;
  presentation: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  symptoms: string;
  medications: string;
  complications: string;
  nextVisitDate: string;
  ultrasoundFindings: string;
  recommendations: string;
  notes: string;
  emergency: boolean;
  emergencyReason: string;
  visitDate: string;
}

const RISK_COLOR: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

function toDateInput(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toISOString().split('T')[0];
}

export default function PregnancyDetail() {
  const params = useParams();
  const router = useRouter();
  const pregnancyId = params.id as string;

  const [record, setRecord] = useState<PregnancyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => { if (pregnancyId) fetchRecord(); }, [pregnancyId]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pregnancyApi.getById(pregnancyId);
      setRecord(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load pregnancy record');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    if (!record) return;
    setEditForm({
      week: String(record.week),
      gestationalAge: String(record.gestationalAge),
      systolicBP: record.systolicBP ? String(record.systolicBP) : '',
      diastolicBP: record.diastolicBP ? String(record.diastolicBP) : '',
      weight: record.weight ? String(record.weight) : '',
      fundalHeight: record.fundalHeight ? String(record.fundalHeight) : '',
      fetalHeartRate: record.fetalHeartRate ? String(record.fetalHeartRate) : '',
      presentation: record.presentation || '',
      riskLevel: record.riskLevel,
      symptoms: record.symptoms?.join(', ') || '',
      medications: record.medications?.join(', ') || '',
      complications: record.complications?.join(', ') || '',
      nextVisitDate: toDateInput(record.nextVisitDate),
      ultrasoundFindings: record.ultrasoundFindings || '',
      recommendations: record.recommendations || '',
      notes: record.notes || '',
      emergency: record.emergency,
      emergencyReason: record.emergencyReason || '',
      visitDate: toDateInput(record.visitDate),
    });
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEditForm(prev => prev ? { ...prev, [name]: val } : prev);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const payload: any = {
        week: parseInt(editForm.week),
        gestationalAge: parseInt(editForm.gestationalAge),
        riskLevel: editForm.riskLevel,
        emergency: editForm.emergency,
        visitDate: editForm.visitDate || undefined,
        systolicBP: editForm.systolicBP ? parseInt(editForm.systolicBP) : undefined,
        diastolicBP: editForm.diastolicBP ? parseInt(editForm.diastolicBP) : undefined,
        weight: editForm.weight ? parseFloat(editForm.weight) : undefined,
        fundalHeight: editForm.fundalHeight ? parseFloat(editForm.fundalHeight) : undefined,
        fetalHeartRate: editForm.fetalHeartRate ? parseInt(editForm.fetalHeartRate) : undefined,
        presentation: editForm.presentation || undefined,
        nextVisitDate: editForm.nextVisitDate || undefined,
        ultrasoundFindings: editForm.ultrasoundFindings || undefined,
        recommendations: editForm.recommendations || undefined,
        notes: editForm.notes || undefined,
        emergencyReason: editForm.emergency ? editForm.emergencyReason : undefined,
        symptoms: editForm.symptoms ? editForm.symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
        medications: editForm.medications ? editForm.medications.split(',').map(s => s.trim()).filter(Boolean) : [],
        complications: editForm.complications ? editForm.complications.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      const updated = await pregnancyApi.update(pregnancyId, payload);
      setRecord(updated);
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading pregnancy record...</p>
      </div>
    </div>
  );

  if (error || !record) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-lg mb-4">{error || 'Record not found'}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center py-4 gap-y-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pregnancy Visit Details</h1>
              <p className="text-sm text-gray-600">{record.motherId.name} — Week {record.week}</p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  ✏️ Edit Visit
                </button>
              )}
              <a href="/healthcare-dashboard/pregnancy/new"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                New Visit
              </a>
              <a href="/healthcare-dashboard/pregnancy"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                Back
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Success banner */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-green-800 text-sm font-medium">Visit record updated successfully.</span>
          </div>
        )}

        {/* ── EDIT FORM ── */}
        {isEditing && editForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">✏️ Edit Visit Record</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">❌ {saveError}</div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Visit Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
                    <input type="date" name="visitDate" value={editForm.visitDate} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Week *</label>
                    <input type="number" name="week" value={editForm.week} onChange={handleChange} required min="1" max="42"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gestational Age (weeks) *</label>
                    <input type="number" name="gestationalAge" value={editForm.gestationalAge} onChange={handleChange} required min="1" max="42"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level *</label>
                    <select name="riskLevel" value={editForm.riskLevel} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                      <option value="LOW">Low Risk</option>
                      <option value="MODERATE">Moderate Risk</option>
                      <option value="HIGH">High Risk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Visit Date</label>
                    <input type="date" name="nextVisitDate" value={editForm.nextVisitDate} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fetal Presentation</label>
                    <select name="presentation" value={editForm.presentation} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                      <option value="">Select</option>
                      <option value="Cephalic">Cephalic</option>
                      <option value="Breech">Breech</option>
                      <option value="Transverse">Transverse</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Vital Signs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Systolic BP</label>
                    <input type="number" name="systolicBP" value={editForm.systolicBP} onChange={handleChange} min="80" max="200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diastolic BP</label>
                    <input type="number" name="diastolicBP" value={editForm.diastolicBP} onChange={handleChange} min="40" max="130"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input type="number" name="weight" value={editForm.weight} onChange={handleChange} step="0.1" min="30" max="200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fundal Height (cm)</label>
                    <input type="number" name="fundalHeight" value={editForm.fundalHeight} onChange={handleChange} step="0.1" min="10" max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fetal Heart Rate (bpm)</label>
                    <input type="number" name="fetalHeartRate" value={editForm.fetalHeartRate} onChange={handleChange} min="100" max="180"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
              </div>

              {/* Clinical */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Clinical Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input type="text" name="symptoms" value={editForm.symptoms} onChange={handleChange} placeholder="e.g. Nausea, Back pain"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medications <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input type="text" name="medications" value={editForm.medications} onChange={handleChange} placeholder="e.g. Folic acid, Iron"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complications <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input type="text" name="complications" value={editForm.complications} onChange={handleChange} placeholder="e.g. Mild anemia"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ultrasound Findings</label>
                    <input type="text" name="ultrasoundFindings" value={editForm.ultrasoundFindings} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                    <textarea name="recommendations" value={editForm.recommendations} onChange={handleChange} rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea name="notes" value={editForm.notes} onChange={handleChange} rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
              </div>

              {/* Emergency */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Emergency</h3>
                <div className="flex items-center gap-3 mb-3">
                  <input type="checkbox" id="emergency" name="emergency" checked={editForm.emergency}
                    onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <label htmlFor="emergency" className="text-sm font-medium text-gray-700">This is an emergency visit</label>
                </div>
                {editForm.emergency && (
                  <textarea name="emergencyReason" value={editForm.emergencyReason} onChange={handleChange}
                    placeholder="Describe the emergency..." rows={2} required={editForm.emergency}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm" />
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-200">
                <button type="submit" disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-medium">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── READ-ONLY VIEW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Visit Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><p className="text-sm text-gray-500">Mother</p><p className="font-medium">{record.motherId.name}</p><p className="text-sm text-gray-500">{record.motherId.phone}</p></div>
                <div><p className="text-sm text-gray-500">Visit Date</p><p className="font-medium">{new Date(record.visitDate).toLocaleDateString()}</p></div>
                <div><p className="text-sm text-gray-500">Pregnancy Week</p><p className="font-medium">Week {record.week}</p></div>
                <div><p className="text-sm text-gray-500">Gestational Age</p><p className="font-medium">{record.gestationalAge} weeks</p></div>
                <div>
                  <p className="text-sm text-gray-500">Risk Level</p>
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${RISK_COLOR[record.riskLevel]}`}>
                    {record.riskLevel === 'LOW' ? 'Low Risk' : record.riskLevel === 'MODERATE' ? 'Moderate Risk' : 'High Risk'}
                  </span>
                  {record.emergency && <span className="ml-2 inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">Emergency</span>}
                </div>
                <div><p className="text-sm text-gray-500">Recorded By</p><p className="font-medium">{record.healthWorkerId?.name || '—'}</p></div>
                {record.nextVisitDate && (
                  <div><p className="text-sm text-gray-500">Next Visit</p><p className="font-medium">{new Date(record.nextVisitDate).toLocaleDateString()}</p></div>
                )}
                {record.emergency && record.emergencyReason && (
                  <div className="md:col-span-2"><p className="text-sm text-gray-500">Emergency Reason</p><p className="font-medium text-red-600">{record.emergencyReason}</p></div>
                )}
              </div>
            </div>

            {/* Vitals */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {record.systolicBP && record.diastolicBP && <div><p className="text-sm text-gray-500">Blood Pressure</p><p className="font-medium">{record.systolicBP}/{record.diastolicBP} mmHg</p></div>}
                {record.weight && <div><p className="text-sm text-gray-500">Weight</p><p className="font-medium">{record.weight} kg</p></div>}
                {record.fundalHeight && <div><p className="text-sm text-gray-500">Fundal Height</p><p className="font-medium">{record.fundalHeight} cm</p></div>}
                {record.fetalHeartRate && <div><p className="text-sm text-gray-500">Fetal Heart Rate</p><p className="font-medium">{record.fetalHeartRate} bpm</p></div>}
                {record.presentation && <div><p className="text-sm text-gray-500">Presentation</p><p className="font-medium">{record.presentation}</p></div>}
              </div>
            </div>

            {/* Clinical */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Assessment</h2>
              <div className="space-y-4">
                {record.symptoms?.length > 0 && <div><p className="text-sm text-gray-500 mb-1">Symptoms</p><div className="flex flex-wrap gap-2">{record.symptoms.map((s, i) => <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{s}</span>)}</div></div>}
                {record.medications?.length > 0 && <div><p className="text-sm text-gray-500 mb-1">Medications</p><div className="flex flex-wrap gap-2">{record.medications.map((m, i) => <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{m}</span>)}</div></div>}
                {record.complications?.length > 0 && <div><p className="text-sm text-gray-500 mb-1">Complications</p><div className="flex flex-wrap gap-2">{record.complications.map((c, i) => <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{c}</span>)}</div></div>}
                {record.ultrasoundFindings && <div><p className="text-sm text-gray-500">Ultrasound Findings</p><p className="text-gray-900">{record.ultrasoundFindings}</p></div>}
                {record.recommendations && <div><p className="text-sm text-gray-500">Recommendations</p><p className="text-gray-900">{record.recommendations}</p></div>}
                {record.notes && <div><p className="text-sm text-gray-500">Notes</p><p className="text-gray-900">{record.notes}</p></div>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button onClick={startEditing}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  ✏️ Edit This Visit
                </button>
                <a href="/healthcare-dashboard/pregnancy/new"
                  className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors text-sm">
                  New Visit
                </a>
                <a href={`/healthcare-dashboard/mothers/${record.motherId._id}`}
                  className="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors text-sm">
                  View Mother
                </a>
              </div>
            </div>

            {record.nextVisitDate && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Visit</h2>
                <div className="space-y-2">
                  <div><p className="text-sm text-gray-500">Scheduled Date</p><p className="font-medium">{new Date(record.nextVisitDate).toLocaleDateString()}</p></div>
                  <div>
                    <p className="text-sm text-gray-500">Days Until</p>
                    <p className="font-medium">
                      {Math.ceil((new Date(record.nextVisitDate).getTime() - Date.now()) / 86400000)} days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
