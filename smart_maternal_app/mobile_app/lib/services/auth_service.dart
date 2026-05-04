import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  // Try multiple host configurations for Android emulator
  final List<String> baseUrls = [
    "http://10.0.2.2:3001/api/auth",  // Standard Android emulator
    "http://localhost:3001/api/auth",  // Fallback for physical device
  ];
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<bool> login(String email, String password) async {
    try {
      print('Attempting login with: $email');

      
      // Try each base URL until one works
      http.Response? response;
      String? workingUrl;
      
      for (String url in baseUrls) {
        try {
          print('Trying URL: $url/login');
          print('Request body: ${jsonEncode({"email": email, "password": password})}');
          
          response = await http.post(
            Uri.parse("$url/login"),
            headers: {
              "Content-Type": "application/json"
            },
            body: jsonEncode({
              "email": email,
              "password": password
            }),
          ).timeout(Duration(seconds: 10));
          
          workingUrl = url;
          print('Connected to: $url');
          print('Response status: ${response.statusCode}');
          print('Response body: ${response.body}');
          break;
        } catch (e) {
          print('Failed to connect to $url: $e');
          print('Error type: ${e.runtimeType}');
          continue;
        }
      }
      
      if (response == null) {
        print('Failed to connect to any backend URL');
        throw Exception('Unable to connect to backend');
      }

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        
        // Check for access_token (what backend actually returns)
        if (responseData['access_token'] != null) {
          await _storage.write(key: 'auth_token', value: responseData['access_token']);
          await _storage.write(key: 'user_name', value: responseData['user']['name'] ?? 'Mother');
          await _storage.write(key: 'user_email', value: responseData['user']['email'] ?? '');
          await _storage.write(key: 'user_role', value: responseData['user']['role'] ?? 'MOTHER');
          await _storage.write(key: 'user_id', value: responseData['user']['id'] ?? '');
          print('Login successful, token stored');
          return true;
        }
        
        print('Access token not found in response');
        return false;
      } else {
        print('Login failed with status code: ${response.statusCode}');
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

      // Try each base URL until one works
      http.Response? response;
      String? workingUrl;
      
      for (String url in baseUrls) {
        try {
          print('Trying URL: $url/register');
          response = await http.post(
            Uri.parse("$url/register"),
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
          ).timeout(Duration(seconds: 10));
          
          workingUrl = url;
          print('Connected to: $url');
          break;
        } catch (e) {
          print('Failed to connect to $url: $e');
          continue;
        }
      }
      
      if (response == null) {
        print('Failed to connect to any backend URL');
        throw Exception('Unable to connect to backend');
      }

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        
        if (responseData['access_token'] != null) {
          await _storage.write(key: 'auth_token', value: responseData['access_token']);
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
      await _storage.delete(key: 'pregnancy_week');
      await _storage.delete(key: 'next_visit');
      await _storage.delete(key: 'risk_level');
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

  Future<String?> getUserName() async {
    return await _storage.read(key: 'user_name');
  }

  Future<String?> getUserEmail() async {
    return await _storage.read(key: 'user_email');
  }

  Future<String?> getUserRole() async {
    return await _storage.read(key: 'user_role');
  }

  Future<String?> getUserId() async {
    return await _storage.read(key: 'user_id');
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
