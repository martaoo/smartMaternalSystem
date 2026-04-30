import 'package:flutter/material.dart';
import '../../models/mother_entities.dart';
import '../models/vaccination_status.dart';

class VaccinationTimelineList extends StatelessWidget {
  final List<VaccinationRecord> records;
  final VaccinationStatus Function(VaccinationRecord) statusOf;
  final Future<void> Function(VaccinationRecord) onMarkCompleted;

  const VaccinationTimelineList({
    super.key,
    required this.records,
    required this.statusOf,
    required this.onMarkCompleted,
  });

  @override
  Widget build(BuildContext context) {
    if (records.isEmpty) {
      return const Card(
        child: ListTile(
          leading: Icon(Icons.info_outline),
          title: Text('No records in this filter'),
          subtitle: Text('Try another status filter to see more milestones.'),
        ),
      );
    }

    final grouped = _groupByMilestone(records);
    return Column(
      children: grouped.entries.map((entry) {
        final firstRecord = entry.value.first;
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE0E7FF)),
            color: Colors.white,
          ),
          child: Theme(
            data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
            child: ExpansionTile(
              tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              leading: Container(
                width: 14,
                height: 14,
                decoration: const BoxDecoration(
                  color: Color(0xFF4FC3F7),
                  shape: BoxShape.circle,
                ),
              ),
              title: Text(entry.key, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
              subtitle: Text('Target date: ${_fmt(firstRecord.dueDate)}'),
              children: entry.value.map((record) {
                final status = statusOf(record);
                final statusColor = _statusColor(status);
                return ListTile(
                  leading: const Icon(Icons.vaccines_rounded, color: Color(0xFF5E35B1)),
                  title: Text(record.vaccine, style: const TextStyle(fontWeight: FontWeight.w600)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          status.label,
                          style: TextStyle(color: statusColor, fontWeight: FontWeight.w700, fontSize: 12),
                        ),
                      ),
                      if (status != VaccinationStatus.completed)
                        IconButton(
                          tooltip: 'Mark completed',
                          onPressed: () => onMarkCompleted(record),
                          icon: const Icon(Icons.check_circle, color: Color(0xFF2E7D32)),
                        ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        );
      }).toList(),
    );
  }

  Map<String, List<VaccinationRecord>> _groupByMilestone(List<VaccinationRecord> source) {
    final groups = <String, List<VaccinationRecord>>{};
    for (final record in source) {
      groups.putIfAbsent(record.ageLabel, () => <VaccinationRecord>[]).add(record);
    }
    return groups;
  }

  Color _statusColor(VaccinationStatus status) {
    switch (status) {
      case VaccinationStatus.completed:
        return const Color(0xFF4CAF50);
      case VaccinationStatus.upcoming:
        return const Color(0xFFFF9800);
      case VaccinationStatus.missed:
        return const Color(0xFFEF5350);
    }
  }

  String _fmt(DateTime date) {
    final month = date.month.toString().padLeft(2, '0');
    final day = date.day.toString().padLeft(2, '0');
    return '${date.year}-$month-$day';
  }
}
