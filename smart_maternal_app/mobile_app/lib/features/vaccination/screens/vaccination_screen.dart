import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../widgets/vaccine_card.dart';
import '../widgets/vaccine_timeline.dart';

class VaccinationScreen extends StatefulWidget {
  const VaccinationScreen({super.key});

  @override
  State<VaccinationScreen> createState() => _VaccinationScreenState();
}

class _VaccinationScreenState extends State<VaccinationScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppBarWidget(
        title: 'Vaccinations',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Upcoming Vaccinations',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.text,
              ),
            ),
            const SizedBox(height: 16),
            const VaccineCard(
              vaccineName: 'BCG',
              vaccineType: 'Tuberculosis',
              scheduledDate: 'May 25, 2026',
              status: 'scheduled',
            ),
            const SizedBox(height: 16),
            const VaccineCard(
              vaccineName: 'Hepatitis B',
              vaccineType: 'Hepatitis',
              scheduledDate: 'June 01, 2026',
              status: 'scheduled',
            ),
            const SizedBox(height: 24),
            Text(
              'Vaccination Timeline',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.text,
              ),
            ),
            const SizedBox(height: 16),
            const VaccineTimeline(),
          ],
        ),
      ),
    );
  }
}
