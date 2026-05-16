class VaccinationModel {
  final String id;
  final String childId;
  final String vaccineName;
  final String vaccineType;
  final DateTime scheduledDate;
  final DateTime? administeredDate;
  final String? administeredBy;
  final String? batchNumber;
  final String status;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  VaccinationModel({
    required this.id,
    required this.childId,
    required this.vaccineName,
    required this.vaccineType,
    required this.scheduledDate,
    this.administeredDate,
    this.administeredBy,
    this.batchNumber,
    required this.status,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory VaccinationModel.fromJson(Map<String, dynamic> json) {
    return VaccinationModel(
      id: json['_id'] ?? json['id'] ?? '',
      childId: json['childId'] ?? '',
      vaccineName: json['vaccineName'] ?? '',
      vaccineType: json['vaccineType'] ?? '',
      scheduledDate: DateTime.parse(json['scheduledDate']),
      administeredDate: json['administeredDate'] != null 
          ? DateTime.parse(json['administeredDate']) 
          : null,
      administeredBy: json['administeredBy'],
      batchNumber: json['batchNumber'],
      status: json['status'] ?? 'scheduled',
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'childId': childId,
      'vaccineName': vaccineName,
      'vaccineType': vaccineType,
      'scheduledDate': scheduledDate.toIso8601String(),
      'administeredDate': administeredDate?.toIso8601String(),
      'administeredBy': administeredBy,
      'batchNumber': batchNumber,
      'status': status,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
