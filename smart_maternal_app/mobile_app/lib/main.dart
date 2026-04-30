import 'package:flutter/material.dart';
import 'screens/auth/login_screen.dart';
import 'core/theme/app_colors.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Maternal Health',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Roboto',
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primaryBrown),
        scaffoldBackgroundColor: AppColors.backgroundLight,
      ),
      home: const LoginScreen(),
    );
  }
}
