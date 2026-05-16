import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';
import '../../../core/services/storage_service.dart';
import '../models/schedule_model.dart';

class AppointmentService {
  final StorageService _storageService = StorageService();

  Future<ScheduleData?> getMySchedule() async {
    try {
      final token = await _storageService.getToken();
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/pregnancy/my-schedule'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return ScheduleData.fromJson(data);
      }
      return null;
    } catch (e) {
      print('Error fetching schedule: $e');
      return null;
    }
  }

  Future<List<dynamic>> getChildVaccinations(String childId) async {
    try {
      final token = await _storageService.getToken();
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/vaccinations/records/child/$childId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return [];
    } catch (e) {
      print('Error fetching child vaccinations: $e');
      return [];
    }
  }
}
