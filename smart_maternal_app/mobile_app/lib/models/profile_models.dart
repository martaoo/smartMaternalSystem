import 'package:flutter/material.dart';

class HealthFacility {
  String facilityName;
  String serialNumber;
  String cardNumber;
  String region;
  String zone;
  String wereda;
  String houseNumber;
  String phoneNumber;

  HealthFacility({
    required this.facilityName,
    required this.serialNumber,
    required this.cardNumber,
    required this.region,
    required this.zone,
    required this.wereda,
    required this.houseNumber,
    required this.phoneNumber,
  });

  factory HealthFacility.fromJson(Map<String, dynamic> json) {
    return HealthFacility(
      facilityName: json['facilityName'] ?? '',
      serialNumber: json['serialNumber'] ?? '',
      cardNumber: json['cardNumber'] ?? '',
      region: json['region'] ?? '',
      zone: json['zone'] ?? '',
      wereda: json['wereda'] ?? '',
      houseNumber: json['houseNumber'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'facilityName': facilityName,
      'serialNumber': serialNumber,
      'cardNumber': cardNumber,
      'region': region,
      'zone': zone,
      'wereda': wereda,
      'houseNumber': houseNumber,
      'phoneNumber': phoneNumber,
    };
  }

  HealthFacility copyWith({
    String? facilityName,
    String? serialNumber,
    String? cardNumber,
    String? region,
    String? zone,
    String? wereda,
    String? houseNumber,
    String? phoneNumber,
  }) {
    return HealthFacility(
      facilityName: facilityName ?? this.facilityName,
      serialNumber: serialNumber ?? this.serialNumber,
      cardNumber: cardNumber ?? this.cardNumber,
      region: region ?? this.region,
      zone: zone ?? this.zone,
      wereda: wereda ?? this.wereda,
      houseNumber: houseNumber ?? this.houseNumber,
      phoneNumber: phoneNumber ?? this.phoneNumber,
    );
  }
}

class InfantProfile {
  String name;
  DateTime dateOfBirth;
  String sex; // 'Male' or 'Female'
  double birthWeight; // in kg
  double birthHeight; // in cm
  int birthHour; // 0-23
  String fatherName;
  String? imagePath; // optional profile image

  InfantProfile({
    required this.name,
    required this.dateOfBirth,
    required this.sex,
    required this.birthWeight,
    required this.birthHeight,
    required this.birthHour,
    required this.fatherName,
    this.imagePath,
  });

