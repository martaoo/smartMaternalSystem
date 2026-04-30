import 'package:flutter/material.dart';

class VaccinationProgressCard extends StatelessWidget {
  final int completed;
  final int upcoming;
  final int missed;
  final int total;

  const VaccinationProgressCard({
    super.key,
    required this.completed,
    required this.upcoming,
    required this.missed,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    final progress = total == 0 ? 0.0 : completed / total;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('$completed of $total vaccines completed', style: const TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 9,
                color: const Color(0xFF4CAF50),
                backgroundColor: const Color(0xFFFFF3E0),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _statusItem('Completed', completed, const Color(0xFF4CAF50)),
                _statusItem('Upcoming', upcoming, const Color(0xFFFF9800)),
                _statusItem('Missed', missed, const Color(0xFFEF5350)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusItem(String label, int value, Color color) {
    return Row(
      children: [
        CircleAvatar(radius: 4, backgroundColor: color),
        const SizedBox(width: 6),
        Text('$label: $value'),
      ],
    );
  }
}
