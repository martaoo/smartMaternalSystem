// lib/core/theme/app_colors.dart

import 'package:flutter/material.dart';

class AppColors {
  // Primary Brown Colors - Professional Maternal Health Theme
  static const Color primaryBrown = Color(0xFF8B4513);      // Warm Brown - Main brand color
  static const Color primaryDarkBrown = Color(0xFF654321); // Dark Brown - Headers and emphasis
  static const Color primaryLightBrown = Color(0xFFA0522D); // Light Brown - Accents
  
  // Medical & Health Colors
  static const Color medicalTeal = Color(0xFF2E8B57);       // Medical Teal - Health indicators
  static const Color vaccinationBlue = Color(0xFF4682B4);  // Vaccination Blue - Vaccination cards
  static const Color warningOrange = Color(0xFFFF8C00);     // Warning Orange - Danger signs
  static const Color successGreen = Color(0xFF228B22);     // Success Green - Completed appointments
  
  // Secondary Colors
  static const Color secondaryTeal = Color(0xFF4DB6AC);     // Soft Teal - Secondary actions
  static const Color secondaryGreen = Color(0xFF66BB6A);   // Soft Green - Positive actions
  static const Color secondarySage = Color(0xFF87A96B);    // Sage Green - Natural elements
  static const Color secondaryRose = Color(0xFFE6A8C7);    // Rose Pink - Maternal touches
  static const Color secondarySky = Color(0xFF87CEEB);     // Sky Blue - Calm elements
  
  // Status Colors
  static const Color success = Color(0xFF228B22);           // Success - Professional green
  static const Color warning = Color(0xFFFF8C00);           // Warning - Medical orange
  static const Color error = Color(0xFFD32F2F);             // Error - Medical red
  static const Color info = Color(0xFF4682B4);              // Info - Medical blue
  
  // Background Colors - Professional Medical Theme
  static const Color backgroundLight = Color(0xFFF5F5DC);   // Cream - Main background
  static const Color backgroundWhite = Colors.white;        // White - Card backgrounds
  static const Color backgroundBeige = Color(0xFFF5DEB3);   // Beige - Alternative background
  static const Color backgroundTan = Color(0xFFD2B48C);     // Tan - Borders and dividers
  
  // Text Colors - Professional Readability
  static const Color textPrimary = Color(0xFF36454F);       // Charcoal - Main text
  static const Color textSecondary = Color(0xFF5D4037);      // Brown text - Secondary text
  static const Color textLight = Color(0xFF8D6E63);         // Light Brown - Hints and captions
  static const Color textWhite = Colors.white;              // White - Text on dark backgrounds
  
  // Surface Colors
  static const Color surfaceLight = Color(0xFFFAF7F2);      // Very light cream
  static const Color surfaceMedium = Color(0xFFF0E6D2);     // Medium cream
  static const Color surfaceDark = Color(0xFFE6D2B5);       // Dark cream
  
  // Border Colors
  static const Color borderLight = Color(0xFFE6D2B5);        // Light borders
  static const Color borderMedium = Color(0xFFD2B48C);       // Medium borders
  static const Color borderDark = Color(0xFFA0522D);        // Dark borders
  
  // Shadow Colors
  static const Color shadowLight = Color(0x1A8B4513);       // Light shadows
  static const Color shadowMedium = Color(0x3D654321);      // Medium shadows
  static const Color shadowDark = Color(0x804A2C2A);       // Dark shadows
  
  // Gradient Colors
  static const List<Color> primaryGradient = [
    primaryBrown,
    primaryDarkBrown,
  ];
  
  static const List<Color> medicalGradient = [
    medicalTeal,
    vaccinationBlue,
  ];
  
  static const List<Color> warmGradient = [
    primaryLightBrown,
    primaryBrown,
    warningOrange,
  ];
  
  // Special Purpose Colors
  static const Color vaccinationCard = Color(0xFF4682B4);   // Vaccination card background
  static const Color dangerSign = Color(0xFFFF8C00);        // Danger sign background
  static const Color maternalCare = Color(0xFFE6A8C7);     // Maternal care accent
  static const Color childHealth = Color(0xFF87A96B);       // Child health accent

  // Additional Colors for Dashboard Design
  static const Color secondaryBrown = Color(0xFFA0522D);    // Secondary Brown - Light brown accent
  static const Color darkBrown = Color(0xFF654321);        // Dark Brown - Deep brown for overlays
  static const Color accentBrown = Color(0xFFCD853F);       // Accent Brown - Highlight color
  static const Color lightBrown = Color(0xFFF5DEB3);        // Light Brown - Background and dividers
  static const Color backgroundBrown = Color(0xFFE6D2B5);    // Background Brown - Surface backgrounds
  static const Color honeyGold = Color(0xFFFFD700);         // Honey Gold - Tips and highlights
  static const Color danger = Color(0xFFFF8C00);            // Danger - Warning color
  static const Color vaccinationCompleted = Color(0xFF228B22); // Vaccination Completed - Success
  static const Color vaccinationUpcoming = Color(0xFF4682B4); // Vaccination Upcoming - Blue
  static const Color childGrowth = Color(0xFF87A96B);       // Child Growth - Sage green
  static const Color slateBrown = Color(0xFF8B7355);        // Slate Brown - Profile action
}