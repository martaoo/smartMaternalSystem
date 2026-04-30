import 'package:flutter/material.dart';

class ChildInfoCard extends StatelessWidget {
  final String childName;
  final String ageText;
  final String gender;

  const ChildInfoCard({
    super.key,
    required this.childName,
    required this.ageText,
    required this.gender,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const CircleAvatar(
          radius: 24,
          backgroundColor: Color(0xFFE3F2FD),
          child: Text('👶', style: TextStyle(fontSize: 20)),
        ),
        title: Text(childName, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Age: $ageText • Gender: $gender'),
      ),
    );
  }
}
