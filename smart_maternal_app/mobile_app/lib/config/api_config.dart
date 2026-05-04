import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;

/// Smart Maternal Nest API base URL, including the global `/api` prefix.
///
/// - Full override: `--dart-define=API_BASE_URL=http://192.168.1.10:3001/api`
/// - Physical phone: `--dart-define=API_HOST=192.168.1.10` (optional `API_PORT`)
///
/// When no host/port override is set, [apiRootCandidates] tries **3001 then 3000**
/// (common Nest defaults) so the app matches your machine without backend changes.
class ApiConfig {
  ApiConfig._();

  /// Set after a successful login so later calls use the same host/port.
  static String? _sessionApiRoot;

  static void setSessionApiRoot(String? root) {
    _sessionApiRoot = (root == null || root.isEmpty) ? null : root;
  }

  /// Ordered list of API roots to try on login (connection errors only).
  static List<String> get apiRootCandidates {
    const override = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (override.isNotEmpty) return [override.trim()];

    const hostOnly = String.fromEnvironment('API_HOST', defaultValue: '');
    const portEnv = String.fromEnvironment('API_PORT', defaultValue: '');
    if (hostOnly.isNotEmpty) {
      final port = portEnv.isNotEmpty ? portEnv : '3001';
      return ['http://$hostOnly:$port/api'];
    }
    if (portEnv.isNotEmpty) {
      return [_builtInHost(portEnv)];
    }
    if (kIsWeb) {
      return ['http://localhost:3001/api', 'http://localhost:3000/api'];
    }
    if (!kIsWeb && Platform.isAndroid) {
      return ['http://10.0.2.2:3001/api', 'http://10.0.2.2:3000/api'];
    }
    return ['http://localhost:3001/api', 'http://localhost:3000/api'];
  }

  static String _builtInHost(String port) {
    if (kIsWeb) return 'http://localhost:$port/api';
    if (!kIsWeb && Platform.isAndroid) return 'http://10.0.2.2:$port/api';
    return 'http://localhost:$port/api';
  }

  static String get baseUrl => _sessionApiRoot ?? apiRootCandidates.first;

  static String get authBase => '${baseUrl}/auth';
}
