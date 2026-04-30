import 'package:flutter/material.dart';
import '../data/mock_mother_repository.dart';
import '../models/mother_entities.dart';

class MotherChildGrowthScreen extends StatefulWidget {
  const MotherChildGrowthScreen({super.key});

  @override
  State<MotherChildGrowthScreen> createState() => _MotherChildGrowthScreenState();
}

enum GrowthStage { pregnancy, zeroToOne, oneToFive }

enum _RiskLevel { normal, warning, risk }

class _MotherChildGrowthScreenState extends State<MotherChildGrowthScreen> {
  GrowthStage _selectedStage = GrowthStage.zeroToOne;
  int _selectedNutritionImage = 0;

  static const List<String> _nutritionImagePaths = <String>[
    'assets/images/nutrition/nutrition1.jpg',
    'assets/images/nutrition/nutrition2.jpg',
    'assets/images/nutrition/nutrition3.jpg',
    'assets/images/nutrition/nutrition4.jpg',
    'assets/images/nutrition/fruits.jpg',
  ];

  static const List<String> _nutritionImageCaptions = <String>[
    'Balanced meal plate',
    'Protein-rich nutrition',
    'Healthy cooked food',
    'Family nutrition basket',
    'Fresh fruit variety',
  ];

  static const List<_NutrientInfo> _nutrients = <_NutrientInfo>[
    _NutrientInfo(
      title: 'Protein',
      tip: 'Builds baby growth',
      imagePath: 'assets/images/nutrition/nutrition1.jpg',
      bgColor: Color(0xFFE3F2FD),
      foods: <String>['Eggs', 'Lentils (Misir)', 'Beans'],
      detailTip: 'Give protein foods daily in small portions.',
    ),
    _NutrientInfo(
      title: 'Iron',
      tip: 'Prevents anemia',
      imagePath: 'assets/images/nutrition/nutrition2.jpg',
      bgColor: Color(0xFFE8F5E9),
      foods: <String>['Spinach', 'Lentils (Misir)', 'Teff Injera'],
      detailTip: 'Pair iron foods with vitamin C for better absorption.',
    ),
    _NutrientInfo(
      title: 'Vitamins',
      tip: 'Boosts immunity',
      imagePath: 'assets/images/nutrition/fruits.jpg',
      bgColor: Color(0xFFFFF3E0),
      foods: <String>['Orange', 'Banana', 'Tomato'],
      detailTip: 'Use fresh fruits and vegetables every day.',
    ),
    _NutrientInfo(
      title: 'Calcium',
      tip: 'Strong bones',
      imagePath: 'assets/images/nutrition/nutrition3.jpg',
      bgColor: Color(0xFFF3E5F5),
      foods: <String>['Milk', 'Yogurt', 'Cheese'],
      detailTip: 'Calcium supports bone and teeth development.',
    ),
    _NutrientInfo(
      title: 'Carbs',
      tip: 'Provides energy',
      imagePath: 'assets/images/nutrition/nutrition4.jpg',
      bgColor: Color(0xFFFFFDE7),
      foods: <String>['Injera', 'Bread', 'Potato'],
      detailTip: 'Choose clean, well-cooked energy foods.',
    ),
  ];

  final Map<String, bool> _milestonesZeroToOne = <String, bool>{
    'Smiling': true,
    'Rolling': true,
    'Sitting': false,
  };

  final Map<String, bool> _milestonesOneToFive = <String, bool>{
    'Walking': true,
    'Talking': true,
    'Sentence forming': false,
  };

