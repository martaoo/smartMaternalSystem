import 'package:flutter/material.dart';
import '../../models/mother_entities.dart';

class NextVaccineCard extends StatelessWidget {
  final VaccinationRecord? nextVaccine;
  final int missedCount;

  const NextVaccineCard({
    super.key,
    required this.nextVaccine,
    required this.missedCount,
  });

  @override
  Widget build(BuildContext context) {
    if (nextVaccine == null) {
      return Card(
        child: Column(
          children: [
            const ListTile(
              leading: Icon(Icons.check_circle, color: Colors.green),
              title: Text('No upcoming vaccines'),
              subtitle: Text('You are up-to-date for now.'),
            ),
            if (missedCount > 0)
              _alertTile(
                icon: Icons.warning_amber_rounded,
                color: const Color(0xFFB71C1C),
                title: 'AI Alert',
                subtitle: 'Missed vaccine detected. Visit the nearest health center.',
              ),
          ],
        ),
      );
    }

    final due = nextVaccine!.dueDate;
    final now = DateTime.now();
    final diff = DateTime(due.year, due.month, due.day).difference(DateTime(now.year, now.month, now.day)).inDays;
    final countdown = diff == 0 ? 'Due today' : 'Due in $diff day${diff == 1 ? '' : 's'}';

    return Card(
      elevation: 0,
      color: const Color(0xFFE8F5E9),
      child: Column(
        children: [
          ListTile(
            leading: const Icon(Icons.schedule, color: Color(0xFF2E7D32)),
            title: Text(nextVaccine!.vaccine, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Due date: ${_fmt(due)}\nSmart reminder: $countdown'),
          ),
          if (missedCount > 0)
            _alertTile(
              icon: Icons.warning_amber_rounded,
              color: const Color(0xFFB71C1C),
              title: 'AI Alert',
              subtitle: 'Missed vaccine detected. Visit the nearest health center.',
            ),
        ],
      ),
    );
  }

  Widget _alertTile({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
  }) {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '$title: $subtitle',
              style: TextStyle(color: color, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  String _fmt(DateTime date) {
    final month = date.month.toString().padLeft(2, '0');
    final day = date.day.toString().padLeft(2, '0');
    return '${date.year}-$month-$day';
  }
}
