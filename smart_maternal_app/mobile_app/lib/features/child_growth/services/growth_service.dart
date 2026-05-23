import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';
import '../../../core/services/storage_service.dart';
import '../../../models/growth_model.dart';

class GrowthService {
  final StorageService _storageService = StorageService();

  Future<Map<String, String>> _headers() async {
    final token = await _storageService.getToken();
    return {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
  }

  void _log(String msg) => print('[GrowthService] $msg');

  /// GET /children/:childId/growth-records
  /// Returns records sorted oldest → newest (for charting left-to-right).
  /// The last element in the returned list is therefore the most recent record.
  Future<List<GrowthModel>> getGrowthRecords(String childId) async {
    try {
      final res = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/children/$childId/growth-records'),
        headers: await _headers(),
      );
      _log('GET /children/$childId/growth-records → ${res.statusCode}');
      _log('body: ${res.body}');

      if (res.statusCode == 200) {
        final decoded = json.decode(res.body);

        // Handle both plain array and { data: [...] } wrapper
        List<dynamic> data;
        if (decoded is List) {
          data = decoded;
        } else if (decoded is Map && decoded['data'] is List) {
          data = decoded['data'] as List<dynamic>;
        } else {
          return [];
        }

        final records = data
            .map((j) => GrowthModel.fromJson(j as Map<String, dynamic>))
            .toList();

        // Sort oldest → newest so chart draws left-to-right
        // and records.last == most recent measurement
        records.sort((a, b) => a.measurementDate.compareTo(b.measurementDate));
        return records;
      }

      _log('Non-200 response: ${res.statusCode} — ${res.body}');
      return [];
    } catch (e) {
      _log('Error fetching growth records: $e');
      return [];
    }
  }

  /// GET /children/:childId/growth-records/latest
  /// Used as a fallback when the list endpoint returns empty.
  Future<GrowthModel?> getLatestGrowthRecord(String childId) async {
    try {
      final res = await http.get(
        Uri.parse(
            '${ApiConstants.baseUrl}/children/$childId/growth-records/latest'),
        headers: await _headers(),
      );
      _log('GET /children/$childId/growth-records/latest → ${res.statusCode}');
      _log('body: ${res.body}');

      if (res.statusCode == 200) {
        final decoded = json.decode(res.body);
        // Backend returns null when no records exist (HTTP 200 + null body)
        if (decoded == null) return null;
        if (decoded is Map<String, dynamic>) {
          return GrowthModel.fromJson(decoded);
        }
      }
      return null;
    } catch (e) {
      _log('Error fetching latest growth record: $e');
      return null;
    }
  }
}
