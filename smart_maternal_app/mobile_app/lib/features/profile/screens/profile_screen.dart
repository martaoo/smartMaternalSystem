import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../widgets/profile_header.dart';
import '../services/profile_service.dart';
import '../../../models/user_model.dart';
import '../../../routes/app_routes.dart';
import '../../auth/services/auth_api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ProfileService _profileService = ProfileService();
  final AuthApiService _authApiService = AuthApiService();
  UserModel? _user;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
    });
    final user = await _profileService.getUserProfile();
    setState(() {
      _user = user;
      _isLoading = false;
      _errorMessage = user == null ? 'Unable to load profile.' : null;
    });
  }

  Future<void> _handleLogout() async {
    await _authApiService.logout();
    if (mounted) {
      Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBarWidget(
        title: 'Profile',
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              // Navigate to Edit Profile and wait for result
              final result = await Navigator.pushNamed(context, '/edit-profile', arguments: _user);
              if (result == true) {
                // Reload profile if updated
                _loadProfile();
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  ProfileHeader(user: _user),
                  const SizedBox(height: 24),
                  _buildProfileSection(
                    'Personal Information',
                    [
                      _buildProfileItem('Full Name', _user?.name ?? 'N/A'),
                      _buildProfileItem('Email', _user?.email ?? 'N/A'),
                      _buildProfileItem('Phone', _user?.phoneNumber ?? 'N/A'),
                      _buildProfileItem('Role', _user?.role ?? 'N/A'),
                      _buildProfileItem('Region', _user?.regionId ?? 'N/A'),
                      _buildProfileItem('Wereda', _user?.woredaId ?? 'N/A'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildProfileSection(
                    'Account Info',
                    [
                      _buildProfileItem('Last Update', _formatDate(_user?.updatedAt)),
                      _buildProfileItem('Created', _formatDate(_user?.createdAt)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _buildLogoutButton(),
                ],
              ),
            ),
    );
  }

  static String _formatDate(DateTime? date) {
    if (date == null) return 'N/A';
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  static Widget _buildProfileSection(String title, List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  static Widget _buildProfileItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.text,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton() {
    return Container(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _handleLogout,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.error,
          foregroundColor: AppColors.textLight,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: const Text(
          'Logout',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
