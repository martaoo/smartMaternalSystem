import '../models/mother_entities.dart';

class MockMotherRepository {
  static MotherProfile profile = const MotherProfile(
    id: 'MTH-1001',
    name: 'Bezawit',
    phone: '+251900000000',
    pregnancyWeek: 28,
    trimester: 'Third Trimester',
    riskLevel: 'Low',
    nextVisit: 'May 12, 2026',
  );

  static final List<MotherAppointment> _appointments = [
    MotherAppointment(
      id: 'A-1',
      title: 'ANC Visit - Week 28',
      dateTime: DateTime.now().add(const Duration(days: 2)),
      facility: 'Adama Health Center',
      provider: 'Dr. Tigist Bekele',
      status: 'upcoming',
      isHighRisk: false,
    ),
    MotherAppointment(
      id: 'A-2',
      title: 'Ultrasound Follow-up',
      dateTime: DateTime.now().add(const Duration(days: 9)),
      facility: 'Adama Hospital',
      provider: 'Dr. Yonas Desta',
      status: 'upcoming',
      isHighRisk: false,
    ),
    MotherAppointment(
      id: 'A-3',
      title: 'ANC Visit - Week 24',
      dateTime: DateTime.now().subtract(const Duration(days: 7)),
      facility: 'Adama Health Center',
      provider: 'Dr. Tigist Bekele',
      status: 'missed',
      isHighRisk: false,
    ),
  ];

  static final List<ChildGrowthRecord> growthRecords = [
    ChildGrowthRecord(date: DateTime.now().subtract(const Duration(days: 60)), weightKg: 3.1, heightCm: 50.0),
    ChildGrowthRecord(date: DateTime.now().subtract(const Duration(days: 30)), weightKg: 4.2, heightCm: 54.0),
    ChildGrowthRecord(date: DateTime.now().subtract(const Duration(days: 7)), weightKg: 5.1, heightCm: 58.0),
  ];

  static final DateTime _childBirthDate = DateTime.now().subtract(const Duration(days: 100));

  static final List<VaccinationRecord> _vaccinations = <VaccinationRecord>[
    _record('V-1', 'Day 1', 'BCG (Tuberculosis)', 1, completed: true, note: 'Given at birth'),
    _record('V-2', 'Day 1', 'OPV-0 (Polio)', 1, completed: true),
    _record('V-3', 'Day 1', 'Hepatitis B', 1, completed: true, note: 'Given per local policy'),
    _record('V-4', 'Day 7', 'Follow-up check', 7, completed: true),
    _record('V-5', 'Day 45', 'Pentavalent 1 (DTP-HepB-Hib)', 45, completed: true),
    _record('V-6', 'Day 45', 'OPV-1 (Polio)', 45, completed: true),
    _record('V-7', 'Day 45', 'PCV-1 (Pneumococcal)', 45, completed: false),
    _record('V-8', 'Day 45', 'Rotavirus-1', 45, completed: true),
    _record('V-9', '3 Months', 'Pentavalent 2', 75, completed: false),
    _record('V-10', '3 Months', 'OPV-2', 75, completed: false),
    _record('V-11', '3 Months', 'PCV-2', 75, completed: false),
    _record('V-12', '3 Months', 'Rotavirus-2', 75, completed: false),
    _record('V-13', '6 Months', 'Pentavalent 3', 180, completed: false),
    _record('V-14', '6 Months', 'OPV-3', 180, completed: false),
    _record('V-15', '6 Months', 'PCV-3', 180, completed: false),
    _record('V-16', '6 Months', 'IPV (Injectable Polio)', 180, completed: false),
    _record('V-17', '1 Year', 'Measles (MCV-1)', 365, completed: false),
    _record('V-18', '1 Year', 'Vitamin A (supplement)', 365, completed: false),
    _record('V-19', '1 Year 6 Months', 'Measles 2 (MCV-2)', 548, completed: false),
    _record('V-20', '1 Year 6 Months', 'DTP Booster', 548, completed: false),
    _record('V-21', '2 Years', 'Vitamin A (follow-up)', 730, completed: false),
    _record('V-22', '2 Years', 'Growth and health monitoring', 730, completed: false),
    _record('V-23', '2 Years 6 Months', 'Booster check (if needed)', 913, completed: false),
    _record('V-24', '2 Years 6 Months', 'Nutrition and development review', 913, completed: false),
    _record('V-25', '5 Years', 'DTP Booster', 1826, completed: false),
    _record('V-26', '5 Years', 'OPV Booster', 1826, completed: false),
    _record('V-27', '5 Years', 'School readiness check', 1826, completed: false),
  ];

