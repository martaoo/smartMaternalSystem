import '../../data/mock_mother_repository.dart';
import '../../models/mother_entities.dart';
import '../models/vaccination_status.dart';

class VaccinationMockService {
  static List<VaccinationRecord> getRecords() {
    return MockMotherRepository.getVaccinations();
  }

  static VaccinationStatus getStatus(VaccinationRecord record) {
    if (record.completed) {
      return VaccinationStatus.completed;
    }
    final now = DateTime.now();
    final due = DateTime(record.dueDate.year, record.dueDate.month, record.dueDate.day);
    final today = DateTime(now.year, now.month, now.day);
    if (due.isBefore(today)) {
      return VaccinationStatus.missed;
    }
    return VaccinationStatus.upcoming;
  }

  static int getCompletedCount(List<VaccinationRecord> records) {
    return records.where((r) => getStatus(r) == VaccinationStatus.completed).length;
  }

  static int getUpcomingCount(List<VaccinationRecord> records) {
    return records.where((r) => getStatus(r) == VaccinationStatus.upcoming).length;
  }

  static int getMissedCount(List<VaccinationRecord> records) {
    return records.where((r) => getStatus(r) == VaccinationStatus.missed).length;
  }

  static VaccinationRecord? getNextVaccine(List<VaccinationRecord> records) {
    final upcoming = records.where((r) => getStatus(r) == VaccinationStatus.upcoming).toList()
      ..sort((a, b) => a.dueDate.compareTo(b.dueDate));
    return upcoming.isEmpty ? null : upcoming.first;
  }

  static Future<void> addRecord({
    required String vaccine,
    required DateTime dueDate,
    String? note,
  }) async {
    await MockMotherRepository.addVaccinationRecord(
      vaccine: vaccine,
      dueDate: dueDate,
      note: note,
    );
  }

  static Future<void> markCompleted(String id) async {
    await MockMotherRepository.markVaccinationCompleted(id);
  }
}
