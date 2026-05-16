class ApiConstants {
  // Use the host machine IP address when testing on a physical Android device.
  // For emulator testing, use 10.0.2.2 instead of localhost.
  static const String baseUrl = 'http://10.161.125.249:3001/api';
  
  static const String authEndpoint = '/auth';
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String logoutEndpoint = '/auth/logout';
  
  static const String appointmentsEndpoint = '/appointments';
  static const String vaccinationsEndpoint = '/vaccinations';
  static const String growthEndpoint = '/growth';
  static const String referralsEndpoint = '/referrals';
  static const String profileEndpoint = '/profile';
  
  static const int connectionTimeout = 30000;
  static const int receiveTimeout = 30000;
}
