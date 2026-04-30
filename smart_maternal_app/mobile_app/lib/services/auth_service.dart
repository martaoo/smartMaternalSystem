import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {

  final String baseUrl = "http://10.0.2.2:3000/auth";
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<bool> login(String email, String password) async {
    try {
      print('Attempting login with: $email');
      
      // Mock login for Bezawit - handle multiple email variations
      if (email.toLowerCase().contains('bezawit')) {
        if (password == 'password' || password == '123456') {
          // Store mock user data
          await _storage.write(key: 'auth_token', value: 'mock_token_bezawit');
          await _storage.write(key: 'user_name', value: 'Bezawit');
          await _storage.write(key: 'pregnancy_week', value: '24');
          await _storage.write(key: 'next_visit', value: 'May 12');
          await _storage.write(key: 'risk_level', value: 'Low');
          print('Mock login successful for Bezawit with email: $email');
          return true;
        }
      }
      
      print('URL: $baseUrl/login');
      
      final response = await http.post(
        Uri.parse("$baseUrl/login"),
        headers: {
          "Content-Type": "application/json"
        },
        body: jsonEncode({
          "email": email,
          "password": password
        }),
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        if (responseData['success'] == true && responseData['token'] != null) {
          await _storage.write(key: 'auth_token', value: responseData['token']);
          await _storage.write(key: 'user_name', value: responseData['user']['name'] ?? 'Mother');
          return true;
        }
        return false;
      } else {
        return false;
      }
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<bool> register(String name, String email, String phone, String password) async {
    try {
      print('Attempting registration for: $email');
      print('URL: $baseUrl/register');
      
      final response = await http.post(
        Uri.parse("$baseUrl/register"),
        headers: {
          "Content-Type": "application/json"
        },
        body: jsonEncode({
          "name": name,
          "email": email,
          "phone": phone,
          "password": password,
          "role": "mother"
        }),
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        if (responseData['success'] == true && responseData['token'] != null) {
          await _storage.write(key: 'auth_token', value: responseData['token']);
          await _storage.write(key: 'user_name', value: responseData['user']['name'] ?? name);
          return true;
        }
        return false;
      } else {
        return false;
      }
    } catch (e) {
      print('Registration error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _storage.delete(key: 'auth_token');
      await _storage.delete(key: 'user_name');
      print('User logged out successfully');
    } catch (e) {
      print('Logout error: $e');
    }
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null;
  }

  Future<String?> getPregnancyWeek() async {
    return await _storage.read(key: 'pregnancy_week');
  }

  Future<String?> getNextVisit() async {
    return await _storage.read(key: 'next_visit');
  }

  Future<String?> getRiskLevel() async {
    return await _storage.read(key: 'risk_level');
  }

  Future<void> setMockMotherData() async {
    await _storage.write(key: 'auth_token', value: 'mock_token_bezawit');
    await _storage.write(key: 'user_name', value: 'Bezawit');
    await _storage.write(key: 'pregnancy_week', value: '24');
    await _storage.write(key: 'next_visit', value: 'May 12');
    await _storage.write(key: 'risk_level', value: 'Low');
    print('Mock mother data set successfully');
  }
}
