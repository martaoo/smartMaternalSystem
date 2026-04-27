enum VaccinationStatus {
  completed,
  upcoming,
  missed,
}

extension VaccinationStatusLabel on VaccinationStatus {
  String get label {
    switch (this) {
      case VaccinationStatus.completed:
        return 'Completed';
      case VaccinationStatus.upcoming:
        return 'Upcoming';
      case VaccinationStatus.missed:
        return 'Missed';
    }
  }
}
