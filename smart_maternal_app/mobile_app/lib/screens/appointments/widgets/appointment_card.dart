import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class AppointmentCard extends StatelessWidget {
  final Map<String, dynamic> appointment;
  final VoidCallback onTap;
  final VoidCallback onSetReminder;
  final VoidCallback onReschedule;
  final VoidCallback? onCancel;

  const AppointmentCard({
    super.key,
    required this.appointment,
    required this.onTap,
    required this.onSetReminder,
    required this.onReschedule,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final date = appointment['date'] as DateTime;
    final isUpcoming = appointment['status'] == 'upcoming';
    final isCompleted = appointment['status'] == 'completed';
    final isMissed = appointment['status'] == 'missed';
    
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.backgroundWhite,
              isMissed 
                  ? AppColors.warning.withValues(alpha: 0.05)
                  : isCompleted
                      ? AppColors.success.withValues(alpha: 0.05)
                      : _getAppointmentTypeColor(appointment['type']).withValues(alpha: 0.05),
            ],
          ),
          border: Border.all(
            color: isMissed
                ? AppColors.warning.withValues(alpha: 0.3)
                : isCompleted
                    ? AppColors.success.withValues(alpha: 0.3)
                    : _getAppointmentTypeColor(appointment['type']).withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                // Appointment Icon Container
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        isMissed
                            ? AppColors.warning.withValues(alpha: 0.2)
                            : isCompleted
                                ? AppColors.success.withValues(alpha: 0.2)
                                : _getAppointmentTypeColor(appointment['type']).withValues(alpha: 0.2),
                        isMissed
                            ? AppColors.warning.withValues(alpha: 0.1)
                            : isCompleted
                                ? AppColors.success.withValues(alpha: 0.1)
                                : _getAppointmentTypeColor(appointment['type']).withValues(alpha: 0.1),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: (isMissed
                                ? AppColors.warning
                                : isCompleted
                                    ? AppColors.success
                                    : _getAppointmentTypeColor(appointment['type']))
                            .withValues(alpha: 0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Center(
                    child: _getAppointmentTypeIcon(
                      appointment['type'], 
                      32, 
                      isMissed
                          ? AppColors.warning
                          : isCompleted
                              ? AppColors.success
                              : _getAppointmentTypeColor(appointment['type']),
                    ),
                  ),
                ),
                const SizedBox(width: 20),
                
                // Appointment Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        appointment['title'], 
                        style: const TextStyle(
                          fontWeight: FontWeight.bold, 
                          fontSize: 16,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      
                      // Time and Location Row
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.backgroundLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.access_time, size: 14, color: AppColors.textSecondary),
                            const SizedBox(width: 4),
                            Text(
                              _formatTime(date), 
                              style: const TextStyle(
                                color: AppColors.textSecondary, 
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              width: 4,
                              height: 4,
                              decoration: BoxDecoration(
                                color: AppColors.textLight,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.location_on, size: 14, color: AppColors.textSecondary),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                appointment['facility'], 
                                style: const TextStyle(
                                  color: AppColors.textSecondary, 
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      if (appointment['notes'] != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.info_outline, size: 14, color: AppColors.textLight),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                appointment['notes'], 
                                style: const TextStyle(
                                  fontSize: 11, 
                                  color: AppColors.textLight,
                                  fontStyle: FontStyle.italic,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                
                // Date and Status
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: (isMissed
                                ? AppColors.warning
                                : isCompleted
                                    ? AppColors.success
                                    : _getAppointmentTypeColor(appointment['type']))
                            .withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: (isMissed
                                  ? AppColors.warning
                                  : isCompleted
                                      ? AppColors.success
                                      : _getAppointmentTypeColor(appointment['type']))
                              .withValues(alpha: 0.3),
                        ),
                      ),
                      child: Text(
                        _formatDate(date), 
                        style: TextStyle(
                          fontSize: 12, 
                          fontWeight: FontWeight.w600,
                          color: isMissed
                              ? AppColors.warning
                              : isCompleted
                                  ? AppColors.success
                                  : _getAppointmentTypeColor(appointment['type']),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isMissed
                            ? AppColors.warning.withValues(alpha: 0.1)
                            : isCompleted
                                ? AppColors.success.withValues(alpha: 0.1)
                                : AppColors.info.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isMissed
                              ? AppColors.warning.withValues(alpha: 0.3)
                              : isCompleted
                                  ? AppColors.success.withValues(alpha: 0.3)
                                  : AppColors.info.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isMissed
                                ? Icons.warning
                                : isCompleted
                                    ? Icons.check_circle
                                    : Icons.upcoming,
                            size: 12,
                            color: isMissed
                                ? AppColors.warning
                                : isCompleted
                                    ? AppColors.success
                                    : AppColors.info,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            appointment['status'],
                            style: TextStyle(
                              fontSize: 10,
                              color: isMissed
                                  ? AppColors.warning
                                  : isCompleted
                                      ? AppColors.success
                                      : AppColors.info,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getAppointmentTypeColor(String type) {
    switch (type) {
      case 'ANC':
        return AppColors.primaryBrown;
      case 'Scan':
        return AppColors.medicalTeal;
      case 'Lab':
        return AppColors.vaccinationBlue;
      case 'Vaccination':
        return AppColors.vaccinationBlue;
      case 'Follow-up':
        return AppColors.warningOrange;
      default:
        return AppColors.primaryBrown;
    }
  }

  Icon _getAppointmentTypeIcon(String type, double size, Color color) {
    switch (type) {
      case 'ANC':
        return Icon(Icons.pregnant_woman, size: size, color: color);
      case 'Scan':
        return Icon(Icons.monitor_heart, size: size, color: color);
      case 'Lab':
        return Icon(Icons.science, size: size, color: color);
      case 'Vaccination':
        return Icon(Icons.vaccines, size: size, color: color);
      case 'Follow-up':
        return Icon(Icons.calendar_today, size: size, color: color);
      default:
        return Icon(Icons.medical_services, size: size, color: color);
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  String _formatTime(DateTime time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
