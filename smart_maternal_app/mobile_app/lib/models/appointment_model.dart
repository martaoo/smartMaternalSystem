class AppointmentModel {
  final String id;
  final String motherId;
  final String facilityName;
  final String facilityAddress;
  final DateTime appointmentDate;
  final String appointmentTime;
  final String type;
  final String? notes;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  AppointmentModel({
    required this.id,
    required this.motherId,
    required this.facilityName,
    required this.facilityAddress,
    required this.appointmentDate,
    required this.appointmentTime,
    required this.type,
    this.notes,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['_id'] ?? json['id'] ?? '',
      motherId: json['motherId'] ?? '',
      facilityName: json['facilityName'] ?? '',
      facilityAddress: json['facilityAddress'] ?? '',
      appointmentDate: DateTime.parse(json['appointmentDate']),
      appointmentTime: json['appointmentTime'] ?? '',
      type: json['type'] ?? '',
      notes: json['notes'],
      status: json['status'] ?? 'scheduled',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'motherId': motherId,
      'facilityName': facilityName,
      'facilityAddress': facilityAddress,
      'appointmentDate': appointmentDate.toIso8601String(),
      'appointmentTime': appointmentTime,
      'type': type,
      'notes': notes,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
