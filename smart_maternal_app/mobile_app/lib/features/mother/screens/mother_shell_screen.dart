import 'package:flutter/material.dart';
import 'mother_appointments_screen.dart';
import 'mother_child_growth_screen.dart';
import 'mother_dashboard_screen.dart';
import 'mother_profile_screen.dart';
import 'mother_vaccination_screen.dart';

class MotherShellScreen extends StatefulWidget {
  const MotherShellScreen({super.key});

  @override
  State<MotherShellScreen> createState() => _MotherShellScreenState();
}

class _MotherShellScreenState extends State<MotherShellScreen> {
  int _currentIndex = 0;

  static const _titles = [
    'Mother Dashboard',
    'Appointments',
    'Child Growth',
    'Vaccination',
    'Profile',
  ];

  @override
  Widget build(BuildContext context) {
    final pages = [
      MotherDashboardScreen(onNavigate: (index) => setState(() => _currentIndex = index)),
      const MotherAppointmentsScreen(),
      const MotherChildGrowthScreen(),
      const MotherVaccinationScreen(),
      const MotherProfileScreen(),
    ];

    return Scaffold(
      appBar: AppBar(title: Text(_titles[_currentIndex])),
      body: IndexedStack(index: _currentIndex, children: pages),
      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton.extended(
              heroTag: 'motherShellSosFab',
              onPressed: () => _showEmergencyDialog(context),
              icon: const Icon(Icons.emergency),
              label: const Text('Emergency SOS'),
              backgroundColor: Colors.red,
            )
          : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.event_note_outlined), selectedIcon: Icon(Icons.event_note), label: 'Appointments'),
          NavigationDestination(icon: Icon(Icons.monitor_weight_outlined), selectedIcon: Icon(Icons.monitor_weight), label: 'Growth'),
          NavigationDestination(icon: Icon(Icons.vaccines_outlined), selectedIcon: Icon(Icons.vaccines), label: 'Vaccine'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  void _showEmergencyDialog(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Emergency SOS'),
        content: const Text(
          'Send emergency alert now?\n\nThis is mock behavior for mother-only phase.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Emergency alert sent.')),
              );
            },
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }
}
