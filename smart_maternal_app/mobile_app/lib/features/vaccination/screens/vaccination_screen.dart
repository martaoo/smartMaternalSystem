import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../../appointments/services/appointment_service.dart';
import '../../appointments/models/schedule_model.dart';
import '../../child_growth/services/child_service.dart';
import 'package:intl/intl.dart';

class VaccinationScreen extends StatefulWidget {
  const VaccinationScreen({super.key});

  @override
  State<VaccinationScreen> createState() => _VaccinationScreenState();
}

class _VaccinationScreenState extends State<VaccinationScreen> {
  final AppointmentService _appointmentService = AppointmentService();
  final ChildService _childService = ChildService();
  
  ScheduleData? _scheduleData;
  List<dynamic> _children = [];
  Map<String, List<dynamic>> _childVaccines = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAllVaccinations();
  }

  Future<void> _loadAllVaccinations() async {
    setState(() => _isLoading = true);
    
    final scheduleFuture = _appointmentService.getMySchedule();
    final childrenFuture = _childService.getMyChildren();
    
    final results = await Future.wait([scheduleFuture, childrenFuture]);
    
    _scheduleData = results[0] as ScheduleData?;
    _children = results[1] as List<dynamic>;
    
    for (var child in _children) {
      final childId = child['_id'];
      final vaccines = await _appointmentService.getChildVaccinations(childId);
      _childVaccines[childId] = vaccines;
    }

    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: const AppBarWidget(
        title: 'Vaccination Center',
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadAllVaccinations,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeroCard(),
                    const SizedBox(height: 32),
                    _buildUpcomingSection(),
                    const SizedBox(height: 32),
                    _buildHistorySection(),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildHeroCard() {
    int upcomingCount = 0;
    if (_scheduleData != null) {
      upcomingCount += _scheduleData!.vaccines.where((v) => v.status == 'SCHEDULED').length;
    }
    _childVaccines.forEach((_, list) {
      upcomingCount += list.where((v) => v['status'] == 'SCHEDULED').length;
    });

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF4A90E2), Color(0xFF357ABD)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: const Color(0xFF4A90E2).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.shield_outlined, color: Colors.white, size: 32),
          const SizedBox(height: 16),
          const Text(
            'Immunity Tracker',
            style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'You have $upcomingCount upcoming vaccinations for you and your family.',
            style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingSection() {
    final List<Widget> upcomingCards = [];
    final List<Widget> missedCards = [];

    // Maternal
    if (_scheduleData != null) {
      final maternalUpcoming = _scheduleData!.vaccines.where((v) => v.status == 'SCHEDULED').toList();
      for (var v in maternalUpcoming) {
        upcomingCards.add(_buildVaccineCard(
          v.vaccineName,
          'Maternal Care • Dose #${v.doseNumber}',
          v.givenDate,
          AppColors.primary,
          'YOU',
        ));
      }

      // Check for missed maternal vaccines (scheduled date in the past)
      final maternalMissed = _scheduleData!.vaccines.where((v) => v.status == 'SCHEDULED' && v.givenDate.isBefore(DateTime.now().subtract(const Duration(days: 1)))).toList();
       for (var v in maternalMissed) {
        missedCards.add(_buildVaccineCard(
          v.vaccineName,
          'Maternal Care • Dose #${v.doseNumber}',
          v.givenDate,
          AppColors.error,
          'MISSED',
        ));
      }
    }

    // Child
    for (var child in _children) {
      final vaccines = _childVaccines[child['_id']] ?? [];
      
      // Upcoming
      final childUpcoming = vaccines.where((v) => v['status'] == 'SCHEDULED').toList();
      for (var v in childUpcoming) {
        upcomingCards.add(_buildVaccineCard(
          v['vaccineId']?['name'] ?? 'Unknown Vaccine',
          '${child['name']} • Dose #${v['doseNumber'] ?? 1}',
          DateTime.parse(v['scheduledDate']),
          AppColors.secondary,
          child['name'].toString().toUpperCase(),
        ));
      }

      // Missed
      final childMissed = vaccines.where((v) => v['status'] == 'MISSED').toList();
      for (var v in childMissed) {
        missedCards.add(_buildVaccineCard(
          v['vaccineId']?['name'] ?? 'Unknown Vaccine',
          '${child['name']} • Dose #${v['doseNumber'] ?? 1}',
          DateTime.parse(v['scheduledDate']),
          AppColors.error,
          'MISSED',
        ));
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (missedCards.isNotEmpty) ...[
          _buildSectionTitle('Missed Vaccinations'),
          const SizedBox(height: 16),
          ...missedCards,
          const SizedBox(height: 24),
        ],
        if (upcomingCards.isNotEmpty) ...[
          _buildSectionTitle('Upcoming Vaccinations'),
          const SizedBox(height: 16),
          ...upcomingCards,
        ],
        if (missedCards.isEmpty && upcomingCards.isEmpty)
          const Center(child: Text('No upcoming or missed vaccinations')),
      ],
    );
  }

  Widget _buildHistorySection() {
    final List<Widget> historyCards = [];

    // Maternal History
    if (_scheduleData != null) {
      final maternalHistory = _scheduleData!.vaccines.where((v) => v.status == 'GIVEN').toList();
      for (var v in maternalHistory) {
        historyCards.add(_buildHistoryItem(
          v.vaccineName,
          'Maternal Care • Dose #${v.doseNumber}',
          v.givenDate,
          Colors.green,
        ));
      }
    }

    // Child History
    for (var child in _children) {
      final vaccines = _childVaccines[child['_id']] ?? [];
      final childHistory = vaccines.where((v) => v['status'] == 'ADMINISTERED').toList();
      for (var v in childHistory) {
        historyCards.add(_buildHistoryItem(
          v['vaccineId']?['name'] ?? 'Unknown Vaccine',
          '${child['name']} • Dose #${v['doseNumber'] ?? 1}',
          DateTime.parse(v['scheduledDate']),
          Colors.green,
        ));
      }
    }

    if (historyCards.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Completed Vaccinations'),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.divider.withOpacity(0.5)),
          ),
          child: Column(
            children: historyCards,
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.text),
    );
  }

  Widget _buildVaccineCard(String name, String subtitle, DateTime date, Color color, String badgeText) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
        ],
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(Icons.vaccines, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        badgeText,
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: color),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 14, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text(
                      DateFormat('MMM d, yyyy').format(date),
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryItem(String name, String subtitle, DateTime date, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(Icons.check_circle, color: color, size: 20),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ),
          Text(
            DateFormat('MMM d').format(date),
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
  
}
