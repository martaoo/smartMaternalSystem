import '../../../models/profile_models.dart';
import '../models/mother_entities.dart' hide MotherProfile;

class MockMotherRepository {
  // ==================== HEALTH FACILITY ====================
  static final HealthFacility healthFacility = HealthFacility(
    facilityName: 'Adama Health Center',
    serialNumber: 'SN-2024-001',
    cardNumber: 'MCH-12345',
    region: 'Oromia',
    zone: 'East Shewa',
    wereda: 'Adama',
    houseNumber: '123',
    phoneNumber: '+251 911 234567',
  );

  // ==================== INFANTS ====================
  static final List<InfantProfile> infants = [
    InfantProfile(
      name: 'Meron Alemu',
      dateOfBirth: DateTime(2022, 6, 10),
      sex: 'Female',
      birthWeight: 3.2,
      birthHeight: 49.0,
      birthHour: 14,
      fatherName: 'Alemu Bekele',
      imagePath: null,
    ),
  ];

  // ==================== PROFILE using YOUR actual MotherProfile model ====================
  static final MotherProfile profile = MotherProfile(
    name: 'Bezawit Alemu',
    birthDate: DateTime(1996, 3, 15),
    phoneNumber: '+251 911 234567',
    healthFacility: healthFacility,
    infants: infants,
    imagePath: null,
    pregnancyWeek: 28,
    trimester: 'Second Trimester',
    riskLevel: 'Low',
    nextVisit: 'April 25, 2024',
  );

  static MotherProfile getMotherProfile() {
    return profile;
  }

  // ==================== APPOINTMENTS ====================
  static final List<MotherAppointment> _appointments = [
    MotherAppointment(
      id: 'APT-001',
      title: 'ANC Visit - Week 28',
      dateTime: DateTime.now().add(const Duration(days: 3)),
      status: 'upcoming',
      type: 'ANC',
      facility: 'Adama Health Center',
      provider: 'Dr. Tigist Bekele',
      notes: 'Bring your ANC card',
      isHighRisk: false,
    ),
    MotherAppointment(
      id: 'APT-002',
      title: 'Ultrasound Scan',
      dateTime: DateTime.now().add(const Duration(days: 10)),
      status: 'upcoming',
      type: 'Ultrasound',
      facility: 'Adama Hospital',
      provider: 'Dr. Yonas Desta',
      notes: 'Full bladder required',
      isHighRisk: false,
    ),
    MotherAppointment(
      id: 'APT-003',
      title: 'Blood Test',
      dateTime: DateTime.now().add(const Duration(days: 5)),
      status: 'upcoming',
      type: 'Lab',
      facility: 'Adama Health Center Lab',
      provider: 'Lab Technician',
      notes: 'Fasting required',
      isHighRisk: false,
    ),
    MotherAppointment(
      id: 'APT-004',
      title: 'First ANC Registration',
      dateTime: DateTime.now().subtract(const Duration(days: 45)),
      status: 'completed',
      type: 'ANC',
      facility: 'Adama Health Center',
      provider: 'Dr. Tigist Bekele',
      notes: 'Initial registration completed',
      isHighRisk: false,
    ),
    MotherAppointment(
      id: 'APT-005',
      title: 'ANC Visit - Week 20',
      dateTime: DateTime.now().subtract(const Duration(days: 20)),
      status: 'completed',
      type: 'ANC',
      facility: 'Adama Health Center',
      provider: 'Dr. Tigist Bekele',
      notes: 'Everything normal',
      isHighRisk: false,
    ),
  ];

  // ==================== CHILD GROWTH RECORDS ====================
  static final List<ChildGrowthRecord> growthRecords = [
    ChildGrowthRecord(
      date: DateTime.now().subtract(const Duration(days: 60)),
      weightKg: 3.1,
      heightCm: 50.0,
    ),
    ChildGrowthRecord(
      date: DateTime.now().subtract(const Duration(days: 30)),
      weightKg: 4.2,
      heightCm: 54.0,
    ),
    ChildGrowthRecord(
      date: DateTime.now().subtract(const Duration(days: 7)),
      weightKg: 5.1,
      heightCm: 58.0,
    ),
  ];

