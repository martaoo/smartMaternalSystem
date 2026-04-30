import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';
import 'widgets/appointment_card.dart';
import 'widgets/empty_state.dart';
import 'widgets/loading_indicator.dart';
import '../../services/notification_service.dart';

class AppointmentScreen extends StatefulWidget {
  const AppointmentScreen({super.key});

  @override
  State<AppointmentScreen> createState() => _AppointmentScreenState();
}

class _AppointmentScreenState extends State<AppointmentScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  final NotificationService _notificationService = NotificationService();
  bool _isLoading = false;
  String _selectedFilter = 'all';
  
  // Sample data - replace with actual data from backend
  final List<Map<String, dynamic>> _appointments = [
    {
      'id': '1',
      'title': 'ANC Visit - Week 28',
      'date': DateTime.now().add(const Duration(days: 3)),
      'status': 'upcoming',
      'type': 'ANC',
      'facility': 'Adama Health Center',
      'provider': 'Dr. Tigist Bekele',
      'notes': 'Bring your ANC card',
    },
    {
      'id': '2',
      'title': 'Ultrasound Scan',
      'date': DateTime.now().add(const Duration(days: 10)),
      'status': 'upcoming',
      'type': 'Scan',
      'facility': 'Adama Hospital',
      'provider': 'Dr. Yonas Desta',
      'notes': 'Full bladder required',
    },
    {
      'id': '3',
      'title': 'Blood Test',
      'date': DateTime.now().add(const Duration(days: 5)),
      'status': 'upcoming',
      'type': 'Lab',
      'facility': 'Adama Health Center Lab',
      'provider': 'Lab Technician',
      'notes': 'Fasting required',
    },
    // Recent appointments (last 3 months)
    {
      'id': '4',
      'title': 'ANC Visit - Week 24',
      'date': DateTime.now().subtract(const Duration(days: 7)),
      'status': 'completed',
      'type': 'ANC',
      'facility': 'Adama Health Center',
      'provider': 'Dr. Tigist Bekele',
      'notes': 'Blood pressure normal',
    },
    {
      'id': '5',
      'title': 'ANC Visit - Week 20',
      'date': DateTime.now().subtract(const Duration(days: 20)),
      'status': 'completed',
      'type': 'ANC',
      'facility': 'Adama Health Center',
      'provider': 'Dr. Tigist Bekele',
      'notes': 'Everything normal',
    },
    // Missed appointments
    {
      'id': '6',
      'title': 'Follow-up Consultation',
      'date': DateTime.now().subtract(const Duration(days: 14)),
      'status': 'missed',
      'type': 'ANC',
      'facility': 'Adama Health Center',
      'provider': 'Dr. Tigist Bekele',
      'notes': 'Patient did not attend',
    },
  ];

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _initializeNotifications();
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.0, 0.6, curve: Curves.easeInOut),
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.3, 1.0, curve: Curves.easeOutCubic),
    ));

    _animationController.forward();
  }

  Future<void> _initializeNotifications() async {
    try {
      await _notificationService.initialize();
      await _notificationService.requestPermissions();
    } catch (e) {
      debugPrint('Failed to initialize notifications: $e');
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredAppointments {
    if (_selectedFilter == 'all') return _appointments;
    return _appointments.where((app) => app['status'] == _selectedFilter).toList();
  }

  Map<String, dynamic>? get _nextAppointment {
    final upcoming = _appointments.where((app) => app['status'] == 'upcoming').toList();
    if (upcoming.isEmpty) return null;
    
    upcoming.sort((a, b) => (a['date'] as DateTime).compareTo(b['date'] as DateTime));
    return upcoming.first;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildFilterChips(),
            if (_nextAppointment != null) _buildNextAppointmentCard(),
            Expanded(
              child: _buildAppointmentsList(),
            ),
          ],
        ),
      ),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primaryBrown,
            AppColors.primaryDarkBrown,
          ],
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryBrown.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.calendar_month,
                  color: Colors.white,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'My Appointments',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Manage your healthcare appointments',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        children: [
          Expanded(child: _buildFilterChip('All', 'all', Icons.calendar_month)),
          const SizedBox(width: 8),
          Expanded(child: _buildFilterChip('Upcoming', 'upcoming', Icons.upcoming)),
          const SizedBox(width: 8),
          Expanded(child: _buildFilterChip('Completed', 'completed', Icons.check_circle)),
          const SizedBox(width: 8),
          Expanded(child: _buildFilterChip('Missed', 'missed', Icons.missed_video_call)),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, IconData icon) {
    final isSelected = _selectedFilter == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryBrown : AppColors.backgroundWhite,
          borderRadius: BorderRadius.circular(25),
          border: Border.all(
            color: isSelected ? AppColors.primaryBrown : AppColors.textLight.withValues(alpha: 0.3),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected ? [
            BoxShadow(
              color: AppColors.primaryBrown.withValues(alpha: 0.2),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ] : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? Colors.white : AppColors.textSecondary,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : AppColors.textSecondary,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNextAppointmentCard() {
    final appointment = _nextAppointment!;
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primaryBrown,
                AppColors.medicalTeal.withValues(alpha: 0.8),
              ],
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryBrown.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.event_available,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Next Appointment',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Today at 2:30 PM',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'In 3 days',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                appointment['title'],
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.location_on, color: Colors.white70, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    appointment['facility'],
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _setReminderForAppointment(appointment),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primaryBrown,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_active, size: 18),
                          SizedBox(width: 6),
                          Text('Set Reminder'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _showRescheduleDialog(appointment),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.event_note, size: 18),
                          SizedBox(width: 6),
                          Text('Reschedule'),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAppointmentsList() {
    if (_isLoading) {
      return const Center(child: LoadingIndicator());
    }

    final appointments = _filteredAppointments;
    if (appointments.isEmpty) {
      return EmptyState(
        icon: Icons.calendar_today,
        title: 'No appointments found',
        subtitle: 'Try changing filter or book a new appointment',
        actionText: 'Book Appointment',
        onAction: () => _showBookDialog(),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      itemCount: appointments.length,
      itemBuilder: (context, index) {
        final appointment = appointments[index];
        return AppointmentCard(
          appointment: appointment,
          onTap: () => _showAppointmentDetails(appointment),
          onSetReminder: () => _setReminderForAppointment(appointment),
          onReschedule: () => _showRescheduleDialog(appointment),
          onCancel: appointment['status'] == 'upcoming' 
              ? () => _cancelAppointment(appointment) 
              : null,
        );
      },
    );
  }

  Widget _buildFloatingActionButton() {
    return FloatingActionButton.extended(
      onPressed: () => _showBookDialog(),
      backgroundColor: AppColors.primaryBrown,
      foregroundColor: Colors.white,
      elevation: 8,
      icon: const Icon(Icons.add),
      label: const Text('Book Appointment'),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(25),
      ),
    );
  }

  Future<void> _setReminderForAppointment(Map<String, dynamic> appointment) async {
    setState(() => _isLoading = true);
    
    try {
      final appointmentId = int.parse(appointment['id']);
      final appointmentTime = appointment['date'] as DateTime;
      
      // Schedule multiple reminders
      await _notificationService.schedulePreReminder(
        appointmentId: appointmentId,
        title: appointment['title'],
        facility: appointment['facility'],
        appointmentTime: appointmentTime,
        appointmentType: appointment['type'],
      );
      
      await _notificationService.scheduleSameDayReminder(
        appointmentId: appointmentId,
        title: appointment['title'],
        facility: appointment['facility'],
        appointmentTime: appointmentTime,
        appointmentType: appointment['type'],
      );
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white),
              const SizedBox(width: 8),
              const Text('Reminders set successfully!'),
            ],
          ),
          backgroundColor: AppColors.success,
          duration: const Duration(seconds: 3),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error, color: Colors.white),
              const SizedBox(width: 8),
              Text('Failed to set reminders: ${e.toString()}'),
            ],
          ),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showRescheduleDialog(Map<String, dynamic> appointment) {
    // Implementation will be added
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Reschedule feature coming soon!')),
    );
  }

  void _cancelAppointment(Map<String, dynamic> appointment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Appointment'),
        content: Text('Are you sure you want to cancel "${appointment['title']}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _appointments.removeWhere((a) => a['id'] == appointment['id']);
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Appointment cancelled')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }

  void _showAppointmentDetails(Map<String, dynamic> appointment) {
    // Implementation will be added
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Appointment details coming soon!')),
    );
  }

  void _showBookDialog() {
    // Implementation will be added
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Book appointment coming soon!')),
    );
  }
}
