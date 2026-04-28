import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../services/notification_service.dart';
import '../data/mock_mother_repository.dart';
import '../models/mother_entities.dart';

class MotherAppointmentsScreen extends StatefulWidget {
  const MotherAppointmentsScreen({super.key});

  @override
  State<MotherAppointmentsScreen> createState() => _MotherAppointmentsScreenState();
}

class _MotherAppointmentsScreenState extends State<MotherAppointmentsScreen> with TickerProviderStateMixin {
  final NotificationService _notificationService = NotificationService();

  List<MotherAppointment> _appointments = const [];
  DateTime _monthCursor = DateTime(DateTime.now().year, DateTime.now().month);
  DateTime _selectedDate = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
  _StatusFilter _filter = _StatusFilter.upcoming;

  bool _loading = true;
  bool _remindersLoading = true;
  final Set<String> _reminderEnabledAppointmentIds = {};

  @override
  void initState() {
    super.initState();
    _reload();
    _initReminders();
  }

  Future<void> _reload() async {
    setState(() => _loading = true);
    final items = MockMotherRepository.getAppointments();
    items.sort((a, b) => a.dateTime.compareTo(b.dateTime));
    setState(() {
      _appointments = items;
      _loading = false;
    });
  }

  Future<void> _initReminders() async {
    try {
      await _notificationService.initialize();
      await _notificationService.requestPermissions();
      final pending = await _notificationService.getPendingNotifications();
      final ids = pending.map((p) => p.id).toSet();

      final enabled = <String>{};
      for (final a in MockMotherRepository.getAppointments()) {
        final base = _notificationBaseId(a.id);
        if (base == null) continue;
        if (ids.contains(base + 1000) || ids.contains(base + 2000)) {
          enabled.add(a.id);
        }
      }

      if (!mounted) return;
      setState(() {
        _reminderEnabledAppointmentIds
          ..clear()
          ..addAll(enabled);
        _remindersLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _remindersLoading = false);
    }
  }

  Future<void> _refresh() async {
    await _reload();
    await _initReminders();
  }

  @override
  Widget build(BuildContext context) {
    final next = _appointments.where((a) => _derivedStatus(a) == _ApptStatus.upcoming).toList()
      ..sort((a, b) => a.dateTime.compareTo(b.dateTime));
    final nextVisit = next.isEmpty ? null : next.first;

    final selectedDayAppointments = _appointments.where((a) => _isSameDay(a.dateTime, _selectedDate)).toList()
      ..sort((a, b) => a.dateTime.compareTo(b.dateTime));

    final filtered = _filteredAppointments();

    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      appBar: AppBar(
        title: const Text('Appointments', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: const Color(0xFFB01257),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: 'Today',
            onPressed: () {
              final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
              setState(() {
                _monthCursor = DateTime(today.year, today.month);
                _selectedDate = today;
              });
            },
            icon: const Icon(Icons.today),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            _buildHero(nextVisit),
            const SizedBox(height: 14),
            _buildCalendar(),
            const SizedBox(height: 14),
            _buildFilters(),
            const SizedBox(height: 12),
            if (selectedDayAppointments.isNotEmpty) ...[
              _buildSelectedDayCard(selectedDayAppointments),
              const SizedBox(height: 14),
            ],
            Row(
              children: [
                Text(_filter.label, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF2F4F8),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text('${filtered.length}', style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.black54)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(30),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (filtered.isEmpty)
              _buildEmptyState()
            else
              ...filtered.map(_buildAppointmentCard),
            const SizedBox(height: 90),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'motherAppointmentsBookFab',
        onPressed: _bookDialog,
        backgroundColor: const Color(0xFFB01257),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add'),
      ),
    );
  }

  Widget _buildHero(MotherAppointment? nextVisit) {
    final upcomingCount = _appointments.where((a) => _derivedStatus(a) == _ApptStatus.upcoming).length;
    final completedCount = _appointments.where((a) => _derivedStatus(a) == _ApptStatus.completed).length;
    final missedCount = _appointments.where((a) => _derivedStatus(a) == _ApptStatus.missed).length;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFB01257), Color(0xFF6A1B9A)],
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFB01257).withOpacity(0.28),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
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
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.calendar_month, color: Colors.white),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Your schedule',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
                ),
              ),
              _miniPill(icon: Icons.upcoming, label: 'Upcoming $upcomingCount'),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _miniPill(icon: Icons.check_circle, label: 'Completed $completedCount'),
              const SizedBox(width: 8),
              _miniPill(icon: Icons.error, label: 'Missed $missedCount'),
            ],
          ),
          const SizedBox(height: 12),
          if (nextVisit == null)
            Text(
              'No upcoming visits. Add ANC visits, vaccination follow-ups, and checkups.',
              style: TextStyle(color: Colors.white.withOpacity(0.9), height: 1.35),
            )
          else ...[
            Text(
              'Next: ${nextVisit.title}',
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 6),
            Text(
              '${DateFormat('EEE, MMM d • h:mm a').format(nextVisit.dateTime)} • ${nextVisit.facility}',
              style: TextStyle(color: Colors.white.withOpacity(0.85)),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: (_remindersLoading || _derivedStatus(nextVisit) != _ApptStatus.upcoming)
                        ? null
                        : () => _toggleReminder(nextVisit),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFFB01257),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    icon: Icon(
                      _reminderEnabledAppointmentIds.contains(nextVisit.id) ? Icons.notifications_off : Icons.notifications_active,
                      size: 18,
                    ),
                    label: Text(
                      _reminderEnabledAppointmentIds.contains(nextVisit.id) ? 'Disable reminder' : 'Enable reminder',
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                OutlinedButton(
                  onPressed: () => _detailsSheet(nextVisit),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: BorderSide(color: Colors.white.withOpacity(0.7)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                  ),
                  child: const Text('Details', style: TextStyle(fontWeight: FontWeight.w900)),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  static Widget _miniPill({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.16),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withOpacity(0.22)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildCalendar() {
    final monthLabel = DateFormat('MMMM yyyy').format(_monthCursor);
    final days = _buildCalendarDays(_monthCursor);

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: () => setState(() {
                    _monthCursor = DateTime(_monthCursor.year, _monthCursor.month - 1);
                  }),
                  icon: const Icon(Icons.chevron_left),
                ),
                Expanded(
                  child: Text(
                    monthLabel,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                ),
                IconButton(
                  onPressed: () => setState(() {
                    _monthCursor = DateTime(_monthCursor.year, _monthCursor.month + 1);
                  }),
                  icon: const Icon(Icons.chevron_right),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: const ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                  .map((d) => Text(d, style: TextStyle(fontWeight: FontWeight.w800, color: Colors.black54)))
                  .toList(),
            ),
            const SizedBox(height: 10),
            Wrap(spacing: 8, runSpacing: 8, children: days),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildCalendarDays(DateTime month) {
    final first = DateTime(month.year, month.month, 1);
    final startingWeekday = first.weekday - 1; // Mon=0
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);

    final results = <Widget>[];
    for (var i = 0; i < startingWeekday; i++) {
      results.add(const SizedBox(width: 42, height: 46));
    }

    for (var day = 1; day <= daysInMonth; day++) {
      final date = DateTime(month.year, month.month, day);
      final selected = _isSameDay(date, _selectedDate);
      final isToday = _isSameDay(date, today);

      final hasAny = _appointments.any((a) => _isSameDay(a.dateTime, date));
      final hasUpcoming = _appointments.any((a) => _isSameDay(a.dateTime, date) && _derivedStatus(a) == _ApptStatus.upcoming);
      final hasMissed = _appointments.any((a) => _isSameDay(a.dateTime, date) && _derivedStatus(a) == _ApptStatus.missed);

      final dotColor = hasMissed
          ? const Color(0xFFC62828)
          : (hasUpcoming ? const Color(0xFFB01257) : const Color(0xFF2E7D32));
      final borderColor = hasAny ? dotColor.withOpacity(0.22) : Colors.transparent;
      final fillColor = selected ? dotColor : (isToday ? dotColor.withOpacity(0.08) : Colors.transparent);

      results.add(
        InkWell(
          onTap: () => setState(() => _selectedDate = date),
          borderRadius: BorderRadius.circular(14),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            width: 42,
            height: 46,
            padding: const EdgeInsets.symmetric(vertical: 7),
            decoration: BoxDecoration(
              color: fillColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: selected ? Colors.transparent : borderColor),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '$day',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    color: selected ? Colors.white : Colors.black87,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                if (hasAny)
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: selected ? Colors.white : dotColor,
                      shape: BoxShape.circle,
                    ),
                  )
                else
                  const SizedBox(height: 6),
              ],
            ),
          ),
        ),
      );
    }

    return results;
  }

  Widget _buildFilters() {
    return Row(
      children: [
        Expanded(child: _filterChip(_StatusFilter.upcoming)),
        const SizedBox(width: 8),
        Expanded(child: _filterChip(_StatusFilter.completed)),
        const SizedBox(width: 8),
        Expanded(child: _filterChip(_StatusFilter.missed)),
      ],
    );
  }

  Widget _filterChip(_StatusFilter f) {
    final selected = _filter == f;
    final color = f.color;
    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: () => setState(() => _filter = f),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        decoration: BoxDecoration(
          color: selected ? color : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: selected ? color : color.withOpacity(0.25)),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: color.withOpacity(0.18),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(f.icon, size: 16, color: selected ? Colors.white : color),
            const SizedBox(width: 6),
            Text(
              f.label,
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: selected ? Colors.white : color),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSelectedDayCard(List<MotherAppointment> dayAppointments) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE8EAF6)),
      ),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: const Color(0xFFEEF2FF),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.event_note, color: Color(0xFF3949AB)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Selected day', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(
                  '${DateFormat('EEE, MMM d').format(_selectedDate)} • ${dayAppointments.length} appointment(s)',
                  style: const TextStyle(fontWeight: FontWeight.w900),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {
              showModalBottomSheet<void>(
                context: context,
                isScrollControlled: true,
                useSafeArea: true,
                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
                builder: (context) => _DayAppointmentsSheet(
                  title: DateFormat('EEEE, MMMM d, yyyy').format(_selectedDate),
                  appointments: dayAppointments,
                  onTapAppointment: (a) {
                    Navigator.pop(context);
                    _detailsSheet(a);
                  },
                ),
              );
            },
            child: const Text('View'),
          ),
        ],
      ),
    );
  }

  List<MotherAppointment> _filteredAppointments() {
    final now = DateTime.now();
    final list = _appointments.where((a) {
      final status = _derivedStatus(a, now: now);
      switch (_filter) {
        case _StatusFilter.upcoming:
          return status == _ApptStatus.upcoming;
        case _StatusFilter.completed:
          return status == _ApptStatus.completed;
        case _StatusFilter.missed:
          return status == _ApptStatus.missed;
      }
    }).toList();

    list.sort((a, b) => a.dateTime.compareTo(b.dateTime));
    if (_filter != _StatusFilter.upcoming) {
      list.sort((a, b) => b.dateTime.compareTo(a.dateTime));
    }
    return list;
  }

  Widget _buildAppointmentCard(MotherAppointment a) {
    final status = _derivedStatus(a);
    final statusColor = status.color;
    final reminderEnabled = _reminderEnabledAppointmentIds.contains(a.id);

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: () => _detailsSheet(a),
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
                      gradient: LinearGradient(colors: [statusColor.withOpacity(0.18), statusColor.withOpacity(0.05)]),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(_typeIcon(a.type), color: statusColor),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          a.title,
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '${a.type}${a.week != null ? ' • Week ${a.week}' : ''}',
                          style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                  _statusPill(status),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.schedule, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      DateFormat('EEE, MMM d • h:mm a').format(a.dateTime),
                      style: TextStyle(color: Colors.grey[800], fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      a.facility,
                      style: TextStyle(color: Colors.grey[800], fontWeight: FontWeight.w700),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _chip(
                    icon: reminderEnabled ? Icons.notifications_active : Icons.notifications_none,
                    label: reminderEnabled ? 'Reminder on' : 'Reminder off',
                    color: reminderEnabled ? const Color(0xFF2E7D32) : const Color(0xFF546E7A),
                    onTap: (_remindersLoading || status != _ApptStatus.upcoming) ? null : () => _toggleReminder(a),
                  ),
                  _chip(
                    icon: Icons.info_outline,
                    label: 'Details',
                    color: const Color(0xFF3949AB),
                    onTap: () => _detailsSheet(a),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statusPill(_ApptStatus status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: status.color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: status.color.withOpacity(0.22)),
      ),
      child: Text(
        status.label,
        style: TextStyle(color: status.color, fontWeight: FontWeight.w900, fontSize: 11),
      ),
    );
  }

  Widget _chip({
    required IconData icon,
    required String label,
    required Color color,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(onTap == null ? 0.06 : 0.10),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: color.withOpacity(0.18)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE8EAF6)),
      ),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: const Color(0xFFEEF2FF),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.calendar_today, color: Color(0xFF3949AB), size: 30),
          ),
          const SizedBox(height: 12),
          const Text('No appointments here', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
          const SizedBox(height: 6),
          Text(
            'Add ANC visits, vaccination follow-ups, or checkups. You will also get reminders.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[700], height: 1.35),
          ),
          const SizedBox(height: 14),
          ElevatedButton.icon(
            onPressed: _bookDialog,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB01257),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              elevation: 0,
            ),
            icon: const Icon(Icons.add),
            label: const Text('Add appointment', style: TextStyle(fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  IconData _typeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'anc':
        return Icons.pregnant_woman;
      case 'vaccination':
        return Icons.vaccines;
      case 'follow-up':
        return Icons.follow_the_signs;
      case 'ultrasound':
        return Icons.monitor_heart;
      case 'lab test':
        return Icons.science;
      default:
        return Icons.event;
    }
  }

  _ApptStatus _derivedStatus(MotherAppointment a, {DateTime? now}) {
    final n = now ?? DateTime.now();
    final base = a.status.toLowerCase();
    if (base == 'completed') return _ApptStatus.completed;
    if (base == 'missed') return _ApptStatus.missed;
    if (base == 'cancelled') return _ApptStatus.cancelled;
    if (a.dateTime.isBefore(n) && (base == 'upcoming' || base == 'rescheduled')) {
      return _ApptStatus.missed;
    }
    return _ApptStatus.upcoming;
  }

  bool _isSameDay(DateTime a, DateTime b) => a.year == b.year && a.month == b.month && a.day == b.day;

  int? _notificationBaseId(String appointmentId) {
    final digits = appointmentId.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isNotEmpty) return int.tryParse(digits);
    final h = appointmentId.hashCode.abs();
    return h % 100000;
  }

  Future<void> _toggleReminder(MotherAppointment a) async {
    final base = _notificationBaseId(a.id);
    if (base == null) return;

    final enabled = _reminderEnabledAppointmentIds.contains(a.id);
    try {
      if (enabled) {
        await _notificationService.cancelNotification(base + 1000);
        await _notificationService.cancelNotification(base + 2000);
        setState(() => _reminderEnabledAppointmentIds.remove(a.id));
      } else {
        await _notificationService.schedulePreReminder(
          appointmentId: base,
          title: a.title,
          facility: a.facility,
          appointmentTime: a.dateTime,
          appointmentType: a.type,
        );
        await _notificationService.scheduleSameDayReminder(
          appointmentId: base,
          title: a.title,
          facility: a.facility,
          appointmentTime: a.dateTime,
          appointmentType: a.type,
        );
        setState(() => _reminderEnabledAppointmentIds.add(a.id));
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(enabled ? 'Reminder disabled' : 'Reminder enabled')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not update reminder')),
      );
    }
  }

  Future<void> _bookDialog() async {
    final titleCtrl = TextEditingController();
    final facilityCtrl = TextEditingController(text: 'Adama Health Center');
    final providerCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    final weekCtrl = TextEditingController();

    final types = <String>['ANC', 'Vaccination', 'Follow-up', 'Ultrasound', 'Lab Test'];
    var selectedType = types.first;

    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
    TimeOfDay selectedTime = const TimeOfDay(hour: 9, minute: 0);

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: EdgeInsets.fromLTRB(18, 14, 18, MediaQuery.of(context).viewInsets.bottom + 18),
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
                const Text('Add appointment', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: selectedType,
                  items: types.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                  onChanged: (v) {
                    if (v == null) return;
                    setSheetState(() => selectedType = v);
                    if (titleCtrl.text.trim().isEmpty) {
                      titleCtrl.text = '$v Visit';
                    }
                  },
                  decoration: InputDecoration(
                    labelText: 'Visit type',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: titleCtrl,
                  decoration: InputDecoration(
                    labelText: 'Title',
                    hintText: 'e.g. ANC Visit - Week 28',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: selectedDate,
                            firstDate: DateTime.now().subtract(const Duration(days: 1)),
                            lastDate: DateTime.now().add(const Duration(days: 365)),
                          );
                          if (picked != null) setSheetState(() => selectedDate = picked);
                        },
                        borderRadius: BorderRadius.circular(14),
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: 'Date',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          child: Text(DateFormat('MMM d, yyyy').format(selectedDate)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final picked = await showTimePicker(context: context, initialTime: selectedTime);
                          if (picked != null) setSheetState(() => selectedTime = picked);
                        },
                        borderRadius: BorderRadius.circular(14),
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: 'Time',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          child: Text(selectedTime.format(context)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: facilityCtrl,
                  decoration: InputDecoration(
                    labelText: 'Facility',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: providerCtrl,
                  decoration: InputDecoration(
                    labelText: 'Provider',
                    hintText: 'e.g. Dr. Tigist',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: weekCtrl,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Week (optional)',
                    hintText: 'e.g. 28',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: notesCtrl,
                  minLines: 2,
                  maxLines: 4,
                  decoration: InputDecoration(
                    labelText: 'Notes / instructions',
                    hintText: 'e.g. Bring your ANC card',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () async {
                    final title = titleCtrl.text.trim();
                    final provider = providerCtrl.text.trim();
                    if (title.isEmpty || provider.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please fill Title and Provider')),
                      );
                      return;
                    }

                    final dt = DateTime(
                      selectedDate.year,
                      selectedDate.month,
                      selectedDate.day,
                      selectedTime.hour,
                      selectedTime.minute,
                    );

                    await MockMotherRepository.bookAppointment(
                      title: title,
                      type: selectedType,
                      week: int.tryParse(weekCtrl.text.trim()),
                      dateTime: dt,
                      facility: facilityCtrl.text.trim(),
                      provider: provider,
                      notes: notesCtrl.text.trim().isEmpty ? null : notesCtrl.text.trim(),
                    );

                    if (!context.mounted) return;
                    Navigator.pop(context);
                    await _refresh();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFB01257),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  icon: const Icon(Icons.check_circle),
                  label: const Text('Save appointment', style: TextStyle(fontWeight: FontWeight.w900)),
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _detailsSheet(MotherAppointment appointment) {
    final status = _derivedStatus(appointment);
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _AppointmentDetailsSheet(
        appointment: appointment,
        status: status,
        reminderEnabled: _reminderEnabledAppointmentIds.contains(appointment.id),
        onToggleReminder: (_remindersLoading || status != _ApptStatus.upcoming) ? null : () => _toggleReminder(appointment),
        onMarkCompleted: () async {
          await MockMotherRepository.markAppointmentCompleted(appointment.id);
          if (!mounted) return;
          Navigator.pop(context);
          await _refresh();
        },
        onMarkMissed: () async {
          await MockMotherRepository.markAppointmentMissed(appointment.id);
          if (!mounted) return;
          Navigator.pop(context);
          await _refresh();
        },
        onReschedulePlus2Days: (status == _ApptStatus.upcoming)
            ? () async {
                await MockMotherRepository.rescheduleAppointment(
                  appointment.id,
                  appointment.dateTime.add(const Duration(days: 2)),
                );
                if (!mounted) return;
                Navigator.pop(context);
                await _refresh();
              }
            : null,
      ),
    );
  }
}

enum _StatusFilter {
  upcoming('Upcoming', Icons.upcoming, Color(0xFF1565C0)),
  completed('Completed', Icons.check_circle, Color(0xFF2E7D32)),
  missed('Missed', Icons.error, Color(0xFFC62828));

  final String label;
  final IconData icon;
  final Color color;
  const _StatusFilter(this.label, this.icon, this.color);
}

enum _ApptStatus {
  upcoming('UPCOMING', Color(0xFF1565C0)),
  completed('COMPLETED', Color(0xFF2E7D32)),
  missed('MISSED', Color(0xFFC62828)),
  cancelled('CANCELLED', Color(0xFF607D8B));

  final String label;
  final Color color;
  const _ApptStatus(this.label, this.color);
}

class _DayAppointmentsSheet extends StatelessWidget {
  final String title;
  final List<MotherAppointment> appointments;
  final ValueChanged<MotherAppointment> onTapAppointment;

  const _DayAppointmentsSheet({
    required this.title,
    required this.appointments,
    required this.onTapAppointment,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 46,
            height: 5,
            decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(99)),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16))),
              Text('${appointments.length}', style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.black54)),
            ],
          ),
          const SizedBox(height: 12),
          Flexible(
            child: ListView.separated(
              shrinkWrap: true,
              itemCount: appointments.length,
              separatorBuilder: (_, __) => const Divider(height: 16),
              itemBuilder: (context, index) {
                final a = appointments[index];
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.event_note),
                  title: Text(a.title, style: const TextStyle(fontWeight: FontWeight.w800)),
                  subtitle: Text('${a.type} • ${a.facility}'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => onTapAppointment(a),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _AppointmentDetailsSheet extends StatelessWidget {
  final MotherAppointment appointment;
  final _ApptStatus status;
  final bool reminderEnabled;
  final VoidCallback? onToggleReminder;
  final VoidCallback onMarkCompleted;
  final VoidCallback onMarkMissed;
  final VoidCallback? onReschedulePlus2Days;

  const _AppointmentDetailsSheet({
    required this.appointment,
    required this.status,
    required this.reminderEnabled,
    required this.onToggleReminder,
    required this.onMarkCompleted,
    required this.onMarkMissed,
    required this.onReschedulePlus2Days,
  });

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      heightFactor: 0.92,
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SafeArea(
          top: false,
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
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: status.color.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Icon(Icons.event, color: status.color),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              appointment.title,
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: status.color.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(color: status.color.withOpacity(0.22)),
                            ),
                            child: Text(
                              status.label,
                              style: TextStyle(color: status.color, fontWeight: FontWeight.w900, fontSize: 11),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      _DetailRow(icon: Icons.category, label: 'Type', value: appointment.type),
                      if (appointment.week != null) _DetailRow(icon: Icons.timelapse, label: 'Week', value: '${appointment.week}'),
                      _DetailRow(icon: Icons.calendar_today, label: 'Date', value: DateFormat('EEEE, MMM d, yyyy').format(appointment.dateTime)),
                      _DetailRow(icon: Icons.access_time, label: 'Time', value: DateFormat('h:mm a').format(appointment.dateTime)),
                      _DetailRow(icon: Icons.location_on, label: 'Facility', value: appointment.facility),
                      _DetailRow(icon: Icons.person, label: 'Provider', value: appointment.provider),
                      if ((appointment.notes ?? '').trim().isNotEmpty)
                        _DetailRow(icon: Icons.sticky_note_2, label: 'Notes', value: appointment.notes!.trim()),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: onToggleReminder,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFB01257),
                                foregroundColor: Colors.white,
                                disabledBackgroundColor: const Color(0xFFB0BEC5),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                elevation: 0,
                              ),
                              icon: Icon(reminderEnabled ? Icons.notifications_off : Icons.notifications_active),
                              label: Text(
                                reminderEnabled ? 'Disable reminder' : 'Enable reminder',
                                style: const TextStyle(fontWeight: FontWeight.w900),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: onReschedulePlus2Days,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF3949AB),
                                side: const BorderSide(color: Color(0xFF3949AB)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                              icon: const Icon(Icons.event_repeat),
                              label: const Text('Reschedule (+2 days)', style: TextStyle(fontWeight: FontWeight.w900)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: onMarkCompleted,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2E7D32),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                elevation: 0,
                              ),
                              icon: const Icon(Icons.check_circle),
                              label: const Text('Mark attended', style: TextStyle(fontWeight: FontWeight.w900)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: onMarkMissed,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFC62828),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                elevation: 0,
                              ),
                              icon: const Icon(Icons.error),
                              label: const Text('Mark missed', style: TextStyle(fontWeight: FontWeight.w900)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
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
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _DetailRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey[600]),
          const SizedBox(width: 10),
          SizedBox(
            width: 90,
            child: Text(label, style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w800)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

