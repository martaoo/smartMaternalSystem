class GrowthModel {
  final String id;
  final String childId;
  final DateTime recordDate;
  final double weight;
  final double height;
  final double? headCircumference;
  final double? armCircumference;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  GrowthModel({
    required this.id,
    required this.childId,
    required this.recordDate,
    required this.weight,
    required this.height,
    this.headCircumference,
    this.armCircumference,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory GrowthModel.fromJson(Map<String, dynamic> json) {
    return GrowthModel(
      id: json['_id'] ?? json['id'] ?? '',
      childId: json['childId'] ?? '',
      recordDate: DateTime.parse(json['recordDate']),
      weight: json['weight']?.toDouble() ?? 0.0,
      height: json['height']?.toDouble() ?? 0.0,
      headCircumference: json['headCircumference']?.toDouble(),
      armCircumference: json['armCircumference']?.toDouble(),
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'childId': childId,
      'recordDate': recordDate.toIso8601String(),
      'weight': weight,
      'height': height,
      'headCircumference': headCircumference,
      'armCircumference': armCircumference,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
