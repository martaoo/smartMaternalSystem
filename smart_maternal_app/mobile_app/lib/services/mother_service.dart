import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

/// Comprehensive service for mother-specific backend operations
/// This service consolidates all endpoints accessible by mothers
class MotherService {
  final AuthService _authService = AuthService();
  
  // Base URLs to try
  final List<String> baseUrls = [
    "http://10.0.2.2:3001/api",  // Standard Android emulator
    "http://localhost:3001/api",  // Fallback for physical device
  ];

  /// Get mother's pregnancy visit history
  Future<List<PregnancyVisit>> getPregnancyVisits() async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      http.Response? response;
      
      for (String baseUrl in baseUrls) {
        try {
          final url = "$baseUrl/pregnancy/me/visits";
          print('Trying pregnancy visits URL: $url');
          
          response = await http.get(
            Uri.parse(url),
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer $token",
            },
          ).timeout(Duration(seconds: 10));
          
          print('Connected to pregnancy visits: $url');
          print('Response status: ${response.statusCode}');
          break;
        } catch (e) {
          print('Failed to connect to $baseUrl: $e');
          continue;
        }
      }
      
      if (response == null) {
        throw Exception('Unable to connect to backend for pregnancy visits');
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        final List<dynamic> responseData = jsonDecode(response.body);
        return responseData.map((json) => _parsePregnancyVisit(json)).toList();
      } else {
        throw Exception('Failed to load pregnancy visits (${response.statusCode})');
      }
    } catch (e) {
      print('Error loading pregnancy visits: $e');
      rethrow;
    }
  }

  /// Get mother's profile information from backend
  Future<MotherProfile?> getMotherProfile() async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      http.Response? response;
      String? workingUrl;
      
      for (String baseUrl in baseUrls) {
        try {
          final url = "$baseUrl/mothers/me/profile";
          print('Trying mother profile URL: $url');
          
          response = await http.get(
            Uri.parse(url),
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer $token",
            },
          ).timeout(Duration(seconds: 10));
          
          workingUrl = url;
          print('Connected to mother profile: $url');
          print('Response status: ${response.statusCode}');
          break;
        } catch (e) {
          print('Failed to connect to $baseUrl: $e');
          continue;
        }
      }
      
      if (response == null) {
        print('Failed to connect to any mother profile backend URL');
        // Fallback to user info
        return await _getFallbackProfile();
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        if (responseData['data'] != null) {
          return _parseMotherProfile(responseData['data']);
        }
      }
      
      print('Failed to load mother profile: ${response.statusCode}');
      return await _getFallbackProfile();
    } catch (e) {
      print('Error loading mother profile: $e');
      return await _getFallbackProfile();
    }
  }

  /// Get dashboard summary with mother profile and latest pregnancy data
  Future<DashboardSummary?> getDashboardSummary() async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      http.Response? response;
      
      for (String baseUrl in baseUrls) {
        try {
          final url = "$baseUrl/mothers/me/summary";
          print('Trying dashboard summary URL: $url');
          
          response = await http.get(
            Uri.parse(url),
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer $token",
            },
          ).timeout(Duration(seconds: 10));
          
          print('Connected to dashboard summary: $url');
          print('Response status: ${response.statusCode}');
          break;
        } catch (e) {
          print('Failed to connect to $baseUrl: $e');
          continue;
        }
      }
      
      if (response == null) {
        throw Exception('Unable to connect to backend for dashboard summary');
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        if (responseData['data'] != null) {
          return _parseDashboardSummary(responseData['data']);
        }
        throw Exception('Dashboard summary response missing data');
      }
      
      throw Exception('Failed to load dashboard summary (${response.statusCode})');
    } catch (e) {
      print('Error loading dashboard summary: $e');
      rethrow;
    }
  }

  /// Fallback method to get basic profile from auth service
  Future<MotherProfile?> _getFallbackProfile() async {
    try {
      final userName = await _authService.getUserName();
      final userEmail = await _authService.getUserEmail();
      
      if (userName != null && userEmail != null) {
        return MotherProfile(
          name: userName,
          email: userEmail,
        );
      }
      
      return null;
    } catch (e) {
      print('Error in fallback profile: $e');
      return null;
    }
  }

  /// Get upcoming appointments from pregnancy visits
  Future<List<Appointment>> getUpcomingAppointments() async {
    final visits = await getPregnancyVisits();
    final now = DateTime.now();
    
    return visits
        .where((visit) => visit.nextVisitDate != null && visit.nextVisitDate!.isAfter(now))
        .map((visit) => _convertVisitToAppointment(visit, isUpcoming: true))
        .toList()
      ..sort((a, b) => a.dateTime.compareTo(b.dateTime));
  }

  /// Get past appointments from pregnancy visits
  Future<List<Appointment>> getPastAppointments() async {
    final visits = await getPregnancyVisits();
    final now = DateTime.now();
    
    return visits
        .where((visit) => visit.visitDate.isBefore(now))
        .map((visit) => _convertVisitToAppointment(visit, isUpcoming: false))
        .toList()
      ..sort((a, b) => b.dateTime.compareTo(a.dateTime));
  }

  /// Get all appointments (both upcoming and past)
  Future<List<Appointment>> getAllAppointments() async {
    final upcoming = await getUpcomingAppointments();
    final past = await getPastAppointments();
    
    return [...upcoming, ...past]..sort((a, b) => b.dateTime.compareTo(a.dateTime));
  }

  /// Get health metrics from latest pregnancy visit
  Future<HealthMetrics?> getLatestHealthMetrics() async {
    final visits = await getPregnancyVisits();
    if (visits.isEmpty) return null;
    
    // Get the most recent visit
    visits.sort((a, b) => b.visitDate.compareTo(a.visitDate));
    final latestVisit = visits.first;
    
    return HealthMetrics(
      systolicBP: latestVisit.systolicBP,
      diastolicBP: latestVisit.diastolicBP,
      weight: latestVisit.weight,
      fundalHeight: latestVisit.fundalHeight,
      fetalHeartRate: latestVisit.fetalHeartRate,
      week: latestVisit.week,
      gestationalAge: latestVisit.gestationalAge,
      riskLevel: latestVisit.riskLevel,
      lastVisitDate: latestVisit.visitDate,
      nextVisitDate: latestVisit.nextVisitDate,
    );
  }

  /// Get symptoms and medications from pregnancy visits
  Future<List<SymptomMedication>> getSymptomsAndMedications() async {
    final visits = await getPregnancyVisits();
    final List<SymptomMedication> items = [];
    
    for (final visit in visits) {
      // Add symptoms
      if (visit.symptoms != null) {
        for (final symptom in visit.symptoms!) {
          items.add(SymptomMedication(
            type: 'symptom',
            name: symptom,
            date: visit.visitDate,
            week: visit.week,
          ));
        }
      }
      
      // Add medications
      if (visit.medications != null) {
        for (final medication in visit.medications!) {
          items.add(SymptomMedication(
            type: 'medication',
            name: medication,
            date: visit.visitDate,
            week: visit.week,
          ));
        }
      }
    }
    
    return items..sort((a, b) => b.date.compareTo(a.date));
  }

  // Helper methods for data parsing and conversion
  
  MotherProfile _parseMotherProfile(Map<String, dynamic> json) {
    return MotherProfile(
      name: json['name'] ?? 'Unknown',
      email: json['email'] ?? '',
      phone: json['phone'],
      address: json['address'],
      bloodType: json['bloodType'],
      age: json['age'],
      expectedDeliveryDate: json['expectedDeliveryDate'] != null 
          ? DateTime.parse(json['expectedDeliveryDate']) 
          : null,
      gravida: json['gravida'],
      para: json['para'],
      lmp: json['lmp'] != null ? DateTime.parse(json['lmp']) : null,
      highRisk: json['highRisk'] ?? false,
      registrationDate: json['registrationDate'] != null 
          ? DateTime.parse(json['registrationDate']) 
          : null,
    );
  }

  DashboardSummary _parseDashboardSummary(Map<String, dynamic> json) {
    final motherData = json['mother'];
    final pregnancyData = json['latestPregnancy'];
    
    return DashboardSummary(
      motherProfile: motherData != null ? _parseMotherProfile(motherData) : null,
      latestPregnancy: pregnancyData != null ? _parsePregnancyVisit(pregnancyData) : null,
    );
  }


  PregnancyVisit _parsePregnancyVisit(Map<String, dynamic> json) {
    return PregnancyVisit(
      id: json['_id']?.toString() ?? '',
      week: json['week'] ?? json['gestationalAge'] ?? 0,
      gestationalAge: json['gestationalAge'] ?? 0,
      systolicBP: json['systolicBP'],
      diastolicBP: json['diastolicBP'],
      weight: json['weight'],
      fundalHeight: json['fundalHeight'],
      fetalHeartRate: json['fetalHeartRate'],
      presentation: json['presentation'],
      notes: json['notes'],
      riskLevel: _parseRiskLevel(json['riskLevel']),
      symptoms: json['symptoms'] != null ? List<String>.from(json['symptoms']) : null,
      medications: json['medications'] != null ? List<String>.from(json['medications']) : null,
      nextVisitDate: json['nextVisitDate'] != null ? DateTime.parse(json['nextVisitDate']) : null,
      healthWorkerId: json['healthWorkerId']?.toString(),
      hospitalId: json['hospitalId']?.toString(),
      visitDate: DateTime.parse(json['visitDate'] ?? DateTime.now().toIso8601String()),
      ultrasoundFindings: json['ultrasoundFindings'],
      labResults: json['labResults'] != null ? LabResults.fromJson(json['labResults']) : null,
      complications: json['complications'] != null ? List<String>.from(json['complications']) : null,
      recommendations: json['recommendations'],
      emergency: json['emergency'] ?? false,
      emergencyReason: json['emergencyReason'],
      bloodType: json['bloodType'],
    );
  }

  RiskLevel _parseRiskLevel(dynamic riskLevel) {
    if (riskLevel == null) return RiskLevel.low;
    switch (riskLevel.toString().toUpperCase()) {
      case 'HIGH':
        return RiskLevel.high;
      case 'MODERATE':
        return RiskLevel.moderate;
      case 'LOW':
      default:
        return RiskLevel.low;
    }
  }

  Appointment _convertVisitToAppointment(PregnancyVisit visit, {required bool isUpcoming}) {
    final appointmentDate = isUpcoming && visit.nextVisitDate != null 
        ? visit.nextVisitDate! 
        : visit.visitDate;
    
    return Appointment(
      id: visit.id,
      title: _generateAppointmentTitle(visit.week, isUpcoming),
      type: _determineAppointmentType(visit.week, visit),
      week: visit.week,
      dateTime: appointmentDate,
      facility: 'Health Center', // Would be populated from hospital data
      provider: 'Healthcare Provider', // Would be populated from health worker data
      status: isUpcoming ? 'upcoming' : 'completed',
      isHighRisk: visit.riskLevel == RiskLevel.high,
      notes: visit.notes ?? visit.recommendations,
    );
  }

  String _generateAppointmentTitle(int week, bool isUpcoming) {
    if (isUpcoming) {
      return 'ANC Visit - Week $week';
    } else {
      return 'ANC Visit - Week $week (Completed)';
    }
  }

  String _determineAppointmentType(int week, PregnancyVisit visit) {
    if (week <= 12) return 'First ANC';
    if (week <= 28) return 'ANC Follow-up';
    if (week <= 36) return 'ANC Visit';
    if (visit.ultrasoundFindings != null) return 'Ultrasound';
    return 'ANC Visit';
  }

}

