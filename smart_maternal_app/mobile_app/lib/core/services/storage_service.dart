import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static const _storage = FlutterSecureStorage();
  
  static const String _tokenKey = 'auth_token';
  static const String _userIdKey = 'user_id';
  static const String _userRoleKey = 'user_role';
  
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }
  
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }
  
  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }
  
  Future<void> saveUserId(String userId) async {
    await _storage.write(key: _userIdKey, value: userId);
  }
  
  Future<String?> getUserId() async {
    return await _storage.read(key: _userIdKey);
  }
  
  Future<void> deleteUser() async {
    await _storage.delete(key: _userIdKey);
  }
  
  Future<void> saveUserRole(String role) async {
    await _storage.write(key: _userRoleKey, value: role);
  }
  
  Future<String?> getUserRole() async {
    return await _storage.read(key: _userRoleKey);
  }
  
  Future<void> deleteUserRole() async {
    await _storage.delete(key: _userRoleKey);
  }

  static const String _userNameKey = 'user_name';

  Future<void> saveUserName(String name) async {
    await _storage.write(key: _userNameKey, value: name);
  }
  
  Future<String?> getUserName() async {
    return await _storage.read(key: _userNameKey);
  }
  
  Future<void> deleteUserName() async {
    await _storage.delete(key: _userNameKey);
  }
  
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
  
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}
