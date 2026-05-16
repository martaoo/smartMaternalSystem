import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../widgets/appointment_card.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppBarWidget(
        title: 'Appointments',
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          AppointmentCard(
            facilityName: 'City General Hospital',
            facilityAddress: '123 Main St, City',
            appointmentDate: 'May 20, 2026',
            appointmentTime: '10:00 AM',
            type: 'Prenatal Checkup',
            status: 'upcoming',
          ),
          SizedBox(height: 16),
          AppointmentCard(
            facilityName: 'Women\'s Health Center',
            facilityAddress: '456 Oak Ave, City',
            appointmentDate: 'June 15, 2026',
            appointmentTime: '2:30 PM',
            type: 'Ultrasound',
            status: 'scheduled',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add new appointment
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add),
      ),
    );
  }
}
