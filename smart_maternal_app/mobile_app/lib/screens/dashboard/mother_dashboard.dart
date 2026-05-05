import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../services/mother_service.dart';
import '../../models/mother_models.dart';
import 'mother_danger_signs_screen.dart';

class MotherDashboardScreen extends StatefulWidget {
  final ValueChanged<int>? onNavigate;
  const MotherDashboardScreen({super.key, this.onNavigate});

  @override
  State<MotherDashboardScreen> createState() => _MotherDashboardScreenState();
}

class _MotherDashboardScreenState extends State<MotherDashboardScreen> {
  bool _expandedTip = false;
  int _selectedQuickAction = -1;
  bool _isLoading = true;
  MotherProfile? _motherProfile;
  PregnancyRecord? _currentPregnancy;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadMotherData();
  }

  Future<void> _loadMotherData() async {
    setState(() => _isLoading = true);
    
    try {
      final motherService = MotherService();
      final profile = await motherService.getMotherProfile();
      final pregnancy = await motherService.getCurrentPregnancy();
      
      setState(() {
        _motherProfile = profile;
        _currentPregnancy = pregnancy;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return _buildLoadingScreen();
    }
    
    if (_errorMessage != null) {
      return _buildErrorScreen();
    }
    
    final profile = _motherProfile!;
    final pregnancy = _currentPregnancy;
    final greeting = _greeting();

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topCenter,
            radius: 1.5,
            colors: [AppColors.backgroundLight, AppColors.backgroundWhite],
          ),
        ),
        child: CustomScrollView(
          slivers: [
            // Animated Header Sliver
            SliverToBoxAdapter(
              child: TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 600),
                curve: Curves.easeOutCubic,
                tween: Tween(begin: 0, end: 1),
                builder: (context, value, child) {
                  return Transform.translate(
                    offset: Offset(0, 50 * (1 - value)),
                    child: Opacity(opacity: value, child: child),
                  );
                },
                child: _buildHeroHeader(profile, pregnancy, greeting),
              ),
            ),
            
            const SliverToBoxAdapter(child: SizedBox(height: 20)),
            
            // Stats Cards Row
            SliverToBoxAdapter(
              child: TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 700),
                curve: Curves.easeOutCubic,
                tween: Tween(begin: 0, end: 1),
                builder: (context, value, child) {
                  return Transform.scale(scale: value, child: child);
                },
                child: _buildStatsRow(profile, pregnancy),
              ),
            ),
            
            const SliverToBoxAdapter(child: SizedBox(height: 20)),
            
            // Quick Actions
            SliverToBoxAdapter(
              child: TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 800),
                curve: Curves.easeOutCubic,
                tween: Tween(begin: 0, end: 1),
                builder: (context, value, child) {
                  return Transform.translate(
                    offset: Offset(0, 30 * (1 - value)),
                    child: Opacity(opacity: value, child: child),
                  );
                },
                child: _buildQuickActions(context),
              ),
            ),
            
            const SliverToBoxAdapter(child: SizedBox(height: 20)),
            
            // Health Metrics Section
            SliverToBoxAdapter(
              child: TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 900),
                curve: Curves.easeOutCubic,
                tween: Tween(begin: 0, end: 1),
                builder: (context, value, child) {
                  return Transform.translate(
                    offset: Offset(0, 30 * (1 - value)),
                    child: Opacity(opacity: value, child: child),
                  );
                },
                child: _buildHealthMetricsSection(pregnancy),
              ),
            ),
            
            const SliverToBoxAdapter(child: SizedBox(height: 20)),
            
            // AI Assistant Card
            SliverToBoxAdapter(
              child: TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 1000),
                curve: Curves.easeOutCubic,
                tween: Tween(begin: 0, end: 1),
                builder: (context, value, child) {
                  return Transform.translate(
                    offset: Offset(0, 30 * (1 - value)),
                    child: Opacity(opacity: value, child: child),
                  );
                },
                child: _buildAIAlertCard(pregnancy?.riskLevel ?? 'LOW'),
              ),
            ),
            
            const SliverToBoxAdapter(child: SizedBox(height: 16)),
            
            // Symptoms & Medications Section
            SliverToBoxAdapter(
              child: TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 900),
                curve: Curves.easeOutCubic,
                tween: Tween(begin: 0, end: 1),
                builder: (context, value, child) {
                  return Transform.translate(
                    offset: Offset(0, 30 * (1 - value)),
                    child: Opacity(opacity: value, child: child),
                  );
                },
                child: _buildSymptomsMedicationsSection(pregnancy),
              ),
            ),
            
            const SliverToBoxAdapter(child: SizedBox(height: 16)),
            
            // Smart Tip Card
            SliverToBoxAdapter(
              child: TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 1000),
                curve: Curves.easeOutCubic,
                tween: Tween(begin: 0, end: 1),
                builder: (context, value, child) {
                  return Transform.translate(
                    offset: Offset(0, 30 * (1 - value)),
                    child: Opacity(opacity: value, child: child),
                  );
                },
                child: _buildSmartTip(pregnancy?.week ?? 24),
              ),
            ),
            
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingScreen() {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: AppColors.primaryBrown),
            const SizedBox(height: 16),
            Text(
              'Loading your health data...',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorScreen() {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Unable to load data',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loadMotherData,
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryBrown),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ==================== HERO HEADER ====================
  Widget _buildHeroHeader(MotherProfile profile, PregnancyRecord? pregnancy, String greeting) {
    final week = pregnancy?.week ?? 24;
    final trimester = _getTrimester(week);
    
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryBrown.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Stack(
          children: [
            Image.asset(
              'assets/images/pregnant_mother2.jpg',
              height: 320,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                height: 320,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppColors.primaryBrown, AppColors.primaryDarkBrown],
                  ),
                ),
                child: const Center(
                  child: Icon(Icons.pregnant_woman, color: Colors.white, size: 80),
                ),
              ),
            ),
            Container(
              height: 320,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    AppColors.darkBrown.withOpacity(0.9),
                    AppColors.primaryBrown.withOpacity(0.6),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
            Positioned(
              top: -40,
              right: -40,
              child: Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              bottom: -50,
              left: -50,
              child: Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              left: 24,
              right: 24,
              bottom: 30,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.honeyGold, AppColors.accentBrown],
                      ),
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.honeyGold.withOpacity(0.4),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: const Text(
                      '✨ PREGNANCY JOURNEY',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 11,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '$greeting,',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontWeight: FontWeight.w500,
                      fontSize: 16,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    profile.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 32,
                      letterSpacing: -0.5,
                      shadows: [
                        Shadow(
                          color: Colors.black26,
                          blurRadius: 8,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: Row(
                      children: [
                        _buildInfoChip(
                          icon: Icons.calendar_today,
                          label: 'Week $week',
                        ),
                        const SizedBox(width: 12),
                        _buildInfoChip(
                          icon: Icons.favorite,
                          label: trimester,
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.successGreen.withOpacity(0.9),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.check_circle, color: Colors.white, size: 14),
                              SizedBox(width: 4),
                              Text(
                                'Next: ANC',
                                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 14),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
        ],
      ),
    );
  }

  // ==================== STATS ROW ====================
  Widget _buildStatsRow(MotherProfile profile, PregnancyRecord? pregnancy) {
    final stats = [
      _StatItem('Next Visit', pregnancy?.nextVisitDate ?? 'Not scheduled', Icons.calendar_month, AppColors.secondaryBrown),
      _StatItem('Baby Size', _getBabySize(pregnancy?.week ?? 24), Icons.child_care, AppColors.successGreen),
      _StatItem('Est. Weight', _getBabyWeight(pregnancy?.week ?? 24), Icons.monitor_weight, AppColors.medicalTeal),
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: stats.asMap().entries.map((entry) {
          final index = entry.key;
          final stat = entry.value;
          return Expanded(
            child: TweenAnimationBuilder<double>(
              duration: Duration(milliseconds: 400 + (index * 100)),
              curve: Curves.easeOutBack,
              tween: Tween(begin: 0, end: 1),
              builder: (context, scale, child) {
                return Transform.scale(scale: scale, child: child);
              },
              child: Container(
                margin: EdgeInsets.only(
                  left: index == 0 ? 0 : 8,
                  right: index == stats.length - 1 ? 0 : 8,
                ),
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Colors.white, stat.color.withOpacity(0.05)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: stat.color.withOpacity(0.15),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                  border: Border.all(color: stat.color.withOpacity(0.2)),
                ),
                child: Column(
                  children: [
                    Icon(stat.icon, color: stat.color, size: 28),
                    const SizedBox(height: 8),
                    Text(
                      stat.value,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: stat.color,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      stat.label,
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ==================== QUICK ACTIONS ====================
  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      _ActionItem('Appointments', Icons.calendar_month, AppColors.secondaryBrown, 
          Colors.blue.shade50, () => widget.onNavigate?.call(1)),
      _ActionItem('Child Growth', Icons.monitor_weight, AppColors.childGrowth,
          Colors.green.shade50, () => widget.onNavigate?.call(2)),
      _ActionItem('Vaccination', Icons.vaccines, AppColors.vaccinationBlue,
          Colors.purple.shade50, () => widget.onNavigate?.call(3)),
      _ActionItem('Danger Signs', Icons.warning_amber_rounded, AppColors.warningOrange,
          Colors.red.shade50, () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const MotherDangerSignsScreen()),
          )),
      _ActionItem('Profile', Icons.person, AppColors.slateBrown,
          Colors.grey.shade50, () => widget.onNavigate?.call(4)),
      _ActionItem('Reports', Icons.bar_chart, AppColors.medicalTeal,
          Colors.teal.shade50, () {}),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: Text(
            'Quick Actions',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 20,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: actions.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.3,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemBuilder: (context, index) {
            final a = actions[index];
            return GestureDetector(
              onTapDown: (_) => setState(() => _selectedQuickAction = index),
              onTapUp: (_) => setState(() => _selectedQuickAction = -1),
              onTapCancel: () => setState(() => _selectedQuickAction = -1),
              onTap: a.onTap,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                transform: Matrix4.identity()
                  ..scale(_selectedQuickAction == index ? 0.97 : 1),
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [a.bgColor, Colors.white],
                    ),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: a.color.withOpacity(0.3), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: a.color.withOpacity(0.2),
                        blurRadius: 12,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [a.color, a.color.withOpacity(0.7)],
                          ),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: a.color.withOpacity(0.4),
                              blurRadius: 12,
                            ),
                          ],
                        ),
                        child: Icon(a.icon, color: Colors.white, size: 30),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        a.title,
                        style: TextStyle(
                          color: a.color,
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  // ==================== HEALTH METRICS SECTION ====================
  Widget _buildHealthMetricsSection(PregnancyRecord? pregnancy) {
    final metrics = [
      _MetricData('Blood Pressure', 
          '${pregnancy?.systolicBP ?? 120}/${pregnancy?.diastolicBP ?? 80}', 
          _getBPStatus(pregnancy?.systolicBP ?? 120, pregnancy?.diastolicBP ?? 80), 
          Icons.favorite, 
          _getBPColor(pregnancy?.systolicBP ?? 120, pregnancy?.diastolicBP ?? 80)),
      _MetricData('Weight', 
          '${pregnancy?.weight ?? 65.5} kg', 
          '+0.5 kg', 
          Icons.monitor_weight, 
          AppColors.secondaryBrown),
      _MetricData('Baby Heartbeat', 
          '${pregnancy?.fetalHeartRate ?? 140} bpm', 
          _getFHRStatus(pregnancy?.fetalHeartRate ?? 140), 
          Icons.favorite_border, 
          _getFHRColor(pregnancy?.fetalHeartRate ?? 140)),
      _MetricData('Blood Sugar', 
          '${pregnancy?.labResults?.bloodSugar ?? 95} mg/dL', 
          'Normal', 
          Icons.science, 
          AppColors.successGreen),
      _MetricData('Hemoglobin', 
          '${pregnancy?.labResults?.hemoglobin ?? 12.5} g/dL', 
          pregnancy?.labResults?.hemoglobin != null && pregnancy!.labResults!.hemoglobin < 11 ? 'Low' : 'Normal', 
          Icons.opacity, 
          pregnancy?.labResults?.hemoglobin != null && pregnancy!.labResults!.hemoglobin < 11 ? AppColors.warningOrange : AppColors.successGreen),
      _MetricData('Fundal Height', 
          '${pregnancy?.fundalHeight ?? 24} cm', 
          'Matches week', 
          Icons.straighten, 
          AppColors.successGreen),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: Row(
            children: [
              Icon(Icons.health_and_safety, color: AppColors.primaryBrown, size: 24),
              SizedBox(width: 8),
              Text(
                'Health Metrics',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 130,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: metrics.length,
            itemBuilder: (context, index) {
              final m = metrics[index];
              return Container(
                width: 160,
                margin: EdgeInsets.only(right: index == metrics.length - 1 ? 0 : 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Colors.white, m.color.withOpacity(0.05)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: m.color.withOpacity(0.15),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                  border: Border.all(color: m.color.withOpacity(0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: m.color.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(m.icon, color: m.color, size: 20),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            m.label,
                            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      m.value,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: m.color,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      m.status,
                      style: const TextStyle(fontSize: 10, color: AppColors.textLight),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // ==================== AI ALERT CARD ====================
  Widget _buildAIAlertCard(String riskLevel) {
    final isHighRisk = riskLevel.toLowerCase() == 'high';
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isHighRisk
                ? [const Color(0xFFFFF0F0), const Color(0xFFFFE0E0)]
                : [const Color(0xFFF0FFF0), const Color(0xFFE0FFE0)],
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isHighRisk ? AppColors.warningOrange : AppColors.successGreen,
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: (isHighRisk ? AppColors.warningOrange : AppColors.successGreen).withOpacity(0.2),
              blurRadius: 15,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isHighRisk
                        ? [AppColors.warningOrange, AppColors.warningOrange.withOpacity(0.7)]
                        : [AppColors.successGreen, AppColors.successGreen.withOpacity(0.7)],
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: (isHighRisk ? AppColors.warningOrange : AppColors.successGreen).withOpacity(0.4),
                      blurRadius: 12,
                    ),
                  ],
                ),
                child: Icon(
                  isHighRisk ? Icons.warning_amber_rounded : Icons.auto_awesome,
                  color: Colors.white,
                  size: 32,
                ),
              ),
              const SizedBox(width: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isHighRisk ? '⚠️ Risk Alert' : '🤖 AI Health Assistant',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: isHighRisk ? AppColors.warningOrange : AppColors.successGreen,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      isHighRisk
                          ? 'High-risk signs detected. Please book an urgent visit immediately.'
                          : '✅ You\'re on track! Continue your ANC visits and stay hydrated.',
                      style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ==================== SYMPTOMS & MEDICATIONS SECTION ====================
  Widget _buildSymptomsMedicationsSection(PregnancyRecord? pregnancy) {
    final symptoms = pregnancy?.symptoms ?? ['Nausea', 'Mild back pain'];
    final medications = pregnancy?.medications ?? ['Folic acid', 'Iron supplements'];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: Text(
            'Current Symptoms & Medications',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 20,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.orange.shade50, Colors.white],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.orange.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.sick, color: Colors.orange.shade600, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Symptoms',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.orange.shade600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ...symptoms.map((symptom) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          children: [
                            Icon(Icons.circle, color: Colors.orange.shade400, size: 6),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                symptom,
                                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                              ),
                            ),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.blue.shade50, Colors.white],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.blue.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.medication, color: Colors.blue.shade600, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Medications',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.blue.shade600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ...medications.map((med) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          children: [
                            Icon(Icons.circle, color: Colors.blue.shade400, size: 6),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                med,
                                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                              ),
                            ),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ==================== SMART TIP CARD ====================
  Widget _buildSmartTip(int week) {
    final tip = _getWeeklyTip(week);
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        child: Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          color: Colors.white,
          child: InkWell(
            borderRadius: BorderRadius.circular(24),
            onTap: () => setState(() => _expandedTip = !_expandedTip),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [AppColors.honeyGold, AppColors.honeyGold.withOpacity(0.7)],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.honeyGold.withOpacity(0.3),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.lightbulb, color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Text(
                          'Smart Tip for Week',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      AnimatedRotation(
                        duration: const Duration(milliseconds: 300),
                        turns: _expandedTip ? 0.5 : 0,
                        child: Icon(
                          Icons.chevron_right,
                          color: AppColors.accentBrown,
                          size: 28,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppColors.honeyGold.withOpacity(0.1), Colors.white],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        Text(
                          'Week $week',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.honeyGold,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            tip,
                            style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_expandedTip) ...[
                    const SizedBox(height: 20),
                    const Divider(color: AppColors.lightBrown),
                    const SizedBox(height: 16),
                    _buildTipItem('💧', 'Drink at least 8 glasses of water daily'),
                    const SizedBox(height: 12),
                    _buildTipItem('🏋️', 'Avoid heavy lifting and strenuous activities'),
                    const SizedBox(height: 12),
                    _buildTipItem('🍎', 'Eat iron-rich foods like spinach and lentils'),
                    const SizedBox(height: 12),
                    _buildTipItem('📞', 'Contact your provider if you feel unusual pain'),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTipItem(String emoji, String text) {
    return Row(
      children: [
        Text(emoji, style: const TextStyle(fontSize: 20)),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ),
        Icon(Icons.check_circle, color: AppColors.successGreen.withOpacity(0.6), size: 18),
      ],
    );
  }

  // ==================== HELPER METHODS ====================
  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  String _getTrimester(int week) {
    if (week < 13) return '1st Trimester';
    if (week < 28) return '2nd Trimester';
    return '3rd Trimester';
  }

  String _getBabySize(int week) {
    if (week < 12) return 'Plum';
    if (week < 16) return 'Lemon';
    if (week < 20) return 'Bell Pepper';
    if (week < 24) return 'Mango';
    if (week < 28) return 'Eggplant';
    if (week < 32) return 'Coconut';
    if (week < 36) return 'Pineapple';
    return 'Watermelon';
  }

  String _getBabyWeight(int week) {
    if (week < 20) return '0.3 kg';
    if (week < 24) return '0.6 kg';
    if (week < 28) return '1.0 kg';
    if (week < 32) return '1.7 kg';
    if (week < 36) return '2.5 kg';
    return '3.0 kg';
  }

  String _getWeeklyTip(int week) {
    if (week < 12) return 'Take folic acid daily and avoid alcohol.';
    if (week < 20) return 'Eat iron-rich foods to prevent anemia.';
    if (week < 28) return 'Monitor baby movements daily.';
    if (week < 34) return 'Sleep on your left side for better blood flow.';
    return 'Prepare your hospital bag and birth plan.';
  }

  String _getBPStatus(int systolic, int diastolic) {
    if (systolic < 120 && diastolic < 80) return 'Normal';
    if (systolic < 130 && diastolic < 80) return 'Elevated';
    if (systolic < 140 || diastolic < 90) return 'High - Stage 1';
    return 'High - Stage 2';
  }

  Color _getBPColor(int systolic, int diastolic) {
    if (systolic < 120 && diastolic < 80) return AppColors.successGreen;
    if (systolic < 130 && diastolic < 80) return AppColors.warningOrange;
    return AppColors.error;
  }

  String _getFHRStatus(int rate) {
    if (rate >= 120 && rate <= 160) return 'Normal';
    if (rate < 120) return 'Low';
    return 'High';
  }

  Color _getFHRColor(int rate) {
    if (rate >= 120 && rate <= 160) return AppColors.successGreen;
    if (rate < 120) return AppColors.warningOrange;
    return AppColors.error;
  }
}

// ==================== HELPER CLASSES ====================

class _StatItem {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  _StatItem(this.label, this.value, this.icon, this.color);
}

class _MetricData {
  final String label;
  final String value;
  final String status;
  final IconData icon;
  final Color color;
  _MetricData(this.label, this.value, this.status, this.icon, this.color);
}

class _ActionItem {
  final String title;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final VoidCallback onTap;
  _ActionItem(this.title, this.icon, this.color, this.bgColor, this.onTap);
}