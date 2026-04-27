class MotherProfile {
  final String id;
  final String name;
  final String phone;
  final int pregnancyWeek;
  final String trimester;
  final String riskLevel;
  final String nextVisit;

  const MotherProfile({
    required this.id,
    required this.name,
    required this.phone,
    required this.pregnancyWeek,
    required this.trimester,
    required this.riskLevel,
    required this.nextVisit,
  });
}

class MotherAppointment {
  final String id;
  final String title;
  final DateTime dateTime;
  final String facility;
  final String provider;
  final String status; // upcoming, completed, missed, cancelled, rescheduled
  final bool isHighRisk;

  const MotherAppointment({
    required this.id,
    required this.title,
    required this.dateTime,
    required this.facility,
    required this.provider,
    required this.status,
    required this.isHighRisk,
  });
}

class ChildGrowthRecord {
  final DateTime date;
  final double weightKg;
  final double heightCm;

  const ChildGrowthRecord({
    required this.date,
    required this.weightKg,
    required this.heightCm,
  });
}

class VaccinationRecord {
  final String id;
  final String vaccine;
  final String ageLabel;
  final DateTime dueDate;
  final bool completed;
  final DateTime? administeredDate;
  final String? note;

  const VaccinationRecord({
    required this.id,
    required this.vaccine,
    required this.ageLabel,
    required this.dueDate,
    required this.completed,
    this.administeredDate,
    this.note,
  });
}
