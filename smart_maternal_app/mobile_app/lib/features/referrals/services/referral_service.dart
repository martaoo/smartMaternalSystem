import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../models/referral_model.dart';

class ReferralService {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  Future<List<ReferralModel>> getReferrals() async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.get(
        '/referrals',
        token: token,
      );

      if (response.statusCode == 200) {
        // Parse response and return list of referrals
        return [];
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
        // Parse response and return referral
        return null;
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