  static List<VaccinationRecord> getVaccinations() {
    final copy = List<VaccinationRecord>.from(_vaccinations);
    copy.sort((a, b) => a.dueDate.compareTo(b.dueDate));
    return copy;
  }

  static Future<void> updateMotherProfile({
    required String name,
    required String phone,
    required String riskLevel,
  }) async {
    profile = MotherProfile(
      id: profile.id,
      name: name,
      phone: phone,
      pregnancyWeek: profile.pregnancyWeek,
      trimester: profile.trimester,
      riskLevel: riskLevel,
      nextVisit: profile.nextVisit,
    );
  }

  static Future<void> markVaccinationCompleted(String id, {DateTime? administeredDate}) async {
    final index = _vaccinations.indexWhere((v) => v.id == id);
    if (index == -1) return;
    final old = _vaccinations[index];
    _vaccinations[index] = VaccinationRecord(
      id: old.id,
      vaccine: old.vaccine,
      ageLabel: old.ageLabel,
      dueDate: old.dueDate,
      completed: true,
      administeredDate: administeredDate ?? DateTime.now(),
      note: old.note,
    );
  }

  static Future<void> addVaccinationRecord({
    required String vaccine,
    required DateTime dueDate,
    String? note,
  }) async {
    _vaccinations.add(
      VaccinationRecord(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        vaccine: vaccine,
        ageLabel: 'Custom',
        dueDate: dueDate,
        completed: false,
        note: note,
      ),
    );
  }

  static VaccinationRecord _record(
    String id,
    String ageLabel,
    String vaccine,
    int dueAfterBirthDays, {
    required bool completed,
    String? note,
  }) {
    final dueDate = _childBirthDate.add(Duration(days: dueAfterBirthDays));
    return VaccinationRecord(
      id: id,
      vaccine: vaccine,
      ageLabel: ageLabel,
      dueDate: dueDate,
      completed: completed,
      administeredDate: completed ? dueDate : null,
      note: note,
    );
  }

  static List<MotherAppointment> getAppointments() {
    final copy = List<MotherAppointment>.from(_appointments);
    copy.sort((a, b) => a.dateTime.compareTo(b.dateTime));
    return copy;
  }

  static Future<void> bookAppointment({
    required String title,
    required DateTime dateTime,
    required String facility,
    required String provider,
  }) async {
    _appointments.add(
      MotherAppointment(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: title,
        dateTime: dateTime,
        facility: facility,
        provider: provider,
        status: 'upcoming',
        isHighRisk: profile.riskLevel.toLowerCase() == 'high',
      ),
    );
  }

  static Future<void> rescheduleAppointment(String id, DateTime dateTime) async {
    final index = _appointments.indexWhere((a) => a.id == id);
    if (index == -1) return;
    final old = _appointments[index];
    _appointments[index] = MotherAppointment(
      id: old.id,
      title: old.title,
      dateTime: dateTime,
      facility: old.facility,
      provider: old.provider,
      status: 'rescheduled',
      isHighRisk: old.isHighRisk,
    );
  }

  static Future<void> cancelAppointment(String id) async {
    final index = _appointments.indexWhere((a) => a.id == id);
    if (index == -1) return;
    final old = _appointments[index];
    _appointments[index] = MotherAppointment(
      id: old.id,
      title: old.title,
      dateTime: old.dateTime,
      facility: old.facility,
      provider: old.provider,
      status: 'cancelled',
      isHighRisk: old.isHighRisk,
    );
  }
}
