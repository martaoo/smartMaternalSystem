import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Helpers {
  static String formatDate(DateTime date) {
    return DateFormat('MMM dd, yyyy').format(date);
  }
  
  static String formatTime(DateTime time) {
    return DateFormat('hh:mm a').format(time);
  }
  
  static String formatDateTime(DateTime dateTime) {
    return DateFormat('MMM dd, yyyy - hh:mm a').format(dateTime);
  }
  
  static String formatAge(DateTime birthDate) {
    final now = DateTime.now();
    final age = now.year - birthDate.year;
    final monthDiff = now.month - birthDate.month;
    
    if (monthDiff < 0 || (monthDiff == 0 && now.day < birthDate.day)) {
      return '${age - 1} years';
    }
    
    return '$age years';
  }
  
  static String formatGestationalAge(DateTime lmp) {
    final now = DateTime.now();
    final difference = now.difference(lmp);
    final weeks = difference.inDays ~/ 7;
    final days = difference.inDays % 7;
    
    return '$weeks weeks $days days';
  }
  
  static void showSnackBar(BuildContext context, String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }
  
  static Future<void> showLoadingDialog(BuildContext context) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
  
  static void hideLoadingDialog(BuildContext context) {
    Navigator.of(context).pop();
  }
  
  static String capitalize(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }
}
