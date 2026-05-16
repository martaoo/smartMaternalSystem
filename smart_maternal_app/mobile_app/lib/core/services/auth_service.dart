import 'dart:convert';
import '../constants/api_constants.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';

class AuthService {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();
  
  Future<bool> login(String email, String password) async {
    try {
      final response = await _apiService.post(
        ApiConstants.loginEndpoint,
        body: {
          'email': email,
          'password': password,
        },
      );
      
      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        final token = decoded['access_token'] as String?;
        final user = decoded['user'] as Map<String, dynamic>?;

        if (token != null) {
          await _storageService.saveToken(token);
        }
        if (user != null && user['id'] != null) {
          await _storageService.saveUserId(user['id'].toString());
        }
        if (user != null && user['role'] != null) {
          await _storageService.saveUserRole(user['role'].toString());
        }
        return token != null;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  
  Future<bool> register(Map<String, dynamic> userData) async {
    try {
      final response = await _apiService.post(
        ApiConstants.registerEndpoint,
        body: userData,
      );
      
      if (response.statusCode == 201) {
        final decoded = jsonDecode(response.body);
        final token = decoded['access_token'] as String?;
        final user = decoded['user'] as Map<String, dynamic>?;

        if (token != null) {
          await _storageService.saveToken(token);
        }
        if (user != null && user['id'] != null) {
          await _storageService.saveUserId(user['id'].toString());
        }
        if (user != null && user['role'] != null) {
          await _storageService.saveUserRole(user['role'].toString());
        }

        return token != null;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  
  Future<void> logout() async {
    try {
      final token = await _storageService.getToken();
      await _apiService.post(ApiConstants.logoutEndpoint, token: token);
    } catch (e) {
      // Ignore logout errors
    } finally {
      await _storageService.clearAll();
    }
  }
  
  Future<bool> isLoggedIn() async {
    return await _storageService.isLoggedIn();
  }
  
  Future<String?> getToken() async {
    return await _storageService.getToken();
  }
  
  Future<String?> getUserId() async {
    return await _storageService.getUserId();
  }
  
  Future<String?> getUserRole() async {
    return await _storageService.getUserRole();
  }
}
