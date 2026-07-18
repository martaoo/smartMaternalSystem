import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import '../features/mother/models/mother_entities.dart';
import 'auth_service.dart';

class ChildProfileSummary {
  final String id;
  final String name;
  final DateTime? birthDate;
  final double? currentWeightKg;

  const ChildProfileSummary({
    required this.id,
    required this.name,
    required this.birthDate,
    required this.currentWeightKg,
  });
}

class TdDoseSchedule {
  final String doseKey;
  final String title;
  final DateTime? dateGiven;
  final DateTime? dueDate;
  final String status;

  const TdDoseSchedule({
    required this.doseKey,
    required this.title,
    required this.dateGiven,
    required this.dueDate,
    required this.status,
  });
}

class VaccinationService {
  VaccinationService({
    AuthService? authService,
    FlutterSecureStorage? storage,
  })  : _authService = authService ?? AuthService(),
        _storage = storage ?? const FlutterSecureStorage();

  final AuthService _authService;
  final FlutterSecureStorage _storage;

  static const Duration _timeout = Duration(seconds: 25);

  Future<String?> getChildId() async {
    const fromEnv = String.fromEnvironment('CHILD_ID', defaultValue: '');
    if (fromEnv.trim().isNotEmpty) return fromEnv.trim();
    final stored = await _storage.read(key: 'child_id');
    if (stored != null && stored.trim().isNotEmpty) return stored.trim();
    return null;
  }

  // Set child ID for vaccination tracking
  Future<void> setChildId(String childId) async {
    await _storage.write(key: 'child_id', value: childId.trim());
  }

  // Clear child ID
  Future<void> clearChildId() async {
    await _storage.delete(key: 'child_id');
  }

