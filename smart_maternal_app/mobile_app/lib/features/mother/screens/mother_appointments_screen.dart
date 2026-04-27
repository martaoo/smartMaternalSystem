import 'package:flutter/material.dart';
import '../data/mock_mother_repository.dart';
import '../models/mother_entities.dart';

class MotherAppointmentsScreen extends StatefulWidget {
  const MotherAppointmentsScreen({super.key});

  @override
  State<MotherAppointmentsScreen> createState() => _MotherAppointmentsScreenState();
}

class _MotherAppointmentsScreenState extends State<MotherAppointmentsScreen> {
  late List<MotherAppointment> appointments;

  @override
  void initState() {
    super.initState();
    appointments = MockMotherRepository.getAppointments();
  }

  Future<void> _refresh() async {
    setState(() {
      appointments = MockMotherRepository.getAppointments();
    });
  }

  @override
  Widget build(BuildContext context) {
    final next = appointments.where((a) => a.status == 'upcoming' || a.status == 'rescheduled').toList();
    final nextVisit = next.isEmpty ? null : next.first;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('My Appointments', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (nextVisit != null) _buildNextCard(nextVisit),
            const SizedBox(height: 8),
            ...appointments.map((a) => _buildAppointmentTile(a)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'motherAppointmentsBookFab',
        onPressed: _bookDialog,
        icon: const Icon(Icons.add),
        label: const Text('Book'),
      ),
    );
  }

  Widget _buildNextCard(MotherAppointment appointment) {
    return Card(
      color: const Color(0xFFFFE5EF),
      child: ListTile(
        title: const Text('Next ANC Visit', style: TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(
          '${appointment.title}\n${_formatDate(appointment.dateTime)} - ${appointment.facility}',
        ),
      ),
    );
  }

  Widget _buildAppointmentTile(MotherAppointment appointment) {
    return Card(
      child: ListTile(
        title: Text(appointment.title),
        subtitle: Text('${_formatDate(appointment.dateTime)} • ${appointment.facility}'),
        trailing: Text(appointment.status, style: const TextStyle(fontWeight: FontWeight.bold)),
        onTap: () => _detailsSheet(appointment),
      ),
    );
  }

  Future<void> _bookDialog() async {
    final titleController = TextEditingController(text: 'ANC Follow-up');
    final facilityController = TextEditingController(text: 'Adama Health Center');
    final providerController = TextEditingController(text: 'Dr. Tigist Bekele');
    DateTime date = DateTime.now().add(const Duration(days: 3));

    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Book Appointment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
            TextField(controller: facilityController, decoration: const InputDecoration(labelText: 'Facility')),
            TextField(controller: providerController, decoration: const InputDecoration(labelText: 'Provider')),
            const SizedBox(height: 10),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Date'),
              subtitle: Text(_formatDate(date)),
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: date,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 365)),
                );
                if (picked != null) {
                  date = picked;
                }
              },
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              await MockMotherRepository.bookAppointment(
                title: titleController.text.trim(),
                dateTime: DateTime(date.year, date.month, date.day, 9, 0),
                facility: facilityController.text.trim(),
                provider: providerController.text.trim(),
              );
              if (!mounted) return;
              Navigator.pop(context);
              await _refresh();
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _detailsSheet(MotherAppointment appointment) {
    showModalBottomSheet<void>(
      context: context,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(appointment.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(_formatDate(appointment.dateTime)),
            Text(appointment.facility),
            Text(appointment.provider),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () async {
                      await MockMotherRepository.rescheduleAppointment(
                        appointment.id,
                        appointment.dateTime.add(const Duration(days: 2)),
                      );
                      if (!mounted) return;
                      Navigator.pop(context);
                      await _refresh();
                    },
                    child: const Text('Reschedule +2 days'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () async {
                      await MockMotherRepository.cancelAppointment(appointment.id);
                      if (!mounted) return;
                      Navigator.pop(context);
                      await _refresh();
                    },
                    child: const Text('Cancel'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime dateTime) {
    return '${dateTime.year}-${dateTime.month.toString().padLeft(2, '0')}-${dateTime.day.toString().padLeft(2, '0')}';
  }
}
