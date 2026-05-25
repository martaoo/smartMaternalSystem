import 'dart:convert';
import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../models/referral_model.dart';

class ReferralService {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  Future<List<ReferralModel>> getActiveReferralsForMother() async {
    try {
      final token = await _storageService.getToken();
      print('[ReferralService] Fetching active referrals with token: ${token != null ? "has token" : "no token"}');
      
      final response = await _apiService.get(
        '/referrals/mother/active',
        token: token,
      );

      print('[ReferralService] Response status: ${response.statusCode}');
      print('[ReferralService] Response body: ${response.body}');

      if (response.statusCode == 200) {
        if (response.body.isEmpty || response.body == 'null') {
          print('[ReferralService] No active referrals found');
          return [];
        }
        final data = json.decode(response.body) as List;
        print('[ReferralService] Parsing ${data.length} referral(s)');
        return data.map((json) => ReferralModel.fromJson(json)).toList();
      }
      return [];
    } catch (e, stackTrace) {
      print('[ReferralService] Error: $e');
      print('[ReferralService] Stack trace: $stackTrace');
      return [];
    }
  }

  Future<List<ReferralModel>> getReferrals() async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.get(
        '/referrals',
        token: token,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => ReferralModel.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<ReferralModel?> createReferral(Map<String, dynamic> referralData) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.post(
        '/referrals',
        body: referralData,
        token: token,
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        return ReferralModel.fromJson(data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<bool> updateReferral(String referralId, Map<String, dynamic> referralData) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.put(
        '/referrals/$referralId',
        body: referralData,
        token: token,
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteReferral(String referralId) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.delete(
        '/referrals/$referralId',
        token: token,
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
