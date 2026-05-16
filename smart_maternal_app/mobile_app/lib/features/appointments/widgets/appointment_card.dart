import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

class AppointmentCard extends StatelessWidget {
  final String facilityName;
  final String facilityAddress;
  final String appointmentDate;
  final String appointmentTime;
  final String type;
  final String status;

  const AppointmentCard({
    super.key,
    required this.facilityName,
    required this.facilityAddress,
    required this.appointmentDate,
    required this.appointmentTime,
    required this.type,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    switch (status) {
      case 'upcoming':
        statusColor = AppColors.info;
        break;
      case 'scheduled':
        statusColor = AppColors.success;
        break;
      case 'completed':
        statusColor = AppColors.textSecondary;
        break;
      case 'cancelled':
        statusColor = AppColors.error;
        break;
      default:
        statusColor = AppColors.textSecondary;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  type,
                  style: AppTextStyles.heading4,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  status.toUpperCase(),
                  style: AppTextStyles.caption.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.location_on, size: 16, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  facilityName,
                  style: AppTextStyles.bodyMedium,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            facilityAddress,
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                appointmentDate,
                style: AppTextStyles.bodyMedium,
              ),
              const SizedBox(width: 16),
              const Icon(Icons.access_time, size: 16, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                appointmentTime,
                style: AppTextStyles.bodyMedium,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
