import 'package:flutter/material.dart';

class MotherDangerSignsScreen extends StatefulWidget {
  const MotherDangerSignsScreen({super.key});

  @override
  State<MotherDangerSignsScreen> createState() => _MotherDangerSignsScreenState();
}

class _MotherDangerSignsScreenState extends State<MotherDangerSignsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isMotherTab = _tabController.index == 0;
    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              pinned: true,
              floating: true,
              expandedHeight: 240,
              toolbarHeight: 0,
              backgroundColor: Colors.black,
              flexibleSpace: FlexibleSpaceBar(
                background: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 350),
                  child: _buildHeaderImage(
                    key: ValueKey(isMotherTab ? 'mother_header' : 'child_header'),
                    imagePath: isMotherTab
                        ? 'assets/images/danger_sign/mother-bed-emergency-clinic.jpg'
                        : 'assets/images/danger_sign/danger_baby.jpg',
                    fallbackPath: isMotherTab
                        ? 'assets/images/danger_sign/danger_mother_bad_smelling.png'
                        : 'assets/images/danger_sign/danger_baby.jpg',
                  ),
                ),
              ),
              bottom: TabBar(
                controller: _tabController,
                indicatorColor: Colors.white,
                indicatorWeight: 4,
                indicatorSize: TabBarIndicatorSize.tab,
                labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white70,
                tabs: const [
                  Tab(icon: Icon(Icons.pregnant_woman), text: 'Mother'),
                  Tab(icon: Icon(Icons.child_friendly), text: 'Child'),
                ],
              ),
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildSignsList(context, _motherSigns, const Color(0xFFC62828), 'Go to a health facility quickly if you see any of these signs.'),
            _buildSignsList(context, _childSigns, const Color(0xFF1565C0), 'Seek urgent care if your baby has these warning signs.'),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderImage({
    required Key key,
    required String imagePath,
    required String fallbackPath,
  }) {
    return Stack(
      key: key,
      fit: StackFit.expand,
      children: [
        Image.asset(
          imagePath,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => Image.asset(
            fallbackPath,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(color: const Color(0xFF5C6BC0)),
          ),
        ),
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0x66000000),
                Color(0x1A000000),
                Color(0xD0000000),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSignsList(BuildContext context, List<_DangerSignItem> signs, Color color, String subtitle) {
    return ListView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 24),
      children: [
        _SectionHeader(
          title: signs == _motherSigns ? 'For Mother' : 'For Child',
          subtitle: subtitle,
          color: color,
        ),
        const SizedBox(height: 18),
        ...signs.asMap().entries.map(
          (entry) => TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: 1),
            duration: Duration(milliseconds: 380 + (entry.key * 70)),
            curve: Curves.easeOutCubic,
            builder: (context, value, child) => Transform.translate(
              offset: Offset(0, (1 - value) * 18),
              child: Opacity(opacity: value, child: child),
            ),
            child: _InteractiveDangerSignCard(item: entry.value),
          ),
        ),
        const SizedBox(height: 24),
        const _EmergencyHelpCard(),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final Color color;

  const _SectionHeader({
    required this.title,
    required this.subtitle,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withOpacity(0.14), color.withOpacity(0.05)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: color.withOpacity(0.25)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.info_outline, color: color, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.black87, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InteractiveDangerSignCard extends StatefulWidget {
  final _DangerSignItem item;
  const _InteractiveDangerSignCard({required this.item});

  @override
  State<_InteractiveDangerSignCard> createState() => _InteractiveDangerSignCardState();
}

class _InteractiveDangerSignCardState extends State<_InteractiveDangerSignCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _showDetailsBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _DangerSignDetailsSheet(item: widget.item),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapCancel: () => _controller.reverse(),
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Card(
          elevation: 7,
          shadowColor: widget.item.color.withOpacity(0.18),
          margin: const EdgeInsets.only(bottom: 18),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: InkWell(
            borderRadius: BorderRadius.circular(24),
            onTap: () {
              _controller.reverse();
              _showDetailsBottomSheet(context);
            },
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: LinearGradient(
                  colors: [Colors.white, widget.item.color.withOpacity(0.04)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Hero(
                    tag: 'danger_img_${widget.item.title}',
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: SizedBox(
                        width: double.infinity,
                        height: 196,
                        child: Image.asset(
                          widget.item.imagePath ?? '',
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [widget.item.color.withOpacity(0.22), widget.item.color.withOpacity(0.08)],
                              ),
                            ),
                            child: Icon(widget.item.icon, color: widget.item.color, size: 56),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    widget.item.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 18,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.item.detail,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.grey[700],
                      height: 1.35,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: widget.item.color,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.warning_amber_rounded, color: Colors.white, size: 15),
                            SizedBox(width: 4),
                            Text(
                              'Urgent sign',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      Text(
                        'Open details',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: widget.item.color.withOpacity(0.7),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Icon(Icons.arrow_forward_ios_rounded, color: widget.item.color.withOpacity(0.6), size: 17),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _DangerSignDetailsSheet extends StatelessWidget {
  final _DangerSignItem item;

  const _DangerSignDetailsSheet({required this.item});

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      heightFactor: 0.92,
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            children: [
              const SizedBox(height: 10),
              Container(
                width: 52,
                height: 5,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Hero(
                        tag: 'danger_img_${item.title}',
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(22),
                          child: SizedBox(
                            height: 220,
                            width: double.infinity,
                            child: Image.asset(
                              item.imagePath ?? '',
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: [item.color.withOpacity(0.22), item.color.withOpacity(0.08)],
                                  ),
                                ),
                                child: Icon(item.icon, color: item.color, size: 84),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: item.color.withOpacity(0.12),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(item.icon, color: item.color, size: 28),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              item.title,
                              style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w800),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: item.color.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          'Emergency warning sign',
                          style: TextStyle(
                            color: item.color,
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        item.detail,
                        style: const TextStyle(fontSize: 16, color: Colors.black87, height: 1.5),
                      ),
                      const SizedBox(height: 18),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF3E0),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFFFCC80)),
                        ),
                        child: const Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.directions_run_rounded, color: Color(0xFFEF6C00)),
                            SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Action to take: Go to the nearest health facility immediately. Do not wait!',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFFE65100),
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: item.color,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: const Text(
                          'Understood',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DangerSignItem {
  final String title;
  final String detail;
  final String? imagePath;
  final IconData icon;
  final Color color;

  const _DangerSignItem({
    required this.title,
    required this.detail,
    this.imagePath,
    required this.icon,
    required this.color,
  });
}

class _EmergencyHelpCard extends StatelessWidget {
  const _EmergencyHelpCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF3E0), Color(0xFFFFF8E1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFFFCC80)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFFFCC80).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          const Icon(Icons.support_agent_rounded, color: Color(0xFFEF6C00), size: 40),
          const SizedBox(height: 12),
          const Text(
            'Emergency Help',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 18,
              color: Color(0xFFE65100),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'If you are not sure, treat it as an emergency. Go to the nearest health center or call your provider now.',
            textAlign: TextAlign.center,
            style: TextStyle(height: 1.4, color: Colors.black87),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              // Call action
            },
            icon: const Icon(Icons.call, color: Colors.white),
            label: const Text('Call Ambulance (902)', style: TextStyle(fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD84315),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }
}

const List<_DangerSignItem> _motherSigns = [
  _DangerSignItem(
    title: 'Heavy bleeding after birth',
    detail: 'If blood is soaking pads quickly or does not stop, seek urgent care now.',
    imagePath: 'assets/images/danger_sign/danger_mother_bleeding.jpg',
    icon: Icons.bloodtype,
    color: Color(0xFFC62828),
  ),
  _DangerSignItem(
    title: 'Fainting (እራስ መሳት)',
    detail: 'Sudden dizziness or loss of consciousness needs immediate medical help.',
    imagePath: 'assets/images/danger_sign/danger_mother_fainting.jpg',
    icon: Icons.warning_amber_rounded,
    color: Color(0xFFEF6C00),
  ),
  _DangerSignItem(
    title: 'Bad-smelling discharge',
    detail: 'A strong foul smell may be a sign of infection and should be checked fast.',
    imagePath: 'assets/images/danger_sign/danger_mother_bad_smelling.png',
    icon: Icons.sick,
    color: Color(0xFF6A1B9A),
  ),
  _DangerSignItem(
    title: 'Severe headache',
    detail: 'Strong headache with blurred vision or swelling can be dangerous.',
    imagePath: 'assets/images/danger_sign/danger_mother_headache.jpg',
    icon: Icons.psychology_alt,
    color: Color(0xFF283593),
  ),
];

const List<_DangerSignItem> _childSigns = [
  _DangerSignItem(
    title: 'Yellow body/eyes',
    detail: 'Yellow skin or eyes can mean jaundice; the baby needs quick evaluation.',
    imagePath: 'assets/images/danger_sign/danger_child_jaundice.jpg',
    icon: Icons.wb_sunny,
    color: Color(0xFFF9A825),
  ),
  _DangerSignItem(
    title: 'Shaking (መንቀጥቀጥ)',
    detail: 'Repeated shaking can be a serious sign. Go to a facility immediately.',
    imagePath: null,
    icon: Icons.vibration,
    color: Color(0xFF00897B),
  ),
  _DangerSignItem(
    title: 'Difficulty breathing',
    detail: 'Fast breathing, chest in-drawing, or noisy breathing is an emergency.',
    imagePath: null,
    icon: Icons.air,
    color: Color(0xFF1565C0),
  ),
  _DangerSignItem(
    title: 'Not moving as normal',
    detail: 'If the baby is weak or not moving normally, seek care immediately.',
    imagePath: null,
    icon: Icons.accessibility_new,
    color: Color(0xFF455A64),
  ),
  _DangerSignItem(
    title: 'Not active / very sleepy',
    detail: 'If your baby does not wake or feed well, this can be dangerous.',
    imagePath: null,
    icon: Icons.bedtime,
    color: Color(0xFF5E35B1),
  ),
  _DangerSignItem(
    title: 'Fever or cold body',
    detail: 'Very hot or cold body temperature in newborns needs urgent treatment.',
    imagePath: null,
    icon: Icons.thermostat,
    color: Color(0xFF00838F),
  ),
];