  factory InfantProfile.fromJson(Map<String, dynamic> json) {
    return InfantProfile(
      name: json['name'] ?? '',
      dateOfBirth: DateTime.parse(json['dateOfBirth'] ?? DateTime.now().toIso8601String()),
      sex: json['sex'] ?? '',
      birthWeight: (json['birthWeight'] ?? 0.0).toDouble(),
      birthHeight: (json['birthHeight'] ?? 0.0).toDouble(),
      birthHour: json['birthHour'] ?? 0,
      fatherName: json['fatherName'] ?? '',
      imagePath: json['imagePath'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'dateOfBirth': dateOfBirth.toIso8601String(),
      'sex': sex,
      'birthWeight': birthWeight,
      'birthHeight': birthHeight,
      'birthHour': birthHour,
      'fatherName': fatherName,
      'imagePath': imagePath,
    };
  }

  InfantProfile copyWith({
    String? name,
    DateTime? dateOfBirth,
    String? sex,
    double? birthWeight,
    double? birthHeight,
    int? birthHour,
    String? fatherName,
    String? imagePath,
  }) {
    return InfantProfile(
      name: name ?? this.name,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      sex: sex ?? this.sex,
      birthWeight: birthWeight ?? this.birthWeight,
      birthHeight: birthHeight ?? this.birthHeight,
      birthHour: birthHour ?? this.birthHour,
      fatherName: fatherName ?? this.fatherName,
      imagePath: imagePath ?? this.imagePath,
    );
  }

  // Calculate age in years, months, and days
  String get formattedAge {
    DateTime now = DateTime.now();
    int years = now.year - dateOfBirth.year;
    int months = now.month - dateOfBirth.month;
    int days = now.day - dateOfBirth.day;

    if (days < 0) {
      months--;
      days += DateTime(now.year, now.month, 0).day;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    List<String> parts = [];
    if (years > 0) parts.add('$years year${years > 1 ? 's' : ''}');
    if (months > 0) parts.add('$months month${months > 1 ? 's' : ''}');
    if (days > 0 || parts.isEmpty) parts.add('$days day${days > 1 ? 's' : ''}');

    return parts.join(' ');
  }

  // Get age in months for calculations
  int get ageInMonths {
    DateTime now = DateTime.now();
    int months = (now.year - dateOfBirth.year) * 12 + (now.month - dateOfBirth.month);
    if (now.day < dateOfBirth.day) {
      months--;
    }
    return months;
  }

  // Get sex icon
  IconData get sexIcon => sex.toLowerCase() == 'male' ? Icons.male : Icons.female;
  
  // Get sex color
  Color get sexColor => sex.toLowerCase() == 'male' ? Colors.blue : Colors.pink;
}

class MotherProfile {
  final String name;
  final DateTime birthDate;
  final String phoneNumber;
  final HealthFacility healthFacility;
  final List<InfantProfile> infants;
  final String? imagePath; // optional profile image
  final int pregnancyWeek;
  final String trimester;
  final String riskLevel;
  final String nextVisit;

  const MotherProfile({
    required this.name,
    required this.birthDate,
    required this.phoneNumber,
    required this.healthFacility,
    required this.infants,
    this.imagePath,
    this.pregnancyWeek = 28,
    this.trimester = 'Third Trimester',
    this.riskLevel = 'Low',
    this.nextVisit = 'May 12, 2026',
  });

  factory MotherProfile.fromJson(Map<String, dynamic> json) {
    return MotherProfile(
      name: json['name'] ?? '',
      birthDate: DateTime.parse(json['birthDate'] ?? DateTime.now().toIso8601String()),
      phoneNumber: json['phoneNumber'] ?? '',
      healthFacility: HealthFacility.fromJson(json['healthFacility'] ?? {}),
      infants: (json['infants'] as List<dynamic>?)
          ?.map((infant) => InfantProfile.fromJson(infant))
          .toList() ?? [],
      imagePath: json['imagePath'],
      pregnancyWeek: json['pregnancyWeek'] ?? 28,
      trimester: json['trimester'] ?? 'Third Trimester',
      riskLevel: json['riskLevel'] ?? 'Low',
      nextVisit: json['nextVisit'] ?? 'May 12, 2026',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'birthDate': birthDate.toIso8601String(),
      'phoneNumber': phoneNumber,
      'healthFacility': healthFacility.toJson(),
      'infants': infants.map((infant) => infant.toJson()).toList(),
      'imagePath': imagePath,
      'pregnancyWeek': pregnancyWeek,
      'trimester': trimester,
      'riskLevel': riskLevel,
      'nextVisit': nextVisit,
    };
  }

  MotherProfile copyWith({
    String? name,
    DateTime? birthDate,
    String? phoneNumber,
    HealthFacility? healthFacility,
    List<InfantProfile>? infants,
    String? imagePath,
    int? pregnancyWeek,
    String? trimester,
    String? riskLevel,
    String? nextVisit,
  }) {
    return MotherProfile(
      name: name ?? this.name,
      birthDate: birthDate ?? this.birthDate,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      healthFacility: healthFacility ?? this.healthFacility,
      infants: infants ?? this.infants,
      imagePath: imagePath ?? this.imagePath,
      pregnancyWeek: pregnancyWeek ?? this.pregnancyWeek,
      trimester: trimester ?? this.trimester,
      riskLevel: riskLevel ?? this.riskLevel,
      nextVisit: nextVisit ?? this.nextVisit,
    );
  }

  // Calculate mother's age
  String get formattedAge {
    DateTime now = DateTime.now();
    int years = now.year - birthDate.year;
    int months = now.month - birthDate.month;

    if (months < 0) {
      years--;
      months += 12;
    }

    return '$years years, $months months';
  }

  // Get total number of infants
  int get totalInfants => infants.length;

  // Get youngest infant
  InfantProfile? get youngestInfant {
    if (infants.isEmpty) return null;
    return infants.reduce((a, b) => a.dateOfBirth.isAfter(b.dateOfBirth) ? a : b);
  }

  // Get oldest infant
  InfantProfile? get oldestInfant {
    if (infants.isEmpty) return null;
    return infants.reduce((a, b) => a.dateOfBirth.isBefore(b.dateOfBirth) ? a : b);
  }
}
