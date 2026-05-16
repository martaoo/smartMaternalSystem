class ScheduleData {
  final List<PregnancyVisit> visits;
  final List<MaternalVaccine> vaccines;
  final PregnancyVisit? nextVisit;
  final List<PregnancyVisit> overdueVisits;
  final List<String> warnings;

  ScheduleData({
    required this.visits,
    required this.vaccines,
    this.nextVisit,
    required this.overdueVisits,
    required this.warnings,
  });

  factory ScheduleData.fromJson(Map<String, dynamic> json) {
    return ScheduleData(
      visits: (json['visits'] as List? ?? [])
          .map((v) => PregnancyVisit.fromJson(v))
          .toList(),
      vaccines: (json['vaccines'] as List? ?? [])
          .map((v) => MaternalVaccine.fromJson(v))
          .toList(),
      nextVisit: json['nextVisit'] != null
          ? PregnancyVisit.fromJson(json['nextVisit'])
          : null,
      overdueVisits: (json['overdueVisits'] as List? ?? [])
          .map((v) => PregnancyVisit.fromJson(v))
          .toList(),
      warnings: List<String>.from(json['warnings'] ?? []),
    );
  }
}

class PregnancyVisit {
  final String id;
  final String motherId;
  final DateTime visitDate;
  final String visitType;
  final String visitStatus;
  final String? notes;
  final int gestationalAge;
  final int week;
  final String riskLevel;
  final HealthWorker? healthWorker;

  PregnancyVisit({
    required this.id,
    required this.motherId,
    required this.visitDate,
    required this.visitType,
    required this.visitStatus,
    this.notes,
    required this.gestationalAge,
    required this.week,
    required this.riskLevel,
    this.healthWorker,
  });

  factory PregnancyVisit.fromJson(Map<String, dynamic> json) {
    return PregnancyVisit(
      id: json['_id'] ?? '',
      motherId: json['motherId'] is Map ? json['motherId']['_id'] : (json['motherId'] ?? ''),
      visitDate: DateTime.parse(json['visitDate']),
      visitType: json['visitType'] ?? 'ANC',
      visitStatus: json['visitStatus'] ?? 'SCHEDULED',
      notes: json['notes'],
      gestationalAge: json['gestationalAge'] ?? 0,
      week: json['week'] ?? 0,
      riskLevel: json['riskLevel'] ?? 'LOW',
      healthWorker: json['healthWorkerId'] != null
          ? HealthWorker.fromJson(json['healthWorkerId'])
          : null,
    );
  }
}

class MaternalVaccine {
  final String id;
  final String vaccineName;
  final int doseNumber;
  final DateTime givenDate;
  final DateTime? nextDoseDate;
  final String status;

  MaternalVaccine({
    required this.id,
    required this.vaccineName,
    required this.doseNumber,
    required this.givenDate,
    this.nextDoseDate,
    required this.status,
  });

  factory MaternalVaccine.fromJson(Map<String, dynamic> json) {
    return MaternalVaccine(
      id: json['_id'] ?? '',
      vaccineName: json['vaccineName'] ?? '',
      doseNumber: json['doseNumber'] ?? 1,
      givenDate: DateTime.parse(json['givenDate']),
      nextDoseDate: json['nextDoseDate'] != null
          ? DateTime.parse(json['nextDoseDate'])
          : null,
      status: json['status'] ?? 'GIVEN',
    );
  }
}

class HealthWorker {
  final String name;
  final String role;

  HealthWorker({required this.name, required this.role});

  factory HealthWorker.fromJson(Map<String, dynamic> json) {
    return HealthWorker(
      name: json['name'] ?? '',
      role: json['role'] ?? '',
    );
  }
}
