import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';
import '../../../core/services/storage_service.dart';

class ChildService {
  final StorageService _storageService = StorageService();

  Future<Map<String, String>> _headers() async {
    final token = await _storageService.getToken();
    return {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
  }

  /// Fetch children for the logged-in mother.
  ///
  /// Strategy:
  ///   1. Try GET /children/my-children  (MOTHER role endpoint)
  ///   2. If that returns empty or fails, fall back to
  ///      GET /children/mother/:motherId using the motherId stored in
  ///      the profile's pregnancyInfo (passed in as [fallbackMotherId]).
  ///
  /// The backend /children/my-children calls findAll('MOTHER', undefined, user._id)
  /// which calls findByUserId(user._id) to resolve the mother record.
  Future<List<dynamic>> getMyChildren({String? fallbackMotherId}) async {
    final headers = await _headers();

    // ── Primary: /children/my-children ──────────────────────────────────────
    try {
      final res = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/children/my-children'),
        headers: headers,
      );
      debugLog('GET /children/my-children → ${res.statusCode}');
      debugLog('body: ${res.body}');

      if (res.statusCode == 200) {
        final decoded = json.decode(res.body);
        final list = _toList(decoded);
        if (list.isNotEmpty) return list;
      }
    } catch (e) {
      debugLog('my-children error: $e');
    }

    // ── Fallback: /children/mother/:motherId ─────────────────────────────────
    if (fallbackMotherId != null && fallbackMotherId.isNotEmpty) {
      try {
        final res = await http.get(
          Uri.parse('${ApiConstants.baseUrl}/children/mother/$fallbackMotherId'),
          headers: headers,
        );
        debugLog('GET /children/mother/$fallbackMotherId → ${res.statusCode}');
        debugLog('body: ${res.body}');

        if (res.statusCode == 200) {
          return _toList(json.decode(res.body));
        }
      } catch (e) {
        debugLog('mother/:id error: $e');
      }
    }

    return [];
  }

  List<dynamic> _toList(dynamic decoded) {
    if (decoded is List) return decoded;
    if (decoded is Map && decoded['data'] is List) return decoded['data'] as List;
    return [];
  }

  void debugLog(String msg) => print('[ChildService] $msg');
}
