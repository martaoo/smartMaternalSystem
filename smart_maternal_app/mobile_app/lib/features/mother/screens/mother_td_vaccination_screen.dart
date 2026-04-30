import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../services/notification_service.dart';
import '../data/mock_mother_repository.dart';

class MotherTdVaccinationScreen extends StatefulWidget {
  const MotherTdVaccinationScreen({super.key});

  @override
  State<MotherTdVaccinationScreen> createState() => _MotherTdVaccinationScreenState();
}

class _MotherTdVaccinationScreenState extends State<MotherTdVaccinationScreen> with SingleTickerProviderStateMixin {
  final NotificationService _notificationService = NotificationService();

  late final TabController _tab;
  bool _remindersLoading = true;
  final Set<String> _reminderEnabledDoseKeys = {};

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
    _tab.addListener(() {
      if (mounted) setState(() {});
    });
    _initReminders();
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  bool get _isPregnant => _tab.index == 0;

  Future<void> _initReminders() async {
    try {
      await _notificationService.initialize();
      await _notificationService.requestPermissions();
      final pending = await _notificationService.getPendingNotifications();
      final ids = pending.map((p) => p.id).toSet();

      final enabled = <String>{};
      for (final dose in _allDoseKeys) {
        final base = _doseNotificationBaseId(dose);
        if (base == null) continue;
        if (ids.contains(base + 1000) || ids.contains(base + 2000)) enabled.add(dose);
      }

      if (!mounted) return;
      setState(() {
        _reminderEnabledDoseKeys
          ..clear()
          ..addAll(enabled);
        _remindersLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _remindersLoading = false);
    }
  }

  List<_TdDose> _buildTimeline(bool pregnant) {
    final dates = MockMotherRepository.getTdDates(pregnant: pregnant);

    DateTime? td1 = dates['TD1'];
    DateTime? td2 = dates['TD2'];
    DateTime? td3 = dates['TD3'];
    DateTime? td4 = dates['TD4'];
    DateTime? td5 = dates['TD5'];

    // Compute recommended next appointment dates from schedule rules.
    DateTime? td2Due = td1 == null ? null : td1.add(const Duration(days: 28));
    DateTime? td3Due = td2 == null ? null : _addMonths(td2, 6);
    DateTime? td4Due = td3 == null ? null : _addYears(td3, 1);
    DateTime? td5Due = td4 == null ? null : _addYears(td4, 1);

    return [
      _TdDose(keyName: 'TD1', title: 'TD1', subtitle: 'First contact', givenDate: td1, dueDate: null),
      _TdDose(keyName: 'TD2', title: 'TD2', subtitle: '4 weeks after TD1', givenDate: td2, dueDate: td2Due),
      _TdDose(keyName: 'TD3', title: 'TD3', subtitle: '6 months after TD2', givenDate: td3, dueDate: td3Due),
      _TdDose(keyName: 'TD4', title: 'TD4', subtitle: '1 year after TD3', givenDate: td4, dueDate: td4Due),
      _TdDose(keyName: 'TD5', title: 'TD5', subtitle: 'Final dose (1 year after TD4)', givenDate: td5, dueDate: td5Due),
    ];
  }

  _TdDose? _nextDose(List<_TdDose> doses) {
    final now = DateTime.now();
    for (final d in doses) {
      if (d.givenDate == null) {
        // TD1 has no due date; show "as soon as possible"
        return d.copyWith(dueDate: d.dueDate ?? now);
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final doses = _buildTimeline(_isPregnant);
    final next = _nextDose(doses);
    final completed = doses.where((d) => d.givenDate != null).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            pinned: true,
            floating: true,
            expandedHeight: 170,
            backgroundColor: const Color(0xFF009688),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF009688), Color(0xFF00695C)],
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 66, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        '💉 Tetanus‑Diphtheria Vaccination',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20),
                      ),
                      SizedBox(height: 6),
                      Text(
                        '(የመንጋጋ ቆልፍ መከላከያ)',
                        style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w700),
                      ),
                      SizedBox(height: 6),
                      Text(
                        'Protect mother and baby from infection',
                        style: TextStyle(color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            bottom: TabBar(
              controller: _tab,
              indicatorColor: Colors.white,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              labelStyle: const TextStyle(fontWeight: FontWeight.w900),
              tabs: const [
                Tab(icon: Icon(Icons.pregnant_woman), text: 'Pregnant'),
                Tab(icon: Icon(Icons.woman), text: 'Non‑Pregnant'),
              ],
            ),
          ),
        ],
        body: TabBarView(
          controller: _tab,
          children: [
            _buildTab(pregnant: true),
            _buildTab(pregnant: false),
          ],
        ),
      ),
    );
  }

  Widget _buildTab({required bool pregnant}) {
    final doses = _buildTimeline(pregnant);
    final next = _nextDose(doses);
    final completed = doses.where((d) => d.givenDate != null).length;

    final message = pregnant
        ? 'Protection for mother & newborn'
        : 'Long‑term protection against tetanus';

    return ListView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      children: [
        _modeCard(message: message),
        const SizedBox(height: 12),
        _progressCard(completed: completed, total: doses.length),
        const SizedBox(height: 12),
        _nextDoseCard(next: next, pregnant: pregnant),
        const SizedBox(height: 14),
        const Text('TD Timeline', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
        const SizedBox(height: 10),
        ...doses.map((d) => _doseCard(dose: d, pregnant: pregnant)),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _modeCard({required String message}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE8EAF6)),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: const Color(0xFF009688).withOpacity(0.12),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Icon(Icons.shield, color: Color(0xFF009688)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
            ),
          ),
        ],
      ),
    );
  }

  Widget _progressCard({required int completed, required int total}) {
    final progress = total == 0 ? 0.0 : completed / total;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE8EAF6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.timeline, color: Color(0xFF009688)),
              const SizedBox(width: 8),
              const Text('Progress', style: TextStyle(fontWeight: FontWeight.w900)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF009688).withOpacity(0.10),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text('$completed / $total', style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF00695C))),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 10,
              color: const Color(0xFF009688),
              backgroundColor: const Color(0xFFE0F2F1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _nextDoseCard({required _TdDose? next, required bool pregnant}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3E0),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFFFCC80)),
      ),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.85),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.notifications_active, color: Color(0xFFEF6C00)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Next Dose', style: TextStyle(fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                if (next == null)
                  Text('All doses completed', style: TextStyle(color: Colors.grey[800], fontWeight: FontWeight.w700))
                else ...[
                  Text(next.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                  const SizedBox(height: 2),
                  Text(
                    next.dueDate == null ? 'As soon as possible' : DateFormat('MMM d, yyyy').format(next.dueDate!),
                    style: TextStyle(color: Colors.grey[800], fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 2),
                  const Text('📍 Visit nearest health center', style: TextStyle(fontWeight: FontWeight.w700)),
                ],
              ],
            ),
          ),
          TextButton(
            onPressed: next == null ? null : () => _openDoseDetails(next, pregnant: pregnant),
            child: const Text('Set Reminder'),
          ),
        ],
      ),
    );
  }

  Widget _doseCard({required _TdDose dose, required bool pregnant}) {
    final status = _doseStatus(dose);
    final color = _statusColor(status);
    final icon = _statusIcon(status);
    final nextDate = _nextAppointmentDate(dose);

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: () => _openDoseDetails(dose, pregnant: pregnant),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.10),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(Icons.vaccines, color: color),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(dose.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                        const SizedBox(height: 2),
                        Text(dose.subtitle, style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: color.withOpacity(0.22)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(icon, size: 14, color: color),
                        const SizedBox(width: 6),
                        Text(
                          status.label,
                          style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _infoLine('Date given', dose.givenDate == null ? 'Not recorded' : DateFormat('MMM d, yyyy').format(dose.givenDate!)),
              _infoLine('Next appointment', nextDate == null ? '—' : DateFormat('MMM d, yyyy').format(nextDate)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoLine(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(width: 120, child: Text(label, style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w800))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }

  Future<void> _openDoseDetails(_TdDose dose, {required bool pregnant}) async {
    final status = _doseStatus(dose);
    DateTime selectedDate = dose.givenDate ?? DateTime.now();

    final doseKey = _doseKey(pregnant: pregnant, dose: dose.keyName);
    bool reminderEnabled = _reminderEnabledDoseKeys.contains(doseKey);

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => FractionallySizedBox(
          heightFactor: 0.92,
          child: Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Column(
              children: [
                const SizedBox(height: 10),
                Container(
                  width: 52,
                  height: 5,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(dose.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
                        const SizedBox(height: 6),
                        Text(dose.subtitle, style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                        const SizedBox(height: 14),
                        _detailRow('Status', status.label),
                        _detailRow('Date given', dose.givenDate == null ? 'Not recorded' : DateFormat('MMM d, yyyy').format(dose.givenDate!)),
                        _detailRow(
                          'Next appointment',
                          _nextAppointmentDate(dose) == null ? '—' : DateFormat('MMM d, yyyy').format(_nextAppointmentDate(dose)!),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF9FAFB),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Text('Record dose', style: TextStyle(fontWeight: FontWeight.w900)),
                              const SizedBox(height: 10),
                              InkWell(
                                onTap: () async {
                                  final picked = await showDatePicker(
                                    context: context,
                                    initialDate: selectedDate,
                                    firstDate: DateTime.now().subtract(const Duration(days: 365 * 10)),
                                    lastDate: DateTime.now().add(const Duration(days: 1)),
                                  );
                                  if (picked != null) setSheetState(() => selectedDate = picked);
                                },
                                borderRadius: BorderRadius.circular(14),
                                child: InputDecorator(
                                  decoration: InputDecoration(
                                    labelText: 'Date given',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                                  ),
                                  child: Text(DateFormat('MMM d, yyyy').format(selectedDate)),
                                ),
                              ),
                              const SizedBox(height: 12),
                              ElevatedButton.icon(
                                onPressed: () async {
                                  await MockMotherRepository.setTdDate(
                                    pregnant: pregnant,
                                    doseKey: dose.keyName,
                                    dateGiven: selectedDate,
                                  );
                                  if (!context.mounted) return;
                                  Navigator.pop(context);
                                  setState(() {});
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF2E7D32),
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                ),
                                icon: const Icon(Icons.check_circle),
                                label: const Text('Save Date Given', style: TextStyle(fontWeight: FontWeight.w900)),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF3E0),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFFFFCC80)),
                          ),
                          child: Row(
                            children: [
                              Icon(reminderEnabled ? Icons.notifications_active : Icons.notifications_none, color: const Color(0xFFEF6C00)),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  reminderEnabled ? 'Reminder enabled' : 'Enable reminder for next appointment',
                                  style: const TextStyle(fontWeight: FontWeight.w800),
                                ),
                              ),
                              TextButton(
                                onPressed: _remindersLoading
                                    ? null
                                    : () async {
                                        final due = _effectiveReminderDateForDose(dose);
                                        if (due == null) return;
                                        final base = _doseNotificationBaseId(doseKey);
                                        if (base == null) return;

                                        if (reminderEnabled) {
                                          await _notificationService.cancelNotification(base + 1000);
                                          await _notificationService.cancelNotification(base + 2000);
                                          setState(() => _reminderEnabledDoseKeys.remove(doseKey));
                                          setSheetState(() => reminderEnabled = false);
                                        } else {
                                          await _notificationService.schedulePreReminder(
                                            appointmentId: base,
                                            title: 'TD Reminder: ${dose.title}',
                                            facility: 'Nearest health center',
                                            appointmentTime: due,
                                            appointmentType: 'TD',
                                          );
                                          await _notificationService.scheduleSameDayReminder(
                                            appointmentId: base,
                                            title: 'TD Today: ${dose.title}',
                                            facility: 'Nearest health center',
                                            appointmentTime: due,
                                            appointmentType: 'TD',
                                          );
                                          setState(() => _reminderEnabledDoseKeys.add(doseKey));
                                          setSheetState(() => reminderEnabled = true);
                                        }
                                      },
                                child: Text(reminderEnabled ? 'Disable' : 'Enable'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        Center(
                          child: TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Close'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(label, style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w800)),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }

  _TdStatus _doseStatus(_TdDose dose) {
    if (dose.givenDate != null) return _TdStatus.completed;
    final due = dose.dueDate;
    if (due == null) return _TdStatus.upcoming; // TD1
    final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    final dueDay = DateTime(due.year, due.month, due.day);
    if (dueDay.isBefore(today)) return _TdStatus.missed;
    return _TdStatus.upcoming;
  }

  DateTime? _nextAppointmentDate(_TdDose dose) {
    // For completed dose, next appointment is this dose's computed due for next dose.
    return dose.dueDate;
  }

  DateTime? _effectiveReminderDateForDose(_TdDose dose) {
    // If dose has dueDate use it, else today (TD1).
    return dose.dueDate ?? DateTime.now().add(const Duration(days: 1));
  }

  Color _statusColor(_TdStatus s) {
    switch (s) {
      case _TdStatus.completed:
        return const Color(0xFF2E7D32);
      case _TdStatus.upcoming:
        return const Color(0xFF1565C0);
      case _TdStatus.missed:
        return const Color(0xFFC62828);
    }
  }

  IconData _statusIcon(_TdStatus s) {
    switch (s) {
      case _TdStatus.completed:
        return Icons.check_circle;
      case _TdStatus.upcoming:
        return Icons.schedule;
      case _TdStatus.missed:
        return Icons.error;
    }
  }

  List<String> get _allDoseKeys => [
        _doseKey(pregnant: true, dose: 'TD1'),
        _doseKey(pregnant: true, dose: 'TD2'),
        _doseKey(pregnant: true, dose: 'TD3'),
        _doseKey(pregnant: true, dose: 'TD4'),
        _doseKey(pregnant: true, dose: 'TD5'),
        _doseKey(pregnant: false, dose: 'TD1'),
        _doseKey(pregnant: false, dose: 'TD2'),
        _doseKey(pregnant: false, dose: 'TD3'),
        _doseKey(pregnant: false, dose: 'TD4'),
        _doseKey(pregnant: false, dose: 'TD5'),
      ];

  String _doseKey({required bool pregnant, required String dose}) => '${pregnant ? 'preg' : 'non'}_$dose';

  int? _doseNotificationBaseId(String doseKey) {
    final digits = doseKey.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isNotEmpty) return int.tryParse(digits);
    final h = doseKey.hashCode.abs();
    return h % 100000;
  }

  static DateTime _addMonths(DateTime dt, int months) {
    final y = dt.year + ((dt.month - 1 + months) ~/ 12);
    final m = ((dt.month - 1 + months) % 12) + 1;
    final day = dt.day;
    final last = DateTime(y, m + 1, 0).day;
    return DateTime(y, m, day.clamp(1, last));
  }

  static DateTime _addYears(DateTime dt, int years) {
    final y = dt.year + years;
    final m = dt.month;
    final day = dt.day;
    final last = DateTime(y, m + 1, 0).day;
    return DateTime(y, m, day.clamp(1, last));
  }
}

enum _TdStatus { completed, upcoming, missed }

extension on _TdStatus {
  String get label {
    switch (this) {
      case _TdStatus.completed:
        return 'Completed';
      case _TdStatus.upcoming:
        return 'Upcoming';
      case _TdStatus.missed:
        return 'Missed';
    }
  }
}

class _TdDose {
  final String keyName; // TD1..TD5
  final String title;
  final String subtitle;
  final DateTime? givenDate;
  final DateTime? dueDate;

  const _TdDose({
    required this.keyName,
    required this.title,
    required this.subtitle,
    required this.givenDate,
    required this.dueDate,
  });

  _TdDose copyWith({DateTime? dueDate}) {
    return _TdDose(
      keyName: keyName,
      title: title,
      subtitle: subtitle,
      givenDate: givenDate,
      dueDate: dueDate ?? this.dueDate,
    );
  }
}

