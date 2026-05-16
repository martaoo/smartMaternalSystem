import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../services/appointment_service.dart';
import '../models/schedule_model.dart';
import '../../child_growth/services/child_service.dart';
import 'package:intl/intl.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> with SingleTickerProviderStateMixin {
  final AppointmentService _appointmentService = AppointmentService();
  final ChildService _childService = ChildService();
  late TabController _tabController;
  ScheduleData? _scheduleData;
  List<dynamic> _children = [];
  Map<String, List<dynamic>> _childVaccines = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAllData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAllData() async {
    setState(() => _isLoading = true);
    
    try {
      final scheduleFuture = _appointmentService.getMySchedule();
      final childrenFuture = _childService.getMyChildren();
      
      final results = await Future.wait([scheduleFuture, childrenFuture]);
      
      _scheduleData = results[0] as ScheduleData?;
      _children = results[1] as List<dynamic>;
      
      debugPrint('Schedule Data: ${_scheduleData?.visits.length} visits, ${_scheduleData?.vaccines.length} vaccines');
      
      // Fetch vaccines for each child
      for (var child in _children) {
        final childId = child['_id'];
        final vaccines = await _appointmentService.getChildVaccinations(childId);
        _childVaccines[childId] = vaccines;
        debugPrint('Child ${child['name']}: ${vaccines.length} vaccines');
      }
    } catch (e) {
      debugPrint('Error loading appointment data: $e');
    }

    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Schedule & Appointments', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.text,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Pregnancy Visits'),
            Tab(text: 'Maternal Vaccines'),
            Tab(text: 'Child Vaccines'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildVisitsTab(),
                _buildMaternalVaccinesTab(),
                _buildChildVaccinesTab(),
              ],
            ),
    );
  }

  Widget _buildVisitsTab() {
    if (_scheduleData == null || _scheduleData!.visits.isEmpty) {
      return _buildEmptyState('No pregnancy visits scheduled yet.');
    }

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    
    final upcoming = _scheduleData!.visits.where((v) {
      return v.visitStatus == 'SCHEDULED' && 
             (v.visitDate.isAfter(today) || 
              (v.visitDate.year == today.year && v.visitDate.month == today.month && v.visitDate.day == today.day));
    }).toList();
    
    final completed = _scheduleData!.visits.where((v) => v.visitStatus == 'COMPLETED').toList();
    
    final missed = _scheduleData!.visits.where((v) {
      return v.visitStatus == 'MISSED' || 
             (v.visitStatus == 'SCHEDULED' && v.visitDate.isBefore(today));
    }).toList();

    return RefreshIndicator(
      onRefresh: _loadAllData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (upcoming.isNotEmpty) ...[
            _buildSectionHeader('Upcoming Visits'),
            ...upcoming.map((v) => _buildVisitCard(v, AppColors.primary)),
            const SizedBox(height: 20),
          ],
          if (missed.isNotEmpty) ...[
            _buildSectionHeader('Missed / Overdue'),
            ...missed.map((v) => _buildVisitCard(v, AppColors.error)),
            const SizedBox(height: 20),
          ],
          if (completed.isNotEmpty) ...[
            _buildSectionHeader('Previous Visits'),
            ...completed.map((v) => _buildVisitCard(v, Colors.green)),
          ],
        ],
      ),
    );
  }

  Widget _buildMaternalVaccinesTab() {
    if (_scheduleData == null || _scheduleData!.vaccines.isEmpty) {
      return _buildEmptyState('No maternal vaccines recorded.');
    }

    final given = _scheduleData!.vaccines.where((v) => v.status == 'GIVEN').toList();
    final scheduled = _scheduleData!.vaccines.where((v) => v.status == 'SCHEDULED').toList();

    return RefreshIndicator(
      onRefresh: _loadAllData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (scheduled.isNotEmpty) ...[
            _buildSectionHeader('Upcoming Vaccinations'),
            ...scheduled.map((v) => _buildMaternalVaccineCard(v, AppColors.secondary)),
            const SizedBox(height: 20),
          ],
          if (given.isNotEmpty) ...[
            _buildSectionHeader('Completed Vaccinations'),
            ...given.map((v) => _buildMaternalVaccineCard(v, Colors.green)),
          ],
        ],
      ),
    );
  }

  Widget _buildChildVaccinesTab() {
    if (_children.isEmpty) {
      return _buildEmptyState('No children registered yet.');
    }

    return RefreshIndicator(
      onRefresh: _loadAllData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ..._children.map((child) {
            final childId = child['_id'];
            final vaccines = _childVaccines[childId] ?? [];
            
            if (vaccines.isEmpty) return const SizedBox.shrink();

            final upcoming = vaccines.where((v) => v['status'] == 'SCHEDULED').toList();
            final completed = vaccines.where((v) => v['status'] == 'ADMINISTERED').toList();
            final missed = vaccines.where((v) => v['status'] == 'MISSED').toList();

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${child['name']}\'s Schedule',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                ),
                const SizedBox(height: 12),
                if (upcoming.isNotEmpty) ...[
                  _buildSectionHeader('Upcoming'),
                  ...upcoming.map((v) => _buildChildVaccineCard(v, AppColors.primary)),
                  const SizedBox(height: 16),
                ],
                if (missed.isNotEmpty) ...[
                  _buildSectionHeader('Missed'),
                  ...missed.map((v) => _buildChildVaccineCard(v, AppColors.error)),
                  const SizedBox(height: 16),
                ],
                if (completed.isNotEmpty) ...[
                  _buildSectionHeader('Completed'),
                  ...completed.map((v) => _buildChildVaccineCard(v, Colors.green)),
                  const SizedBox(height: 16),
                ],
                const SizedBox(height: 24),
              ],
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: AppColors.textSecondary,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildVisitCard(PregnancyVisit visit, Color statusColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            Container(
              width: 6,
              decoration: BoxDecoration(
                color: statusColor,
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          visit.visitType,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            visit.visitStatus,
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 14, color: AppColors.textSecondary),
                        const SizedBox(width: 8),
                        Text(
                          DateFormat('EEEE, MMM d, yyyy').format(visit.visitDate),
                          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.info_outline, size: 14, color: AppColors.textSecondary),
                        const SizedBox(width: 8),
                        Text(
                          'Week ${visit.week} • ${visit.riskLevel} Risk',
                          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMaternalVaccineCard(MaternalVaccine vaccine, Color statusColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.vaccines_outlined, color: statusColor),
        ),
        title: Text(vaccine.vaccineName, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Dose #${vaccine.doseNumber} • ${DateFormat('MMM d, yyyy').format(vaccine.givenDate)}'),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            vaccine.status,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
          ),
        ),
      ),
    );
  }

  Widget _buildChildVaccineCard(dynamic record, Color statusColor) {
    final vaccine = record['vaccineId'];
    final name = vaccine != null ? vaccine['name'] : 'Unknown Vaccine';
    final date = DateTime.parse(record['scheduledDate']);
    final dose = record['doseNumber'] ?? 1;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider.withOpacity(0.5)),
      ),
      child: ListTile(
        dense: true,
        leading: Icon(Icons.baby_changing_station, color: statusColor, size: 20),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        subtitle: Text('Dose #$dose • ${DateFormat('MMM d, yyyy').format(date)}', style: const TextStyle(fontSize: 12)),
        trailing: Text(
          record['status'],
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.event_note, size: 64, color: AppColors.textSecondary.withOpacity(0.3)),
          const SizedBox(height: 16),
          Text(message, style: const TextStyle(color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
