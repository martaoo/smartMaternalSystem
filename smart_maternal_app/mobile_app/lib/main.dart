import 'package:flutter/material.dart';
import 'routes/app_routes.dart';
import 'core/constants/app_colors.dart';

void main() {
  runApp(const SmartMaternalApp());
}

class SmartMaternalApp extends StatelessWidget {
  const SmartMaternalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Maternal Health',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          secondary: AppColors.secondary,
        ),
        useMaterial3: true,
      ),
      initialRoute: AppRoutes.login,
      routes: AppRoutes.routes,
    );
  }
}