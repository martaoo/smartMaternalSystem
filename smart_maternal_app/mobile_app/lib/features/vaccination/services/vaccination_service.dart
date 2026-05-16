import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../models/vaccination_model.dart';

class VaccinationService {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  Future<List<VaccinationModel>> getVaccinations(String childId) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.get(
        '/vaccinations/child/$childId',
        token: token,
      );

      if (response.statusCode == 200) {
        // Parse response and return list of vaccinations
        return [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<VaccinationModel?> createVaccination(Map<String, dynamic> vaccinationData) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.post(
        '/vaccinations',
        body: vaccinationData,
        token: token,
      );

      if (response.statusCode == 201) {
        // Parse response and return vaccination
        return null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<bool> updateVaccination(String vaccinationId, Map<String, dynamic> vaccinationData) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.put(
        '/vaccinations/$vaccinationId',
        body: vaccinationData,
        token: token,
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteVaccination(String vaccinationId) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.delete(
        '/vaccinations/$vaccinationId',
        token: token,
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
