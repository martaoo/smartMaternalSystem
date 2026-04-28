import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../services/notification_service.dart';
import '../data/mock_mother_repository.dart';
import '../vaccination/data/vaccination_mock_service.dart';
import '../vaccination/models/vaccination_status.dart';
import '../models/mother_entities.dart';

class MotherVaccinationScreen extends StatefulWidget {
  const MotherVaccinationScreen({super.key});

  @override
  State<MotherVaccinationScreen> createState() => _MotherVaccinationScreenState();
}

class _MotherVaccinationScreenState extends State<MotherVaccinationScreen>
    with SingleTickerProviderStateMixin {
  final NotificationService _notificationService = NotificationService();

  late final TabController _tab;

  List<dynamic> _records = const [];
  final Set<String> _reminderEnabledIds = {};
  bool _remindersLoading = true;

  // For demo (until you connect real child profile)
  final String _childName = 'Baby Hana';
  final String _childAgeText = '3 months';
  final String _childWeightText = '5.2 kg';

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 3, vsync: this);
    _tab.addListener(() {
      if (mounted) setState(() {});
    });
    _reload();
    _initReminders();
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  void _reload() {
    setState(() {
      _records = VaccinationMockService.getRecords();
    });
  }

  Future<void> _initReminders() async {
    try {
      await _notificationService.initialize();
      await _notificationService.requestPermissions();
      final pending = await _notificationService.getPendingNotifications();
      final ids = pending.map((p) => p.id).toSet();

      final enabled = <String>{};
      for (final r in VaccinationMockService.getRecords()) {
        final base = _notificationBaseId(r.id);
        if (base == null) continue;
        if (ids.contains(base + 1000) || ids.contains(base + 2000)) {
          enabled.add(r.id);
        }
      }

      if (!mounted) return;
      setState(() {
        _reminderEnabledIds
          ..clear()
          ..addAll(enabled);
        _remindersLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _remindersLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final vaccineSchedule = _buildVaccineSchedule(_records);
    final vitaminSchedule = _buildVitaminASchedule(_records);

    final nextVaccine = _findNextRecord(vaccineSchedule);
    final nextVitamin = _findNextRecord(vitaminSchedule);

    final header = _headerConfigForIndex(_tab.index);

    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            pinned: true,
            floating: true,
            expandedHeight: 160,
            backgroundColor: header.primary,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [header.primary, header.secondary],
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 62, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.18),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withOpacity(0.18)),
                            ),
                            child: Icon(header.icon, color: Colors.white),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              header.title,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 22),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        header.subtitle,
                        style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w600),
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
                Tab(text: 'Child Vaccines', icon: Icon(Icons.vaccines)),
                Tab(text: 'Vitamin A', icon: Icon(Icons.local_drink)),
                Tab(text: 'Mother TD', icon: Icon(Icons.health_and_safety)),
              ],
            ),
          ),
        ],
        body: TabBarView(
          controller: _tab,
          children: [
            _buildChildTab(
              themeColor: const Color(0xFF009688),
              reminderColor: const Color(0xFFFF9800),
              nextRecord: nextVaccine,
              groups: vaccineSchedule,
            ),
            _buildChildTab(
              themeColor: const Color(0xFFFF9800),
              reminderColor: const Color(0xFFFFB74D),
              nextRecord: nextVitamin,
              groups: vitaminSchedule,
              overrideNextTitle: 'Next Vitamin A Dose',
              overrideTimelineTitle: 'Vitamin A Timeline',
            ),
            const _MotherTdTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildChildTab({
    required Color themeColor,
    required Color reminderColor,
    required VaccinationRecord? nextRecord,
    required List<_ScheduleGroup> groups,
    String? overrideNextTitle,
    String? overrideTimelineTitle,
  }) {
    return ListView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      children: [
        _childInfoCard(themeColor: themeColor),
        const SizedBox(height: 12),
        _nextReminderCard(
          themeColor: themeColor,
          reminderColor: reminderColor,
          title: overrideNextTitle ?? 'Next Vaccine',
          record: nextRecord,
        ),
        const SizedBox(height: 14),
        Text(overrideTimelineTitle ?? 'Vaccination Timeline', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
        const SizedBox(height: 10),
        ...groups.map((g) => _timelineGroupCard(themeColor: themeColor, group: g)),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _childInfoCard({required Color themeColor}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE8EAF6)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 14,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: themeColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(Icons.child_care, color: themeColor),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_childName, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                const SizedBox(height: 4),
                Text('Age: $_childAgeText', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text('Weight: $_childWeightText', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _nextReminderCard({
    required Color themeColor,
    required Color reminderColor,
    required String title,
    required VaccinationRecord? record,
  }) {
    final reminderEnabled = record != null && _reminderEnabledIds.contains(record.id);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: reminderColor.withOpacity(0.18),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: reminderColor.withOpacity(0.35)),
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
            child: Icon(Icons.notifications_active, color: themeColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                if (record == null)
                  Text('No upcoming dose', style: TextStyle(color: Colors.grey[800], fontWeight: FontWeight.w700))
                else ...[
                  Text(DateFormat('MMM d').format(record.dueDate), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                  const SizedBox(height: 2),
                  Text(record.ageLabel, style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                ],
              ],
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextButton(
                onPressed: record == null ? null : () => _openRecordDetails(record, themeColor: themeColor),
                child: const Text('View Details'),
              ),
              const SizedBox(height: 2),
              TextButton(
                onPressed: (record == null || _remindersLoading)
                    ? null
                    : () async {
                        await _toggleReminderForRecord(record);
                      },
                child: Text(reminderEnabled ? 'Disable' : 'Set Reminder'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _timelineGroupCard({required Color themeColor, required _ScheduleGroup group}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE8EAF6)),
      ),
      child: Theme(
        data: ThemeData(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
          leading: _TimelineMarker(color: themeColor),
          title: Text(group.title, style: const TextStyle(fontWeight: FontWeight.w900)),
          subtitle: Text('Target: ${DateFormat('MMM d, yyyy').format(group.targetDate)}'),
          children: group.items.map((item) {
            final status = VaccinationMockService.getStatus(item);
            final badge = _StatusBadge.fromStatus(status);
            return Container(
              margin: const EdgeInsets.only(top: 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: themeColor.withOpacity(0.10),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(Icons.vaccines_rounded, color: themeColor),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.vaccine, style: const TextStyle(fontWeight: FontWeight.w900)),
                        const SizedBox(height: 4),
                        Text(
                          _statusSubtitle(item, status),
                          style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  _StatusBadgeWidget(badge: badge),
                  const SizedBox(width: 8),
                  IconButton(
                    tooltip: 'Details',
                    onPressed: () => _openRecordDetails(item, themeColor: themeColor),
                    icon: Icon(Icons.chevron_right, color: Colors.grey[600]),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  String _statusSubtitle(VaccinationRecord r, VaccinationStatus s) {
    if (s == VaccinationStatus.completed && r.administeredDate != null) {
      return 'Given: ${DateFormat('MMM d, yyyy').format(r.administeredDate!)}${(r.note ?? '').trim().isEmpty ? '' : ' • ${r.note}'}';
    }
    return 'Due: ${DateFormat('MMM d, yyyy').format(r.dueDate)}';
  }

  Future<void> _toggleReminderForRecord(VaccinationRecord record) async {
    final base = _notificationBaseId(record.id);
    if (base == null) return;
    final enabled = _reminderEnabledIds.contains(record.id);

    if (enabled) {
      await _notificationService.cancelNotification(base + 1000);
      await _notificationService.cancelNotification(base + 2000);
      setState(() => _reminderEnabledIds.remove(record.id));
    } else {
      await _notificationService.schedulePreReminder(
        appointmentId: base,
        title: record.vaccine,
        facility: record.ageLabel,
        appointmentTime: record.dueDate,
        appointmentType: 'Vaccine',
      );
      await _notificationService.scheduleSameDayReminder(
        appointmentId: base,
        title: record.vaccine,
        facility: record.ageLabel,
        appointmentTime: record.dueDate,
        appointmentType: 'Vaccine',
      );
      setState(() => _reminderEnabledIds.add(record.id));
    }

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(enabled ? 'Reminder disabled' : 'Reminder set')),
    );
  }

  Future<void> _openRecordDetails(VaccinationRecord record, {required Color themeColor}) async {
    final status = VaccinationMockService.getStatus(record);
    final weightCtrl = TextEditingController();
    DateTime givenDate = DateTime.now();
    bool reminderEnabled = _reminderEnabledIds.contains(record.id);

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
                        Row(
                          children: [
                            Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: themeColor.withOpacity(0.10),
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: Icon(Icons.vaccines, color: themeColor),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                record.vaccine,
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _infoRow('Visit', record.ageLabel),
                        _infoRow('Due date', DateFormat('EEEE, MMM d, yyyy').format(record.dueDate)),
                        _infoRow('Status', status.label),
                        if ((record.note ?? '').trim().isNotEmpty) _infoRow('Note', record.note!.trim()),
                        const SizedBox(height: 14),
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
                              const Text('Record vaccination', style: TextStyle(fontWeight: FontWeight.w900)),
                              const SizedBox(height: 10),
                              TextField(
                                controller: weightCtrl,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  labelText: 'Child weight (kg)',
                                  hintText: 'e.g. 5.2',
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                                ),
                              ),
                              const SizedBox(height: 10),
                              InkWell(
                                onTap: () async {
                                  final picked = await showDatePicker(
                                    context: context,
                                    initialDate: givenDate,
                                    firstDate: DateTime.now().subtract(const Duration(days: 365 * 5)),
                                    lastDate: DateTime.now().add(const Duration(days: 1)),
                                  );
                                  if (picked != null) setSheetState(() => givenDate = picked);
                                },
                                borderRadius: BorderRadius.circular(14),
                                child: InputDecorator(
                                  decoration: InputDecoration(
                                    labelText: 'Date given',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                                  ),
                                  child: Text(DateFormat('MMM d, yyyy').format(givenDate)),
                                ),
                              ),
                              const SizedBox(height: 12),
                              ElevatedButton.icon(
                                onPressed: () async {
                                  final weight = weightCtrl.text.trim();
                                  final note = weight.isEmpty ? null : 'Weight: $weight kg';
                                  await VaccinationMockService.markCompleted(
                                    record.id,
                                    administeredDate: givenDate,
                                    note: note,
                                  );
                                  _reload();
                                  if (!context.mounted) return;
                                  Navigator.pop(context);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Saved as completed.')),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF2E7D32),
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                ),
                                icon: const Icon(Icons.check_circle),
                                label: const Text('Mark Completed', style: TextStyle(fontWeight: FontWeight.w900)),
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
                                  reminderEnabled ? 'Reminder enabled' : 'Enable reminder for this dose',
                                  style: const TextStyle(fontWeight: FontWeight.w800),
                                ),
                              ),
                              TextButton(
                                onPressed: _remindersLoading
                                    ? null
                                    : () async {
                                        final base = _notificationBaseId(record.id);
                                        if (base == null) return;
                                        if (reminderEnabled) {
                                          await _notificationService.cancelNotification(base + 1000);
                                          await _notificationService.cancelNotification(base + 2000);
                                          setState(() => _reminderEnabledIds.remove(record.id));
                                          setSheetState(() => reminderEnabled = false);
                                        } else {
                                          await _notificationService.schedulePreReminder(
                                            appointmentId: base,
                                            title: record.vaccine,
                                            facility: record.ageLabel,
                                            appointmentTime: record.dueDate,
                                            appointmentType: 'Vaccine',
                                          );
                                          await _notificationService.scheduleSameDayReminder(
                                            appointmentId: base,
                                            title: record.vaccine,
                                            facility: record.ageLabel,
                                            appointmentTime: record.dueDate,
                                            appointmentType: 'Vaccine',
                                          );
                                          setState(() => _reminderEnabledIds.add(record.id));
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

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 92,
            child: Text(label, style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w800)),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }

  int? _notificationBaseId(String id) {
    final digits = id.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isNotEmpty) return int.tryParse(digits);
    final h = id.hashCode.abs();
    return h % 100000;
  }

  VaccinationRecord? _findNextRecord(List<_ScheduleGroup> groups) {
    final all = groups.expand((g) => g.items).toList();
    final upcoming = all.where((r) => VaccinationMockService.getStatus(r) == VaccinationStatus.upcoming).toList()
      ..sort((a, b) => a.dueDate.compareTo(b.dueDate));
    return upcoming.isEmpty ? null : upcoming.first;
  }

  List<_ScheduleGroup> _buildVaccineSchedule(List<dynamic> all) {
    VaccinationRecord? match(String contains) {
      try {
        return all.firstWhere((r) => r.vaccine.toLowerCase().contains(contains.toLowerCase()));
      } catch (_) {
        return null;
      }
    }

    // Uses your clean schedule.
    final groups = <_ScheduleGroup>[
      _ScheduleGroup(
        title: 'At Birth',
        targetDate: match('BCG')?.dueDate ?? DateTime.now(),
        items: [
          match('BCG') ?? _placeholder('BCG', 'At Birth', DateTime.now()),
          match('OPV-0') ?? _placeholder('OPV 0', 'At Birth', DateTime.now()),
          match('Hepatitis B') ?? _placeholder('Birth Dose', 'At Birth', DateTime.now()),
        ],
      ),
      _ScheduleGroup(
        title: '6 Weeks (≈45 days)',
        targetDate: match('Day 45')?.dueDate ?? DateTime.now().add(const Duration(days: 45)),
        items: [
          match('OPV-1') ?? _placeholder('OPV 1', '6 Weeks', DateTime.now().add(const Duration(days: 45))),
          match('Pentavalent 1') ?? _placeholder('DPT-HepB-Hib 1', '6 Weeks', DateTime.now().add(const Duration(days: 45))),
          match('PCV-1') ?? _placeholder('PCV 1', '6 Weeks', DateTime.now().add(const Duration(days: 45))),
          match('Rotavirus-1') ?? _placeholder('Rota 1', '6 Weeks', DateTime.now().add(const Duration(days: 45))),
        ],
      ),
      _ScheduleGroup(
        title: '10 Weeks',
        targetDate: match('3 Months')?.dueDate ?? DateTime.now().add(const Duration(days: 70)),
        items: [
          match('OPV-2') ?? _placeholder('OPV 2', '10 Weeks', DateTime.now().add(const Duration(days: 70))),
          match('Pentavalent 2') ?? _placeholder('DPT-HepB-Hib 2', '10 Weeks', DateTime.now().add(const Duration(days: 70))),
          match('PCV-2') ?? _placeholder('PCV 2', '10 Weeks', DateTime.now().add(const Duration(days: 70))),
          match('Rotavirus-2') ?? _placeholder('Rota 2', '10 Weeks', DateTime.now().add(const Duration(days: 70))),
        ],
      ),
      _ScheduleGroup(
        title: '14 Weeks',
        targetDate: match('Pentavalent 3')?.dueDate ?? DateTime.now().add(const Duration(days: 98)),
        items: [
          match('OPV-3') ?? _placeholder('OPV 3', '14 Weeks', DateTime.now().add(const Duration(days: 98))),
          match('IPV') ?? _placeholder('IPV 1', '14 Weeks', DateTime.now().add(const Duration(days: 98))),
          match('Pentavalent 3') ?? _placeholder('DPT-HepB-Hib 3', '14 Weeks', DateTime.now().add(const Duration(days: 98))),
          match('PCV-3') ?? _placeholder('PCV 3', '14 Weeks', DateTime.now().add(const Duration(days: 98))),
          _placeholder('Rota 3', '14 Weeks', DateTime.now().add(const Duration(days: 98))),
        ],
      ),
      _ScheduleGroup(
        title: '6 Months+',
        targetDate: match('Vitamin A')?.dueDate ?? DateTime.now().add(const Duration(days: 180)),
        items: [
          match('Vitamin A') ?? _placeholder('Vitamin A', '6 Months+', DateTime.now().add(const Duration(days: 180))),
          _placeholder('Malaria 1', '6 Months+', DateTime.now().add(const Duration(days: 180))),
        ],
      ),
      _ScheduleGroup(
        title: 'Follow-up',
        targetDate: DateTime.now().add(const Duration(days: 210)),
        items: [
          _placeholder('Malaria 2', 'Follow-up', DateTime.now().add(const Duration(days: 210))),
        ],
      ),
    ];

    return groups;
  }

  List<_ScheduleGroup> _buildVitaminASchedule(List<dynamic> all) {
    // Build clean vitamin A schedule every 6 months (6m..60m). We use a demo birth date.
    final birth = DateTime.now().subtract(const Duration(days: 100));
    final doses = <int>[6, 12, 18, 24, 30, 36, 42, 48, 54, 60];

    VaccinationRecord? existingForMonth(int m) {
      final key = 'Vitamin A $m';
      try {
        return all.firstWhere((r) => r.vaccine.toLowerCase().contains(key.toLowerCase()));
      } catch (_) {
        // fallback: match any generic Vitamin A near due date
        try {
          final due = DateTime(birth.year, birth.month, birth.day).add(Duration(days: (m * 30)));
          return all.firstWhere((r) => r.vaccine.toLowerCase().contains('vitamin a') && _near(r.dueDate, due));
        } catch (_) {
          return null;
        }
      }
    }

    final items = doses.map((m) {
      final due = birth.add(Duration(days: m * 30));
      return existingForMonth(m) ?? _placeholder('Vitamin A $m months', '$m months', due);
    }).toList();

    // Group by year-ish blocks for nicer timeline
    final groups = <_ScheduleGroup>[
      _ScheduleGroup(title: '6–12 Months', targetDate: items.first.dueDate, items: items.take(2).toList()),
      _ScheduleGroup(title: '18–24 Months', targetDate: items[2].dueDate, items: items.sublist(2, 4)),
      _ScheduleGroup(title: '30–36 Months', targetDate: items[4].dueDate, items: items.sublist(4, 6)),
      _ScheduleGroup(title: '42–48 Months', targetDate: items[6].dueDate, items: items.sublist(6, 8)),
      _ScheduleGroup(title: '54–60 Months', targetDate: items[8].dueDate, items: items.sublist(8, 10)),
    ];
    return groups;
  }

  bool _near(DateTime a, DateTime b) => (a.difference(b).inDays).abs() <= 25;

  VaccinationRecord _placeholder(String vaccine, String ageLabel, DateTime dueDate) {
    return VaccinationRecord(
      id: 'PH-${vaccine.hashCode}',
      vaccine: vaccine,
      ageLabel: ageLabel,
      dueDate: dueDate,
      completed: false,
      administeredDate: null,
      note: null,
    );
  }

  _HeaderConfig _headerConfigForIndex(int index) {
    switch (index) {
      case 0:
        return const _HeaderConfig(
          title: 'Child Vaccines',
          subtitle: 'Timeline, reminders, and recording',
          primary: Color(0xFF009688),
          secondary: Color(0xFF00695C),
          icon: Icons.vaccines,
        );
      case 1:
        return const _HeaderConfig(
          title: 'Vitamin A Supplement',
          subtitle: 'Keep your child strong and healthy',
          primary: Color(0xFFFF9800),
          secondary: Color(0xFFEF6C00),
          icon: Icons.medication_liquid,
        );
      default:
        return const _HeaderConfig(
          title: 'Mother TD Vaccination',
          subtitle: 'Protect mother and baby from infection',
          primary: Color(0xFF009688),
          secondary: Color(0xFF3949AB),
          icon: Icons.health_and_safety,
        );
    }
  }
}

class _ScheduleGroup {
  final String title;
  final DateTime targetDate;
  final List<VaccinationRecord> items;

  const _ScheduleGroup({
    required this.title,
    required this.targetDate,
    required this.items,
  });
}

class _HeaderConfig {
  final String title;
  final String subtitle;
  final Color primary;
  final Color secondary;
  final IconData icon;

  const _HeaderConfig({
    required this.title,
    required this.subtitle,
    required this.primary,
    required this.secondary,
    required this.icon,
  });
}

class _TimelineMarker extends StatelessWidget {
  final Color color;
  const _TimelineMarker({required this.color});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 18,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned.fill(
            child: Align(
              alignment: Alignment.center,
              child: Container(width: 2, height: 44, color: color.withOpacity(0.22)),
            ),
          ),
          Container(
            width: 14,
            height: 14,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
        ],
      ),
    );
  }
}

class _StatusBadge {
  final String label;
  final Color color;
  final IconData icon;

  const _StatusBadge({required this.label, required this.color, required this.icon});

  static _StatusBadge fromStatus(VaccinationStatus s) {
    switch (s) {
      case VaccinationStatus.completed:
        return const _StatusBadge(label: 'Completed', color: Color(0xFF2E7D32), icon: Icons.check_circle);
      case VaccinationStatus.upcoming:
        return const _StatusBadge(label: 'Upcoming', color: Color(0xFF1565C0), icon: Icons.schedule);
      case VaccinationStatus.missed:
        return const _StatusBadge(label: 'Missed', color: Color(0xFFC62828), icon: Icons.cancel);
    }
  }
}

class _StatusBadgeWidget extends StatelessWidget {
  final _StatusBadge badge;
  const _StatusBadgeWidget({required this.badge});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: badge.color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: badge.color.withOpacity(0.22)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(badge.icon, size: 14, color: badge.color),
          const SizedBox(width: 6),
          Text(
            badge.label,
            style: TextStyle(color: badge.color, fontWeight: FontWeight.w900, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _MotherTdTab extends StatefulWidget {
  const _MotherTdTab();

  @override
  State<_MotherTdTab> createState() => _MotherTdTabState();
}

class _MotherTdTabState extends State<_MotherTdTab> with SingleTickerProviderStateMixin {
  late final TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
    _tab.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pregnant = _tab.index == 0;
    final message = pregnant ? 'Protection for mother & newborn' : 'Long‑term protection against tetanus';
    final dates = MockMotherRepository.getTdDates(pregnant: pregnant);
    final doses = _buildTdDoses(dates);
    final completed = doses.where((d) => d.givenDate != null).length;
    final next = doses.firstWhere((d) => d.givenDate == null, orElse: () => doses.last);
    final nextLabel = next.givenDate == null ? next.title : 'All completed';

    return ListView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: const Color(0xFFE8EAF6)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TabBar(
                controller: _tab,
                labelColor: const Color(0xFF009688),
                unselectedLabelColor: Colors.black54,
                labelStyle: const TextStyle(fontWeight: FontWeight.w900),
                indicatorColor: const Color(0xFF009688),
                tabs: const [
                  Tab(icon: Icon(Icons.pregnant_woman), text: 'Pregnant'),
                  Tab(icon: Icon(Icons.woman), text: 'Non‑Pregnant'),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: const Color(0xFF009688).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.shield, color: Color(0xFF009688)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w900))),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF009688).withOpacity(0.10),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text('$completed / 5', style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF00695C))),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
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
                    Text(nextLabel, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                    const SizedBox(height: 2),
                    const Text('📍 Visit nearest health center', style: TextStyle(fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        const Text('TD Timeline', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
        const SizedBox(height: 10),
        ...doses.map((d) => _tdDoseCard(context, pregnant: pregnant, dose: d)),
      ],
    );
  }

  List<_TdDose> _buildTdDoses(Map<String, DateTime?> dates) {
    final td1 = dates['TD1'];
    final td2 = dates['TD2'];
    final td3 = dates['TD3'];
    final td4 = dates['TD4'];
    final td5 = dates['TD5'];

    DateTime? td2Due = td1 == null ? null : td1.add(const Duration(days: 28));
    DateTime? td3Due = td2 == null ? null : _addMonths(td2, 6);
    DateTime? td4Due = td3 == null ? null : _addYears(td3, 1);
    DateTime? td5Due = td4 == null ? null : _addYears(td4, 1);

    return [
      _TdDose(keyName: 'TD1', title: 'TD1', subtitle: 'First contact', givenDate: td1, nextDue: td2Due),
      _TdDose(keyName: 'TD2', title: 'TD2', subtitle: '4 weeks after TD1', givenDate: td2, nextDue: td3Due),
      _TdDose(keyName: 'TD3', title: 'TD3', subtitle: '6 months after TD2', givenDate: td3, nextDue: td4Due),
      _TdDose(keyName: 'TD4', title: 'TD4', subtitle: '1 year after TD3', givenDate: td4, nextDue: td5Due),
      _TdDose(keyName: 'TD5', title: 'TD5', subtitle: 'Final dose (1 year after TD4)', givenDate: td5, nextDue: null),
    ];
  }

  Widget _tdDoseCard(BuildContext context, {required bool pregnant, required _TdDose dose}) {
    final status = _tdStatus(dose);
    final color = _tdColor(status);
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: () => _openTdDoseDetails(context, pregnant: pregnant, dose: dose),
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
                    child: Text(status, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 12)),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              _line('Date given', dose.givenDate == null ? 'Not recorded' : DateFormat('MMM d, yyyy').format(dose.givenDate!)),
              _line('Next appointment', dose.nextDue == null ? '—' : DateFormat('MMM d, yyyy').format(dose.nextDue!)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _line(String l, String v) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(width: 130, child: Text(l, style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w800))),
          Expanded(child: Text(v, style: const TextStyle(fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }

  String _tdStatus(_TdDose d) {
    if (d.givenDate != null) return 'Completed';
    if (d.keyName == 'TD1') return 'Upcoming';
    final due = d.nextDue;
    if (due == null) return 'Upcoming';
    final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    final dd = DateTime(due.year, due.month, due.day);
    return dd.isBefore(today) ? 'Missed' : 'Upcoming';
  }

  Color _tdColor(String s) {
    switch (s) {
      case 'Completed':
        return const Color(0xFF2E7D32);
      case 'Missed':
        return const Color(0xFFC62828);
      default:
        return const Color(0xFF1565C0);
    }
  }

  Future<void> _openTdDoseDetails(BuildContext context, {required bool pregnant, required _TdDose dose}) async {
    DateTime selected = dose.givenDate ?? DateTime.now();
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
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 18),
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 52,
                      height: 5,
                      decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(dose.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
                  const SizedBox(height: 6),
                  Text(dose.subtitle, style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                  const SizedBox(height: 14),
                  InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: selected,
                        firstDate: DateTime.now().subtract(const Duration(days: 365 * 10)),
                        lastDate: DateTime.now().add(const Duration(days: 1)),
                      );
                      if (picked != null) setSheetState(() => selected = picked);
                    },
                    borderRadius: BorderRadius.circular(14),
                    child: InputDecorator(
                      decoration: InputDecoration(
                        labelText: 'Date given',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: Text(DateFormat('MMM d, yyyy').format(selected)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: () async {
                      await MockMotherRepository.setTdDate(pregnant: pregnant, doseKey: dose.keyName, dateGiven: selected);
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
                    label: const Text('Save', style: TextStyle(fontWeight: FontWeight.w900)),
                  ),
                  const SizedBox(height: 8),
                  Center(child: TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  static DateTime _addMonths(DateTime dt, int months) {
    final y = dt.year + ((dt.month - 1 + months) ~/ 12);
    final m = ((dt.month - 1 + months) % 12) + 1;
    final last = DateTime(y, m + 1, 0).day;
    return DateTime(y, m, dt.day.clamp(1, last));
  }

  static DateTime _addYears(DateTime dt, int years) {
    final y = dt.year + years;
    final last = DateTime(y, dt.month + 1, 0).day;
    return DateTime(y, dt.month, dt.day.clamp(1, last));
  }
}

class _TdDose {
  final String keyName;
  final String title;
  final String subtitle;
  final DateTime? givenDate;
  final DateTime? nextDue;

  const _TdDose({
    required this.keyName,
    required this.title,
    required this.subtitle,
    required this.givenDate,
    required this.nextDue,
  });
}
