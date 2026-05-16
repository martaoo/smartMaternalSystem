import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../models/growth_model.dart';
import 'package:intl/intl.dart';

class GrowthChart extends StatelessWidget {
  final List<GrowthModel> records;
  
  const GrowthChart({super.key, required this.records});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Weight Over Time (kg)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${records.length} records',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          if (records.isEmpty)
            Container(
              height: 200,
              alignment: Alignment.center,
              child: const Text('No growth data available yet', style: TextStyle(color: AppColors.textSecondary)),
            )
          else
            SizedBox(
              height: 200,
              child: CustomPaint(
                size: Size.infinite,
                painter: GrowthChartPainter(records: records),
              ),
            ),
          const SizedBox(height: 20),
          if (records.isNotEmpty)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(DateFormat('MMM d').format(records.first.recordDate), style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                const Text('Progress Timeline', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                Text(DateFormat('MMM d').format(records.last.recordDate), style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
              ],
            ),
        ],
      ),
    );
  }
}

class GrowthChartPainter extends CustomPainter {
  final List<GrowthModel> records;

  GrowthChartPainter({required this.records});

  @override
  void paint(Canvas canvas, Size size) {
    if (records.isEmpty) return;

    final paint = Paint()
      ..color = AppColors.primary
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [AppColors.primary.withOpacity(0.3), AppColors.primary.withOpacity(0.01)],
      ).createShader(Rect.fromLTRB(0, 0, size.width, size.height));

    // Find max weight for scaling
    double maxWeight = 0;
    for (var r in records) {
      if (r.weight > maxWeight) maxWeight = r.weight;
    }
    maxWeight = maxWeight * 1.2; // Add some padding

    final points = <Offset>[];
    for (int i = 0; i < records.length; i++) {
      final x = records.length == 1 ? size.width / 2 : (size.width / (records.length - 1)) * i;
      final y = size.height - (size.height * (records[i].weight / maxWeight));
      points.add(Offset(x, y));
    }

    // Draw area path
    final areaPath = Path();
    areaPath.moveTo(points[0].dx, size.height);
    for (var p in points) {
      areaPath.lineTo(p.dx, p.dy);
    }
    areaPath.lineTo(points.last.dx, size.height);
    areaPath.close();
    canvas.drawPath(areaPath, fillPaint);

    // Draw line path
    final path = Path();
    path.moveTo(points[0].dx, points[0].dy);
    for (int i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }
    canvas.drawPath(path, paint);

    // Draw points
    for (final point in points) {
      canvas.drawCircle(point, 6, Paint()..color = Colors.white..style = PaintingStyle.fill);
      canvas.drawCircle(point, 4, Paint()..color = AppColors.primary..style = PaintingStyle.fill);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
