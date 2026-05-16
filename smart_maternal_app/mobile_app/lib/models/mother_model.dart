class MotherModel {
  final String id;
  final String userId;
  final String? address;
  final DateTime? dateOfBirth;
  final String? bloodType;
  final String? emergencyContact;
  final String? emergencyContactPhone;
  final DateTime? lastMenstrualPeriod;
  final DateTime? expectedDeliveryDate;
  final int? parity;
  final String? medicalHistory;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  MotherModel({
    required this.id,
    required this.userId,
    this.address,
    this.dateOfBirth,
    this.bloodType,
    this.emergencyContact,
    this.emergencyContactPhone,
    this.lastMenstrualPeriod,
    this.expectedDeliveryDate,
    this.parity,
    this.medicalHistory,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory MotherModel.fromJson(Map<String, dynamic> json) {
    return MotherModel(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      address: json['address'],
      dateOfBirth: json['dateOfBirth'] != null 
          ? DateTime.parse(json['dateOfBirth']) 
          : null,
      bloodType: json['bloodType'],
      emergencyContact: json['emergencyContact'],
      emergencyContactPhone: json['emergencyContactPhone'],
      lastMenstrualPeriod: json['lastMenstrualPeriod'] != null 
          ? DateTime.parse(json['lastMenstrualPeriod']) 
          : null,
      expectedDeliveryDate: json['expectedDeliveryDate'] != null 
          ? DateTime.parse(json['expectedDeliveryDate']) 
          : null,
      parity: json['parity'],
      medicalHistory: json['medicalHistory'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'address': address,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'bloodType': bloodType,
      'emergencyContact': emergencyContact,
      'emergencyContactPhone': emergencyContactPhone,
      'lastMenstrualPeriod': lastMenstrualPeriod?.toIso8601String(),
      'expectedDeliveryDate': expectedDeliveryDate?.toIso8601String(),
      'parity': parity,
      'medicalHistory': medicalHistory,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
