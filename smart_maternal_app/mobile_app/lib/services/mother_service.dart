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
      String? workingUrl;
      
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
          
          workingUrl = url;
          print('Connected to pregnancy visits: $url');
          print('Response status: ${response.statusCode}');
          break;
        } catch (e) {
          print('Failed to connect to $baseUrl: $e');
          continue;
        }
      }
      
      if (response == null) {
        print('Failed to connect to any pregnancy visits backend URL');
        return _getMockPregnancyVisits();
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        final List<dynamic> responseData = jsonDecode(response.body);
        return responseData.map((json) => _parsePregnancyVisit(json)).toList();
      } else {
        print('Failed to load pregnancy visits: ${response.statusCode}');
        return _getMockPregnancyVisits();
      }
    } catch (e) {
      print('Error loading pregnancy visits: $e');
      return _getMockPregnancyVisits();
    }
  }

  /// Get mother's profile information
  Future<MotherProfile?> getMotherProfile() async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      // Try to get user info first, then try to get linked mother profile
      final userName = await _authService.getUserName();
      final userEmail = await _authService.getUserEmail();
      
      if (userName != null && userEmail != null) {
        return MotherProfile(
          name: userName,
          email: userEmail,
          // Additional profile info would come from backend if available
        );
      }
      
      return null;
    } catch (e) {
      print('Error loading mother profile: $e');
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

  // Mock data for fallback when backend is not available
  List<PregnancyVisit> _getMockPregnancyVisits() {
    print('Using mock pregnancy visits data as fallback');
    final now = DateTime.now();
    return [
      PregnancyVisit(
        id: 'MOCK-001',
        week: 32,
        gestationalAge: 32,
        systolicBP: 120,
        diastolicBP: 80,
        weight: 65.5,
        fundalHeight: 30,
        fetalHeartRate: 140,
        presentation: 'Cephalic',
        notes: 'Routine checkup, monitor blood pressure',
        riskLevel: RiskLevel.low,
        symptoms: ['Mild swelling in feet'],
        medications: ['Iron supplements', 'Folic acid'],
        nextVisitDate: now.add(const Duration(days: 7)),
        healthWorkerId: 'doctor-001',
        hospitalId: 'hospital-001',
        visitDate: now.subtract(const Duration(days: 7)),
        ultrasoundFindings: 'Normal fetal development',
        labResults: LabResults(
          hemoglobin: 11.5,
          urineProtein: 'Negative',
          bloodSugar: 85,
          hiv: 'Negative',
          syphilis: 'Negative',
        ),
        complications: null,
        recommendations: 'Continue iron supplements, increase fluid intake',
        emergency: false,
        bloodType: 'O+',
      ),
      PregnancyVisit(
        id: 'MOCK-002',
        week: 28,
        gestationalAge: 28,
        systolicBP: 118,
        diastolicBP: 78,
        weight: 64.2,
        fundalHeight: 28,
        fetalHeartRate: 145,
        presentation: 'Cephalic',
        notes: 'Normal development, fetal heartbeat detected',
        riskLevel: RiskLevel.low,
        symptoms: null,
        medications: ['Iron supplements'],
        nextVisitDate: now.subtract(const Duration(days: 14)),
        healthWorkerId: 'doctor-001',
        hospitalId: 'hospital-001',
        visitDate: now.subtract(const Duration(days: 42)),
        ultrasoundFindings: 'Fetal position normal',
        labResults: LabResults(
          hemoglobin: 11.8,
          urineProtein: 'Negative',
          bloodSugar: 90,
          hiv: 'Negative',
          syphilis: 'Negative',
        ),
        complications: null,
        recommendations: 'Continue routine care',
        emergency: false,
        bloodType: 'O+',
      ),
      PregnancyVisit(
        id: 'MOCK-003',
        week: 20,
        gestationalAge: 20,
        systolicBP: 115,
        diastolicBP: 75,
        weight: 62.8,
        fundalHeight: 20,
        fetalHeartRate: 150,
        presentation: 'Cephalic',
        notes: 'Anemia detected, iron supplements prescribed',
        riskLevel: RiskLevel.moderate,
        symptoms: ['Fatigue', 'Dizziness'],
        medications: ['Iron supplements', 'Vitamin C'],
        nextVisitDate: now.subtract(const Duration(days: 84)),
        healthWorkerId: 'doctor-001',
        hospitalId: 'hospital-001',
        visitDate: now.subtract(const Duration(days: 140)),
        ultrasoundFindings: 'Normal anatomy scan',
        labResults: LabResults(
          hemoglobin: 10.2,
          urineProtein: 'Negative',
          bloodSugar: 88,
          hiv: 'Negative',
          syphilis: 'Negative',
        ),
        complications: ['Mild anemia'],
        recommendations: 'Increase iron-rich foods, take supplements as prescribed',
        emergency: false,
        bloodType: 'O+',
      ),
    ];
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

  MotherProfile({
    required this.name,
    required this.email,
    this.phone,
    this.address,
    this.dateOfBirth,
    this.bloodType,
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
