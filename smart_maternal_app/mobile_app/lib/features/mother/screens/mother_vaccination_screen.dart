import 'package:flutter/material.dart';
import '../vaccination/data/vaccination_mock_service.dart';
import '../models/mother_entities.dart';
import '../vaccination/widgets/vaccination_header_section.dart';
import '../vaccination/widgets/child_info_card.dart';
import '../vaccination/widgets/vaccination_progress_card.dart';
import '../vaccination/widgets/next_vaccine_card.dart';
import '../vaccination/widgets/vaccination_timeline_list.dart';
import '../vaccination/widgets/vaccination_tips_card.dart';
import '../vaccination/models/vaccination_status.dart';

class MotherVaccinationScreen extends StatefulWidget {
  const MotherVaccinationScreen({super.key});

  @override
  State<MotherVaccinationScreen> createState() => _MotherVaccinationScreenState();
}

class _MotherVaccinationScreenState extends State<MotherVaccinationScreen> {
  List<VaccinationRecord> _records = <VaccinationRecord>[];
  VaccinationStatus? _selectedFilter;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    setState(() {
      _records = VaccinationMockService.getRecords();
    });
  }

  @override
  Widget build(BuildContext context) {
    final completedCount = VaccinationMockService.getCompletedCount(_records);
    final upcomingCount = VaccinationMockService.getUpcomingCount(_records);
    final missedCount = VaccinationMockService.getMissedCount(_records);
    final nextVaccine = VaccinationMockService.getNextVaccine(_records);
    final total = _records.length;
    final visibleRecords = _selectedFilter == null
        ? _records
        : _records.where((record) => VaccinationMockService.getStatus(record) == _selectedFilter).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const VaccinationHeaderSection(),
        const SizedBox(height: 14),
        const ChildInfoCard(
          childName: 'Baby Bezawit',
          ageText: '3 months',
          gender: 'Female',
        ),
        const SizedBox(height: 8),
        VaccinationProgressCard(
          completed: completedCount,
          upcoming: upcomingCount,
          missed: missedCount,
          total: total,
        ),
        const SizedBox(height: 8),
        NextVaccineCard(
          nextVaccine: nextVaccine,
          missedCount: missedCount,
        ),
        const SizedBox(height: 14),
        _buildFilterRow(),
        const SizedBox(height: 10),
        ElevatedButton.icon(
          onPressed: _showAddVaccinationDialog,
          icon: const Icon(Icons.add),
          label: const Text('Add Vaccination'),
        ),
        const SizedBox(height: 14),
        const Text(
          'Vaccination timeline',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        VaccinationTimelineList(
          records: visibleRecords,
          statusOf: VaccinationMockService.getStatus,
          onMarkCompleted: (record) async {
            await VaccinationMockService.markCompleted(record.id);
            _reload();
            if (!context.mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('${record.vaccine} marked as completed.')),
            );
          },
        ),
        const VaccinationTipsCard(),
      ],
    );
  }

  Widget _buildFilterRow() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        ChoiceChip(
          label: const Text('All'),
          selected: _selectedFilter == null,
          onSelected: (_) => setState(() => _selectedFilter = null),
        ),
        ChoiceChip(
          label: const Text('Upcoming'),
          selected: _selectedFilter == VaccinationStatus.upcoming,
          onSelected: (_) => setState(() => _selectedFilter = VaccinationStatus.upcoming),
        ),
        ChoiceChip(
          label: const Text('Completed'),
          selected: _selectedFilter == VaccinationStatus.completed,
          onSelected: (_) => setState(() => _selectedFilter = VaccinationStatus.completed),
        ),
        ChoiceChip(
          label: const Text('Missed'),
          selected: _selectedFilter == VaccinationStatus.missed,
          onSelected: (_) => setState(() => _selectedFilter = VaccinationStatus.missed),
        ),
      ],
    );
  }

  Future<void> _showAddVaccinationDialog() async {
    final vaccineController = TextEditingController();
    final noteController = TextEditingController();
    DateTime dueDate = DateTime.now().add(const Duration(days: 7));

    await showDialog<void>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Vaccination'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: vaccineController,
                  decoration: const InputDecoration(labelText: 'Vaccine Name'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: noteController,
                  decoration: const InputDecoration(labelText: 'Note (optional)'),
                ),
                const SizedBox(height: 8),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Due Date'),
                  subtitle: Text(_formatDate(dueDate)),
                  trailing: const Icon(Icons.calendar_month),
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: dueDate,
                      firstDate: DateTime.now().subtract(const Duration(days: 1)),
                      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
                    );
                    if (picked != null) {
                      setDialogState(() => dueDate = picked);
                    }
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                final vaccineName = vaccineController.text.trim();
                if (vaccineName.isEmpty) return;

                await VaccinationMockService.addRecord(
                  vaccine: vaccineName,
                  dueDate: dueDate,
                  note: noteController.text.trim().isEmpty ? null : noteController.text.trim(),
                );

                if (!mounted) return;
                Navigator.pop(context);
                _reload();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Vaccination added successfully.')),
                );
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final month = date.month.toString().padLeft(2, '0');
    final day = date.day.toString().padLeft(2, '0');
    return '${date.year}-$month-$day';
  }
}
