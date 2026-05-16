import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

import '../../../models/user_model.dart';

class ProfileHeader extends StatelessWidget {
  final UserModel? user;

  const ProfileHeader({super.key, this.user});

  @override
  Widget build(BuildContext context) {
    final name = user?.name ?? 'Guest User';
    final role = user?.role ?? 'Mother';
    final id = user?.id ?? 'N/A';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: AppColors.primaryLight,
            child: const Icon(
              Icons.person,
              size: 50,
              color: AppColors.textLight,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            name,
            style: AppTextStyles.heading3.copyWith(
              color: AppColors.textLight,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            role,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textLight,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'ID: $id',
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textLight,
            ),
          ),
        ],
      ),
    );
  }
}
