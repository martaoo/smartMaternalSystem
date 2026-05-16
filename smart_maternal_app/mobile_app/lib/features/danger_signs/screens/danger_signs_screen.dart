import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../widgets/danger_sign_card.dart';
import '../../profile/services/profile_service.dart';
import '../../../models/user_model.dart';

class DangerSignsScreen extends StatefulWidget {
  const DangerSignsScreen({super.key});

  @override
  State<DangerSignsScreen> createState() => _DangerSignsScreenState();
}

class _DangerSignsScreenState extends State<DangerSignsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ProfileService _profileService = ProfileService();
  UserModel? _user;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
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

  void _showEmergencyNumbers() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Emergency Contacts',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.text),
              ),
              const SizedBox(height: 8),
              Text(
                'Ethiopian National Emergency Services',
                style: TextStyle(color: AppColors.textSecondary.withOpacity(0.8), fontSize: 14),
              ),
              const SizedBox(height: 24),
              if (_user?.healthCenterName != null) ...[
                _buildEmergencyItem(
                  context,
                  'Your Health Facility',
                  _user!.healthCenterName!,
                  Icons.local_hospital_rounded,
                  AppColors.primary,
                ),
                const Divider(height: 24),
              ],
              _buildEmergencyItem(
                context,
                'National Emergency',
                '939',
                Icons.emergency_rounded,
                Colors.red,
              ),
              _buildEmergencyItem(
                context,
                'Ambulance (Red Cross)',
                '907',
                Icons.medical_services_rounded,
                Colors.red[700]!,
              ),
              _buildEmergencyItem(
                context,
                'Health Info Line',
                '8335',
                Icons.contact_support_rounded,
                Colors.blue,
              ),
              _buildEmergencyItem(
                context,
                'Police',
                '991',
                Icons.local_police_rounded,
                Colors.blue[900]!,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: const Text('Close', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmergencyItem(BuildContext context, String title, String number, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                Text(number, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.text)),
              ],
            ),
          ),
          IconButton(
            onPressed: () {
              // Call logic
            },
            icon: Icon(Icons.call_rounded, color: color),
            style: IconButton.styleFrom(backgroundColor: color.withOpacity(0.1)),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBFBFB),
      appBar: AppBarWidget(
        title: 'Danger Signs',
        actions: [
          IconButton(
            icon: const Icon(Icons.call_rounded, color: Colors.white),
            onPressed: _showEmergencyNumbers,
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.primary,
            child: TabBar(
              controller: _tabController,
              indicatorColor: Colors.white,
              indicatorWeight: 3,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white.withOpacity(0.7),
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
              tabs: const [
                Tab(text: 'Mother Signs'),
                Tab(text: 'Baby Signs'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildMotherDangerSigns(),
                _buildBabyDangerSigns(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMotherDangerSigns() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: const [
        DangerSignCard(
          title: 'Severe Vaginal Bleeding',
          description: 'Heavy bleeding that soaks through a pad in an hour or less. This is a life-threatening emergency.',
          icon: Icons.water_drop_rounded,
          severity: 'high',
          action: 'Go to the health facility immediately',
          imagePath: 'assets/images/danger_sign/danger_mother_bleeding.jpg',
        ),
        SizedBox(height: 20),
        DangerSignCard(
          title: 'Severe Headache & Blurry Vision',
          description: 'Intense headache that won\'t go away, combined with seeing spots or flashing lights. Could indicate high blood pressure.',
          icon: Icons.visibility_off_rounded,
          severity: 'high',
          action: 'Seek medical attention immediately',
          imagePath: 'assets/images/danger_sign/danger_mother_headache.jpg',
        ),
        SizedBox(height: 20),
        DangerSignCard(
          title: 'Fainting or Convulsions',
          description: 'Losing consciousness or having seizures. This requires immediate emergency care.',
          icon: Icons.warning_rounded,
          severity: 'high',
          action: 'Call emergency services or go to clinic',
          imagePath: 'assets/images/danger_sign/danger_mother_fainting.jpg',
        ),
        SizedBox(height: 20),
        DangerSignCard(
          title: 'Foul Smelling Discharge',
          description: 'Vaginal discharge that smells bad or unusual. May be accompanied by fever and abdominal pain.',
          icon: Icons.sick_rounded,
          severity: 'medium',
          action: 'Visit health center for checkup',
          imagePath: 'assets/images/danger_sign/danger_mother_bad_smelling.png',
        ),
        SizedBox(height: 20),
        DangerSignCard(
          title: 'Severe Abdominal Pain',
          description: 'Sharp or persistent pain in the stomach area that is not related to labor.',
          icon: Icons.emergency_rounded,
          severity: 'high',
          action: 'Consult your healthcare provider',
          imagePath: 'assets/images/danger_sign/mother-bed-emergency-clinic.jpg',
        ),
      ],
    );
  }

  Widget _buildBabyDangerSigns() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: const [
        DangerSignCard(
          title: 'Breathing Difficulty',
          description: 'Baby is breathing very fast (more than 60 breaths/min), grunting, or chest is pulling in deeply.',
          icon: Icons.air_rounded,
          severity: 'high',
          action: 'Seek immediate medical care',
          imagePath: 'assets/images/danger_sign/baby-breathing-difficulty.jpg',
        ),
        SizedBox(height: 20),
        DangerSignCard(
          title: 'Fever or Very Cold',
          description: 'Body temperature is too high (above 37.5°C) or too low (below 35.5°C).',
          icon: Icons.thermostat_rounded,
          severity: 'high',
          action: 'Contact health provider immediately',
          imagePath: 'assets/images/danger_sign/baby-fever-cold.jpg',
        ),
        SizedBox(height: 20),
        DangerSignCard(
          title: 'Convulsions or Shaking',
          description: 'Involuntary movements or stiffness. This is a serious sign of illness.',
          icon: Icons.warning_amber_rounded,
          severity: 'high',
          action: 'Go to the nearest hospital immediately',
          imagePath: 'assets/images/danger_sign/baby-danger-shaking.jpg',
        ),
        SizedBox(height: 20),
        DangerSignCard(
          title: 'Lethargic or Unconscious',
          description: 'Baby is difficult to wake up, very sleepy, or doesn\'t react to touch.',
          icon: Icons.hotel_rounded,
          severity: 'high',
          action: 'Seek emergency medical attention',
          imagePath: 'assets/images/danger_sign/baby-lethargic-fainting.jpg',
        ),
        SizedBox(height: 20),
        DangerSignCard(
          title: 'Not Feeding or Active',
          description: 'Baby is unable to suckle or has stopped feeding completely.',
          icon: Icons.child_care_rounded,
          severity: 'high',
          action: 'Consult your doctor immediately',
          imagePath: 'assets/images/danger_sign/baby-not-active-sleepy.jpg',
        ),
        SizedBox(height: 20),
        DangerSignCard(
          title: 'Umbilical Cord Infection',
          description: 'Redness around the cord base, foul smell, or pus discharge.',
          icon: Icons.health_and_safety_rounded,
          severity: 'medium',
          action: 'Visit the clinic for treatment',
          imagePath: 'assets/images/danger_sign/baby-umbilical-cord-infection.jpg',
        ),
        SizedBox(height: 20),
        DangerSignCard(
          title: 'Yellow Skin (Jaundice)',
          description: 'Yellowing of the skin and eyes, especially within the first 24 hours of life.',
          icon: Icons.face_rounded,
          severity: 'medium',
          action: 'Consult your healthcare provider',
          imagePath: 'assets/images/danger_sign/danger_child_jaundice.jpg',
        ),
      ],
    );
  }
}
