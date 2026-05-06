import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../services/notification_service.dart';
import '../../../services/mother_service.dart';
import '../models/mother_entities.dart';

class MotherAppointmentsScreen extends StatefulWidget {
  const MotherAppointmentsScreen({super.key});

  @override
  State<MotherAppointmentsScreen> createState() => _MotherAppointmentsScreenState();
}

class _MotherAppointmentsScreenState extends State<MotherAppointmentsScreen> with TickerProviderStateMixin {
  final NotificationService _notificationService = NotificationService();
  final MotherService _motherService = MotherService();

  List<Appointment> _appointments = [];
  DateTime _monthCursor = DateTime(DateTime.now().year, DateTime.now().month);
  DateTime _selectedDate = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
  _StatusFilter _filter = _StatusFilter.upcoming;

  bool _loading = true;
  bool _remindersLoading = true;
  final Set<String> _reminderEnabledAppointmentIds = {};
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _reload();
    _initReminders();
  }

  Future<void> _reload() async {
    setState(() => _loading = true);
    try {
      final items = await _motherService.getAllAppointments();
      setState(() {
        _appointments = items;
        _loading = false;
        _errorMessage = null;
      });
    } catch (e) {
      print('Error loading appointments: $e');
      setState(() {
        _appointments = [];
        _loading = false;
        _errorMessage = e.toString();
      });
    }
  }

  Future<void> _initReminders() async {
    try {
      await _notificationService.initialize();
      await _notificationService.requestPermissions();
      final pending = await _notificationService.getPendingNotifications();
      final ids = pending.map((p) => p.id).toSet();

      final enabled = <String>{};
      for (final a in _appointments) {
        final base = _notificationBaseId(a.id);
        if (base != null) {
          if (ids.contains(base + 1000) || ids.contains(base + 2000)) {
            enabled.add(a.id);
          }
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
            else if (_errorMessage != null)
              _buildErrorState()
            else if (filtered.isEmpty)
              _buildEmptyState()
            else
              ...filtered.map(_buildAppointmentCard),
            const SizedBox(height: 90),
          ],
        ),
      ),
    );
  }

  Widget _buildHero(Appointment? nextVisit) {
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
              'No upcoming visits. Your healthcare provider will schedule your next ANC visit.',
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
          ],
        ],
      ),
    );
  }

  Widget _miniPill({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildCalendar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildCalendarHeader(),
          _buildCalendarDays(),
          _buildCalendarGrid(),
        ],
      ),
    );
  }

  Widget _buildCalendarHeader() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          IconButton(
            onPressed: () => setState(() => _monthCursor = DateTime(_monthCursor.year, _monthCursor.month - 1)),
            icon: const Icon(Icons.chevron_left),
          ),
          Expanded(
            child: Text(
              DateFormat('MMMM yyyy').format(_monthCursor),
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
            ),
          ),
          IconButton(
            onPressed: () => setState(() => _monthCursor = DateTime(_monthCursor.year, _monthCursor.month + 1)),
            icon: const Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }

  Widget _buildCalendarDays() {
    final days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        children: days.map((day) => Expanded(
          child: Center(
            child: Text(
              day,
              style: TextStyle(
                color: Colors.grey[600],
                fontWeight: FontWeight.w800,
                fontSize: 11,
              ),
            ),
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildCalendarGrid() {
    final firstDayOfMonth = DateTime(_monthCursor.year, _monthCursor.month, 1);
    final lastDayOfMonth = DateTime(_monthCursor.year, _monthCursor.month + 1, 0);
    final startDate = firstDayOfMonth.subtract(Duration(days: firstDayOfMonth.weekday));
    final endDate = lastDayOfMonth.add(Duration(days: 6 - lastDayOfMonth.weekday));

    final days = <DateTime>[];
    for (DateTime date = startDate; date.isBefore(endDate) || date.isAtSameMomentAs(endDate); date = date.add(const Duration(days: 1))) {
      days.add(date);
    }

    return Padding(
      padding: const EdgeInsets.all(8),
      child: Column(
        children: [
          for (int week = 0; week < days.length / 7; week++)
            Row(
              children: [
                for (int day = 0; day < 7; day++)
                  if (week * 7 + day < days.length)
                    Expanded(child: _buildCalendarDay(days[week * 7 + day]))
                  else
                    const Expanded(child: SizedBox()),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildCalendarDay(DateTime date) {
    final isCurrentMonth = date.year == _monthCursor.year && date.month == _monthCursor.month;
    final isToday = _isSameDay(date, DateTime.now());
    final isSelected = _isSameDay(date, _selectedDate);
    final hasAppointments = _appointments.any((a) => _isSameDay(a.dateTime, date));

    return GestureDetector(
      onTap: () => setState(() => _selectedDate = date),
      child: Container(
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFB01257) : (isToday ? const Color(0xFFE8F5E8) : null),
          borderRadius: BorderRadius.circular(8),
          border: isToday && !isSelected ? Border.all(color: Colors.green, width: 1) : null,
        ),
        child: Stack(
          children: [
            Center(
              child: Text(
                '${date.day}',
                style: TextStyle(
                  color: isSelected ? Colors.white : (isCurrentMonth ? Colors.black : Colors.grey),
                  fontWeight: isSelected ? FontWeight.w900 : (isToday ? FontWeight.w800 : FontWeight.normal),
                ),
              ),
            ),
            if (hasAppointments)
              Positioned(
                bottom: 2,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    width: 4,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.white : const Color(0xFFB01257),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: _StatusFilter.values.map((filter) {
          final isSelected = _filter == filter;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _filter = filter),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: isSelected ? filter.color : Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(filter.icon, size: 16, color: isSelected ? Colors.white : filter.color),
                      const SizedBox(width: 4),
                      Text(
                        filter.label,
                        style: TextStyle(
                          color: isSelected ? Colors.white : filter.color,
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSelectedDayCard(List<Appointment> appointments) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            DateFormat('EEEE, MMMM d').format(_selectedDate),
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
          ),
          const SizedBox(height: 12),
          ...appointments.map((appointment) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _derivedStatus(appointment).color,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '${DateFormat('h:mm a').format(appointment.dateTime)} • ${appointment.title}',
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  List<Appointment> _filteredAppointments() {
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
        case _StatusFilter.cancelled:
          return status == _ApptStatus.cancelled;
      }
    }).toList();

    list.sort((a, b) => a.dateTime.compareTo(b.dateTime));
    if (_filter != _StatusFilter.upcoming) {
      list.sort((a, b) => b.dateTime.compareTo(a.dateTime));
    }
    return list;
  }

  Widget _buildAppointmentCard(Appointment a) {
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
            'Your healthcare provider will schedule your ANC visits. Check back regularly for updates.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[700], height: 1.35),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(Icons.error_outline, color: Colors.red.shade400, size: 30),
          ),
          const SizedBox(height: 12),
          const Text('Unable to load appointments', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
          const SizedBox(height: 6),
          Text(
            _errorMessage ?? 'Unknown error occurred',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[700], height: 1.35),
          ),
          const SizedBox(height: 14),
          ElevatedButton.icon(
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB01257),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              elevation: 0,
            ),
          ),
        ],
      ),
    );
  }

  IconData _typeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'first anc':
        return Icons.pregnant_woman;
      case 'vaccination':
        return Icons.vaccines;
      case 'follow-up':
        return Icons.follow_the_signs;
      case 'ultrasound':
        return Icons.monitor_heart;
      case 'lab':
        return Icons.science;
      default:
        return Icons.event;
    }
  }

  _ApptStatus _derivedStatus(Appointment a, {DateTime? now}) {
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

  Future<void> _toggleReminder(Appointment a) async {
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

  void _detailsSheet(Appointment appointment) {
    final status = _derivedStatus(appointment);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _AppointmentDetailsSheet(
        appointment: appointment,
        status: status,
        reminderEnabled: _reminderEnabledAppointmentIds.contains(appointment.id),
        onToggleReminder: (_remindersLoading || status != _ApptStatus.upcoming) ? null : () => _toggleReminder(appointment),
      ),
    );
  }
}

enum _StatusFilter {
  upcoming('Upcoming', Icons.upcoming, Color(0xFF1565C0)),
  completed('Completed', Icons.check_circle, Color(0xFF2E7D32)),
  missed('Missed', Icons.error, Color(0xFFC62828)),
  cancelled('Cancelled', Icons.cancel, Color(0xFF757575));

  const _StatusFilter(this.label, this.icon, this.color);
  final String label;
  final IconData icon;
  final Color color;
}

enum _ApptStatus {
  upcoming('Upcoming', Color(0xFF1565C0)),
  completed('Completed', Color(0xFF2E7D32)),
  missed('Missed', Color(0xFFC62828)),
  cancelled('Cancelled', Color(0xFF757575));

  const _ApptStatus(this.label, this.color);
  final String label;
  final Color color;
}

class _AppointmentDetailsSheet extends StatelessWidget {
  final Appointment appointment;
  final _ApptStatus status;
  final bool reminderEnabled;
  final VoidCallback? onToggleReminder;

  const _AppointmentDetailsSheet({
    required this.appointment,
    required this.status,
    required this.reminderEnabled,
    required this.onToggleReminder,
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
