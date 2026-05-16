import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../models/growth_model.dart';

class GrowthService {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  Future<List<GrowthModel>> getGrowthRecords(String childId) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.get(
        '/growth/child/$childId',
        token: token,
      );

      if (response.statusCode == 200) {
        // Parse response and return list of growth records
        return [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<GrowthModel?> createGrowthRecord(Map<String, dynamic> growthData) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.post(
        '/growth',
        body: growthData,
        token: token,
      );

      if (response.statusCode == 201) {
        // Parse response and return growth record
        return null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<bool> updateGrowthRecord(String growthId, Map<String, dynamic> growthData) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.put(
        '/growth/$growthId',
        body: growthData,
        token: token,
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteGrowthRecord(String growthId) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.delete(
        '/growth/$growthId',
        token: token,
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
