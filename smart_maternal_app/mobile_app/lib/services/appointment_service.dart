import 'dart:convert';
import 'package:http/http.dart' as http;
import '../features/mother/models/mother_entities.dart';
import 'auth_service.dart';

class AppointmentService {
  final AuthService _authService = AuthService();
  
  // Base URLs to try - using pregnancy endpoints instead
  final List<String> baseUrls = [
    "http://10.0.2.2:3001/api/pregnancy/me/visits",  // Standard Android emulator
    "http://localhost:3001/api/pregnancy/me/visits",  // Fallback for physical device
  ];

  Future<List<MotherAppointment>> getAppointments() async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      http.Response? response;
      String? workingUrl;
      
      for (String url in baseUrls) {
        try {
          print('Trying appointments URL: $url');
          response = await http.get(
            Uri.parse(url),
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer $token",
            },
          ).timeout(Duration(seconds: 10));
          
          workingUrl = url;
          print('Connected to appointments: $url');
          print('Response status: ${response.statusCode}');
          print('Response body: ${response.body}');
          break;
        } catch (e) {
          print('Failed to connect to $url: $e');
          continue;
        }
      }
      
      if (response == null) {
        print('Failed to connect to any appointments backend URL');
        return _getMockAppointments(); // Fallback to mock data
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        final List<dynamic> responseData = jsonDecode(response.body);
        return responseData.map((json) => _parseAppointment(json)).toList();
      } else {
        print('Failed to load appointments: ${response.statusCode}');
        return _getMockAppointments(); // Fallback to mock data
      }
    } catch (e) {
      print('Error loading appointments: $e');
      return _getMockAppointments(); // Fallback to mock data
    }
  }

  Future<List<MotherAppointment>> getUpcomingAppointments() async {
    final allAppointments = await getAppointments();
    return allAppointments
        .where((a) => a.status == 'upcoming')
        .toList()
      ..sort((a, b) => a.dateTime.compareTo(b.dateTime));
  }

  Future<List<MotherAppointment>> getPastAppointments() async {
    final allAppointments = await getAppointments();
    return allAppointments
        .where((a) => a.status == 'completed' || a.status == 'missed')
        .toList()
      ..sort((a, b) => b.dateTime.compareTo(a.dateTime));
  }

  Future<MotherAppointment?> bookAppointment({
    required String title,
    required String type,
    int? week,
    required DateTime dateTime,
    required String facility,
    required String provider,
    String? notes,
  }) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final appointmentData = {
        'title': title,
        'type': type,
        'week': week,
        'dateTime': dateTime.toIso8601String(),
        'facility': facility,
        'provider': provider,
        'notes': notes,
        'status': 'upcoming',
        'isHighRisk': false,
      };

      http.Response? response;
      
      for (String url in baseUrls) {
        try {
          print('Trying to book appointment at: $url');
          response = await http.post(
            Uri.parse(url),
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer $token",
            },
            body: jsonEncode(appointmentData),
          ).timeout(Duration(seconds: 10));
          
          if (response.statusCode == 201 || response.statusCode == 200) {
            print('Appointment booked successfully at: $url');
            final responseData = jsonDecode(response.body);
            return _parseAppointment(responseData);
          }
        } catch (e) {
          print('Failed to book appointment at $url: $e');
          continue;
        }
      }
      
      throw Exception('Failed to book appointment');
    } catch (e) {
      print('Error booking appointment: $e');
      throw e;
    }
  }

  Future<MotherAppointment?> rescheduleAppointment(String id, DateTime newDateTime) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final updateData = {
        'dateTime': newDateTime.toIso8601String(),
        'status': 'rescheduled',
      };

      http.Response? response;
      
      for (String url in baseUrls) {
        try {
          print('Trying to reschedule appointment at: $url/$id');
          response = await http.patch(
            Uri.parse("$url/$id"),
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer $token",
            },
            body: jsonEncode(updateData),
          ).timeout(Duration(seconds: 10));
          
          if (response.statusCode == 200) {
            print('Appointment rescheduled successfully at: $url');
            final responseData = jsonDecode(response.body);
            return _parseAppointment(responseData);
          }
        } catch (e) {
          print('Failed to reschedule appointment at $url: $e');
          continue;
        }
      }
      
      throw Exception('Failed to reschedule appointment');
    } catch (e) {
      print('Error rescheduling appointment: $e');
      throw e;
    }
  }

  Future<bool> cancelAppointment(String id) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      http.Response? response;
      
      for (String url in baseUrls) {
        try {
          print('Trying to cancel appointment at: $url/$id');
          response = await http.patch(
            Uri.parse("$url/$id"),
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer $token",
            },
            body: jsonEncode({'status': 'cancelled'}),
          ).timeout(Duration(seconds: 10));
          
          if (response.statusCode == 200) {
            print('Appointment cancelled successfully at: $url');
            return true;
          }
        } catch (e) {
          print('Failed to cancel appointment at $url: $e');
          continue;
        }
      }
      
      return false;
    } catch (e) {
      print('Error cancelling appointment: $e');
      return false;
    }
  }

  MotherAppointment _parseAppointment(Map<String, dynamic> json) {
    // Parse pregnancy visit data as appointment
    final visitDate = json['visitDate'] != null ? DateTime.parse(json['visitDate']) : DateTime.now();
    final nextVisitDate = json['nextVisitDate'] != null ? DateTime.parse(json['nextVisitDate']) : null;
    final week = json['week'] ?? json['gestationalAge'] ?? 0;
    final riskLevel = json['riskLevel'] ?? 'LOW';
    final isHighRisk = riskLevel == 'HIGH';
    
    // Determine if this is a past visit or upcoming visit
    final isPastVisit = nextVisitDate == null || nextVisitDate.isBefore(DateTime.now());
    final appointmentDate = isPastVisit ? visitDate : nextVisitDate!;
    
    return MotherAppointment(
      id: json['_id']?.toString() ?? '',
      title: _generateAppointmentTitle(week, isPastVisit),
      type: _determineAppointmentType(week, json),
      week: week,
      dateTime: appointmentDate,
      facility: 'Health Center', // Will be populated from hospital data
      provider: 'Healthcare Provider', // Will be populated from health worker data
      status: _determineStatus(appointmentDate, isPastVisit),
      isHighRisk: isHighRisk,
      notes: json['notes'] ?? json['recommendations'],
    );
  }

  String _generateAppointmentTitle(int week, bool isPastVisit) {
    if (isPastVisit) {
      return 'ANC Visit - Week $week (Completed)';
    } else {
      return 'ANC Visit - Week $week';
    }
  }

  String _determineAppointmentType(int week, Map<String, dynamic> json) {
    // Determine appointment type based on week and data
    if (week <= 12) return 'First ANC';
    if (week <= 28) return 'ANC Follow-up';
    if (week <= 36) return 'ANC Visit';
    if (json['ultrasoundFindings'] != null) return 'Ultrasound';
    return 'ANC Visit';
  }

  String _determineStatus(DateTime appointmentDate, bool isPastVisit) {
    if (isPastVisit) return 'completed';
    if (appointmentDate.isBefore(DateTime.now())) return 'missed';
    return 'upcoming';
  }

  // Fallback mock data if backend is not available
  List<MotherAppointment> _getMockAppointments() {
    print('Using mock pregnancy-based appointments data as fallback');
    final now = DateTime.now();
    return [
      // Upcoming visits
      MotherAppointment(
        id: 'PREG-001',
        title: 'ANC Visit - Week 32',
        week: 32,
        dateTime: now.add(const Duration(days: 7)),
        status: 'upcoming',
        type: 'ANC Follow-up',
        facility: 'Adama Health Center',
        provider: 'Dr. Tigist Bekele',
        notes: 'Routine checkup, monitor blood pressure',
        isHighRisk: false,
      ),
      MotherAppointment(
        id: 'PREG-002',
        title: 'ANC Visit - Week 36',
        week: 36,
        dateTime: now.add(const Duration(days: 21)),
        status: 'upcoming',
        type: 'ANC Visit',
        facility: 'Adama Health Center',
        provider: 'Dr. Tigist Bekele',
        notes: 'Final ANC visit before delivery',
        isHighRisk: false,
      ),
      // Past visits
      MotherAppointment(
        id: 'PREG-003',
        title: 'ANC Visit - Week 12 (Completed)',
        week: 12,
        dateTime: now.subtract(const Duration(days: 140)),
        status: 'completed',
        type: 'First ANC',
        facility: 'Adama Health Center',
        provider: 'Dr. Tigist Bekele',
        notes: 'Initial registration, blood tests, ultrasound',
        isHighRisk: false,
      ),
      MotherAppointment(
        id: 'PREG-004',
        title: 'ANC Visit - Week 20 (Completed)',
        week: 20,
        dateTime: now.subtract(const Duration(days: 84)),
        status: 'completed',
        type: 'ANC Follow-up',
        facility: 'Adama Health Center',
        provider: 'Dr. Tigist Bekele',
        notes: 'Normal development, fetal heartbeat detected',
        isHighRisk: false,
      ),
      MotherAppointment(
        id: 'PREG-005',
        title: 'ANC Visit - Week 28 (Completed)',
        week: 28,
        dateTime: now.subtract(const Duration(days: 42)),
        status: 'completed',
        type: 'ANC Visit',
        facility: 'Adama Health Center',
        provider: 'Dr. Tigist Bekele',
        notes: 'Anemia detected, iron supplements prescribed',
        isHighRisk: false,
      ),
    ];
  }
}