// Data models for mother service
class PregnancyVisit {
  final String id;
  final int week;
  final int gestationalAge;
  final int? systolicBP;
  final int? diastolicBP;
  final double? weight;
  final double? fundalHeight;
  final int? fetalHeartRate;
  final String? presentation;
  final String? notes;
  final RiskLevel riskLevel;
  final List<String>? symptoms;
  final List<String>? medications;
  final DateTime? nextVisitDate;
  final String? healthWorkerId;
  final String? hospitalId;
  final DateTime visitDate;
  final String? ultrasoundFindings;
  final LabResults? labResults;
  final List<String>? complications;
  final String? recommendations;
  final bool emergency;
  final String? emergencyReason;
  final String? bloodType;

  PregnancyVisit({
    required this.id,
    required this.week,
    required this.gestationalAge,
    this.systolicBP,
    this.diastolicBP,
    this.weight,
    this.fundalHeight,
    this.fetalHeartRate,
    this.presentation,
    this.notes,
    required this.riskLevel,
    this.symptoms,
    this.medications,
    this.nextVisitDate,
    this.healthWorkerId,
    this.hospitalId,
    required this.visitDate,
    this.ultrasoundFindings,
    this.labResults,
    this.complications,
    this.recommendations,
    required this.emergency,
    this.emergencyReason,
    this.bloodType,
  });
}

