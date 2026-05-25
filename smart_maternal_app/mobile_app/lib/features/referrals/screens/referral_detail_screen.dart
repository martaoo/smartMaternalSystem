import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../models/referral_model.dart';
import '../../../core/constants/app_colors.dart';
import 'package:intl/intl.dart';

class ReferralDetailScreen extends StatelessWidget {
  final ReferralModel referral;

  const ReferralDetailScreen({
    super.key,
    required this.referral,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFF8F5),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.primary,
        title: const Text(
          'Referral Details',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildQRSection(),
            const SizedBox(height: 24),
            _buildReferralInfoSection(),
            const SizedBox(height: 24),
            _buildMotherInfoSection(),
            const SizedBox(height: 24),
            _buildStatusSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildQRSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'Referral QR Code',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            referral.referralCode,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.divider, width: 2),
            ),
            child: QrImageView(
              data: referral.referralCode,
              version: QrVersions.auto,
              size: 220,
              backgroundColor: Colors.white,
              foregroundColor: AppColors.primary,
              gapless: true,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Present this QR code at the receiving facility',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReferralInfoSection() {
    final fromFacilityName = referral.fromHospital is Map
        ? referral.fromHospital['name'] ?? 'Unknown Facility'
        : 'Unknown Facility';
    final fromFacilityLocation = referral.fromHospital is Map
        ? referral.fromHospital['location']
        : null;
    
    final toFacilityName = referral.toHospital is Map
        ? referral.toHospital['name'] ?? 'Unknown Facility'
        : 'Unknown Facility';
    final toFacilityLocation = referral.toHospital is Map
        ? referral.toHospital['location']
        : null;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Referral Information',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 20),
          _buildInfoRow('Referral Code', referral.referralCode),
          const SizedBox(height: 16),
          _buildInfoRow('From Facility', fromFacilityName),
          if (fromFacilityLocation != null) ...[
            const SizedBox(height: 16),
            _buildInfoRow('From Location', fromFacilityLocation),
          ],
          const SizedBox(height: 16),
          _buildInfoRow('To Facility', toFacilityName),
          if (toFacilityLocation != null) ...[
            const SizedBox(height: 16),
            _buildInfoRow('To Location', toFacilityLocation),
          ],
          const SizedBox(height: 16),
          _buildInfoRow(
            'Created On',
            DateFormat.yMMMd().add_jm().format(referral.createdAt),
          ),
          const SizedBox(height: 16),
          _buildInfoRow('Urgency', referral.urgency, isUrgency: true),
          const SizedBox(height: 16),
          _buildInfoRow('Reason', referral.reasonForReferral),
          if (referral.liaisonNote != null) ...[
            const SizedBox(height: 16),
            _buildInfoRow('Liaison Note', referral.liaisonNote!),
          ],
        ],
      ),
    );
  }

  Widget _buildMotherInfoSection() {
    final motherName = referral.motherSnapshot?.name ?? referral.patientName;
    final motherPhone = referral.motherSnapshot?.phone ?? referral.patientPhone;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Mother Information',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 20),
          _buildInfoRow('Name', motherName),
          const SizedBox(height: 16),
          _buildInfoRow('Phone', motherPhone),
          if (referral.motherSnapshot?.age != null) ...[
            const SizedBox(height: 16),
            _buildInfoRow('Age', '${referral.motherSnapshot?.age} years'),
          ],
          if (referral.motherSnapshot?.bloodType != null) ...[
            const SizedBox(height: 16),
            _buildInfoRow('Blood Type', referral.motherSnapshot!.bloodType!),
          ],
          if (referral.gestationalAge != null) ...[
            const SizedBox(height: 16),
            _buildInfoRow('Gestational Age', '${referral.gestationalAge} weeks'),
          ],
          if (referral.motherSnapshot?.highRisk != null) ...[
            const SizedBox(height: 16),
            _buildInfoRow(
              'Risk Level',
              referral.motherSnapshot!.highRisk! ? 'High Risk' : 'Low Risk',
              isHighRisk: referral.motherSnapshot!.highRisk,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Status History',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 20),
          ...referral.activityLog.map((log) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    margin: const EdgeInsets.only(top: 6, right: 12),
                    decoration: BoxDecoration(
                      color: _getStatusColor(log.status),
                      shape: BoxShape.circle,
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          log.status,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (log.note != null)
                          Text(
                            log.note!,
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        const SizedBox(height: 2),
                        Text(
                          DateFormat.yMMMd().add_jm().format(log.timestamp),
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value,
      {bool isUrgency = false, bool? isHighRisk}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 6),
        isUrgency
            ? Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _getUrgencyColor(value).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  value,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: _getUrgencyColor(value),
                  ),
                ),
              )
            : isHighRisk != null
                ? Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isHighRisk
                          ? AppColors.error.withOpacity(0.1)
                          : AppColors.success.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      value,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isHighRisk ? AppColors.error : AppColors.success,
                      ),
                    ),
                  )
                : Text(
                    value,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
      ],
    );
  }

  Color _getUrgencyColor(String urgency) {
    switch (urgency.toUpperCase()) {
      case 'HIGH':
        return AppColors.error;
      case 'MEDIUM':
        return AppColors.warning;
      default:
        return AppColors.info;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return Colors.grey;
      case 'PENDING':
        return AppColors.warning;
      case 'ACCEPTED':
        return AppColors.success;
      case 'CHECKED_IN':
      case 'ARRIVED':
        return AppColors.primary;
      case 'COMPLETED':
        return AppColors.success;
      case 'REJECTED':
      case 'EXPIRED':
        return AppColors.error;
      default:
        return Colors.grey;
    }
  }
}
