import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../services/notification_service.dart';

class AppointmentScreen extends StatefulWidget {
  const AppointmentScreen({super.key});

  @override
  State<AppointmentScreen> createState() => _AppointmentScreenState();
}

class _AppointmentScreenState extends State<AppointmentScreen>
    with TickerProviderStateMixin {
  late AnimationController _fabAnimationController;
  late AnimationController _cardAnimationController;
  late Animation<double> _fabScaleAnimation;
  late Animation<Offset> _cardSlideAnimation;
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
    {
      'id': '4',
      'title': 'First ANC Registration',
      'date': DateTime.now().subtract(const Duration(days: 45)),
      'status': 'completed',
      'type': 'ANC',
      'facility': 'Adama Health Center',
      'provider': 'Dr. Tigist Bekele',
      'notes': 'Initial registration completed',
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
  ];

  DateTime _selectedDate = DateTime.now();
  String _selectedFilter = 'all'; // all, upcoming, completed
  bool _isCalendarExpanded = false;
  final NotificationService _notificationService = NotificationService();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fabAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _cardAnimationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _fabScaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fabAnimationController, curve: Curves.elasticOut),
    );
    
    _cardSlideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _cardAnimationController, curve: Curves.easeOutCubic),
    );
    
    _fabAnimationController.forward();
    _cardAnimationController.forward();
    
    // Initialize notifications
    _initializeNotifications();
  }

  Future<void> _initializeNotifications() async {
    await _notificationService.initialize();
    await _notificationService.requestPermissions();
  }

  @override
  void dispose() {
    _fabAnimationController.dispose();
    _cardAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final nextAppointment = _appointments.firstWhere(
      (app) => app['status'] == 'upcoming',
      orElse: () => {},
    );

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('My Appointments'),
        backgroundColor: AppColors.primaryPink,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(_isCalendarExpanded ? Icons.calendar_view_month : Icons.calendar_today),
            onPressed: () => setState(() => _isCalendarExpanded = !_isCalendarExpanded),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          _buildFilterChips(),
          
          // Next Appointment Card
          if (nextAppointment.isNotEmpty)
            SlideTransition(
              position: _cardSlideAnimation,
              child: _buildNextAppointmentCard(nextAppointment),
            ),
          
          // Calendar Section
          AnimatedSize(
            duration: const Duration(milliseconds: 300),
            child: _isCalendarExpanded ? _buildCalendarSection() : const SizedBox.shrink(),
          ),
          
          // Appointments List
          Expanded(
            child: _buildAppointmentsList(),
          ),
        ],
      ),
      floatingActionButton: ScaleTransition(
        scale: _fabScaleAnimation,
        child: _buildFAB(),
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          _buildFilterChip('All', 'all'),
          const SizedBox(width: 8),
          _buildFilterChip('Upcoming', 'upcoming'),
          const SizedBox(width: 8),
          _buildFilterChip('Completed', 'completed'),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) => setState(() => _selectedFilter = value),
        backgroundColor: Colors.white,
        selectedColor: AppColors.primaryPink.withValues(alpha: 0.2),
        checkmarkColor: AppColors.primaryPink,
        labelStyle: TextStyle(
          color: isSelected ? AppColors.primaryPink : Colors.grey,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isSelected ? AppColors.primaryPink : Colors.grey.withValues(alpha: 0.3),
          ),
        ),
      ),
    );
  }

  Widget _buildNextAppointmentCard(Map<String, dynamic> appointment) {
    final date = appointment['date'] as DateTime;
    final daysRemaining = date.difference(DateTime.now()).inDays;
    final hoursRemaining = date.difference(DateTime.now()).inHours;
    final isToday = daysRemaining == 0;
    final isTomorrow = daysRemaining == 1;
    
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFFF48FB1),
            const Color(0xFFCE93D8),
            const Color(0xFFB39DDB).withValues(alpha: 0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.pink.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: Colors.purple.withValues(alpha: 0.2),
            blurRadius: 40,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with icon and badges
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: _getAppointmentTypeIcon(appointment['type'], 28, Colors.white),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Next Appointment', 
                          style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 2),
                      Text(appointment['title'], 
                          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isToday ? Icons.today : isTomorrow ? Icons.event_next : Icons.schedule,
                        color: Colors.white,
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        isToday ? 'Today' : isTomorrow ? 'Tomorrow' : 'In $daysRemaining days',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Date and Time Section
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.calendar_today, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _formatDate(date),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            _formatTime(date),
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Location and Provider
            Row(
              children: [
                Expanded(
                  child: _buildInfoCard(Icons.location_on, appointment['facility'], 'Location'),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildInfoCard(Icons.person, appointment['provider'], 'Provider'),
                ),
              ],
            ),
            
            const SizedBox(height: 20),
            
            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: Container(
                    height: 48,
                    child: OutlinedButton(
                      onPressed: () => _showRescheduleDialog(appointment),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.event_note, size: 18),
                          SizedBox(width: 6),
                          Text('Reschedule', style: TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () => _setReminderForAppointment(appointment),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.pink,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_active, size: 18),
                          SizedBox(width: 6),
                          Text('Set Reminder', style: TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(IconData icon, String text, String label) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: Colors.white70, size: 16),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildCalendarSection() {
    return Card(
      margin: const EdgeInsets.all(16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Month selector
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  onPressed: () => setState(() {
                    _selectedDate = DateTime(_selectedDate.year, _selectedDate.month - 1);
                  }),
                  icon: const Icon(Icons.chevron_left),
                ),
                Text(
                  _formatMonthYear(_selectedDate),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  onPressed: () => setState(() {
                    _selectedDate = DateTime(_selectedDate.year, _selectedDate.month + 1);
                  }),
                  icon: const Icon(Icons.chevron_right),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Weekday headers
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: const ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                  .map((day) => Text(day, style: const TextStyle(fontWeight: FontWeight.bold)))
                  .toList(),
            ),
            const SizedBox(height: 8),
            // Calendar days
            _buildCalendarDays(),
          ],
        ),
      ),
    );
  }

  Widget _buildCalendarDays() {
    final firstDay = DateTime(_selectedDate.year, _selectedDate.month, 1);
    final startingWeekday = firstDay.weekday - 1;
    final daysInMonth = DateTime(_selectedDate.year, _selectedDate.month + 1, 0).day;
    final today = DateTime.now();

    List<Widget> days = [];
    
    // Empty cells
    for (int i = 0; i < startingWeekday; i++) {
      days.add(const SizedBox(width: 40, height: 40));
    }
    
    // Days
    for (int day = 1; day <= daysInMonth; day++) {
      final date = DateTime(_selectedDate.year, _selectedDate.month, day);
      final hasAppointment = _appointments.any((app) {
        final appDate = app['date'] as DateTime;
        return appDate.year == date.year && appDate.month == date.month && appDate.day == date.day;
      });
      
      days.add(
        GestureDetector(
          onTap: () => setState(() => _selectedDate = date),
          child: Container(
            width: 40,
            height: 40,
            margin: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: date.year == today.year && date.month == today.month && date.day == today.day
                  ? AppColors.primaryPink.withValues(alpha: 0.3)
                  : null,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    day.toString(),
                    style: TextStyle(
                      fontWeight: date.year == today.year && date.month == today.month && date.day == today.day
                          ? FontWeight.bold
                          : FontWeight.normal,
                    ),
                  ),
                  if (hasAppointment)
                    Container(
                      width: 4,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.primaryPink,
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      );
    }
    
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: days,
    );
  }

  Widget _buildAppointmentsList() {
    List<Map<String, dynamic>> filteredAppointments = _appointments.where((app) {
      if (_selectedFilter != 'all') {
        return app['status'] == _selectedFilter;
      }
      return true;
    }).toList();

    // Sort by date
    filteredAppointments.sort((a, b) {
      final dateA = a['date'] as DateTime;
      final dateB = b['date'] as DateTime;
      return dateA.compareTo(dateB);
    });

    if (filteredAppointments.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.primaryPink.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(50),
              ),
              child: const Icon(Icons.calendar_today, size: 48, color: AppColors.primaryPink),
            ),
            const SizedBox(height: 16),
            const Text('No appointments found', style: TextStyle(color: Colors.grey, fontSize: 16)),
            const SizedBox(height: 8),
            const Text('Try changing the filter or book a new appointment', 
                style: TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => _showBookDialog(),
              icon: const Icon(Icons.add),
              label: const Text('Book Appointment'),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryPink),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: filteredAppointments.length,
      itemBuilder: (context, index) {
        final app = filteredAppointments[index];
        final date = app['date'] as DateTime;
        final isUpcoming = app['status'] == 'upcoming';
        
        return Dismissible(
          key: Key(app['id']),
          direction: isUpcoming ? DismissDirection.endToStart : DismissDirection.none,
          background: Container(
            decoration: BoxDecoration(
              color: Colors.red,
              borderRadius: BorderRadius.circular(16),
            ),
            alignment: Alignment.centerRight,
            padding: const EdgeInsets.only(right: 20),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.delete, color: Colors.white, size: 24),
                Text('Cancel', style: TextStyle(color: Colors.white)),
              ],
            ),
          ),
          onDismissed: (direction) {
            setState(() {
              _appointments.removeWhere((a) => a['id'] == app['id']);
            });
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Appointment cancelled')),
            );
          },
          child: Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 4,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white,
                    _getAppointmentTypeColor(app['type']).withValues(alpha: 0.05),
                  ],
                ),
              ),
              child: InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () => _showAppointmentDetails(app),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      // Appointment Icon Container
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              _getAppointmentTypeColor(app['type']).withValues(alpha: 0.2),
                              _getAppointmentTypeColor(app['type']).withValues(alpha: 0.1),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: _getAppointmentTypeColor(app['type']).withValues(alpha: 0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Center(
                          child: _getAppointmentTypeIcon(app['type'], 32, _getAppointmentTypeColor(app['type'])),
                        ),
                      ),
                      const SizedBox(width: 20),
                      
                      // Appointment Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              app['title'], 
                              style: const TextStyle(
                                fontWeight: FontWeight.bold, 
                                fontSize: 16,
                                color: Color(0xFF2D3748),
                              ),
                            ),
                            const SizedBox(height: 8),
                            
                            // Time and Location Row
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.grey.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.access_time, size: 14, color: Color(0xFF718096)),
                                  const SizedBox(width: 4),
                                  Text(
                                    _formatTime(date), 
                                    style: const TextStyle(
                                      color: Color(0xFF718096), 
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    width: 4,
                                    height: 4,
                                    decoration: BoxDecoration(
                                      color: Color(0xFFCBD5E0),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Icon(Icons.location_on, size: 14, color: Color(0xFF718096)),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      app['facility'], 
                                      style: const TextStyle(
                                        color: Color(0xFF718096), 
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            
                            if (app['notes'] != null) ...[
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.info_outline, size: 14, color: Color(0xFFA0AEC0)),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      app['notes'], 
                                      style: const TextStyle(
                                        fontSize: 11, 
                                        color: Color(0xFFA0AEC0),
                                        fontStyle: FontStyle.italic,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                      
                      // Date and Status
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: _getAppointmentTypeColor(app['type']).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: _getAppointmentTypeColor(app['type']).withValues(alpha: 0.3),
                              ),
                            ),
                            child: Text(
                              _formatDate(date), 
                              style: TextStyle(
                                fontSize: 12, 
                                fontWeight: FontWeight.w600,
                                color: _getAppointmentTypeColor(app['type']),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: isUpcoming ? Colors.green.withValues(alpha: 0.1) : Colors.grey.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isUpcoming ? Colors.green.withValues(alpha: 0.3) : Colors.grey.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  isUpcoming ? Icons.upcoming : Icons.check_circle,
                                  size: 12,
                                  color: isUpcoming ? Colors.green : Colors.grey,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  app['status'],
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isUpcoming ? Colors.green : Colors.grey,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildFAB() {
    return FloatingActionButton.extended(
      onPressed: _showBookDialog,
      backgroundColor: AppColors.primaryPink,
      icon: const Icon(Icons.add),
      label: const Text('Book Appointment'),
    );
  }

  void _showBookDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Book Appointment'),
        content: const Text('Appointment booking feature coming soon!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showRescheduleDialog(Map<String, dynamic> appointment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reschedule Appointment'),
        content: const Text('Reschedule feature coming soon!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showReminderDialog(Map<String, dynamic> appointment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryPink.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.notifications_active, color: AppColors.primaryPink),
            ),
            const SizedBox(width: 12),
            const Text('Set Reminder'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Get notified about your appointment:',
              style: const TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            Text(
              appointment['title'],
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text(
              '${_formatDate(appointment['date'])} at ${_formatTime(appointment['date'])}',
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 16),
            const Text('You will receive:',
                style: TextStyle(fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            ...[
              '• Reminder 24 hours before',
              '• Reminder 2 hours before',
            ].map((reminder) => Padding(
              padding: const EdgeInsets.only(left: 8, top: 4),
              child: Text(reminder, style: const TextStyle(color: Colors.grey, fontSize: 14)),
            )),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _setReminderForAppointment(appointment);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryPink),
            child: const Text('Set Reminder'),
          ),
        ],
      ),
    );
  }

  Future<void> _setReminderForAppointment(Map<String, dynamic> appointment) async {
    setState(() => _isLoading = true);
    
    try {
      final appointmentId = int.parse(appointment['id']);
      final appointmentTime = appointment['date'] as DateTime;
      
      // Schedule pre-reminder (24 hours before)
      await _notificationService.schedulePreReminder(
        appointmentId: appointmentId,
        title: appointment['title'],
        facility: appointment['facility'],
        appointmentTime: appointmentTime,
        appointmentType: appointment['type'],
      );
      
      // Schedule same-day reminder (2 hours before)
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
          backgroundColor: Colors.green,
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
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showAppointmentDetails(Map<String, dynamic> appointment) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _getAppointmentTypeColor(appointment['type']).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: _getAppointmentTypeIcon(appointment['type'], 32, _getAppointmentTypeColor(appointment['type'])),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(appointment['title'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: appointment['status'] == 'upcoming' 
                                ? Colors.green.withValues(alpha: 0.1) 
                                : Colors.grey.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            appointment['status'],
                            style: TextStyle(
                              color: appointment['status'] == 'upcoming' ? Colors.green : Colors.grey,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Details
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDetailSection('Date & Time', [
                        _buildDetailRow(Icons.calendar_today, _formatDate(appointment['date'])),
                        const SizedBox(height: 8),
                        _buildDetailRow(Icons.access_time, _formatTime(appointment['date'])),
                      ]),
                      const SizedBox(height: 20),
                      _buildDetailSection('Location', [
                        _buildDetailRow(Icons.location_on, appointment['facility']),
                      ]),
                      const SizedBox(height: 20),
                      _buildDetailSection('Healthcare Provider', [
                        _buildDetailRow(Icons.person, appointment['provider']),
                      ]),
                      if (appointment['notes'] != null) ...[
                        const SizedBox(height: 20),
                        _buildDetailSection('Notes', [
                          _buildDetailRow(Icons.note, appointment['notes']),
                        ]),
                      ],
                    ],
                  ),
                ),
              ),
              
              // Action Buttons
              if (appointment['status'] == 'upcoming') ...[
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _showRescheduleDialog(appointment);
                        },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Reschedule'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _showReminderDialog(appointment);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryPink,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Set Reminder'),
                      ),
                    ),
                  ],
                ),
              ],
              
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primaryPink)),
        const SizedBox(height: 12),
        ...children,
      ],
    );
  }

  Widget _buildDetailRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: const TextStyle(fontSize: 14))),
      ],
    );
  }

  Widget _getAppointmentTypeIcon(String type, double size, Color color) {
    switch (type) {
      case 'ANC':
        return Icon(Icons.pregnant_woman, size: size, color: color);
      case 'Scan':
        return Icon(Icons.monitor_heart, size: size, color: color);
      case 'Lab':
        return Icon(Icons.science, size: size, color: color);
      default:
        return Icon(Icons.event, size: size, color: color);
    }
  }

  Color _getAppointmentTypeColor(String type) {
    switch (type) {
      case 'ANC':
        return Colors.pink;
      case 'Scan':
        return Colors.blue;
      case 'Lab':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(DateTime date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  String _formatTime(DateTime date) {
    final hour = date.hour > 12 ? date.hour - 12 : date.hour;
    final period = date.hour >= 12 ? 'PM' : 'AM';
    return '$hour:${date.minute.toString().padLeft(2, '0')} $period';
  }

  String _formatMonthYear(DateTime date) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return '${months[date.month - 1]} ${date.year}';
  }
}
