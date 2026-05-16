class ReferralModel {
  final String id;
  final String motherId;
  final String referredBy;
  final String referredTo;
  final String facilityName;
  final String facilityAddress;
  final String reason;
  final String urgency;
  final DateTime referralDate;
  final String? notes;
  final String status;
  final DateTime? followUpDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  ReferralModel({
    required this.id,
    required this.motherId,
    required this.referredBy,
    required this.referredTo,
    required this.facilityName,
    required this.facilityAddress,
    required this.reason,
    required this.urgency,
    required this.referralDate,
    this.notes,
    required this.status,
    this.followUpDate,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory ReferralModel.fromJson(Map<String, dynamic> json) {
    return ReferralModel(
      id: json['_id'] ?? json['id'] ?? '',
      motherId: json['motherId'] ?? '',
      referredBy: json['referredBy'] ?? '',
      referredTo: json['referredTo'] ?? '',
      facilityName: json['facilityName'] ?? '',
      facilityAddress: json['facilityAddress'] ?? '',
      reason: json['reason'] ?? '',
      urgency: json['urgency'] ?? 'normal',
      referralDate: DateTime.parse(json['referralDate']),
      notes: json['notes'],
      status: json['status'] ?? 'pending',
      followUpDate: json['followUpDate'] != null 
          ? DateTime.parse(json['followUpDate']) 
          : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'motherId': motherId,
      'referredBy': referredBy,
      'referredTo': referredTo,
      'facilityName': facilityName,
      'facilityAddress': facilityAddress,
      'reason': reason,
      'urgency': urgency,
      'referralDate': referralDate.toIso8601String(),
      'notes': notes,
      'status': status,
      'followUpDate': followUpDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
