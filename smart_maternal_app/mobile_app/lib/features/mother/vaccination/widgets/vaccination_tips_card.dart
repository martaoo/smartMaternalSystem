import 'package:flutter/material.dart';

class VaccinationTipsCard extends StatelessWidget {
  const VaccinationTipsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.tips_and_updates, color: Color(0xFF26A69A)),
                SizedBox(width: 8),
                Text('Education & Care Tips', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            SizedBox(height: 10),
            Text('• Mild fever after vaccine can be normal.'),
            Text('• Continue breastfeeding for comfort and hydration.'),
            Text('• Keep vaccination card updated at each clinic visit.'),
            Text('• If a dose is missed, visit clinic as soon as possible.'),
            Text('• Tap "Mark completed" right after each vaccine to keep reminders accurate.'),
          ],
        ),
      ),
    );
  }
}
