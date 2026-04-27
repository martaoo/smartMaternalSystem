import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../data/mock_mother_repository.dart';
import 'mother_danger_signs_screen.dart';

class MotherDashboardScreen extends StatefulWidget {
  final ValueChanged<int>? onNavigate;
  const MotherDashboardScreen({super.key, this.onNavigate});

  @override
  State<MotherDashboardScreen> createState() => _MotherDashboardScreenState();
}

class _MotherDashboardScreenState extends State<MotherDashboardScreen> {
  bool _expandedTip = false;

  @override
  Widget build(BuildContext context) {
    final profile = MockMotherRepository.profile;
    final greeting = _greeting();

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFFFF5F7), Color(0xFFFFFFFF)],
        ),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TweenAnimationBuilder<double>(
              duration: const Duration(milliseconds: 550),
              curve: Curves.easeOutCubic,
              tween: Tween(begin: 0.96, end: 1),
              builder: (context, value, child) => Transform.scale(scale: value, child: child),
              child: _buildHeroHeader(profile, greeting),
            ),
            const SizedBox(height: 16),
            _buildPregnancyStatusCard(profile),
            const SizedBox(height: 16),
            _buildQuickActions(context),
            const SizedBox(height: 16),
            _buildHealthSnapshot(),
            const SizedBox(height: 16),
            _buildAIAlertCard(profile.riskLevel),
            const SizedBox(height: 12),
            _buildSmartTip(profile.pregnancyWeek),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroHeader(profile, String greeting) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: SizedBox(
        height: 250,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/pregnant_mother2.jpg',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: const Color(0xFFF8BBD0),
                alignment: Alignment.center,
                child: const Icon(Icons.pregnant_woman, color: Colors.white, size: 90),
              ),
            ),
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [Color(0xCC880E4F), Color(0x779C27B0), Color(0x22000000)],
                ),
              ),
            ),
            Positioned(
              left: 18,
              right: 18,
              bottom: 18,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.25),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      'My Maternal Journey',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '$greeting, ${profile.name}',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 24),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Week ${profile.pregnancyWeek} • ${profile.trimester}',
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Next ANC: ${profile.nextVisit}',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPregnancyStatusCard(profile) {
    final progress = (profile.pregnancyWeek / 40).clamp(0, 1).toDouble();
    final riskColor = profile.riskLevel.toLowerCase() == 'high' ? Colors.red : Colors.green;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.favorite, color: AppColors.primaryDarkPink),
                SizedBox(width: 8),
                Text('Pregnancy Progress', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 9,
                color: AppColors.primaryDarkPink,
                backgroundColor: const Color(0xFFFCE4EC),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Week ${profile.pregnancyWeek}/40'),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: riskColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    '${profile.riskLevel} Risk',
                    style: TextStyle(color: riskColor, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      _ActionItem('Appointments', Icons.calendar_month, const Color(0xFF64B5F6), () => widget.onNavigate?.call(1)),
      _ActionItem('Child Growth', Icons.monitor_weight, const Color(0xFF66BB6A), () => widget.onNavigate?.call(2)),
      _ActionItem('Vaccination', Icons.vaccines, const Color(0xFF9C27B0), () => widget.onNavigate?.call(3)),
      _ActionItem(
        'Danger Signs',
        Icons.warning_amber_rounded,
        const Color(0xFFD84315),
        () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const MotherDangerSignsScreen()),
        ),
      ),
      _ActionItem('Profile', Icons.person, const Color(0xFF607D8B), () => widget.onNavigate?.call(4)),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: AppColors.textPrimary),
        ),
        const SizedBox(height: 10),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: actions.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.6,
          ),
          itemBuilder: (context, index) {
            final a = actions[index];
            return InkWell(
              onTap: a.onTap,
              borderRadius: BorderRadius.circular(16),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      a.color.withOpacity(0.18),
                      Colors.white.withOpacity(0.88),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: a.color.withOpacity(0.2)),
                  boxShadow: [
                    BoxShadow(
                      color: a.color.withOpacity(0.15),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(a.icon, color: a.color),
                    const SizedBox(width: 8),
                    Text(a.title, style: TextStyle(color: a.color, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildHealthSnapshot() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: const [
            _MetricTile(label: 'BP', value: '118/76'),
            _MetricTile(label: 'Weight', value: '64 kg'),
            _MetricTile(label: 'FHR', value: '142 bpm'),
          ],
        ),
      ),
    );
  }

  Widget _buildAIAlertCard(String riskLevel) {
    final isHighRisk = riskLevel.toLowerCase() == 'high';
    return Card(
      elevation: 1.5,
      color: isHighRisk ? const Color(0xFFFFEBEE) : const Color(0xFFE8F5E9),
      child: ListTile(
        leading: Icon(isHighRisk ? Icons.warning_amber : Icons.check_circle, color: isHighRisk ? Colors.red : Colors.green),
        title: Text(isHighRisk ? 'Risk Alert' : 'AI Guidance'),
        subtitle: Text(
          isHighRisk
              ? 'High-risk signs detected. Please book an urgent visit.'
              : 'You are on track. Keep your ANC visits and daily hydration.',
        ),
      ),
    );
  }

  Widget _buildSmartTip(int week) {
    return Card(
      elevation: 1.5,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => setState(() => _expandedTip = !_expandedTip),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 240),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.lightbulb, color: Color(0xFFFFB300)),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Smart Tip',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                  Icon(_expandedTip ? Icons.expand_less : Icons.expand_more),
                ],
              ),
              const SizedBox(height: 8),
              Text('Week $week: Try light walking daily and sleep on your left side.'),
              if (_expandedTip) ...[
                const SizedBox(height: 8),
                const Text(
                  'Also drink enough water, avoid heavy lifting, and contact your provider if you feel unusual pain.',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
              ],
            ],
          ),
        ),
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

class _MetricTile extends StatelessWidget {
  final String label;
  final String value;
  const _MetricTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: AppColors.textSecondary)),
      ],
    );
  }
}

class _ActionItem {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  _ActionItem(this.title, this.icon, this.color, this.onTap);
}