enum RiskLevel { low, moderate, high }

class LabResults {
  final double? hemoglobin;
  final String? urineProtein;
  final double? bloodSugar;
  final String? hiv;
  final String? syphilis;

  LabResults({
    this.hemoglobin,
    this.urineProtein,
    this.bloodSugar,
    this.hiv,
    this.syphilis,
  });

  factory LabResults.fromJson(Map<String, dynamic> json) {
    return LabResults(
      hemoglobin: json['hemoglobin']?.toDouble(),
      urineProtein: json['urineProtein'],
      bloodSugar: json['bloodSugar']?.toDouble(),
      hiv: json['hiv'],
      syphilis: json['syphilis'],
    );
  }
}

class MotherProfile {
  final String name;
  final String email;
  final String? phone;
  final String? address;
  final DateTime? dateOfBirth;
  final String? bloodType;
  final int? age;
  final DateTime? expectedDeliveryDate;
  final int? gravida;
  final int? para;
  final DateTime? lmp;
  final bool highRisk;
  final DateTime? registrationDate;

  MotherProfile({
    required this.name,
    required this.email,
    this.phone,
    this.address,
    this.dateOfBirth,
    this.bloodType,
    this.age,
    this.expectedDeliveryDate,
    this.gravida,
    this.para,
    this.lmp,
    this.highRisk = false,
    this.registrationDate,
  });
}

