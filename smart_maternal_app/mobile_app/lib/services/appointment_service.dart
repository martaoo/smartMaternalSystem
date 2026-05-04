import 'dart:convert';
import 'package:http/http.dart' as http;
import '../features/mother/models/mother_entities.dart';
import 'auth_service.dart';

class AppointmentService {
  final AuthService _authService = AuthService();
  
  // Base URLs to try
  final List<String> baseUrls = [
    "http://10.0.2.2:3001/api/appointments",  // Standard Android emulator
    "http://localhost:3001/api/appointments",  // Fallback for physical device
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
    return MotherAppointment(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      type: json['type'] ?? 'Consultation',
      week: json['week'],
      dateTime: DateTime.parse(json['dateTime'] ?? json['date'] ?? DateTime.now().toIso8601String()),
      facility: json['facility'] ?? 'Health Center',
      provider: json['provider'] ?? 'Healthcare Provider',
      status: json['status'] ?? 'upcoming',
      isHighRisk: json['isHighRisk'] ?? false,
      notes: json['notes'],
    );
  }

  // Fallback mock data if backend is not available
  List<MotherAppointment> _getMockAppointments() {
    print('Using mock appointments data as fallback');
    return [
      MotherAppointment(
        id: 'APT-001',
        title: 'ANC Visit - Week 28',
        dateTime: DateTime.now().add(const Duration(days: 3)),
        status: 'upcoming',
        type: 'ANC',
        facility: 'Adama Health Center',
        provider: 'Dr. Tigist Bekele',
        notes: 'Bring your ANC card',
        isHighRisk: false,
      ),
      MotherAppointment(
        id: 'APT-002',
        title: 'Ultrasound Scan',
        dateTime: DateTime.now().add(const Duration(days: 10)),
        status: 'upcoming',
        type: 'Ultrasound',
        facility: 'Adama Hospital',
        provider: 'Dr. Yonas Desta',
        notes: 'Full bladder required',
        isHighRisk: false,
      ),
      MotherAppointment(
        id: 'APT-003',
        title: 'Blood Test',
        dateTime: DateTime.now().add(const Duration(days: 5)),
        status: 'upcoming',
        type: 'Lab',
        facility: 'Adama Health Center Lab',
        provider: 'Lab Technician',
        notes: 'Fasting required',
        isHighRisk: false,
      ),
      MotherAppointment(
        id: 'APT-004',
        title: 'First ANC Registration',
        dateTime: DateTime.now().subtract(const Duration(days: 45)),
        status: 'completed',
        type: 'ANC',
        facility: 'Adama Health Center',
        provider: 'Dr. Tigist Bekele',
        notes: 'Initial registration completed',
        isHighRisk: false,
      ),
      MotherAppointment(
        id: 'APT-005',
        title: 'ANC Visit - Week 20',
        dateTime: DateTime.now().subtract(const Duration(days: 20)),
        status: 'completed',
        type: 'ANC',
        facility: 'Adama Health Center',
        provider: 'Dr. Tigist Bekele',
        notes: 'Normal development',
        isHighRisk: false,
      ),
    ];
  }
}
