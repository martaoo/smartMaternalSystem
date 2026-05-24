import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../routes/app_routes.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Palette
// ─────────────────────────────────────────────────────────────────────────────
class _P {
  static const bg          = Color(0xFFFFF8F5);   // warm cream background
  static const brownDeep   = Color(0xFF4E342E);
  static const brownRich   = Color(0xFF6D4C41);
  static const brownWarm   = Color(0xFF8D6E63);
  static const brownLight  = Color(0xFFD7CCC8);
  static const gold        = Color(0xFFFFB74D);
  static const green       = Color(0xFF66BB6A);
  static const blue        = Color(0xFF42A5F5);
  static const red         = Color(0xFFEF5350);
  static const pink        = Color(0xFFE91E63);
  static const textDark    = Color(0xFF3E2723);
  static const textMid     = Color(0xFF6D4C41);
  static const textSoft    = Color(0xFF8D6E63);
}

// ─────────────────────────────────────────────────────────────────────────────
// Landing screen
// ─────────────────────────────────────────────────────────────────────────────
class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});
  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen>
    with TickerProviderStateMixin {

  late final AnimationController _entryCtrl;
  late final AnimationController _pulseCtrl;
  late final AnimationController _shimmerCtrl;

  late final Animation<double>  _fadeAnim;
  late final Animation<Offset>  _slideAnim;
  late final Animation<double>  _imgScaleAnim;
  late final Animation<double>  _pulseAnim;
  late final Animation<double>  _shimmerAnim;

  bool _amharic = false;

  // ── Strings ─────────────────────────────────────────────────────────────────
  String get _title    => _amharic ? 'ብልህ የእናቶች ጤና ስርዓት'  : 'Smart Maternal\nHealth System';
  String get _subtitle => _amharic
      ? 'ደህንነቱ የተጠበቀ እርግዝና እና የሕፃናት ጤና አጠባበቅ ድጋፍ'
      : 'Supporting mothers & babies through\nsafe pregnancy and child healthcare.';
  String get _btnLabel => _amharic ? 'ወደ መለያዎ ይግቡ' : 'Sign In';
  String get _footer   => _amharic ? 'የጤና ጉዞዎ እዚህ ይጀምራል 💖' : 'Your health journey starts here 💖';

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ));

    _entryCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1000));
    _pulseCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 2200))
      ..repeat(reverse: true);
    _shimmerCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 2600))
      ..repeat();

    _fadeAnim = CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.10), end: Offset.zero)
        .animate(CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOutCubic));
    _imgScaleAnim = Tween<double>(begin: 1.06, end: 1.0)
        .animate(CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOutCubic));
    _pulseAnim = Tween<double>(begin: 1.0, end: 1.035)
        .animate(CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
    _shimmerAnim = Tween<double>(begin: -2.0, end: 3.0)
        .animate(CurvedAnimation(parent: _shimmerCtrl, curve: Curves.linear));

    _entryCtrl.forward();
  }

  @override
  void dispose() {
    _entryCtrl.dispose();
    _pulseCtrl.dispose();
    _shimmerCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size   = MediaQuery.of(context).size;
    final top    = MediaQuery.of(context).padding.top;
    final bottom = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: _P.bg,
      body: Column(
        children: [
          // ── TOP SECTION: header + image (55% of screen) ──────────────────
          SizedBox(
            height: size.height * 0.55,
            child: Stack(
              fit: StackFit.expand,
              children: [

                // ── Full-bleed image ────────────────────────────────────────
                ScaleTransition(
                  scale: _imgScaleAnim,
                  child: Image.asset(
                    'assets/images/pregnant_mother2.jpg',
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                  ),
                ),

                // ── Bottom gradient so text is readable ─────────────────────
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      stops: [0.0, 0.40, 0.75, 1.0],
                      colors: [
                        Color(0x00000000),
                        Color(0x18000000),
                        Color(0x88000000),
                        Color(0xDD000000),
                      ],
                    ),
                  ),
                ),

                // ── Top header bar ──────────────────────────────────────────
                Positioned(
                  top: top + 12,
                  left: 20,
                  right: 20,
                  child: FadeTransition(
                    opacity: _fadeAnim,
                    child: _buildHeader(),
                  ),
                ),

                // ── Title text over image bottom ────────────────────────────
                Positioned(
                  left: 24,
                  right: 24,
                  bottom: 24,
                  child: FadeTransition(
                    opacity: _fadeAnim,
                    child: SlideTransition(
                      position: _slideAnim,
                      child: _buildImageTitle(),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── BOTTOM SECTION: features + button (45% of screen) ────────────
          Expanded(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SlideTransition(
                position: _slideAnim,
                child: _buildBottomContent(bottom),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Header bar ───────────────────────────────────────────────────────────────
  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Logo
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.30),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: Colors.white.withOpacity(0.25)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(5),
                decoration: const BoxDecoration(
                  color: _P.pink,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.favorite_rounded, color: Colors.white, size: 11),
              ),
              const SizedBox(width: 8),
              const Text(
                'SMHS',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  letterSpacing: 2.0,
                ),
              ),
            ],
          ),
        ),

        // Language toggle
        GestureDetector(
          onTap: () => setState(() => _amharic = !_amharic),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.30),
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: Colors.white.withOpacity(0.25)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _langChip('EN',  !_amharic),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4),
                  child: Text('·', style: TextStyle(color: Colors.white38, fontSize: 12)),
                ),
                _langChip('አማ', _amharic),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _langChip(String label, bool active) => Text(
    label,
    style: TextStyle(
      color: active ? Colors.white : Colors.white38,
      fontWeight: active ? FontWeight.bold : FontWeight.normal,
      fontSize: 12,
    ),
  );

  // ── Title over image ─────────────────────────────────────────────────────────
  Widget _buildImageTitle() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Pill tag
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
          decoration: BoxDecoration(
            color: _P.pink.withOpacity(0.85),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.verified_rounded, color: Colors.white, size: 12),
              const SizedBox(width: 5),
              Text(
                _amharic ? 'ኦፊሴላዊ ስርዓት' : 'Official Health System',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        Text(
          _title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 30,
            fontWeight: FontWeight.bold,
            height: 1.2,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _subtitle,
          style: TextStyle(
            color: Colors.white.withOpacity(0.80),
            fontSize: 13,
            height: 1.55,
          ),
        ),
      ],
    );
  }

  // ── Bottom content ────────────────────────────────────────────────────────────
  Widget _buildBottomContent(double bottomPadding) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: _P.bg,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.fromLTRB(24, 28, 24, 16 + bottomPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // ── Stats row ─────────────────────────────────────────────────
            _buildStatsRow(),
            const SizedBox(height: 24),

            // ── Section label ─────────────────────────────────────────────
            Text(
              _amharic ? 'ዋና ባህሪያት' : 'Key Features',
              style: const TextStyle(
                color: _P.textDark,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 14),

            // ── Feature grid ──────────────────────────────────────────────
            _buildFeatureGrid(),
            const SizedBox(height: 28),

            // ── Sign In button ────────────────────────────────────────────
            _buildSignInButton(),
            const SizedBox(height: 16),

            // ── Footer ───────────────────────────────────────────────────
            Center(
              child: Text(
                _footer,
                style: const TextStyle(
                  color: _P.textSoft,
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Stats row ─────────────────────────────────────────────────────────────────
  Widget _buildStatsRow() {
    final stats = _amharic
        ? [('10K+', 'እናቶች', _P.pink), ('98%', 'ደህንነት', _P.green), ('24/7', 'ድጋፍ', _P.blue)]
        : [('10K+', 'Mothers', _P.pink), ('98%', 'Safe Births', _P.green), ('24/7', 'Support', _P.blue)];

    return Row(
      children: stats.map((s) {
        final isLast = stats.indexOf(s) == stats.length - 1;
        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: isLast ? 0 : 12),
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              children: [
                Text(
                  s.$1,
                  style: TextStyle(
                    color: s.$3,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  s.$2,
                  style: const TextStyle(
                    color: _P.textSoft,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  // ── Feature grid ──────────────────────────────────────────────────────────────
  Widget _buildFeatureGrid() {
    final features = _amharic
        ? [
            _Feat(Icons.calendar_month_rounded, 'ቀጠሮ ክትትል',    'ሁሉም ቀጠሮዎችዎን ይከታተሉ',          _P.blue),
            _Feat(Icons.vaccines_rounded,        'ክትባት ማሳወቂያ',  'ለልጅዎ ክትባቶች ማሳወቂያ ያግኙ',       _P.green),
            _Feat(Icons.emergency_rounded,       'አደጋ ጊዜ ድጋፍ', 'ፈጣን የጤና ድጋፍ ያግኙ',             _P.red),
            _Feat(Icons.child_care_rounded,      'ሕፃን ዕድገት',    'የልጅዎን ዕድገት ይከታተሉ',           _P.gold),
          ]
        : [
            _Feat(Icons.calendar_month_rounded, 'ANC Tracking',      'Track all your prenatal visits',    _P.blue),
            _Feat(Icons.vaccines_rounded,        'Vaccine Reminders', 'Never miss baby\'s immunizations',  _P.green),
            _Feat(Icons.emergency_rounded,       'Emergency SOS',     'Quick access to urgent support',    _P.red),
            _Feat(Icons.child_care_rounded,      'Child Growth',      'Monitor your baby\'s development',  _P.gold),
          ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.55,
      children: features.map((f) => _FeatureCard(feat: f)).toList(),
    );
  }

  // ── Sign In button ────────────────────────────────────────────────────────────
  Widget _buildSignInButton() {
    return AnimatedBuilder(
      animation: _pulseAnim,
      builder: (_, child) => Transform.scale(scale: _pulseAnim.value, child: child),
      child: GestureDetector(
        onTap: () => Navigator.pushReplacementNamed(context, AppRoutes.login),
        child: Container(
          height: 58,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(30),
            gradient: const LinearGradient(
              colors: [_P.brownDeep, _P.brownRich, _P.brownWarm],
            ),
            boxShadow: [
              BoxShadow(
                color: _P.brownRich.withOpacity(0.45),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Shimmer sweep
              ClipRRect(
                borderRadius: BorderRadius.circular(30),
                child: AnimatedBuilder(
                  animation: _shimmerAnim,
                  builder: (_, __) => Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment(_shimmerAnim.value - 1, 0),
                        end: Alignment(_shimmerAnim.value, 0),
                        colors: [
                          Colors.transparent,
                          Colors.white.withOpacity(0.10),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              // Label
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _btnLabel,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.4,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.20),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.arrow_forward_rounded,
                        color: Colors.white,
                        size: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature data
// ─────────────────────────────────────────────────────────────────────────────
class _Feat {
  final IconData icon;
  final String   title;
  final String   desc;
  final Color    color;
  const _Feat(this.icon, this.title, this.desc, this.color);
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature card
// ─────────────────────────────────────────────────────────────────────────────
class _FeatureCard extends StatelessWidget {
  final _Feat feat;
  const _FeatureCard({required this.feat});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: feat.color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(feat.icon, color: feat.color, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  feat.title,
                  style: const TextStyle(
                    color: _P.textDark,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  feat.desc,
                  style: const TextStyle(
                    color: _P.textSoft,
                    fontSize: 10,
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
