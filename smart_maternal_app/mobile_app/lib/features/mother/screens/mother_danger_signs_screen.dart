import 'package:flutter/material.dart';

class MotherDangerSignsScreen extends StatelessWidget {
  const MotherDangerSignsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFFFF4F8), Color(0xFFF7FBFF), Color(0xFFFFFFFF)],
          ),
        ),
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                expandedHeight: 168,
                backgroundColor: const Color(0xFFC2185B),
                flexibleSpace: FlexibleSpaceBar(
                  titlePadding: const EdgeInsetsDirectional.only(start: 16, bottom: 16),
                  title: const Text(
                    'Danger Signs Advice',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
                  ),
                  background: Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFFE91E63), Color(0xFFAD1457), Color(0xFF6A1B9A)],
                      ),
                    ),
                    child: const Padding(
                      padding: EdgeInsets.fromLTRB(16, 72, 16, 20),
                      child: Align(
                        alignment: Alignment.bottomLeft,
                        child: Text(
                          'Know the signs.\nAct fast. Save lives.',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                            height: 1.35,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                sliver: SliverList(
                  delegate: SliverChildListDelegate(
                    [
                      _SectionHeader(
                        title: 'For Mother (After Birth)',
                        subtitle: 'Go to a health facility quickly if you see any of these signs.',
                        color: const Color(0xFFC62828),
                      ),
                      const SizedBox(height: 12),
                      ..._motherSigns.map((sign) => _DangerSignCard(item: sign)),
                      const SizedBox(height: 18),
                      _SectionHeader(
                        title: 'For Child (Newborn)',
                        subtitle: 'Seek urgent care if your baby has these warning signs.',
                        color: const Color(0xFF1565C0),
                      ),
                      const SizedBox(height: 12),
                      ..._childSigns.map((sign) => _DangerSignCard(item: sign)),
                      const SizedBox(height: 8),
                      const _EmergencyHelpCard(),
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
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withOpacity(0.12), color.withOpacity(0.04)],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withOpacity(0.24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(color: Colors.black87),
          ),
        ],
      ),
    );
  }
}

class _DangerSignCard extends StatelessWidget {
  final _DangerSignItem item;
  const _DangerSignCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1.8,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                width: 102,
                height: 102,
                child: Image.asset(
                  item.imagePath,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [item.color.withOpacity(0.22), item.color.withOpacity(0.08)],
                      ),
                    ),
                    child: Icon(item.icon, color: item.color, size: 34),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.detail,
                    style: const TextStyle(
                      color: Colors.black87,
                      height: 1.34,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: item.color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      'Urgent sign',
                      style: TextStyle(
                        color: item.color,
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DangerSignItem {
  final String title;
  final String detail;
  final String imagePath;
  final IconData icon;
  final Color color;

  const _DangerSignItem({
    required this.title,
    required this.detail,
    required this.imagePath,
    required this.icon,
    required this.color,
  });
}

class _EmergencyHelpCard extends StatelessWidget {
  const _EmergencyHelpCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF3E0), Color(0xFFFFF8E1)],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFFCC80)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.support_agent, color: Color(0xFFEF6C00)),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'If you are not sure, treat it as an emergency. Go to the nearest health center or call your provider now.',
              style: TextStyle(height: 1.35),
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
    imagePath: 'assets/images/danger_mother_bleeding.jpg',
    icon: Icons.bloodtype,
    color: Color(0xFFC62828),
  ),
  _DangerSignItem(
    title: 'Fainting (እራስ መሳት)',
    detail: 'Sudden dizziness or loss of consciousness needs immediate medical help.',
    imagePath: 'assets/images/danger_mother_fainting.jpg',
    icon: Icons.warning_amber_rounded,
    color: Color(0xFFEF6C00),
  ),
  _DangerSignItem(
    title: 'Bad-smelling discharge',
    detail: 'A strong foul smell may be a sign of infection and should be checked fast.',
    imagePath: 'assets/images/danger_mother_discharge.jpg',
    icon: Icons.sick,
    color: Color(0xFF6A1B9A),
  ),
  _DangerSignItem(
    title: 'Severe headache',
    detail: 'Strong headache with blurred vision or swelling can be dangerous.',
    imagePath: 'assets/images/danger_mother_headache.jpg',
    icon: Icons.psychology_alt,
    color: Color(0xFF283593),
  ),
];

const List<_DangerSignItem> _childSigns = [
  _DangerSignItem(
    title: 'Yellow body/eyes',
    detail: 'Yellow skin or eyes can mean jaundice; the baby needs quick evaluation.',
    imagePath: 'assets/images/danger_child_jaundice.jpg',
    icon: Icons.wb_sunny,
    color: Color(0xFFF9A825),
  ),
  _DangerSignItem(
    title: 'Shaking (መንቀጥቀጥ)',
    detail: 'Repeated shaking can be a serious sign. Go to a facility immediately.',
    imagePath: 'assets/images/danger_child_shaking.jpg',
    icon: Icons.vibration,
    color: Color(0xFF00897B),
  ),
  _DangerSignItem(
    title: 'Difficulty breathing',
    detail: 'Fast breathing, chest in-drawing, or noisy breathing is an emergency.',
    imagePath: 'assets/images/danger_child_breathing.jpg',
    icon: Icons.air,
    color: Color(0xFF1565C0),
  ),
  _DangerSignItem(
    title: 'Not moving as normal',
    detail: 'If the baby is weak or not moving normally, seek care immediately.',
    imagePath: 'assets/images/danger_child_not_moving.jpg',
    icon: Icons.accessibility_new,
    color: Color(0xFF455A64),
  ),
  _DangerSignItem(
    title: 'Not active / very sleepy',
    detail: 'If your baby does not wake or feed well, this can be dangerous.',
    imagePath: 'assets/images/danger_child_not_active.jpg',
    icon: Icons.bedtime,
    color: Color(0xFF5E35B1),
  ),
  _DangerSignItem(
    title: 'Fever or cold body',
    detail: 'Very hot or cold body temperature in newborns needs urgent treatment.',
    imagePath: 'assets/images/danger_child_temp.jpg',
    icon: Icons.thermostat,
    color: Color(0xFF00838F),
  ),
];
