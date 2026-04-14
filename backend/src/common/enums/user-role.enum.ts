export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',         // Super Admin - creates regional system admins
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',        // Regional/Subcity Admin - manages their region
  WOREDA_ADMIN = 'WOREDA_ADMIN',       // Woreda Admin - manages specific woreda
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',   // Hospital Admin - manages specific hospital
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  MIDWIFE = 'MIDWIFE',
  DISPATCHER = 'DISPATCHER',
  EMERGENCY_ADMIN = 'EMERGENCY_ADMIN',  // Emergency Admin/Dispatcher Admin
  MOTHER = 'MOTHER',
}
