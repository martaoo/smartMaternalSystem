'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { referralsApi } from '@/lib/healthcare-api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MaternalReferral, 
  ReferralStatus, 
  UrgencyLevel, 
  RiskLevel,
  STATUS_CONFIG,
  URGENCY_CONFIG,
  RISK_CONFIG,
  REFERRAL_ACTIONS
} from '@/types/referral';

export default function ReferralDetails() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const referralId = params.id as string;
  
  const [referral, setReferral] = useState<MaternalReferral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [actionNote, setActionNote] = useState('');

  useEffect(() => {
    if (!authLoading && referralId) {
      fetchReferralDetails();
    }
  }, [authLoading, referralId]);

  const fetchReferralDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        router.push('/auth');
        return;
      }

      const response = await referralsApi.getById(referralId);
      setReferral(response);
    } catch (err) {
      console.error('Error fetching referral details:', err);
      setError('Failed to load referral details');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableActions = () => {
    if (!referral || !user) return [];
    
    const statusActions = REFERRAL_ACTIONS[referral.status] || [];
    return statusActions.filter(action => 
      action.allowedRoles.includes(user.role)
    );
  };

  const handleActionClick = (action: any) => {
    setSelectedAction(action);
    setActionNote('');
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedAction || !referral) return;

    try {
      setActionLoading(true);
      setError(null);

      // Call appropriate API based on action
      let response;
      switch (selectedAction.status) {
        case ReferralStatus.PENDING:
          response = await referralsApi.send(referral._id, referral.toHospital);
          break;
        case ReferralStatus.ACCEPTED:
          response = await referralsApi.respond(referral._id, { 
            status: 'ACCEPTED', 
            note: actionNote 
          });
          break;
        case ReferralStatus.REJECTED:
          response = await referralsApi.respond(referral._id, { 
            status: 'REJECTED', 
            note: actionNote 
          });
          break;
        case ReferralStatus.IN_TRANSIT:
          response = await referralsApi.updateStatus(referral._id, 'IN_TRANSIT', actionNote);
          break;
        case ReferralStatus.ARRIVED:
          response = await referralsApi.updateStatus(referral._id, 'ARRIVED', actionNote);
          break;
        case ReferralStatus.IN_PROGRESS:
          response = await referralsApi.updateStatus(referral._id, 'IN_PROGRESS', actionNote);
          break;
        case ReferralStatus.COMPLETED:
          response = await referralsApi.updateStatus(referral._id, 'COMPLETED', actionNote);
          break;
        default:
          throw new Error('Unknown action');
      }

      // Refresh referral data
      await fetchReferralDetails();
      
      setShowActionModal(false);
      setSelectedAction(null);
      setActionNote('');
    } catch (err: any) {
      console.error('Error executing action:', err);
      setError(err?.message || 'Failed to execute action');
    } finally {
      setActionLoading(false);
    }
  };

  const isEmergency = () => {
    return referral?.urgency === UrgencyLevel.EMERGENCY;
  };

  const getStatusColor = (status?: ReferralStatus) => {
    if (!status || !STATUS_CONFIG[status]) {
      return STATUS_CONFIG[ReferralStatus.CREATED].bgColor;
    }
    return STATUS_CONFIG[status].bgColor;
  };

  const getStatusTextColor = (status?: ReferralStatus) => {
    if (!status || !STATUS_CONFIG[status]) {
      return STATUS_CONFIG[ReferralStatus.CREATED].color;
    }
    return STATUS_CONFIG[status].color;
  };

  const getStatusLabel = (status?: ReferralStatus) => {
    if (!status || !STATUS_CONFIG[status]) {
      return STATUS_CONFIG[ReferralStatus.CREATED].label;
    }
    return STATUS_CONFIG[status].label;
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    return URGENCY_CONFIG[urgency].bgColor;
  };

  const getUrgencyTextColor = (urgency: UrgencyLevel) => {
    return URGENCY_CONFIG[urgency].color;
  };

  const getRiskColor = (risk?: RiskLevel) => {
    if (!risk || !RISK_CONFIG[risk]) {
      return RISK_CONFIG[RiskLevel.LOW].bgColor;
    }
    return RISK_CONFIG[risk].bgColor;
  };

  const getRiskTextColor = (risk?: RiskLevel) => {
    if (!risk || !RISK_CONFIG[risk]) {
      return RISK_CONFIG[RiskLevel.LOW].color;
    }
    return RISK_CONFIG[risk].color;
  };

  const getRiskLabel = (risk?: RiskLevel) => {
    if (!risk || !RISK_CONFIG[risk]) {
      return RISK_CONFIG[RiskLevel.LOW].label;
    }
    return RISK_CONFIG[risk].label;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referral details...</p>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Not Found</h2>
          <p className="text-gray-600 mb-4">The requested referral could not be found</p>
          <button
            onClick={() => router.push('/healthcare-dashboard/maternal-referrals')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Referrals
          </button>
        </div>
      </div>
    );
  }

  const availableActions = getAvailableActions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Referral Details</h1>
              <p className="text-sm text-gray-600">Referral Code: {referral.referralCode}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/healthcare-dashboard/maternal-referrals')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Referrals
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Emergency Alert */}
        {isEmergency() && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">🚨</span>
              <span className="text-red-800 font-medium">EMERGENCY REFERRAL</span>
            </div>
            <p className="text-red-700 mt-1">This is an emergency referral requiring immediate attention</p>
          </div>
        )}

        {/* Status and Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Current Status</h2>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(referral.status)} ${getStatusTextColor(referral.status)}`}>
                  {getStatusLabel(referral.status)}
                </span>
                <span className="text-gray-600 text-sm">
                  {STATUS_CONFIG[referral.status]?.description || 'Status information not available'}
                </span>
              </div>
            </div>
            
            {/* Available Actions */}
            {availableActions.length > 0 && (
              <div className="flex space-x-2">
                {availableActions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => handleActionClick(action)}
                    className={`px-4 py-2 bg-${action.color}-600 text-white rounded-lg hover:bg-${action.color}-700 transition-colors`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Referral Timeline</h3>
            <div className="space-y-4">
              {referral.activityLog.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)} ${getStatusTextColor(activity.status)}`}>
                      <span className="text-xs font-medium">
                        {activity.status.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {STATUS_CONFIG[activity.status]?.label || 'Unknown Status'}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {activity.note && (
                      <p className="text-gray-600 text-sm mt-1">{activity.note}</p>
                    )}
                    {activity.actorName && (
                      <p className="text-gray-500 text-sm mt-1">
                        By: {activity.actorName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{referral.mother?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{referral.mother?.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{referral.mother?.age || 'Unknown'} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium">{referral.mother?.address || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Referral Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">From Hospital:</span>
                <span className="font-medium">{referral.fromHospitalName || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To Hospital:</span>
                <span className="font-medium">{referral.toHospitalName || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">{referral.doctorName || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{new Date(referral.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Maternal Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Maternal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-600 block">Gestational Age</span>
              <span className="font-medium">{referral.gestationalAge || 'Not specified'} weeks</span>
            </div>
            <div>
              <span className="text-gray-600 block">Expected Delivery Date</span>
              <span className="font-medium">
                {referral.expectedDeliveryDate 
                  ? new Date(referral.expectedDeliveryDate).toLocaleDateString() 
                  : 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 block">Gravida</span>
              <span className="font-medium">{referral.gravida || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-gray-600 block">Para</span>
              <span className="font-medium">{referral.para || 'Not specified'}</span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-600 block">Risk Level</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(referral.riskLevel)} ${getRiskTextColor(referral.riskLevel)}`}>
                {getRiskLabel(referral.riskLevel)}
              </span>
            </div>
            <div>
              <span className="text-gray-600 block">Urgency Level</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(referral.urgency)} ${getUrgencyTextColor(referral.urgency)}`}>
                {URGENCY_CONFIG[referral.urgency].label}
              </span>
            </div>
            <div>
              <span className="text-gray-600 block">Referral Code</span>
              <span className="font-medium">{referral.referralCode}</span>
            </div>
          </div>
        </div>

        {/* Clinical Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Clinical Information</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Clinical Condition</h4>
              <p className="text-gray-600">
                {referral.clinicalCondition || 'No clinical condition specified'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Reason for Referral</h4>
              <p className="text-gray-600">{referral.reasonForReferral}</p>
            </div>
            {referral.clinicalNotes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Clinical Notes</h4>
                <p className="text-gray-600">{referral.clinicalNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Transport Information (for emergency cases) */}
        {isEmergency() && referral.transportInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transport Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 block">Vehicle Type</span>
                <span className="font-medium">{referral.transportInfo.vehicleType || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Driver Name</span>
                <span className="font-medium">{referral.transportInfo.driverName || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Driver Phone</span>
                <span className="font-medium">{referral.transportInfo.driverPhone || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Estimated Arrival</span>
                <span className="font-medium">
                  {referral.transportInfo.estimatedArrival 
                    ? new Date(referral.transportInfo.estimatedArrival).toLocaleString() 
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Action Modal */}
      {showActionModal && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedAction.label}
            </h3>
            
            {selectedAction.requiresConfirmation && (
              <p className="text-gray-600 mb-4">
                {selectedAction.confirmationMessage}
              </p>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add any relevant notes..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
