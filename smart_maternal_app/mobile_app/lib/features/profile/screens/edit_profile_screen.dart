import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_bar_widget.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_textfield.dart';
import '../../../models/user_model.dart';
import '../services/profile_service.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final ProfileService _profileService = ProfileService();

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  final TextEditingController _currentPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  bool _isLoading = false;
  UserModel? _user;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_user == null) {
      _user = ModalRoute.of(context)?.settings.arguments as UserModel?;
      _nameController = TextEditingController(text: _user?.name);
      _emailController = TextEditingController(text: _user?.email);
      _phoneController = TextEditingController(text: _user?.phoneNumber);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final profileData = <String, dynamic>{
      'name': _nameController.text.trim(),
      'email': _emailController.text.trim(),
      'phoneNumber': _phoneController.text.trim(),
    };

    final success = await _profileService.updateProfile(profileData);

    setState(() {
      _isLoading = false;
    });

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully'), backgroundColor: AppColors.success),
      );
      Navigator.pop(context, true); // Return true to indicate success
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update profile'), backgroundColor: AppColors.error),
      );
    }
  }

  Future<void> _showChangePasswordDialog() async {
    _currentPasswordController.clear();
    _newPasswordController.clear();
    _confirmPasswordController.clear();
    
    final passwordFormKey = GlobalKey<FormState>();
    bool isSaving = false;

    await showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('Change Password'),
              content: Form(
                key: passwordFormKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CustomTextfield(
                        label: 'Current Password',
                        hintText: 'Enter current password',
                        controller: _currentPasswordController,
                        obscureText: true,
                        validator: (value) => value == null || value.isEmpty ? 'Required' : null,
                      ),
                      const SizedBox(height: 16),
                      CustomTextfield(
                        label: 'New Password',
                        hintText: 'Enter new password',
                        controller: _newPasswordController,
                        obscureText: true,
                        validator: (value) {
                          if (value == null || value.isEmpty) return 'Required';
                          if (value.length < 6) return 'Must be at least 6 characters';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      CustomTextfield(
                        label: 'Confirm New Password',
                        hintText: 'Confirm new password',
                        controller: _confirmPasswordController,
                        obscureText: true,
                        validator: (value) {
                          if (value != _newPasswordController.text) return 'Passwords do not match';
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: isSaving
                      ? null
                      : () async {
                          if (!passwordFormKey.currentState!.validate()) return;
                          
                          setStateDialog(() => isSaving = true);
                          final success = await _profileService.updateProfile({
                            'currentPassword': _currentPasswordController.text,
                            'newPassword': _newPasswordController.text,
                          });
                          setStateDialog(() => isSaving = false);
                          
                          if (success && context.mounted) {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Password updated successfully'), backgroundColor: AppColors.success),
                            );
                          } else if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Failed to update password. Check your current password.'), backgroundColor: AppColors.error),
                            );
                          }
                        },
                  child: isSaving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Update'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppBarWidget(
        title: 'Edit Profile',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Personal Information',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.text,
                    ),
              ),
              const SizedBox(height: 16),
              CustomTextfield(
                label: 'Full Name',
                hintText: 'Enter your full name',
                controller: _nameController,
                validator: (value) => value == null || value.isEmpty ? 'Name is required' : null,
              ),
              const SizedBox(height: 16),
              CustomTextfield(
                label: 'Email',
                hintText: 'Enter your email',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Email is required';
                  if (!value.contains('@')) return 'Enter a valid email';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              CustomTextfield(
                label: 'Phone Number',
                hintText: 'Enter your phone number',
                controller: _phoneController,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 32),
              OutlinedButton.icon(
                onPressed: _showChangePasswordDialog,
                icon: const Icon(Icons.lock_outline),
                label: const Text('Change Password'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 48),
              CustomButton(
                text: 'Save Changes',
                onPressed: _handleSave,
                isLoading: _isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