  @override
  Widget build(BuildContext context) {
    final records = MockMotherRepository.growthRecords.toList()..sort((a, b) => a.date.compareTo(b.date));
    final latest = records.isNotEmpty ? records.last : null;
    final ageInMonths = records.isNotEmpty ? DateTime.now().difference(records.first.date).inDays ~/ 30 : 2;

    return Container(
      color: const Color(0xFFF5F7FA),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _HeaderCard(selectedStage: _selectedStage),
          const SizedBox(height: 14),
          _StageSwitcher(
            selectedStage: _selectedStage,
            onChanged: (stage) => setState(() => _selectedStage = stage),
          ),
          const SizedBox(height: 14),
          if (_selectedStage == GrowthStage.pregnancy)
            _buildPregnancyTab()
          else if (_selectedStage == GrowthStage.zeroToOne)
            _buildZeroToOneTab(records, latest, ageInMonths)
          else
            _buildOneToFiveTab(latest),
        ],
      ),
    );
  }

  Widget _buildPregnancyTab() {
    const bloodPressureHigh = true;
    final risk = bloodPressureHigh ? _RiskLevel.risk : _RiskLevel.normal;

    return Column(
      children: [
        _NutritionImageHeroCard(
          imagePath: _nutritionImagePaths[_selectedNutritionImage],
          caption: _nutritionImageCaptions[_selectedNutritionImage],
          onTap: () => _showNutritionImagePreview(_selectedNutritionImage),
        ),
        const SizedBox(height: 12),
        const _SectionCard(
          title: 'Baby Development (Week 24)',
          icon: Icons.pregnant_woman_rounded,
          accent: Color(0xFF009688),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Baby size: as big as a corn', style: TextStyle(fontWeight: FontWeight.w700)),
              SizedBox(height: 8),
              Text('Your baby is developing lungs and hearing. Keep ANC follow-up active this week.'),
            ],
          ),
        ),
        const SizedBox(height: 12),
        const _AIAdviceCard(
          tips: <String>[
            'Eat iron-rich foods: spinach, lentils, and beans.',
            'Drink enough water and rest regularly.',
            'Attend ANC visit this week.',
          ],
        ),
        const SizedBox(height: 12),
        const _FoodSafetyAlertCard(
          warnings: <String>[
            'Avoid raw meat (kitfo, gored gored) during pregnancy - risk of infection.',
            'Avoid unboiled milk. Boil milk before drinking to reduce bacterial risk.',
            'Wash and cook vegetables properly before eating.',
          ],
        ),
        const SizedBox(height: 12),
        _RiskAlertCard(
          level: risk,
          message: bloodPressureHigh
              ? 'High blood pressure detected - visit clinic immediately.'
              : 'Healthy pregnancy trend. Continue routine checks.',
        ),
      ],
    );
  }

  Widget _buildZeroToOneTab(
    List<ChildGrowthRecord> records,
    ChildGrowthRecord? latest,
    int ageInMonths,
  ) {
    final weight = latest?.weightKg ?? 3.2;
    final height = latest?.heightCm ?? 50;
    final weightStatus = _weightStatus(ageInMonths: ageInMonths, weight: weight);
    final heightStatus = _heightStatus(ageInMonths: ageInMonths, height: height);
    final risk = _composeRisk(weightStatus, heightStatus, _milestonesZeroToOne);
    final lowWeight = weightStatus == _RiskLevel.warning || weightStatus == _RiskLevel.risk;

    return Column(
      children: [
        _GrowthMetricsCard(
          ageLabel: '$ageInMonths months',
          weight: '$weight kg',
          weightRisk: weightStatus,
          height: '$height cm',
          heightRisk: heightStatus,
        ),
        const SizedBox(height: 12),
        _SectionCard(
          title: 'Growth Chart (Weight vs Age)',
          icon: Icons.show_chart_rounded,
          accent: const Color(0xFF26A69A),
          child: _SimpleGrowthChart(records: records),
        ),
        const SizedBox(height: 12),
        _AIAdviceCard(
          tips: lowWeight
              ? const <String>[
                  'Baby is slightly underweight. Increase breastfeeding frequency.',
                  'Feed every 2-3 hours and monitor hydration.',
                  'Schedule a growth check at nearby health center.',
                ]
              : const <String>[
                  'Growth trend is healthy. Continue exclusive breastfeeding.',
                  'Keep child warm and maintain immunization schedule.',
                  'Attend routine checkups to maintain progress.',
                ],
        ),
        const SizedBox(height: 12),
        const _NutritionCard(
          title: 'Nutrition Advice (0-1 Year)',
          items: <String>[
            'Exclusive breastfeeding for first 6 months.',
            'Feed every 2-3 hours.',
            'After 6 months, add soft mashed foods safely.',
            'Do not give raw milk, unclean food, or adult spicy foods early.',
            'Give clean, soft, and well-cooked complementary foods.',
          ],
        ),
        const SizedBox(height: 12),
        _NutritionSystemSection(onTapNutrient: _showNutrientDetail),
        const SizedBox(height: 12),
        _NutritionImageGallery(
          title: 'Nutrition Visual Guide',
          imagePaths: _nutritionImagePaths,
          captions: _nutritionImageCaptions,
          selectedIndex: _selectedNutritionImage,
          onPageChanged: (index) => setState(() => _selectedNutritionImage = index),
          onImageTap: _showNutritionImagePreview,
        ),
        const SizedBox(height: 12),
        _MilestoneChecklistCard(
          title: 'Milestone Checklist',
          milestones: _milestonesZeroToOne,
          onChanged: (name, value) => setState(() => _milestonesZeroToOne[name] = value),
        ),
        const SizedBox(height: 12),
        _RiskAlertCard(level: risk, message: _riskMessage(risk)),
      ],
    );
  }

  Widget _buildOneToFiveTab(ChildGrowthRecord? latest) {
    const ageLabel = '2 years';
    final weight = latest?.weightKg ?? 10;
    final height = latest?.heightCm ?? 82;
    final weightStatus = weight < 10 ? _RiskLevel.warning : _RiskLevel.normal;
    final heightStatus = height < 80 ? _RiskLevel.warning : _RiskLevel.normal;
    final risk = _composeRisk(weightStatus, heightStatus, _milestonesOneToFive);

    return Column(
      children: [
        _GrowthMetricsCard(
          ageLabel: ageLabel,
          weight: '$weight kg',
          weightRisk: weightStatus,
          height: '$height cm',
          heightRisk: heightStatus,
        ),
        const SizedBox(height: 12),
        const _AIAdviceCard(
          tips: <String>[
            'Add protein foods such as eggs, milk, and lentils.',
            'Encourage active play daily for healthy development.',
            'Schedule next growth check visit this month.',
          ],
        ),
        const SizedBox(height: 12),
        const _NutritionCard(
          title: 'Localized Nutrition Plan (Ethiopia)',
          items: <String>[
            'Injera with lentils and vegetables.',
            'Milk and eggs 3-4 times per week.',
            'Seasonal fruits plus clean drinking water.',
          ],
        ),
        const SizedBox(height: 12),
        _NutritionSystemSection(onTapNutrient: _showNutrientDetail),
        const SizedBox(height: 12),
        _NutritionImageGallery(
          title: 'Recommended Foods Gallery',
          imagePaths: _nutritionImagePaths,
          captions: _nutritionImageCaptions,
          selectedIndex: _selectedNutritionImage,
          onPageChanged: (index) => setState(() => _selectedNutritionImage = index),
          onImageTap: _showNutritionImagePreview,
        ),
        const SizedBox(height: 12),
        _MilestoneChecklistCard(
          title: 'Development Milestones (1-5 Years)',
          milestones: _milestonesOneToFive,
          onChanged: (name, value) => setState(() => _milestonesOneToFive[name] = value),
        ),
        const SizedBox(height: 12),
        _RiskAlertCard(level: risk, message: _riskMessage(risk)),
      ],
    );
  }

  _RiskLevel _weightStatus({required int ageInMonths, required double weight}) {
    if (ageInMonths <= 6) {
      if (weight < 3.0) return _RiskLevel.risk;
      if (weight < 4.0) return _RiskLevel.warning;
      return _RiskLevel.normal;
    }
    if (weight < 6.0) return _RiskLevel.warning;
    return _RiskLevel.normal;
  }

  _RiskLevel _heightStatus({required int ageInMonths, required double height}) {
    if (ageInMonths <= 6) {
      if (height < 48) return _RiskLevel.risk;
      if (height < 52) return _RiskLevel.warning;
      return _RiskLevel.normal;
    }
    if (height < 60) return _RiskLevel.warning;
    return _RiskLevel.normal;
  }

  _RiskLevel _composeRisk(
    _RiskLevel weightStatus,
    _RiskLevel heightStatus,
    Map<String, bool> milestones,
  ) {
    final missedMilestones = milestones.values.where((isDone) => !isDone).length;
    if (weightStatus == _RiskLevel.risk || heightStatus == _RiskLevel.risk) return _RiskLevel.risk;
    if (weightStatus == _RiskLevel.warning || heightStatus == _RiskLevel.warning || missedMilestones > 0) {
      return _RiskLevel.warning;
    }
    return _RiskLevel.normal;
  }

  String _riskMessage(_RiskLevel level) {
    switch (level) {
      case _RiskLevel.risk:
        return 'Growth below standard detected. Please visit a health center urgently.';
      case _RiskLevel.warning:
        return 'Delayed milestone or slight growth warning detected. Monitor closely and follow advice.';
      case _RiskLevel.normal:
        return 'Healthy growth trend detected. Keep up current nutrition and checkups.';
    }
  }

  void _showNutritionImagePreview(int index) {
    showDialog<void>(
      context: context,
      builder: (_) => Dialog(
        insetPadding: const EdgeInsets.all(20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
              child: Image.asset(
                _nutritionImagePaths[index],
                height: 260,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Text(
                _nutritionImageCaptions[index],
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showNutrientDetail(_NutrientInfo nutrient) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.asset(
                    nutrient.imagePath,
                    width: 56,
                    height: 56,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '${nutrient.title} Foods',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            for (final food in nutrient.foods)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text('- $food'),
              ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: nutrient.bgColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Tip: ${nutrient.detailTip}',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NutrientInfo {
  final String title;
  final String tip;
  final String imagePath;
  final Color bgColor;
  final List<String> foods;
  final String detailTip;

  const _NutrientInfo({
    required this.title,
    required this.tip,
    required this.imagePath,
    required this.bgColor,
    required this.foods,
    required this.detailTip,
  });
}

class _NutritionSystemSection extends StatelessWidget {
  final ValueChanged<_NutrientInfo> onTapNutrient;

  const _NutritionSystemSection({
    required this.onTapNutrient,
  });

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Recommended Nutrition',
      icon: Icons.local_dining_rounded,
      accent: const Color(0xFF009688),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Eat balanced foods for healthy growth',
            style: TextStyle(color: Color(0xFF607D8B), fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 170,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _MotherChildGrowthScreenState._nutrients.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final nutrient = _MotherChildGrowthScreenState._nutrients[index];
                return GestureDetector(
                  onTap: () => onTapNutrient(nutrient),
                  child: Container(
                    width: 130,
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: nutrient.bgColor,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: const <BoxShadow>[
                        BoxShadow(color: Color(0x14000000), blurRadius: 8, offset: Offset(0, 4)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.asset(
                            nutrient.imagePath,
                            height: 82,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          nutrient.title,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          nutrient.tip,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF455A64)),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              'Example Meals:\n- Injera + Misir (Iron + Protein)\n- Milk + Bread (Calcium + Energy)',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _NutritionImageHeroCard extends StatelessWidget {
  final String imagePath;
  final String caption;
  final VoidCallback onTap;

  const _NutritionImageHeroCard({
    required this.imagePath,
    required this.caption,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Stack(
          children: [
            Image.asset(
              imagePath,
              height: 175,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
            Positioned.fill(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: <Color>[Color(0x22000000), Color(0xAA000000)],
                  ),
                ),
              ),
            ),
            Positioned(
              left: 14,
              right: 14,
              bottom: 12,
              child: Row(
                children: [
                  const Icon(Icons.touch_app_rounded, color: Colors.white),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '$caption - tap to preview',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
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
}

class _NutritionImageGallery extends StatelessWidget {
  final String title;
  final List<String> imagePaths;
  final List<String> captions;
  final int selectedIndex;
  final ValueChanged<int> onPageChanged;
  final ValueChanged<int> onImageTap;

  const _NutritionImageGallery({
    required this.title,
    required this.imagePaths,
    required this.captions,
    required this.selectedIndex,
    required this.onPageChanged,
    required this.onImageTap,
  });

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: title,
      icon: Icons.photo_library_rounded,
      accent: const Color(0xFF00897B),
      child: Column(
        children: [
          SizedBox(
            height: 170,
            child: PageView.builder(
              onPageChanged: onPageChanged,
              itemCount: imagePaths.length,
              itemBuilder: (context, index) {
                return GestureDetector(
                  onTap: () => onImageTap(index),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.asset(imagePaths[index], fit: BoxFit.cover),
                          Positioned(
                            left: 10,
                            right: 10,
                            bottom: 10,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0x99000000),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                captions[index],
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              imagePaths.length,
              (index) => AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                width: selectedIndex == index ? 18 : 8,
                height: 8,
                margin: const EdgeInsets.symmetric(horizontal: 3),
                decoration: BoxDecoration(
                  color: selectedIndex == index ? const Color(0xFF009688) : const Color(0xFFB2DFDB),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  final GrowthStage selectedStage;

  const _HeaderCard({required this.selectedStage});

  @override
  Widget build(BuildContext context) {
    final subtitle = switch (selectedStage) {
      GrowthStage.pregnancy => 'Pregnancy development + ANC smart guidance',
      GrowthStage.zeroToOne => '0-1 year growth tracking with AI suggestions',
      GrowthStage.oneToFive => '1-5 years growth, nutrition, and milestones',
    };

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        gradient: const LinearGradient(
          colors: <Color>[Color(0xFF009688), Color(0xFF26A69A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: const <BoxShadow>[
          BoxShadow(color: Color(0x22000000), blurRadius: 12, offset: Offset(0, 6)),
        ],
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 24,
            backgroundColor: Color(0x33FFFFFF),
            child: Icon(Icons.insights_rounded, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Child Growth & Smart Advice',
                  style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(color: Colors.white70)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StageSwitcher extends StatelessWidget {
  final GrowthStage selectedStage;
  final ValueChanged<GrowthStage> onChanged;

  const _StageSwitcher({
    required this.selectedStage,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          _tabChip('Pregnancy', GrowthStage.pregnancy),
          _tabChip('0-1 Year', GrowthStage.zeroToOne),
          _tabChip('1-5 Years', GrowthStage.oneToFive),
        ],
      ),
    );
  }

  Widget _tabChip(String label, GrowthStage stage) {
    final selected = selectedStage == stage;
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 2),
        child: ChoiceChip(
          labelPadding: const EdgeInsets.symmetric(vertical: 2),
          label: Text(label),
          selected: selected,
          onSelected: (_) => onChanged(stage),
          selectedColor: const Color(0xFF009688),
          labelStyle: TextStyle(
            color: selected ? Colors.white : const Color(0xFF455A64),
            fontWeight: FontWeight.w600,
          ),
          backgroundColor: const Color(0xFFE0F2F1),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color accent;
  final Widget child;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.accent,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const <BoxShadow>[
          BoxShadow(color: Color(0x12000000), blurRadius: 10, offset: Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: accent),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _GrowthMetricsCard extends StatelessWidget {
  final String ageLabel;
  final String weight;
  final _RiskLevel weightRisk;
  final String height;
  final _RiskLevel heightRisk;

  const _GrowthMetricsCard({
    required this.ageLabel,
    required this.weight,
    required this.weightRisk,
    required this.height,
    required this.heightRisk,
  });

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Growth Status',
      icon: Icons.monitor_heart_rounded,
      accent: const Color(0xFF009688),
      child: Column(
        children: [
          _metricRow('Age', ageLabel, _RiskLevel.normal),
          const SizedBox(height: 8),
          _metricRow('Weight', weight, weightRisk),
          const SizedBox(height: 8),
          _metricRow('Height', height, heightRisk),
        ],
      ),
    );
  }

  Widget _metricRow(String label, String value, _RiskLevel risk) {
    final color = _riskColor(risk);
    final status = _riskLabel(risk);
    return Row(
      children: [
        Expanded(
          child: Text(
            '$label: $value',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
        if (label != 'Age')
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              status,
              style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12),
            ),
          ),
      ],
    );
  }
}

class _SimpleGrowthChart extends StatelessWidget {
  final List<ChildGrowthRecord> records;

  const _SimpleGrowthChart({required this.records});

  @override
  Widget build(BuildContext context) {
    if (records.isEmpty) {
      return const Text('No growth records yet.');
    }

    final maxWeight = records.map((r) => r.weightKg).reduce((a, b) => a > b ? a : b);
    return SizedBox(
      height: 170,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (var i = 0; i < records.length; i++)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Align(
                        alignment: Alignment.bottomCenter,
                        child: Container(
                          width: 16,
                          height: (records[i].weightKg / maxWeight) * 110 + 8,
                          decoration: BoxDecoration(
                            color: const Color(0xFF26A69A),
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'M${i + 1}',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF607D8B)),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _AIAdviceCard extends StatelessWidget {
  final List<String> tips;

  const _AIAdviceCard({required this.tips});

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'AI Recommendation',
      icon: Icons.psychology_rounded,
      accent: const Color(0xFF1E88E5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final tip in tips)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text('- $tip'),
            ),
        ],
      ),
    );
  }
}

class _NutritionCard extends StatelessWidget {
  final String title;
  final List<String> items;

  const _NutritionCard({
    required this.title,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: title,
      icon: Icons.restaurant_menu_rounded,
      accent: const Color(0xFF43A047),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final item in items)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text('- $item'),
            ),
        ],
      ),
    );
  }
}

class _MilestoneChecklistCard extends StatelessWidget {
  final String title;
  final Map<String, bool> milestones;
  final void Function(String name, bool value) onChanged;

  const _MilestoneChecklistCard({
    required this.title,
    required this.milestones,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: title,
      icon: Icons.checklist_rounded,
      accent: const Color(0xFF8E24AA),
      child: Column(
        children: milestones.entries.map((entry) {
          return CheckboxListTile(
            dense: true,
            contentPadding: EdgeInsets.zero,
            value: entry.value,
            title: Text(entry.key),
            onChanged: (value) => onChanged(entry.key, value ?? false),
          );
        }).toList(),
      ),
    );
  }
}

class _RiskAlertCard extends StatelessWidget {
  final _RiskLevel level;
  final String message;

  const _RiskAlertCard({
    required this.level,
    required this.message,
  });

  @override
  Widget build(BuildContext context) {
    final color = _riskColor(level);
    final icon = switch (level) {
      _RiskLevel.normal => Icons.verified_rounded,
      _RiskLevel.warning => Icons.warning_amber_rounded,
      _RiskLevel.risk => Icons.dangerous_rounded,
    };

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.45)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: color, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _FoodSafetyAlertCard extends StatelessWidget {
  final List<String> warnings;

  const _FoodSafetyAlertCard({required this.warnings});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFE5E5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFB3B3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Color(0xFFC62828)),
              SizedBox(width: 8),
              Text(
                'Food Safety Alert',
                style: TextStyle(
                  color: Color(0xFFB71C1C),
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          for (final warning in warnings)
            Padding(
              padding: const EdgeInsets.only(bottom: 7),
              child: Text(
                '- $warning',
                style: const TextStyle(
                  color: Color(0xFFB71C1C),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

Color _riskColor(_RiskLevel level) {
  switch (level) {
    case _RiskLevel.normal:
      return const Color(0xFF2E7D32);
    case _RiskLevel.warning:
      return const Color(0xFFF57C00);
    case _RiskLevel.risk:
      return const Color(0xFFC62828);
  }
}

String _riskLabel(_RiskLevel level) {
  switch (level) {
    case _RiskLevel.normal:
      return 'Normal';
    case _RiskLevel.warning:
      return 'Warning';
    case _RiskLevel.risk:
      return 'Risk';
  }
}
