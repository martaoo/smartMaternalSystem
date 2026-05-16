import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../models/appointment_model.dart';

class AppointmentsService {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  Future<List<AppointmentModel>> getAppointments() async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.get(
        '/appointments',
        token: token,
      );

      if (response.statusCode == 200) {
        // Parse response and return list of appointments
        return [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<AppointmentModel?> createAppointment(Map<String, dynamic> appointmentData) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.post(
        '/appointments',
        body: appointmentData,
        token: token,
      );

      if (response.statusCode == 201) {
        // Parse response and return appointment
        return null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<bool> updateAppointment(String appointmentId, Map<String, dynamic> appointmentData) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.put(
        '/appointments/$appointmentId',
        body: appointmentData,
        token: token,
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteAppointment(String appointmentId) async {
    try {
      final token = await _storageService.getToken();
      final response = await _apiService.delete(
        '/appointments/$appointmentId',
        token: token,
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
