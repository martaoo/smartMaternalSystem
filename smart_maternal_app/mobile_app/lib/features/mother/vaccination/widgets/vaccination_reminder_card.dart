import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class VaccinationReminderCard extends StatelessWidget {
  final String title;
  final String description;
  final String date;
  final IconData icon;
  final Color? color;

  const VaccinationReminderCard({
    super.key,
    required this.title,
    required this.description,
    required this.date,
    required this.icon,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: (color ?? Colors.orange).withOpacity(0.08),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: (color ?? Colors.orange).withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: (color ?? Colors.orange).withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: (color ?? Colors.orange), size: 28),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryDarkBrown,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.event_note, size: 14, color: (color ?? Colors.orange)),
                    const SizedBox(width: 5),
                    Text(
                      'Scheduled: $date',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: (color ?? Colors.orange),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
