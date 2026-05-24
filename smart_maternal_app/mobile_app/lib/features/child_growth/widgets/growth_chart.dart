import 'dart:math';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/growth_model.dart';
import 'package:intl/intl.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Public widget
// ─────────────────────────────────────────────────────────────────────────────
class GrowthChart extends StatefulWidget {
  final List<GrowthModel> records;
  const GrowthChart({super.key, required this.records});

  @override
  State<GrowthChart> createState() => _GrowthChartState();
}

class _GrowthChartState extends State<GrowthChart>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;
  bool _showWeight = true;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900));
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic);
    _ctrl.forward();
  }

  @override
  void didUpdateWidget(GrowthChart old) {
    super.didUpdateWidget(old);
    if (old.records != widget.records) _ctrl.forward(from: 0);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header row ────────────────────────────────────────────────────
          Row(
            children: [
              Expanded(
                child: Text(
                  _showWeight
                      ? 'Weight Progress (kg)'
                      : 'Height Progress (cm)',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: Color(0xFF212121),
                  ),
                ),
              ),
              _ToggleChip(
                label: 'Weight',
                active: _showWeight,
                color: AppColors.primary,
                onTap: () => setState(() {
                  _showWeight = true;
                  _ctrl.forward(from: 0);
                }),
              ),
              const SizedBox(width: 8),
              _ToggleChip(
                label: 'Height',
                active: !_showWeight,
                color: Colors.blue,
                onTap: () => setState(() {
                  _showWeight = false;
                  _ctrl.forward(from: 0);
                }),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // ── Chart ─────────────────────────────────────────────────────────
          if (widget.records.isEmpty)
            _EmptyChart()
          else
            AnimatedBuilder(
              animation: _anim,
              builder: (_, __) => SizedBox(
                height: 200,
                child: CustomPaint(
                  size: Size.infinite,
                  painter: _LinePainter(
                    records: widget.records,
                    showWeight: _showWeight,
                    progress: _anim.value,
                  ),
                ),
              ),
            ),

          const SizedBox(height: 16),

          // ── X-axis labels ─────────────────────────────────────────────────
          if (widget.records.isNotEmpty)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _axisLabel(DateFormat('MMM d')
                    .format(widget.records.first.measurementDate)),
                _axisLabel('Progress Timeline', bold: true),
                _axisLabel(DateFormat('MMM d')
                    .format(widget.records.last.measurementDate)),
              ],
            ),
        ],
      ),
    );
  }

  Widget _axisLabel(String text, {bool bold = false}) => Text(
        text,
        style: TextStyle(
          fontSize: 10,
          color: AppColors.textSecondary,
          fontWeight: bold ? FontWeight.bold : FontWeight.normal,
        ),
      );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle chip
// ─────────────────────────────────────────────────────────────────────────────
class _ToggleChip extends StatelessWidget {
  final String label;
  final bool active;
  final Color color;
  final VoidCallback onTap;

  const _ToggleChip({
    required this.label,
    required this.active,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active ? color : color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: active ? Colors.white : color,
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────
class _EmptyChart extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      alignment: Alignment.center,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.show_chart,
              size: 48, color: AppColors.textSecondary.withOpacity(0.3)),
          const SizedBox(height: 12),
          const Text(
            'No growth data yet',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom painter — smooth bezier line with animated draw
// Uses dart:ui as ui to avoid TextDirection conflicts with flutter/material.dart
// ─────────────────────────────────────────────────────────────────────────────
class _LinePainter extends CustomPainter {
  final List<GrowthModel> records;
  final bool showWeight;
  final double progress; // 0.0 → 1.0

  _LinePainter({
    required this.records,
    required this.showWeight,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (records.isEmpty) return;

    final color = showWeight ? AppColors.primary : Colors.blue;
    final values =
        records.map((r) => showWeight ? r.weight : r.height).toList();

    final minVal = values.reduce(min) * 0.9;
    final maxVal = values.reduce(max) * 1.1;
    final range = (maxVal - minVal).clamp(0.01, double.infinity);

    // Map data to canvas points
    final pts = <Offset>[];
    for (int i = 0; i < records.length; i++) {
      final x = records.length == 1
          ? size.width / 2
          : (size.width / (records.length - 1)) * i;
      final y =
          size.height - (size.height * ((values[i] - minVal) / range));
      pts.add(Offset(x, y));
    }

    // Clip to animated progress width
    canvas.save();
    canvas.clipRect(Rect.fromLTWH(0, 0, size.width * progress, size.height));

    // ── Grid lines ──────────────────────────────────────────────────────────
    final gridPaint = Paint()
      ..color = Colors.grey.withOpacity(0.1)
      ..strokeWidth = 1;
    for (int i = 1; i <= 3; i++) {
      final y = size.height * i / 4;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // ── Filled area ─────────────────────────────────────────────────────────
    final fillPaint = Paint()
      ..shader = ui.Gradient.linear(
        Offset(0, 0),
        Offset(0, size.height),
        [color.withOpacity(0.25), color.withOpacity(0.0)],
      );

    final areaPath = Path()..moveTo(pts.first.dx, size.height);
    _addSmoothLine(areaPath, pts, moveTo: false);
    areaPath
      ..lineTo(pts.last.dx, size.height)
      ..close();
    canvas.drawPath(areaPath, fillPaint);

    // ── Line ────────────────────────────────────────────────────────────────
    final linePaint = Paint()
      ..color = color
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final linePath = Path();
    _addSmoothLine(linePath, pts, moveTo: true);
    canvas.drawPath(linePath, linePaint);

    // ── Data points ─────────────────────────────────────────────────────────
    for (final pt in pts) {
      canvas.drawCircle(
          pt, 6, Paint()..color = Colors.white..style = PaintingStyle.fill);
      canvas.drawCircle(
          pt, 4, Paint()..color = color..style = PaintingStyle.fill);
      canvas.drawCircle(
          pt,
          6,
          Paint()
            ..color = color.withOpacity(0.3)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1.5);
    }

    // ── Value labels (using dart:ui Paragraph to avoid TextDirection issues) ─
    for (int i = 0; i < pts.length; i++) {
      final label = showWeight
          ? '${values[i].toStringAsFixed(1)}kg'
          : '${values[i].toStringAsFixed(0)}cm';

      final pb = ui.ParagraphBuilder(ui.ParagraphStyle(
        textAlign: TextAlign.center,
        fontSize: 9,
        fontWeight: FontWeight.bold,
      ))
        ..pushStyle(ui.TextStyle(color: color))
        ..addText(label);

      final paragraph = pb.build()
        ..layout(const ui.ParagraphConstraints(width: 40));

      canvas.drawParagraph(
        paragraph,
        Offset(pts[i].dx - 20, pts[i].dy - 20),
      );
    }

    canvas.restore();
  }

  void _addSmoothLine(Path path, List<Offset> pts, {required bool moveTo}) {
    if (pts.isEmpty) return;
    if (moveTo) path.moveTo(pts.first.dx, pts.first.dy);
    if (pts.length == 1) return;
    for (int i = 0; i < pts.length - 1; i++) {
      final cp1 = Offset((pts[i].dx + pts[i + 1].dx) / 2, pts[i].dy);
      final cp2 = Offset((pts[i].dx + pts[i + 1].dx) / 2, pts[i + 1].dy);
      path.cubicTo(
          cp1.dx, cp1.dy, cp2.dx, cp2.dy, pts[i + 1].dx, pts[i + 1].dy);
    }
  }

  @override
  bool shouldRepaint(_LinePainter old) =>
      old.records != records ||
      old.showWeight != showWeight ||
      old.progress != progress;
}