  // ==================== VACCINATIONS ====================
  static final List<VaccinationRecord> _vaccinations = [
    VaccinationRecord(
      id: 'VAC-001',
      vaccine: 'BCG',
      dueDate: DateTime.now().subtract(const Duration(days: 30)),
      administeredDate: DateTime.now().subtract(const Duration(days: 28)),
      completed: true,
      ageLabel: 'Dose 1',
      note: 'Administered by Nurse Mekdes',
    ),
    VaccinationRecord(
      id: 'VAC-002',
      vaccine: 'Polio (OPV)',
      dueDate: DateTime.now().subtract(const Duration(days: 15)),
      administeredDate: DateTime.now().subtract(const Duration(days: 14)),
      completed: true,
      ageLabel: 'Dose 1',
      note: 'Administered by Nurse Mekdes',
    ),
    VaccinationRecord(
      id: 'VAC-003',
      vaccine: 'Pentavalent',
      dueDate: DateTime.now().add(const Duration(days: 7)),
      administeredDate: null,
      completed: false,
      ageLabel: 'Dose 1',
      note: null,
    ),
    VaccinationRecord(
      id: 'VAC-004',
      vaccine: 'Rotavirus',
      dueDate: DateTime.now().add(const Duration(days: 14)),
      administeredDate: null,
      completed: false,
      ageLabel: 'Dose 1',
      note: null,
    ),
    VaccinationRecord(
      id: 'VAC-005',
      vaccine: 'Measles',
      dueDate: DateTime.now().add(const Duration(days: 90)),
      administeredDate: null,
      completed: false,
      ageLabel: 'Dose 1',
      note: null,
    ),
  ];

  // ==================== GETTER METHODS ====================
  static List<VaccinationRecord> getVaccinations() {
    final copy = List<VaccinationRecord>.from(_vaccinations);
    copy.sort((a, b) => a.dueDate.compareTo(b.dueDate));
    return copy;
  }

  static List<VaccinationRecord> getUpcomingVaccinations() {
    return _vaccinations
        .where((v) => !v.completed)
        .toList()
      ..sort((a, b) => a.dueDate.compareTo(b.dueDate));
  }

  static List<VaccinationRecord> getCompletedVaccinations() {
    return _vaccinations
        .where((v) => v.completed)
        .toList()
      ..sort((a, b) => b.dueDate.compareTo(a.dueDate));
  }

  static List<MotherAppointment> getAppointments() {
    final copy = List<MotherAppointment>.from(_appointments);
    copy.sort((a, b) => a.dateTime.compareTo(b.dateTime));
    return copy;
  }

  static List<MotherAppointment> getUpcomingAppointments() {
    return _appointments
        .where((a) => a.status == 'upcoming')
        .toList()
      ..sort((a, b) => a.dateTime.compareTo(b.dateTime));
  }

  static List<MotherAppointment> getPastAppointments() {
    return _appointments
        .where((a) => a.status == 'completed' || a.status == 'missed')
        .toList()
      ..sort((a, b) => b.dateTime.compareTo(a.dateTime));
  }

  static List<ChildGrowthRecord> getGrowthRecords() {
    return List<ChildGrowthRecord>.from(growthRecords)
      ..sort((a, b) => a.date.compareTo(b.date));
  }

  // ==================== APPOINTMENT MANAGEMENT METHODS ====================
  static Future<void> bookAppointment({
    required String title,
    required String type,
    int? week,
    required DateTime dateTime,
    required String facility,
    required String provider,
    String? notes,
  }) async {
    _appointments.add(
      MotherAppointment(
        id: 'APT-${DateTime.now().millisecondsSinceEpoch}',
        title: title,
        type: type,
        week: week,
        dateTime: dateTime,
        facility: facility,
        provider: provider,
        status: 'upcoming',
        notes: notes,
        isHighRisk: false,
      ),
    );
  }

