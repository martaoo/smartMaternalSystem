import 'package:flutter/material.dart';
import '../../../services/auth_service.dart';
import '../../../screens/auth/login_screen.dart';
import '../data/mock_mother_repository.dart';

class MotherProfileScreen extends StatefulWidget {
  const MotherProfileScreen({super.key});

  @override
  State<MotherProfileScreen> createState() => _MotherProfileScreenState();
}

class _MotherProfileScreenState extends State<MotherProfileScreen> {
  Future<void> _editProfile() async {
    final profile = MockMotherRepository.profile;
    final nameController = TextEditingController(text: profile.name);
    final phoneController = TextEditingController(text: profile.phone);
    String selectedRisk = profile.riskLevel;

    await showDialog<void>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Edit Profile'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Phone'),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: selectedRisk,
                  items: const ['Low', 'Medium', 'High']
                      .map((risk) => DropdownMenuItem(value: risk, child: Text(risk)))
                      .toList(),
                  onChanged: (value) => setDialogState(() => selectedRisk = value ?? selectedRisk),
                  decoration: const InputDecoration(labelText: 'Risk level'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                if (nameController.text.trim().isEmpty || phoneController.text.trim().isEmpty) {
                  return;
                }
                await MockMotherRepository.updateMotherProfile(
                  name: nameController.text.trim(),
                  phone: phoneController.text.trim(),
                  riskLevel: selectedRisk,
                );
                if (!mounted) return;
                Navigator.pop(context);
                setState(() {});
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Profile updated successfully.')),
                );
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profile = MockMotherRepository.profile;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Profile', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Name: ${profile.name}'),
                Text('Phone: ${profile.phone}'),
                Text('ID: ${profile.id}'),
                Text('Risk level: ${profile.riskLevel}'),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        ElevatedButton.icon(
          onPressed: _editProfile,
          icon: const Icon(Icons.edit),
          label: const Text('Edit Profile'),
        ),
        const SizedBox(height: 20),
        ElevatedButton.icon(
          onPressed: () async {
            await AuthService().logout();
            if (!context.mounted) return;
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (_) => const LoginScreen()),
              (route) => false,
            );
          },
          icon: const Icon(Icons.logout),
          label: const Text('Logout'),
        ),
      ],
    );
  }
}
