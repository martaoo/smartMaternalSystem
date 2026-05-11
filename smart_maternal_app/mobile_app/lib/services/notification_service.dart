import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();
  bool _isInitialized = false;

  // Notification channel IDs (matching backend reminder types)
  static const String channelANC = 'anc_reminders';
  static const String channelVaccine = 'vaccine_reminders';
  static const String channelMaternalVaccine = 'maternal_vaccine_reminders';
  static const String channelEmergency = 'emergency_alerts';

  Future<void> initialize() async {
    if (_isInitialized) return;

    tz.initializeTimeZones();

    // Create multiple channels for different notification types
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
          requestAlertPermission: true,
          requestBadgePermission: true,
          requestSoundPermission: true,
        );

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await _notifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channels (Android 8.0+)
    await _createNotificationChannels();

    _isInitialized = true;
  }

  Future<void> _createNotificationChannels() async {
    final androidPlugin = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    
    if (androidPlugin != null) {
      // ANC Visit Channel
      await androidPlugin.createNotificationChannel(const AndroidNotificationChannel(
        channelANC,
        'ANC Visit Reminders',
        description: 'Reminders for antenatal care visits',
        importance: Importance.high,
        enableVibration: true,
        playSound: true,
        sound: RawResourceAndroidNotificationSound('notification'),
      ));

      // Child Vaccine Channel
      await androidPlugin.createNotificationChannel(const AndroidNotificationChannel(
        channelVaccine,
        'Vaccination Reminders',
        description: 'Reminders for child vaccinations',
        importance: Importance.high,
        enableVibration: true,
        playSound: true,
      ));

      // Maternal Vaccine Channel
      await androidPlugin.createNotificationChannel(const AndroidNotificationChannel(
        channelMaternalVaccine,
        'Maternal Vaccine Reminders',
        description: 'Reminders for mother TD vaccinations',
        importance: Importance.high,
        enableVibration: true,
        playSound: true,
      ));

      // Emergency Channel
      await androidPlugin.createNotificationChannel(const AndroidNotificationChannel(
        channelEmergency,
        'Emergency Alerts',
        description: 'Critical health alerts',
        importance: Importance.max,
        enableVibration: true,
        playSound: true,
      ));
    }
  }

  Future<bool> requestPermissions() async {
    final androidPlugin = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    final result = await androidPlugin?.requestNotificationsPermission();
    return result ?? false;
  }

  // ==================== ANC VISIT REMINDERS (Matches backend) ====================
  
  /// 3-day reminder (matches backend's reminder3DaySent flag)
  Future<void> schedule3DayReminder({
    required int visitId,
    required String motherName,
    required DateTime visitDate,
    required int gestationalAge,
    required String facilityName,
  }) async {
    await initialize();
    
    final reminderDate = visitDate.subtract(const Duration(days: 3));
    if (!reminderDate.isAfter(DateTime.now())) return;

    final androidDetails = AndroidNotificationDetails(
      channelANC,
      'ANC Visit Reminders',
      channelDescription: 'Reminders for antenatal care visits',
      importance: Importance.high,
      priority: Priority.high,
      styleInformation: BigTextStyleInformation(
        'Your ANC visit is in 3 days. Gestational age: $gestationalAge weeks.',
      ),
    );

    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _notifications.zonedSchedule(
      visitId + 3000, // Use +3000 for 3-day reminders
      'ANC Visit Reminder',
      'Hello $motherName, you have an ANC visit at $facilityName in 3 days.',
      tz.TZDateTime.from(reminderDate, tz.local),
      details,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: 'anc_visit_$visitId',
    );
  }

  /// 1-day reminder (matches backend's visitReminderSent flag)
  Future<void> schedule1DayReminder({
    required int visitId,
    required String motherName,
    required DateTime visitDate,
    required int gestationalAge,
    required String facilityName,
  }) async {
    await initialize();
    
    final reminderDate = visitDate.subtract(const Duration(days: 1));
    if (!reminderDate.isAfter(DateTime.now())) return;

    final androidDetails = AndroidNotificationDetails(
      channelANC,
      'ANC Visit Reminders',
      importance: Importance.high,
      priority: Priority.high,
      styleInformation: BigTextStyleInformation(
        'Your ANC visit is tomorrow. Gestational age: $gestationalAge weeks.',
      ),
    );

    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _notifications.zonedSchedule(
      visitId + 1000, // Use +1000 for 1-day reminders
      'ANC Visit Tomorrow',
      'Hello $motherName, your ANC visit at $facilityName is tomorrow.',
      tz.TZDateTime.from(reminderDate, tz.local),
      details,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: 'anc_visit_$visitId',
    );
  }

  /// Same-day ANC reminder (matches backend's reminderSameDaySent flag)
  Future<void> scheduleAncSameDayReminder({
    required int visitId,
    required String motherName,
    required DateTime visitDate,
    required int gestationalAge,
    required String facilityName,
  }) async {
    await initialize();
    
    final reminderDate = DateTime(visitDate.year, visitDate.month, visitDate.day, 8, 0);
    if (!reminderDate.isAfter(DateTime.now())) return;

    final androidDetails = AndroidNotificationDetails(
      channelANC,
      'ANC Visit Reminders',
      importance: Importance.high,
      priority: Priority.high,
      styleInformation: BigTextStyleInformation(
        'Your ANC visit is today. Please bring your ANC card.',
      ),
    );

    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _notifications.zonedSchedule(
      visitId + 2000, // Use +2000 for same-day reminders
      'ANC Visit Today',
      'Hello $motherName, your ANC visit at $facilityName is today at ${_formatTime(visitDate)}.',
      tz.TZDateTime.from(reminderDate, tz.local),
      details,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: 'anc_visit_$visitId',
    );
  }

  // ==================== CHILD VACCINATION REMINDERS ====================
  
  Future<void> scheduleVaccinationReminder({
    required int vaccineId,
    required String childName,
    required String vaccineName,
    required DateTime dueDate,
    required String facilityName,
    required int daysAhead, // 3, 1, or 0
  }) async {
    await initialize();
    
    DateTime reminderDate = dueDate.subtract(Duration(days: daysAhead));
    if (daysAhead > 0 && !reminderDate.isAfter(DateTime.now())) return;
    if (daysAhead == 0) {
      // Same day: schedule at 8 AM
      reminderDate = DateTime(dueDate.year, dueDate.month, dueDate.day, 8, 0);
      if (!reminderDate.isAfter(DateTime.now())) return;
    }

    String title;
    String body;
    int idOffset;

    switch (daysAhead) {
      case 3:
        title = 'Vaccination in 3 Days';
        body = '$childName\'s $vaccineName vaccine is due in 3 days at $facilityName.';
        idOffset = 3000;
        break;
      case 1:
        title = 'Vaccination Tomorrow';
        body = '$childName\'s $vaccineName vaccine is tomorrow at $facilityName.';
        idOffset = 1000;
        break;
      default:
        title = 'Vaccination Today';
        body = '$childName\'s $vaccineName vaccine is today at ${_formatTime(dueDate)}. Please bring vaccination card.';
        idOffset = 2000;
    }

    final androidDetails = AndroidNotificationDetails(
      channelVaccine,
      'Vaccination Reminders',
      importance: Importance.high,
      priority: Priority.high,
      styleInformation: BigTextStyleInformation(body),
    );

    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _notifications.zonedSchedule(
      vaccineId + idOffset + daysAhead,
      title,
      body,
      tz.TZDateTime.from(reminderDate, tz.local),
      details,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: 'vaccine_$vaccineId',
    );
  }

  // ==================== MATERNAL VACCINE REMINDERS (TD) ====================
  
  Future<void> scheduleMaternalVaccineReminder({
    required int vaccineId,
    required String motherName,
    required String vaccineName,
    required int doseNumber,
    required DateTime dueDate,
    required int daysAhead,
  }) async {
    await initialize();
    
    final reminderDate = dueDate.subtract(Duration(days: daysAhead));
    if (daysAhead > 0 && !reminderDate.isAfter(DateTime.now())) return;

    String title;
    String body;
    int idOffset;

    switch (daysAhead) {
      case 3:
        title = 'TD Vaccine in 3 Days';
        body = '$vaccineName dose #$doseNumber is due in 3 days.';
        idOffset = 3000;
        break;
      case 1:
        title = 'TD Vaccine Tomorrow';
        body = '$vaccineName dose #$doseNumber is tomorrow.';
        idOffset = 1000;
        break;
      default:
        title = 'TD Vaccine Today';
        body = '$vaccineName dose #$doseNumber is today. Please visit your health center.';
        idOffset = 2000;
    }

    final androidDetails = AndroidNotificationDetails(
      channelMaternalVaccine,
      'Maternal Vaccine Reminders',
      importance: Importance.high,
      priority: Priority.high,
    );

    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _notifications.zonedSchedule(
      vaccineId + idOffset + daysAhead,
      title,
      body,
      tz.TZDateTime.from(reminderDate, tz.local),
      details,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: 'maternal_vaccine_$vaccineId',
    );
  }

  // ==================== MISSED VISIT ALERT ====================
  
  Future<void> showMissedVisitAlert({
    required int visitId,
    required String motherName,
    required DateTime missedDate,
    required DateTime rescheduledDate,
  }) async {
    await initialize();

    final androidDetails = AndroidNotificationDetails(
      channelANC,
      'ANC Visit Reminders',
      importance: Importance.high,
      priority: Priority.high,
    );

    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _notifications.show(
      visitId + 4000,
      '⚠️ Missed ANC Visit',
      'You missed your ANC visit on ${_formatDate(missedDate)}. Please reschedule for ${_formatDate(rescheduledDate)}.',
      details,
      payload: 'missed_visit_$visitId',
    );
  }

  // ==================== EMERGENCY NOTIFICATIONS ====================
  
  Future<void> showEmergencyNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    await initialize();

    final androidDetails = AndroidNotificationDetails(
      channelEmergency,
      'Emergency Alerts',
      importance: Importance.max,
      priority: Priority.max,
      playSound: true,
      enableVibration: true,
      color: const Color(0xFFD32F2F),
    );

    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _notifications.show(
      DateTime.now().millisecondsSinceEpoch % 100000,
      title,
      body,
      details,
      payload: payload,
    );
  }

  // ==================== UTILITY METHODS ====================
  Future<void> schedulePreReminder({
    required int appointmentId,
    required String title,
    required String facility,
    required DateTime appointmentTime,
    required String appointmentType,
  }) async {
    await initialize();
    final reminderDate = appointmentTime.subtract(const Duration(days: 1));
    if (!reminderDate.isAfter(DateTime.now())) return;

    final details = NotificationDetails(
      android: AndroidNotificationDetails(
        channelANC,
        'Appointment Reminders',
        channelDescription: 'General visit reminders',
        importance: Importance.high,
        priority: Priority.high,
      ),
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );

    await _notifications.zonedSchedule(
      appointmentId + 1000,
      '$appointmentType Reminder',
      '$title at $facility is tomorrow.',
      tz.TZDateTime.from(reminderDate, tz.local),
      details,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: 'appointment_$appointmentId',
    );
  }

  Future<void> scheduleSameDayReminder({
    required int appointmentId,
    required String title,
    required String facility,
    required DateTime appointmentTime,
    required String appointmentType,
  }) async {
    await initialize();
    final reminderDate = DateTime(
      appointmentTime.year,
      appointmentTime.month,
      appointmentTime.day,
      8,
      0,
    );
    if (!reminderDate.isAfter(DateTime.now())) return;

    final details = NotificationDetails(
      android: AndroidNotificationDetails(
        channelANC,
        'Appointment Reminders',
        channelDescription: 'General visit reminders',
        importance: Importance.high,
        priority: Priority.high,
      ),
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );

    await _notifications.zonedSchedule(
      appointmentId + 2000,
      '$appointmentType Today',
      '$title at $facility is today at ${_formatTime(appointmentTime)}.',
      tz.TZDateTime.from(reminderDate, tz.local),
      details,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: 'appointment_$appointmentId',
    );
  }

  Future<void> scheduleFiveDayCountdownReminders({
    required int appointmentId,
    required String title,
    required String facility,
    required DateTime appointmentTime,
    required String appointmentType,
  }) async {
    await initialize();
    for (int days = 5; days >= 1; days--) {
      final reminderDate = appointmentTime.subtract(Duration(days: days));
      if (!reminderDate.isAfter(DateTime.now())) continue;
      final details = NotificationDetails(
        android: AndroidNotificationDetails(
          channelANC,
          'Appointment Reminders',
          channelDescription: 'General visit reminders',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      );
      await _notifications.zonedSchedule(
        appointmentId + 5000 + days,
        '$appointmentType in $days day${days == 1 ? '' : 's'}',
        '$title at $facility is in $days day${days == 1 ? '' : 's'}.',
        tz.TZDateTime.from(reminderDate, tz.local),
        details,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        payload: 'appointment_$appointmentId',
      );
    }
    await scheduleSameDayReminder(
      appointmentId: appointmentId,
      title: title,
      facility: facility,
      appointmentTime: appointmentTime,
      appointmentType: appointmentType,
    );
  }

  Future<void> cancelFiveDayCountdownReminders(int appointmentId) async {
    for (int days = 5; days >= 1; days--) {
      await cancelNotification(appointmentId + 5000 + days);
    }
    await cancelNotification(appointmentId + 2000);
  }
  
  Future<void> cancelNotification(int id) async {
    await _notifications.cancel(id);
  }

  Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
  }

  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _notifications.pendingNotificationRequests();
  }

  // Cancel all reminders for a specific visit/vaccine
  Future<void> cancelAllRemindersForId(int baseId) async {
    await cancelNotification(baseId + 1000);
    await cancelNotification(baseId + 2000);
    await cancelNotification(baseId + 3000);
    await cancelNotification(baseId + 4000);
    await cancelNotification(baseId + 5000);
  }

  static void _onNotificationTapped(NotificationResponse response) {
    debugPrint('Notification tapped: ${response.payload}');
    // You can add navigation logic here based on payload
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  String _formatTime(DateTime date) {
    final hour = date.hour > 12 ? date.hour - 12 : date.hour;
    final period = date.hour >= 12 ? 'PM' : 'AM';
    return '$hour:${date.minute.toString().padLeft(2, '0')} $period';
  }
}