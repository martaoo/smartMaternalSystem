import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

class VaccineTimeline extends StatelessWidget {
  const VaccineTimeline({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTimelineItem(
            'Birth',
            'BCG, Hepatitis B',
            'Completed',
            AppColors.success,
            isFirst: true,
          ),
          _buildTimelineItem(
            '6 Weeks',
            'Pentavalent 1, OPV 1, PCV 1, Rotavirus 1',
            'Completed',
            AppColors.success,
          ),
          _buildTimelineItem(
            '10 Weeks',
            'Pentavalent 2, OPV 2, PCV 2, Rotavirus 2',
            'Completed',
            AppColors.success,
          ),
          _buildTimelineItem(
            '14 Weeks',
            'Pentavalent 3, OPV 3, PCV 3, Rotavirus 3, IPV',
            'Pending',
            AppColors.info,
          ),
          _buildTimelineItem(
            '9 Months',
            'MR 1, JE 1, Vitamin A',
            'Pending',
            AppColors.info,
            isLast: true,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(
    String age,
    String vaccines,
    String status,
    Color statusColor, {
    bool isFirst = false,
    bool isLast = false,
  }) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Column(
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: statusColor,
                  shape: BoxShape.circle,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: AppColors.divider,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    age,
                    style: AppTextStyles.heading4.copyWith(
                      color: statusColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    vaccines,
                    style: AppTextStyles.bodyMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    status,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