class DashboardSummary {
  final MotherProfile? motherProfile;
  final PregnancyVisit? latestPregnancy;

  DashboardSummary({
    this.motherProfile,
    this.latestPregnancy,
  });
}

class Appointment {
  final String id;
  final String title;
  final String type;
  final int? week;
  final DateTime dateTime;
  final String facility;
  final String provider;
  final String status;
  final bool isHighRisk;
  final String? notes;

  Appointment({
    required this.id,
    required this.title,
    required this.type,
    this.week,
    required this.dateTime,
    required this.facility,
    required this.provider,
    required this.status,
    required this.isHighRisk,
    this.notes,
  });
}

class HealthMetrics {
  final int? systolicBP;
  final int? diastolicBP;
  final double? weight;
  final double? fundalHeight;
  final int? fetalHeartRate;
  final int week;
  final int gestationalAge;
  final RiskLevel riskLevel;
  final DateTime lastVisitDate;
  final DateTime? nextVisitDate;

  HealthMetrics({
    this.systolicBP,
    this.diastolicBP,
    this.weight,
    this.fundalHeight,
    this.fetalHeartRate,
    required this.week,
    required this.gestationalAge,
    required this.riskLevel,
    required this.lastVisitDate,
    this.nextVisitDate,
  });
}

class SymptomMedication {
  final String type; // 'symptom' or 'medication'
  final String name;
  final DateTime date;
  final int week;

  SymptomMedication({
    required this.type,
    required this.name,
    required this.date,
    required this.week,
  });
}