  Map<String, dynamic>? _asJsonObject(dynamic value) {
    if (value == null) return null;
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      return value.map((k, v) => MapEntry(k.toString(), v));
    }
    return null;
  }

  DateTime _parseDate(dynamic v) {
    if (v == null) return DateTime.now();
    if (v is String) return DateTime.tryParse(v) ?? DateTime.now();
    if (v is Map && v[r'$date'] != null) {
      final d = v[r'$date'];
      if (d is String) return DateTime.tryParse(d) ?? DateTime.now();
      if (d is int) return DateTime.fromMillisecondsSinceEpoch(d);
    }
    return DateTime.now();
  }

  double? _parseWeightKg(dynamic v) {
    if (v == null) return null;
    if (v is num) {
      // backend child.birthWeight is typically grams; convert if likely grams
      if (v > 100) return (v / 1000.0);
      return v.toDouble();
    }
    if (v is String) {
      final parsed = double.tryParse(v);
      if (parsed == null) return null;
      if (parsed > 100) return parsed / 1000.0;
      return parsed;
    }
    return null;
  }

  VaccinationRecord _fromBackendRecord(Map<String, dynamic> json) {
    final id = json['_id']?.toString() ?? json['id']?.toString() ?? '';
    final scheduled = _parseDate(json['scheduledDate']);
    final administered = json['administeredDate'] == null
        ? null
        : _parseDate(json['administeredDate']);
    final status = json['status']?.toString().toUpperCase();
    final completed = status == 'ADMINISTERED' || administered != null;

    final vaccine = _asJsonObject(json['vaccineId']);
    final vaccineName = vaccine?['name']?.toString() ??
        vaccine?['code']?.toString() ??
        'Vaccine';
    final ageLabel = vaccine?['recommendedAge']?.toString() ?? 'Scheduled';

    final note = (json['notes']?.toString().trim().isNotEmpty ?? false)
        ? json['notes']?.toString().trim()
        : null;

    return VaccinationRecord(
      id: id,
      vaccine: vaccineName,
      ageLabel: ageLabel,
      dueDate: scheduled,
      completed: completed,
      administeredDate: administered,
      note: note,
    );
  }

  Future<List<VaccinationRecord>> getChildVaccinationRecords() async {
    final childId = await getChildId();
    if (childId == null || childId.isEmpty) {
      throw Exception(
        'Missing child id for vaccination records.\n'
        'Run with: --dart-define=CHILD_ID=<MongoChildId>\n'
        'or write secure storage key "child_id".',
      );
    }

    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Not logged in.');
    }

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/vaccinations/records/child/$childId');
      try {
        final res = await http
            .get(
              uri,
              headers: {
                'Authorization': 'Bearer $token',
                'Accept': 'application/json',
              },
            )
            .timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          final decoded = jsonDecode(res.body);
          if (decoded is! List) {
            throw Exception('Expected a JSON array of vaccination records.');
          }
          ApiConfig.setSessionApiRoot(root);
          final out = <VaccinationRecord>[];
          for (final item in decoded) {
            final m = _asJsonObject(item);
            if (m != null) out.add(_fromBackendRecord(m));
          }
          return out;
        }

        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }

    throw Exception(
      'Could not load vaccination records. Tried: ${ApiConfig.apiRootCandidates.join(' · ')}. '
      'Last error: $lastError',
    );
  }

  Future<ChildProfileSummary> getChildProfile() async {
    final childId = await getChildId();
    if (childId == null || childId.isEmpty) {
      throw Exception(
        'Missing child id for child profile.\n'
        'Run with: --dart-define=CHILD_ID=<MongoChildId>\n'
        'or write secure storage key "child_id".',
      );
    }

    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Not logged in.');
    }

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/children/$childId');
      try {
        final res = await http
            .get(
              uri,
              headers: {
                'Authorization': 'Bearer $token',
                'Accept': 'application/json',
              },
            )
            .timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          final decoded = jsonDecode(res.body);
          final m = _asJsonObject(decoded);
          if (m == null) {
            throw Exception('Expected a JSON object for child profile.');
          }
          ApiConfig.setSessionApiRoot(root);
          return ChildProfileSummary(
            id: m['_id']?.toString() ?? m['id']?.toString() ?? childId,
            name: m['name']?.toString() ?? 'Baby',
            birthDate: m['birthDate'] == null ? null : _parseDate(m['birthDate']),
            currentWeightKg: _parseWeightKg(m['birthWeight']),
          );
        }

        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }

    throw Exception(
      'Could not load child profile. Tried: ${ApiConfig.apiRootCandidates.join(' · ')}. '
      'Last error: $lastError',
    );
  }

  // Generate vaccination schedule for a child
  Future<List<VaccinationRecord>> generateVaccinationSchedule(String childId) async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Not logged in.');
    }

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/vaccinations/schedule/$childId');
      try {
        final res = await http
            .post(
              uri,
              headers: {
                'Authorization': 'Bearer $token',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            )
            .timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          final decoded = jsonDecode(res.body);
          if (decoded is! List) {
            throw Exception('Expected a JSON array of vaccination records.');
          }
          ApiConfig.setSessionApiRoot(root);
          final out = <VaccinationRecord>[];
          for (final item in decoded) {
            final m = _asJsonObject(item);
            if (m != null) out.add(_fromBackendRecord(m));
          }
          return out;
        }

        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }

    throw Exception(
      'Could not generate vaccination schedule. Tried: ${ApiConfig.apiRootCandidates.join(' · ')}. '
      'Last error: $lastError',
    );
  }

  // Get upcoming vaccinations
  Future<List<VaccinationRecord>> getUpcomingVaccinations({int days = 30}) async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Not logged in.');
    }

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/vaccinations/records/upcoming?days=$days');
      try {
        final res = await http
            .get(
              uri,
              headers: {
                'Authorization': 'Bearer $token',
                'Accept': 'application/json',
              },
            )
            .timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          final decoded = jsonDecode(res.body);
          if (decoded is! List) {
            throw Exception('Expected a JSON array of vaccination records.');
          }
          ApiConfig.setSessionApiRoot(root);
          final out = <VaccinationRecord>[];
          for (final item in decoded) {
            final m = _asJsonObject(item);
            if (m != null) out.add(_fromBackendRecord(m));
          }
          return out;
        }

        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }

    throw Exception(
      'Could not load upcoming vaccinations. Tried: ${ApiConfig.apiRootCandidates.join(' · ')}. '
      'Last error: $lastError',
    );
  }

  // Get overdue vaccinations
  Future<List<VaccinationRecord>> getOverdueVaccinations() async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Not logged in.');
    }

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/vaccinations/records/overdue');
      try {
        final res = await http
            .get(
              uri,
              headers: {
                'Authorization': 'Bearer $token',
                'Accept': 'application/json',
              },
            )
            .timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          final decoded = jsonDecode(res.body);
          if (decoded is! List) {
            throw Exception('Expected a JSON array of vaccination records.');
          }
          ApiConfig.setSessionApiRoot(root);
          final out = <VaccinationRecord>[];
          for (final item in decoded) {
            final m = _asJsonObject(item);
            if (m != null) out.add(_fromBackendRecord(m));
          }
          return out;
        }

        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }

    throw Exception(
      'Could not load overdue vaccinations. Tried: ${ApiConfig.apiRootCandidates.join(' · ')}. '
      'Last error: $lastError',
    );
  }

  // Mark vaccination as administered
  Future<VaccinationRecord> markVaccinationAdministered(String recordId, {Map<String, dynamic>? administrationData}) async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Not logged in.');
    }

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/vaccinations/records/$recordId/administer');
      try {
        final res = await http
            .patch(
              uri,
              headers: {
                'Authorization': 'Bearer $token',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: jsonEncode(administrationData ?? {}),
            )
            .timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          final decoded = jsonDecode(res.body);
          final m = _asJsonObject(decoded);
          if (m != null) {
            ApiConfig.setSessionApiRoot(root);
            return _fromBackendRecord(m);
          }
          throw Exception('Invalid vaccination record response.');
        }

        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }

    throw Exception(
      'Could not mark vaccination as administered. Tried: ${ApiConfig.apiRootCandidates.join(' · ')}. '
      'Last error: $lastError',
    );
  }

  // Mark vaccination as missed
  Future<VaccinationRecord> markVaccinationMissed(String recordId, String missReason) async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Not logged in.');
    }

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/vaccinations/records/$recordId/miss');
      try {
        final res = await http
            .patch(
              uri,
              headers: {
                'Authorization': 'Bearer $token',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: jsonEncode({'missReason': missReason}),
            )
            .timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          final decoded = jsonDecode(res.body);
          final m = _asJsonObject(decoded);
          if (m != null) {
            ApiConfig.setSessionApiRoot(root);
            return _fromBackendRecord(m);
          }
          throw Exception('Invalid vaccination record response.');
        }

        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }

    throw Exception(
      'Could not mark vaccination as missed. Tried: ${ApiConfig.apiRootCandidates.join(' · ')}. '
      'Last error: $lastError',
    );
  }

  // Defer vaccination
  Future<VaccinationRecord> deferVaccination(String recordId, String deferReason, DateTime newScheduledDate) async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Not logged in.');
    }

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/vaccinations/records/$recordId/defer');
      try {
        final res = await http
            .patch(
              uri,
              headers: {
                'Authorization': 'Bearer $token',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: jsonEncode({
                'deferReason': deferReason,
                'newScheduledDate': newScheduledDate.toIso8601String(),
              }),
            )
            .timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          final decoded = jsonDecode(res.body);
          final m = _asJsonObject(decoded);
          if (m != null) {
            ApiConfig.setSessionApiRoot(root);
            return _fromBackendRecord(m);
          }
          throw Exception('Invalid vaccination record response.');
        }

        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }

    throw Exception(
      'Could not defer vaccination. Tried: ${ApiConfig.apiRootCandidates.join(' · ')}. '
      'Last error: $lastError',
    );
  }

  // Get vaccination statistics
  Future<Map<String, dynamic>> getVaccinationStats() async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Not logged in.');
    }

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/vaccinations/stats');
      try {
        final res = await http
            .get(
              uri,
              headers: {
                'Authorization': 'Bearer $token',
                'Accept': 'application/json',
              },
            )
            .timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          final decoded = jsonDecode(res.body);
          if (decoded is Map<String, dynamic>) {
            ApiConfig.setSessionApiRoot(root);
            return decoded;
          }
          throw Exception('Expected a JSON object for vaccination statistics.');
        }

        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }

    throw Exception(
      'Could not load vaccination statistics. Tried: ${ApiConfig.apiRootCandidates.join(' · ')}. '
      'Last error: $lastError',
    );
  }

  Future<List<TdDoseSchedule>> getMyTdSchedule() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not logged in.');

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/mothers/me/td-schedule');
      try {
        final res = await http.get(
          uri,
          headers: {
            'Authorization': 'Bearer $token',
            'Accept': 'application/json',
          },
        ).timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          final decoded = jsonDecode(res.body);
          final wrapper = _asJsonObject(decoded) ?? <String, dynamic>{};
          final data = _asJsonObject(wrapper['data']) ?? wrapper;
          final doses = data['doses'];
          if (doses is! List) return const [];
          ApiConfig.setSessionApiRoot(root);
          return doses.map((e) {
            final m = _asJsonObject(e) ?? <String, dynamic>{};
            return TdDoseSchedule(
              doseKey: m['doseKey']?.toString() ?? '',
              title: m['title']?.toString() ?? '',
              dateGiven: m['dateGiven'] == null ? null : _parseDate(m['dateGiven']),
              dueDate: m['dueDate'] == null ? null : _parseDate(m['dueDate']),
              status: m['status']?.toString() ?? 'PENDING',
            );
          }).toList();
        }

        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }
    throw Exception('Could not load TD schedule. Last error: $lastError');
  }

  Future<void> setMyTdDoseDate({
    required String doseKey,
    required DateTime dateGiven,
  }) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not logged in.');

    Object? lastError;
    for (final root in ApiConfig.apiRootCandidates) {
      final uri = Uri.parse('$root/mothers/me/td-schedule');
      try {
        final res = await http.patch(
          uri,
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({
            'doseKey': doseKey,
            'dateGiven': dateGiven.toIso8601String(),
          }),
        ).timeout(_timeout);

        if (res.statusCode == 200 || res.statusCode == 201) {
          ApiConfig.setSessionApiRoot(root);
          return;
        }
        lastError =
            'HTTP ${res.statusCode}: ${res.body.length > 200 ? '${res.body.substring(0, 200)}…' : res.body}';
      } catch (e) {
        lastError = e;
      }
    }
    throw Exception('Could not update TD dose. Last error: $lastError');
  }
}
