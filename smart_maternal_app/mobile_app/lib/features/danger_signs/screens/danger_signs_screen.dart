import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../widgets/danger_sign_card.dart';

class DangerSignsScreen extends StatefulWidget {
  const DangerSignsScreen({super.key});

  @override
  State<DangerSignsScreen> createState() => _DangerSignsScreenState();
}

class _DangerSignsScreenState extends State<DangerSignsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppBarWidget(
        title: 'Danger Signs',
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          DangerSignCard(
            title: 'Severe Vaginal Bleeding',
            description: 'Heavy bleeding that soaks through a pad in an hour or less',
            icon: Icons.water_drop,
            severity: 'high',
            action: 'Seek immediate medical attention',
          ),
          SizedBox(height: 16),
          DangerSignCard(
            title: 'Severe Abdominal Pain',
            description: 'Intense or persistent abdominal pain that doesn\'t go away',
            icon: Icons.warning,
            severity: 'high',
            action: 'Contact healthcare provider immediately',
          ),
          SizedBox(height: 16),
          DangerSignCard(
            title: 'Severe Headache',
            description: 'Headache that doesn\'t improve with rest or medication',
            icon: Icons.sick,
            severity: 'medium',
            action: 'Monitor and contact doctor if persists',
          ),
          SizedBox(height: 16),
          DangerSignCard(
            title: 'Vision Changes',
            description: 'Blurred vision, flashing lights, or spots in vision',
            icon: Icons.visibility_off,
            severity: 'high',
            action: 'Seek immediate medical attention',
          ),
          SizedBox(height: 16),
          DangerSignCard(
            title: 'Reduced Fetal Movement',
            description: 'Noticeable decrease in baby\'s movements',
            icon: Icons.child_care,
            severity: 'high',
            action: 'Contact healthcare provider immediately',
          ),
          SizedBox(height: 16),
          DangerSignCard(
            title: 'Fever or Chills',
            description: 'Temperature above 38°C (100.4°F) or severe chills',
            icon: Icons.thermostat,
            severity: 'medium',
            action: 'Contact healthcare provider',
          ),
        ],
      ),
    );
  }
}
