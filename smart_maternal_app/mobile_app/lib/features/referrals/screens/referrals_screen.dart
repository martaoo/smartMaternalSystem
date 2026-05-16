import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../widgets/referral_card.dart';

class ReferralsScreen extends StatefulWidget {
  const ReferralsScreen({super.key});

  @override
  State<ReferralsScreen> createState() => _ReferralsScreenState();
}

class _ReferralsScreenState extends State<ReferralsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppBarWidget(
        title: 'Referrals',
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          ReferralCard(
            facilityName: 'Regional Hospital',
            facilityAddress: '789 Health Center Rd, City',
            reason: 'High blood pressure monitoring',
            urgency: 'high',
            referralDate: 'May 10, 2026',
            status: 'pending',
            referredBy: 'Dr. Smith',
          ),
          SizedBox(height: 16),
          ReferralCard(
            facilityName: 'Specialist Clinic',
            facilityAddress: '321 Specialist Ave, City',
            reason: 'Fetal ultrasound evaluation',
            urgency: 'normal',
            referralDate: 'April 28, 2026',
            status: 'completed',
            referredBy: 'Dr. Johnson',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add new referral
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add),
      ),
    );
  }
}
