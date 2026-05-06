'use client';

import { useState, useEffect } from 'react';
import { pregnancyApi } from '@/lib/healthcare-api';
import { useSearchParams } from 'next/navigation';

interface PregnancyRecord {
  _id: string;
  motherId: {
    _id: string;
    name: string;
    phone: string;
  };
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
  createdBy: {
    name: string;
    role: string;
  };
  // Reminder fields
  visitReminderSent?: boolean;
  visitReminderSentDate?: string;
  reminder3DaySent?: boolean;
  reminderSameDaySent?: boolean;
}

export default function PregnancyTracking() {
  const [pregnancyRecords, setPregnancyRecords] = useState<PregnancyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PregnancyRecord[]>([]);
  const [groupedRecords, setGroupedRecords] = useState<{ [key: string]: PregnancyRecord[] }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMothers, setExpandedMothers] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const motherIdFromUrl = searchParams.get('motherId');

  useEffect(() => {
    fetchPregnancyRecords();
  }, []);

  // Auto-select and expand mother when coming from mother profile
  useEffect(() => {
    if (motherIdFromUrl && pregnancyRecords.length > 0) {
      // Find the mother in the records and expand her section
      const motherRecords = pregnancyRecords.filter(record => 
        record.motherId && record.motherId._id === motherIdFromUrl
      );
      
      if (motherRecords.length > 0) {
        const motherKey = `${motherIdFromUrl}-${motherRecords[0].motherId?.name || 'Unknown Mother'}`;
        setExpandedMothers(prev => new Set([...prev, motherKey]));
      }
    }
  }, [motherIdFromUrl, pregnancyRecords]);

  useEffect(() => {
    let filtered = pregnancyRecords;

    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(record =>
        record.motherId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.motherId.phone.includes(searchQuery)
      );
    }

    // Apply risk filter
    if (filterRisk !== 'all') {
      filtered = filtered.filter(record => record.riskLevel === filterRisk);
    }

    setFilteredRecords(filtered);
  }, [searchQuery, filterRisk, pregnancyRecords]);

  useEffect(() => {
    // Group records by mother
    const grouped: { [key: string]: PregnancyRecord[] } = {};
    filteredRecords.forEach(record => {
      const motherKey = `${record.motherId?._id || 'unknown'}-${record.motherId?.name || 'Unknown Mother'}`;
      if (!grouped[motherKey]) {
        grouped[motherKey] = [];
      }
      grouped[motherKey].push(record);
    });

    // Sort visits within each mother by date (most recent first)
    Object.keys(grouped).forEach(motherKey => {
      grouped[motherKey].sort((a, b) => 
        new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
      );
    });

    setGroupedRecords(grouped);
  }, [filteredRecords]);

  const toggleMotherExpansion = (motherKey: string) => {
    setExpandedMothers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(motherKey)) {
        newSet.delete(motherKey);
      } else {
        newSet.add(motherKey);
      }
      return newSet;
    });
  };

  const handleDeleteVisit = async (visitId: string, visitDate: string) => {
    if (!window.confirm(`Are you sure you want to delete the pregnancy visit from ${new Date(visitDate).toLocaleDateString()}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await pregnancyApi.delete(visitId);
      setPregnancyRecords(prev => prev.filter(record => record._id !== visitId));
      setFilteredRecords(prev => prev.filter(record => record._id !== visitId));
    } catch (err: any) {
      console.error('Error deleting pregnancy visit:', err);
      setError(err.message || 'Failed to delete pregnancy visit');
    }
  };

  const fetchPregnancyRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pregnancyApi.getAll();
      setPregnancyRecords(data);
      setFilteredRecords(data);
    } catch (err: any) {
      console.error('Error fetching pregnancy records:', err);
      setError(err.message || 'Failed to load pregnancy records');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'Low Risk';
      case 'MODERATE':
        return 'Moderate Risk';
      case 'HIGH':
        return 'High Risk';
      default:
        return riskLevel;
    }
  };

  // Get reminder dates for a pregnancy visit
  const getReminderDates = (scheduledDate: string) => {
    const visitDate = new Date(scheduledDate);
    const reminder3Day = new Date(visitDate);
    reminder3Day.setDate(reminder3Day.getDate() - 3);
    
    const reminder2Day = new Date(visitDate);
    reminder2Day.setDate(reminder2Day.getDate() - 2);
    
    const reminder1Day = new Date(visitDate);
    reminder1Day.setDate(reminder1Day.getDate() - 1);

    return {
      visitDate,
      reminder3Day,
      reminder2Day,
      reminder1Day
    };
  };

  // Check if reminders should be sent today
  const getPendingReminders = (record: PregnancyRecord) => {
    if (!record.nextVisitDate) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    const reminders = getReminderDates(record.nextVisitDate);
    const pendingReminders = [];

    // Check 3-day reminder
    if (!record.reminder3DaySent && reminders.reminder3Day <= today) {
      pendingReminders.push({
        type: '3-day',
        date: reminders.reminder3Day,
        message: `Reminder: Your next pregnancy visit is in 3 days (${reminders.visitDate.toLocaleDateString()})`
      });
    }

    // Check 2-day reminder
    if (!record.reminderSameDaySent && reminders.reminder2Day <= today) {
      pendingReminders.push({
        type: '2-day',
        date: reminders.reminder2Day,
        message: `Reminder: Your next pregnancy visit is in 2 days (${reminders.visitDate.toLocaleDateString()})`
      });
    }

    // Check 1-day reminder
    if (!record.visitReminderSent && reminders.reminder1Day <= today) {
      pendingReminders.push({
        type: '1-day',
        date: reminders.reminder1Day,
        message: `Reminder: Your next pregnancy visit is tomorrow (${reminders.visitDate.toLocaleDateString()})`
      });
    }

    return pendingReminders;
  };

  // Send reminder to mother (simulate SMS/phone call)
  const sendReminderToMother = async (record: PregnancyRecord, reminderType: string) => {
    try {
      const motherPhone = record.motherId?.phone;
      const motherName = record.motherId?.name;
      const visitDate = record.nextVisitDate ? new Date(record.nextVisitDate).toLocaleDateString() : '';

      if (!motherPhone) {
        console.error('Mother phone number not available');
        return;
      }

      // Create reminder message
      const message = `Dear ${motherName}, this is a reminder that your next pregnancy visit is scheduled for ${visitDate}. Please ensure to attend the health center on time for your ANC checkup.`;

      // In a real implementation, this would integrate with SMS gateway or phone system
      console.log('PREGNANCY VISIT REMINDER SENT:', {
        to: motherPhone,
        message: message,
        type: reminderType,
        visitDate: visitDate
      });

      // Update the record to mark reminder as sent
      const updateData = {
        visitReminderSent: reminderType === '1-day',
        reminder3DaySent: reminderType === '3-day',
        reminderSameDaySent: reminderType === '2-day',
        visitReminderSentDate: new Date()
      };

      await pregnancyApi.update(record._id, updateData);
      
      // Refresh data
      fetchPregnancyRecords();
    } catch (error) {
      console.error('Error sending pregnancy visit reminder:', error);
    }
  };

  // Get next visit for a mother
  const getNextVisitForMother = (motherId: string) => {
    const motherRecords = pregnancyRecords.filter(record => 
      record.motherId._id === motherId && 
      record.nextVisitDate && 
      new Date(record.nextVisitDate) > new Date()
    );
    
    if (motherRecords.length === 0) return null;
    
    // Sort by next visit date to get the earliest upcoming visit
    motherRecords.sort((a, b) => new Date(a.nextVisitDate!).getTime() - new Date(b.nextVisitDate!).getTime());
    
    return motherRecords[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pregnancy records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">error</div>
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchPregnancyRecords}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
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
              <h1 className="text-2xl font-bold text-gray-900">Pregnancy Tracking</h1>
              <p className="text-sm text-gray-600">Monitor and manage pregnancy visits</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/healthcare-dashboard/pregnancy/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Visit
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search and Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by mother name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="LOW">Low Risk</option>
                  <option value="MODERATE">Moderate Risk</option>
                  <option value="HIGH">High Risk</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: {filteredRecords.length} visits</span>
              <span>High Risk: {pregnancyRecords.filter(r => r.riskLevel === 'HIGH').length}</span>
              <span>Emergency: {pregnancyRecords.filter(r => r.emergency).length}</span>
            </div>
          </div>
        </div>

        {/* Pregnancy Records List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {Object.keys(groupedRecords).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">pregnancy</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filterRisk !== 'all' ? 'No pregnancy records found' : 'No pregnancy records yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterRisk !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Start by recording a pregnancy visit'
                }
              </p>
              {!searchQuery && filterRisk === 'all' && (
                <a
                  href="/healthcare-dashboard/pregnancy/new"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record First Visit
                </a>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedRecords).map(([motherKey, visits]) => {
                const mother = visits[0].motherId;
                const isExpanded = expandedMothers.has(motherKey);
                const latestVisit = visits[0]; // Most recent visit (sorted by date)
                
                return (
                  <div key={motherKey} className="border-b border-gray-200 last:border-b-0">
                    {/* Mother Header - Clickable to expand/collapse */}
                    <div 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleMotherExpansion(motherKey)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {mother?.name?.charAt(0).toUpperCase() || 'M'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{mother?.name || 'Unknown Mother'}</h3>
                              <p className="text-sm text-gray-500">{mother?.phone || 'No phone'}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {visits.length} visit{visits.length !== 1 ? 's' : ''} recorded
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {/* Latest Visit Summary */}
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Latest Visit</div>
                            <div className="text-sm font-medium text-gray-900">
                              Week {latestVisit.week} ({latestVisit.gestationalAge} weeks)
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(latestVisit.visitDate).toLocaleDateString()}
                            </div>
                          </div>
                          {/* Expand/Collapse Icon */}
                          <div className="flex-shrink-0">
                            <svg
                              className={`w-5 h-5 text-gray-400 transform transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Visits */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        <div className="p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Visit History</h4>
                          <div className="space-y-3">
                            {visits.map((visit, index) => (
                              <div key={visit._id} className="bg-white rounded-lg border border-gray-200 p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      Visit #{visits.length - index}
                                    </div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(visit.riskLevel)}`}>
                                      {getRiskLevelText(visit.riskLevel)}
                                    </span>
                                    {visit.emergency && (
                                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                        Emergency
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(visit.visitDate).toLocaleDateString()}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700">Pregnancy:</span>
                                    <div>Week {visit.week} ({visit.gestationalAge} weeks)</div>
                                    {visit.presentation && (
                                      <div className="text-gray-500">Presentation: {visit.presentation}</div>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-gray-700">Vital Signs:</span>
                                    {visit.systolicBP && visit.diastolicBP && (
                                      <div>BP: {visit.systolicBP}/{visit.diastolicBP}</div>
                                    )}
                                    {visit.weight && <div>Weight: {visit.weight}kg</div>}
                                    {visit.fundalHeight && <div>FH: {visit.fundalHeight}cm</div>}
                                    {visit.fetalHeartRate && <div>FHR: {visit.fetalHeartRate}bpm</div>}
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-gray-700">Next Visit:</span>
                                    {visit.nextVisitDate ? (
                                      <div className="space-y-1">
                                        <div className="font-medium text-green-600">
                                          📅 {new Date(visit.nextVisitDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {(() => {
                                            const today = new Date();
                                            const nextVisit = new Date(visit.nextVisitDate);
                                            const daysUntil = Math.ceil((nextVisit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                            if (daysUntil < 0) return `Overdue by ${Math.abs(daysUntil)} days`;
                                            if (daysUntil === 0) return 'Today';
                                            if (daysUntil === 1) return 'Tomorrow';
                                            return `In ${daysUntil} days`;
                                          })()}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-gray-500">No next visit scheduled</div>
                                    )}
                                    
                                    {/* Reminder Actions */}
                                    {visit.nextVisitDate && (
                                      <div className="mt-2">
                                        <div className="text-xs text-gray-600 mb-1">Reminders:</div>
                                        <div className="flex flex-wrap gap-1">
                                          {(() => {
                                            const pendingReminders = getPendingReminders(visit);
                                            return pendingReminders.map((reminder, index) => (
                                              <button
                                                key={index}
                                                onClick={() => sendReminderToMother(visit, reminder.type)}
                                                className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                                                title={`Send ${reminder.type} reminder to mother`}
                                              >
                                                {reminder.type}
                                              </button>
                                            ));
                                          })()}
                                          {getPendingReminders(visit).length === 0 && (
                                            <span className="text-xs text-gray-500">✅ All reminders sent</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex space-x-2 mt-2">
                                      <a
                                        href={`/healthcare-dashboard/pregnancy/${visit._id}`}
                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                      >
                                        View Details
                                      </a>
                                      <a
                                        href={`/healthcare-dashboard/pregnancy/schedule/${visit.motherId._id}`}
                                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                                      >
                                        Schedule Next
                                      </a>
                                      <button
                                        onClick={() => handleDeleteVisit(visit._id, visit.visitDate)}
                                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
