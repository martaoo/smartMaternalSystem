import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../services/notification_service.dart';
import '../../../services/vaccination_service.dart';
import '../data/mock_mother_repository.dart';
import '../vaccination/models/vaccination_status.dart';
import '../models/mother_entities.dart';
import '../vaccination/widgets/vaccination_header.dart';
import '../vaccination/widgets/vaccination_tabs.dart';
import '../vaccination/widgets/child_info_card.dart';
import '../vaccination/widgets/vaccination_timeline_item.dart';
import '../vaccination/widgets/vaccination_reminder_card.dart';

class MotherVaccinationScreen extends StatefulWidget {
  const MotherVaccinationScreen({super.key});

  @override
  State<MotherVaccinationScreen> createState() => _MotherVaccinationScreenState();
}

class _MotherVaccinationScreenState extends State<MotherVaccinationScreen>
    with SingleTickerProviderStateMixin {
  final NotificationService _notificationService = NotificationService();
  final VaccinationService _vaccinationService = VaccinationService();

  List<dynamic> _records = const [];
  final Set<String> _reminderEnabledIds = {};
  bool _remindersLoading = true;
  bool _recordsLoading = true;
  String? _recordsError;
  ChildProfileSummary? _childProfile;
  int _currentTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    setState(() {
      _recordsLoading = true;
      _recordsError = null;
    });
    try {
      final results = await Future.wait([
        _vaccinationService.getChildVaccinationRecords(),
        _vaccinationService.getChildProfile(),
      ]);
      final items = results[0] as List<VaccinationRecord>;
      final profile = results[1] as ChildProfileSummary;
      if (!mounted) return;
      setState(() {
        _records = items;
        _childProfile = profile;
        _recordsLoading = false;
      });
      await _initReminders();
    } catch (e) {
      if (!mounted) return;
      final errorString = e.toString();
      if (errorString.contains('Missing child id')) {
        await _showChildIdSetupDialog();
        return;
      }
      setState(() {
        _records = const [];
        _childProfile = null;
        _recordsLoading = false;
        _recordsError = errorString;
      });
      await _initReminders();
    }
  }

  Future<void> _showChildIdSetupDialog() async {
    final controller = TextEditingController();
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Setup Child Profile'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('To track vaccinations, please enter your child\'s ID:'),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'Child ID',
                border: OutlineInputBorder(),
                hintText: 'Enter child ID from hospital records',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final childId = controller.text.trim();
              if (childId.isNotEmpty) {
                await _vaccinationService.setChildId(childId);
                if (!mounted) return;
                Navigator.pop(context);
                _reload();
              }
            },
            child: const Text('Set Child ID'),
          ),
        ],
      ),
    );
  }

  Future<void> _initReminders() async {
    try {
      await _notificationService.initialize();
      await _notificationService.requestPermissions();
      final pending = await _notificationService.getPendingNotifications();
      final ids = pending.map((p) => p.id).toSet();

      final enabled = <String>{};
      for (final r in _records.whereType<VaccinationRecord>()) {
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
    if (_recordsLoading) {
      return const Scaffold(
        backgroundColor: AppColors.backgroundLight,
        body: Center(child: CircularProgressIndicator(color: AppColors.primaryBrown)),
      );
    }
    if (_recordsError != null) {
      return Scaffold(
        backgroundColor: AppColors.backgroundLight,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(30.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 80, color: Colors.red[300]),
                const SizedBox(height: 20),
                Text(
                  'Something went wrong',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.grey[800]),
                ),
                const SizedBox(height: 10),
                Text(
                  _recordsError!,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[600]),
                ),
                const SizedBox(height: 30),
                ElevatedButton(
                  onPressed: _reload,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBrown,
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  child: const Text('Try Again', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: Column(
        children: [
          const VaccinationHeader(),
          VaccinationTabs(
            selectedIndex: _currentTabIndex,
            onTabSelected: (index) {
              setState(() {
                _currentTabIndex = index;
              });
            },
          ),
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: _currentTabIndex == 0 ? _buildBabySection() : _buildMotherSection(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBabySection() {
    final profile = _childProfile;
    final childName = profile?.name ?? 'Baby';
    final childAgeText = _ageText(profile?.birthDate);
    final childWeightText = profile?.currentWeightKg == null
        ? '—'
        : '${profile!.currentWeightKg!.toStringAsFixed(1)} kg';
    
    final vaccineRecords = _records.whereType<VaccinationRecord>().toList();
    final nextVaccine = vaccineRecords.firstWhere(
      (r) => r.administeredDate == null && r.dueDate.isAfter(DateTime.now()),
      orElse: () => vaccineRecords.isNotEmpty ? vaccineRecords.first : VaccinationRecord(id: '', vaccine: 'None', dueDate: DateTime.now(), ageLabel: '', completed: false),
    );

    return Column(
      children: [
        ChildInfoCard(
          name: childName,
          age: childAgeText,
          weight: childWeightText,
          nextVaccineDate: DateFormat('MMM d, yyyy').format(nextVaccine.dueDate),
        ),
        const VaccinationReminderCard(
          title: 'Upcoming Vaccination',
          description: 'Ensure your baby is protected against preventable diseases.',
          date: 'May 15, 2026',
          icon: Icons.notifications_active,
          color: Colors.blue,
        ),
        const VaccinationReminderCard(
          title: 'Vitamin A Schedule',
          description: 'Regular Vitamin A supplementation boosts baby\'s immunity.',
          date: 'June 2, 2026',
          icon: Icons.lightbulb_outline,
          color: Colors.orange,
        ),
        const Padding(
          padding: EdgeInsets.fromLTRB(25, 20, 25, 10),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Vaccination Timeline',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryDarkBrown,
              ),
            ),
          ),
        ),
        _buildBabyTimeline(),
        const SizedBox(height: 30),
      ],
    );
  }

  Widget _buildBabyTimeline() {
    return Column(
      children: const [
        VaccinationTimelineItem(
          title: 'At Birth',
          date: 'Jan 10, 2026',
          vaccines: ['BCG', 'OPV-0', 'HepB-0'],
          status: VaccinationStatus.completed,
        ),
        VaccinationTimelineItem(
          title: '6 Weeks',
          date: 'Feb 21, 2026',
          vaccines: ['Pentavalent 1', 'OPV-1', 'PCV-1', 'Rota-1'],
          status: VaccinationStatus.completed,
        ),
        VaccinationTimelineItem(
          title: '10 Weeks',
          date: 'March 7, 2026',
          vaccines: ['Pentavalent 2', 'OPV-2', 'PCV-2', 'Rota-2'],
          status: VaccinationStatus.upcoming,
          nextAppointment: 'March 14, 2026',
        ),
        VaccinationTimelineItem(
          title: '14 Weeks',
          date: 'March 28, 2026',
          vaccines: ['Pentavalent 3', 'OPV-3', 'PCV-3', 'IPV'],
          status: VaccinationStatus.upcoming,
          isLast: true,
        ),
      ],
    );
  }

  Widget _buildMotherSection() {
    return Column(
      children: [
        Container(
          margin: const EdgeInsets.all(20),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(25),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'Tetanus Protection (TD)',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryDarkBrown,
                    ),
                  ),
                  Text(
                    '2 of 5 Doses',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryBrown,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 15),
              LinearProgressIndicator(
                value: 0.4,
                backgroundColor: Colors.grey[200],
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryBrown),
                minHeight: 10,
                borderRadius: BorderRadius.circular(5),
              ),
              const SizedBox(height: 10),
              Text(
                'Keep yourself protected to ensure baby\'s safety.',
                style: TextStyle(fontSize: 13, color: Colors.grey[600]),
              ),
            ],
          ),
        ),
        const VaccinationReminderCard(
          title: 'Upcoming TD Dose',
          description: 'Your next Tetanus-Diphtheria vaccine is due soon.',
          date: 'August 12, 2026',
          icon: Icons.security,
          color: Colors.teal,
        ),
        const Padding(
          padding: EdgeInsets.fromLTRB(25, 10, 25, 10),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Mother\'s Vaccination History',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryDarkBrown,
              ),
            ),
          ),
        ),
        _buildMotherTimeline(),
        const SizedBox(height: 30),
      ],
    );
  }

  Widget _buildMotherTimeline() {
    return Column(
      children: const [
        VaccinationTimelineItem(
          title: 'TD Dose 1',
          date: 'Sept 20, 2025',
          vaccines: ['Tetanus-Diphtheria 1'],
          status: VaccinationStatus.completed,
        ),
        VaccinationTimelineItem(
          title: 'TD Dose 2',
          date: 'Oct 25, 2025',
          vaccines: ['Tetanus-Diphtheria 2'],
          status: VaccinationStatus.completed,
        ),
        VaccinationTimelineItem(
          title: 'TD Dose 3',
          date: 'Oct 20, 2026 (Due)',
          vaccines: ['Tetanus-Diphtheria 3'],
          status: VaccinationStatus.upcoming,
          nextAppointment: 'Oct 20, 2026',
        ),
        VaccinationTimelineItem(
          title: 'TD Dose 4',
          date: 'Pending',
          vaccines: ['Tetanus-Diphtheria 4'],
          status: VaccinationStatus.upcoming,
        ),
        VaccinationTimelineItem(
          title: 'TD Dose 5',
          date: 'Pending',
          vaccines: ['Tetanus-Diphtheria 5'],
          status: VaccinationStatus.upcoming,
          isLast: true,
        ),
      ],
    );
  }

  int? _notificationBaseId(String id) {
    final digits = id.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isNotEmpty) return int.tryParse(digits);
    final h = id.hashCode.abs();
    return h % 100000;
  }

  String _ageText(DateTime? birthDate) {
    if (birthDate == null) return '—';
    final now = DateTime.now();
    final diff = now.difference(birthDate);
    if (diff.inDays < 30) return '${diff.inDays} days';
    if (diff.inDays < 365) return '${(diff.inDays / 30).floor()} months';
    return '${(diff.inDays / 365).floor()} years';
  }
}
