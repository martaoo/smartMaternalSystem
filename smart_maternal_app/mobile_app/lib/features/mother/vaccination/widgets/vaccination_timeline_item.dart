import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../models/vaccination_status.dart';

class VaccinationTimelineItem extends StatelessWidget {
  final String title;
  final String date;
  final String? nextAppointment;
  final List<String> vaccines;
  final VaccinationStatus status;
  final bool isLast;

  const VaccinationTimelineItem({
    super.key,
    required this.title,
    required this.date,
    this.nextAppointment,
    required this.vaccines,
    required this.status,
    this.isLast = false,
  });

  Color get _statusColor {
    switch (status) {
      case VaccinationStatus.completed:
        return Colors.green;
      case VaccinationStatus.upcoming:
        return Colors.blue;
      case VaccinationStatus.missed:
        return Colors.red;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline indicator
          Column(
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: _statusColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: _statusColor.withOpacity(0.3),
                      blurRadius: 5,
                      spreadRadius: 2,
                    ),
                  ],
                ),
              ),
              if (!isLast)
                Container(
                  width: 2,
                  height: 100, // Fixed height for simplicity, should ideally be dynamic
                  color: Colors.grey[300],
                ),
            ],
          ),
          const SizedBox(width: 20),
          // Content Card
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(bottom: 20),
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryDarkBrown,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _statusColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          status.name.toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _statusColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Given: $date',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: vaccines.map((v) => _VaccineBadge(name: v)).toList(),
                  ),
                  if (nextAppointment != null) ...[
                    const SizedBox(height: 15),
                    const Divider(height: 1),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const Icon(Icons.alarm, size: 14, color: Colors.blue),
                        const SizedBox(width: 5),
                        Text(
                          'Next: $nextAppointment',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _VaccineBadge extends StatelessWidget {
  final String name;

  const _VaccineBadge({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.backgroundBeige.withOpacity(0.5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.primaryLightBrown.withOpacity(0.2)),
      ),
      child: Text(
        name,
        style: const TextStyle(
          fontSize: 11,
          color: AppColors.primaryDarkBrown,
        ),
      ),
    );
  }
}