  static Future<void> rescheduleAppointment(String id, DateTime dateTime) async {
    final index = _appointments.indexWhere((a) => a.id == id);
    if (index != -1) {
      final appointment = _appointments[index];
      _appointments[index] = MotherAppointment(
        id: appointment.id,
        title: appointment.title,
        type: appointment.type,
        week: appointment.week,
        dateTime: dateTime,
        facility: appointment.facility,
        provider: appointment.provider,
        status: 'rescheduled',
        notes: appointment.notes,
        isHighRisk: appointment.isHighRisk,
      );
    }
  }

  static Future<void> cancelAppointment(String id) async {
    final index = _appointments.indexWhere((a) => a.id == id);
    if (index != -1) {
      final appointment = _appointments[index];
      _appointments[index] = MotherAppointment(
        id: appointment.id,
        title: appointment.title,
        type: appointment.type,
        week: appointment.week,
        dateTime: appointment.dateTime,
        facility: appointment.facility,
        provider: appointment.provider,
        status: 'cancelled',
        notes: appointment.notes,
        isHighRisk: appointment.isHighRisk,
      );
    }
  }

  static Future<void> markAppointmentCompleted(String id) async {
    final index = _appointments.indexWhere((a) => a.id == id);
    if (index != -1) {
      final appointment = _appointments[index];
      _appointments[index] = MotherAppointment(
        id: appointment.id,
        title: appointment.title,
        type: appointment.type,
        week: appointment.week,
        dateTime: appointment.dateTime,
        facility: appointment.facility,
        provider: appointment.provider,
        status: 'completed',
        notes: appointment.notes,
        isHighRisk: appointment.isHighRisk,
      );
    }
  }

  static Future<void> markAppointmentMissed(String id) async {
    final index = _appointments.indexWhere((a) => a.id == id);
    if (index != -1) {
      final appointment = _appointments[index];
      _appointments[index] = MotherAppointment(
        id: appointment.id,
        title: appointment.title,
        type: appointment.type,
        week: appointment.week,
        dateTime: appointment.dateTime,
        facility: appointment.facility,
        provider: appointment.provider,
        status: 'missed',
        notes: appointment.notes,
        isHighRisk: appointment.isHighRisk,
      );
    }
  }

  // ==================== VACCINATION MANAGEMENT METHODS ====================
  static Future<void> markVaccinationCompleted(String id, {DateTime? administeredDate, String? note}) async {
    final index = _vaccinations.indexWhere((v) => v.id == id);
    if (index != -1) {
      final vaccination = _vaccinations[index];
      _vaccinations[index] = VaccinationRecord(
        id: vaccination.id,
        vaccine: vaccination.vaccine,
        ageLabel: vaccination.ageLabel,
        dueDate: vaccination.dueDate,
        completed: true,
        administeredDate: administeredDate ?? DateTime.now(),
        note: note ?? vaccination.note,
      );
    }
  }

  static Future<void> addVaccinationRecord({
    required String vaccine,
    required DateTime dueDate,
    String? note,
  }) async {
    _vaccinations.add(
      VaccinationRecord(
        id: 'VAC-${DateTime.now().millisecondsSinceEpoch}',
        vaccine: vaccine,
        ageLabel: 'Custom',
        dueDate: dueDate,
        completed: false,
        administeredDate: null,
        note: note,
      ),
    );
  }

  // ==================== TD VACCINATION METHODS ====================
  static Map<String, DateTime?> getTdDates({required bool pregnant}) {
    return {
      'TD1': DateTime.now().subtract(const Duration(days: 60)),
      'TD2': DateTime.now().subtract(const Duration(days: 32)),
      'TD3': null,
      'TD4': null,
      'TD5': null,
    };
  }

  static Future<void> setTdDate({
    required bool pregnant,
    required String doseKey,
    required DateTime dateGiven,
  }) async {
    // TD date setting logic would go here
  }

  // ==================== PROFILE MANAGEMENT ====================
  static Future<void> updateMotherProfile({
    required String name,
    required String phone,
    required String riskLevel,
  }) async {
    // Update logic would go here
  }
}