import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../widgets/growth_chart.dart';
import '../services/child_service.dart';
import '../services/growth_service.dart';
import '../../../models/growth_model.dart';
import 'package:intl/intl.dart';

class ChildGrowthScreen extends StatefulWidget {
  const ChildGrowthScreen({super.key});

  @override
  State<ChildGrowthScreen> createState() => _ChildGrowthScreenState();
}

class _ChildGrowthScreenState extends State<ChildGrowthScreen> {
  final ChildService _childService = ChildService();
  final GrowthService _growthService = GrowthService();
  
  List<dynamic> _children = [];
  dynamic _selectedChild;
  List<GrowthModel> _growthRecords = [];
  Map<String, dynamic>? _latestGrowth;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadChildren();
  }

  Future<void> _loadChildren() async {
    try {
      setState(() => _isLoading = true);
      final children = await _childService.getMyChildren();
      if (children.isNotEmpty) {
        setState(() {
          _children = children;
          _selectedChild = children[0];
        });
        await _loadChildData(_selectedChild['_id']);
      }
    } catch (e) {
      debugPrint('Error loading children: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadChildData(String childId) async {
    try {
      final latestFuture = _childService.getLatestGrowthRecord(childId);
      final recordsFuture = _growthService.getGrowthRecords(childId);
      
      final results = await Future.wait([latestFuture, recordsFuture]);
      
      setState(() {
        _latestGrowth = results[0] as Map<String, dynamic>?;
        _growthRecords = results[1] as List<GrowthModel>? ?? [];
      });
    } catch (e) {
      debugPrint('Error loading child data: $e');
      setState(() {
        _latestGrowth = null;
        _growthRecords = [];
      });
    }
  }

  String _calculateAge(String birthDateStr) {
    final birthDate = DateTime.parse(birthDateStr);
    final now = DateTime.now();
    final difference = now.difference(birthDate);
    final months = (difference.inDays / 30).floor();
    if (months < 1) return '${difference.inDays} days';
    if (months < 24) return '$months months';
    return '${(months / 12).floor()} years';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: const AppBarWidget(
        title: 'Child Growth Tracking',
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _children.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _loadChildren,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_children.length > 1) _buildChildSelector(),
                        _buildChildInfoCard(),
                        const SizedBox(height: 24),
                        _buildStatsSection(),
                        const SizedBox(height: 24),
                        _buildChartSection(),
                        const SizedBox(height: 100), // Space for FAB if added
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildChildSelector() {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _children.length,
        itemBuilder: (context, index) {
          final child = _children[index];
          final isSelected = _selectedChild?['_id'] == child['_id'];
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedChild = child;
                _loadChildData(child['_id']);
              });
            },
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(25),
                boxShadow: [
                  if (isSelected) BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 4)),
                ],
              ),
              alignment: Alignment.center,
              child: Text(
                child['name'],
                style: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildChildInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primary.withOpacity(0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8)),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 35,
            backgroundColor: Colors.white.withOpacity(0.2),
            child: Text(
              _selectedChild['name'][0],
              style: const TextStyle(fontSize: 30, color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _selectedChild['name'],
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 4),
                Text(
                  '${_selectedChild['gender']} • ${_calculateAge(_selectedChild['birthDate'])} old',
                  style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.9)),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'Birth Date: ${DateFormat('MMM d, yyyy').format(DateTime.parse(_selectedChild['birthDate']))}',
                    style: const TextStyle(fontSize: 11, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSection() {
    final weight = _latestGrowth?['weight']?.toString() ?? '--';
    final height = _latestGrowth?['height']?.toString() ?? '--';
    final age = _calculateAge(_selectedChild['birthDate']);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Latest Measurements',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.text),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            _buildStatCard('Weight', '$weight kg', Icons.monitor_weight_outlined, Colors.orange),
            const SizedBox(width: 16),
            _buildStatCard('Height', '$height cm', Icons.straighten_outlined, Colors.blue),
          ],
        ),
        const SizedBox(height: 16),
        _buildStatCard('Current Age', age, Icons.cake_outlined, Colors.purple, fullWidth: true),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color, {bool fullWidth = false}) {
    return Expanded(
      flex: fullWidth ? 2 : 1,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 16),
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _buildChartSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Growth Progress',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.text),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('View All History'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        GrowthChart(records: _growthRecords),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.child_care, size: 80, color: AppColors.textSecondary.withOpacity(0.3)),
          const SizedBox(height: 20),
          const Text('No children registered to your profile.', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          const Text('Please contact your health worker to add your child.', style: TextStyle(color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
