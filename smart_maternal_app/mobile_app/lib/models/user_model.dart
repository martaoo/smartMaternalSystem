class UserModel {
  final String id;
  final String name;
  final String email;
  final String phoneNumber;
  final String role;
  final String? regionId;
  final String? woredaId;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phoneNumber,
    required this.role,
    this.regionId,
    this.woredaId,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory UserModel.fromJson(Map<String, dynamic> json) {
    String? extractName(dynamic field) {
      if (field == null) return null;
      if (field is String) return field;
      if (field is Map<String, dynamic>) {
        return field['name']?.toString() ?? field['_id']?.toString() ?? field['id']?.toString();
      }
      return field.toString();
    }

    return UserModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '${json['firstName'] ?? ''} ${json['lastName'] ?? ''}'.trim(),
      email: json['email']?.toString() ?? '',
      phoneNumber: json['phoneNumber']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
      regionId: extractName(json['regionId']) ?? json['assignedRegion']?.toString(),
      woredaId: extractName(json['woredaId']),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phoneNumber': phoneNumber,
      'role': role,
      'regionId': regionId,
      'woredaId': woredaId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
  
  String get fullName => name;
}
