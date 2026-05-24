import 'package:flutter/material.dart';
import 'dart:ui';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../widgets/quick_action_card.dart';
import '../../../routes/app_routes.dart';
import '../../../models/user_model.dart';
import '../../../models/growth_model.dart';
import '../../profile/services/profile_service.dart';
import '../../child_growth/services/child_service.dart';
import '../../child_growth/services/growth_service.dart';
import 'package:intl/intl.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ProfileService _profileService = ProfileService();
  UserModel? _user;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    final user = await _profileService.getUserProfile();
    setState(() {
      _user = user;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBFBFB),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadProfile,
              displacement: 60,
              child: CustomScrollView(
                slivers: [
                  _buildSliverHero(),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(24, 32, 24, 40),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        _buildSectionHeader('Your Journey'),
                        const SizedBox(height: 20),
                        _buildProgressTrackingCard(),
                        const SizedBox(height: 32),
                        _buildSectionHeader('Quick Actions'),
                        const SizedBox(height: 20),
                        _buildQuickActionsGrid(),
                        const SizedBox(height: 32),
                        _buildHealthTipCard(),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSliverHero() {
    final name = _user?.name ?? 'Mama';
    
    return SliverAppBar(
      expandedHeight: 340,
      floating: false,
      pinned: true,
      backgroundColor: AppColors.primary,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            // Background Image
            Image.network(
              'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1453&auto=format&fit=crop',
              fit: BoxFit.cover,
            ),
            // Gradient Overlay
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.black.withOpacity(0.7),
                    Colors.black.withOpacity(0.3),
                    Colors.transparent,
                  ],
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                ),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hello,',
                    style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 18, fontWeight: FontWeight.w400),
                  ),
                  Text(
                    name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -1.0,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.verified, color: Colors.white, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          'Verified Mother Profile',
                          style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppColors.text,
            letterSpacing: -0.5,
          ),
        ),
      ],
    );
  }

  Widget _buildProgressTrackingCard() {
    final week = _user?.pregnancyInfo?.currentWeek ?? 0;
    final nextVisit = _user?.pregnancyInfo?.nextAppointment;
    final dueDate = _user?.pregnancyInfo?.dueDate;
    final progress = week / 40.0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              _buildMetricItem('Week', '$week', Icons.pregnant_woman, Colors.purple),
              const Spacer(),
              _buildMetricItem(
                'Due Date', 
                dueDate != null ? DateFormat('MMM d').format(dueDate) : 'TBD', 
                Icons.child_care, 
                Colors.orange
              ),
            ],
          ),
          const SizedBox(height: 24),
          Stack(
            children: [
              Container(
                height: 12,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              FractionallySizedBox(
                widthFactor: progress > 1.0 ? 1.0 : progress,
                child: Container(
                  height: 12,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppColors.primary, Color(0xFFFFA0B4)]),
                    borderRadius: BorderRadius.circular(6),
                    boxShadow: [
                      BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 6, offset: const Offset(0, 2)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Divider(height: 1),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), shape: BoxShape.circle),
                child: const Icon(Icons.event_available, color: Colors.blue, size: 20),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Next Appointment', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    Text(
                      nextVisit != null ? DateFormat('EEEE, MMMM d').format(nextVisit) : 'Schedule pending',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textSecondary),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricItem(String label, String value, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
            Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.text)),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.1,
      children: [
        _buildActionCard(Icons.calendar_month_rounded, 'Appointments', Colors.blue, AppRoutes.appointments),
        _buildActionCard(Icons.child_care_rounded, 'Child Growth', Colors.green, AppRoutes.childGrowth),
        _buildActionCard(Icons.vaccines_rounded, 'Vaccinations', Colors.orange, AppRoutes.vaccination),
        _buildActionCard(Icons.warning_amber_rounded, 'Danger Signs', Colors.red, AppRoutes.dangerSigns),
        _buildActionCard(Icons.local_hospital_rounded, 'Referrals', Colors.purple, AppRoutes.referrals),
        _buildActionCard(Icons.person_rounded, 'My Profile', Colors.brown, AppRoutes.profile),
      ],
    );
  }

  Widget _buildActionCard(IconData icon, String title, Color color, String route) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, route),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const Spacer(),
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.text),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthTipCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary.withOpacity(0.1), AppColors.primary.withOpacity(0.05)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: AppColors.primary.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.auto_awesome, color: AppColors.primary, size: 20),
              SizedBox(width: 8),
              Text('Mama Insight', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 15)),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'Your baby is now the size of a small melon! Keep nourishing your body with iron-rich foods like spinach and lean meats.',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 15, height: 1.6),
          ),
        ],
      ),
    );
  }
}
