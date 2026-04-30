import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../data/mock_mother_repository.dart';
import 'mother_danger_signs_screen.dart';
import 'appointments/appointment_screen_simple.dart';
import 'vaccination_simple.dart';
import 'profile/profile_simple.dart';

class SimpleDashboardScreen extends StatefulWidget {
  final ValueChanged<int>? onNavigate;
  const SimpleDashboardScreen({super.key, this.onNavigate});

  @override
  State<SimpleDashboardScreen> createState() => _SimpleDashboardScreenState();
}

class _SimpleDashboardScreenState extends State<SimpleDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    final profile = MockMotherRepository.profile;
    final pregnancyWeek = MockMotherRepository.pregnancyWeek;
    final greeting = _greeting();

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: Text(
          'Welcome, ${profile.name}',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppColors.primaryBrown,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications, color: Colors.white),
            onPressed: () {
              // TODO: Implement notifications
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadowLight,
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    greeting,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Pregnancy Week $pregnancyWeek',
                    style: const TextStyle(
                      fontSize: 18,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Trimester: ${MockMotherRepository.trimester}',
                    style: const TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Quick Actions Grid
            Text(
              'Quick Actions',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.2,
              children: [
                _buildQuickActionCard(
                  'Appointments',
                  Icons.calendar_today,
                  AppColors.infoBlue,
                  () {
                    if (widget.onNavigate != null) {
                      widget.onNavigate!(1);
                    } else {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AppointmentScreenSimple(),
                        ),
                      );
                    }
                  },
                ),
                _buildQuickActionCard(
                  'Vaccinations',
                  Icons.vaccines,
                  AppColors.vaccinationBlue,
                  () {
                    if (widget.onNavigate != null) {
                      widget.onNavigate!(2);
                    } else {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AppointmentScreenSimple(),
                        ),
                      );
                    }
                  },
                ),
                _buildQuickActionCard(
                  'Danger Signs',
                  Icons.warning,
                  AppColors.dangerRed,
                  () {
                    if (widget.onNavigate != null) {
                      widget.onNavigate!(3);
                    } else {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const MotherDangerSignsScreen(),
                        ),
                      );
                    }
                  },
                ),
                _buildQuickActionCard(
                  'Profile',
                  Icons.person,
                  AppColors.primaryBrown,
                  () {
                    if (widget.onNavigate != null) {
                      widget.onNavigate!(4);
                    } else {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const SimpleProfileScreen(),
                        ),
                      );
                    }
                  },
                ),
              ],
            ),
            
            const SizedBox(height: 20),
            
            // Health Tips
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadowLight,
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Health Tips',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildHealthTip(
                    'Stay Hydrated',
                    'Drink at least 8 glasses of water daily during pregnancy.',
                    Icons.local_drink,
                  ),
                  const SizedBox(height: 8),
                  _buildHealthTip(
                    'Healthy Nutrition',
                    'Eat a balanced diet rich in fruits, vegetables, and proteins.',
                    Icons.restaurant,
                  ),
                  const SizedBox(height: 8),
                  _buildHealthTip(
                    'Regular Exercise',
                    'Engage in light exercises like walking for 30 minutes daily.',
                    Icons.directions_walk,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionCard(String title, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 32,
              color: color,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthTip(String title, String description, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(
            icon,
            color: AppColors.primaryBrown,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
