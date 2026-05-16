import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../widgets/dashboard_card.dart';
import '../widgets/quick_action_card.dart';
import '../../../routes/app_routes.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppBarWidget(
        title: 'Dashboard',
        showBackButton: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const DashboardCard(),
            const SizedBox(height: 24),
            Text(
              'Quick Actions',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.text,
              ),
            ),
            const SizedBox(height: 16),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 20,
              crossAxisSpacing: 20,
              childAspectRatio: 1.0,
              children: [
                QuickActionCard(
                  icon: Icons.calendar_month,
                  title: 'Appointments',
                  color: Colors.blue,
                  onTap: () {
                    Navigator.pushNamed(context, AppRoutes.appointments);
                  },
                ),
                QuickActionCard(
                  icon: Icons.warning_rounded,
                  title: 'Danger Signs',
                  color: Colors.red,
                  onTap: () {
                    Navigator.pushNamed(context, AppRoutes.dangerSigns);
                  },
                ),
                QuickActionCard(
                  icon: Icons.child_care,
                  title: 'Child Growth',
                  color: Colors.green,
                  onTap: () {
                    Navigator.pushNamed(context, AppRoutes.childGrowth);
                  },
                ),
                QuickActionCard(
                  icon: Icons.vaccines,
                  title: 'Vaccination',
                  color: Colors.orange,
                  onTap: () {
                    Navigator.pushNamed(context, AppRoutes.vaccination);
                  },
                ),
                QuickActionCard(
                  icon: Icons.local_hospital,
                  title: 'Referrals',
                  color: Colors.purple,
                  onTap: () {
                    Navigator.pushNamed(context, AppRoutes.referrals);
                  },
                ),
                QuickActionCard(
                  icon: Icons.person,
                  title: 'Profile',
                  color: Colors.brown,
                  onTap: () {
                    Navigator.pushNamed(context, AppRoutes.profile);
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
