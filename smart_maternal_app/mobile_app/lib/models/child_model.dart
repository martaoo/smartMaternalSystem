class ChildModel {
  final String id;
  final String motherId;
  final String firstName;
  final String lastName;
  final DateTime dateOfBirth;
  final String gender;
  final double? birthWeight;
  final double? birthHeight;
  final String? bloodType;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  ChildModel({
    required this.id,
    required this.motherId,
    required this.firstName,
    required this.lastName,
    required this.dateOfBirth,
    required this.gender,
    this.birthWeight,
    this.birthHeight,
    this.bloodType,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory ChildModel.fromJson(Map<String, dynamic> json) {
    return ChildModel(
      id: json['_id'] ?? json['id'] ?? '',
      motherId: json['motherId'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      dateOfBirth: DateTime.parse(json['dateOfBirth']),
      gender: json['gender'] ?? '',
      birthWeight: json['birthWeight']?.toDouble(),
      birthHeight: json['birthHeight']?.toDouble(),
      bloodType: json['bloodType'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'motherId': motherId,
      'firstName': firstName,
      'lastName': lastName,
      'dateOfBirth': dateOfBirth.toIso8601String(),
      'gender': gender,
      'birthWeight': birthWeight,
      'birthHeight': birthHeight,
      'bloodType': bloodType,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
  
  String get fullName => '$firstName $lastName';
}
