import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pesa_shop/models/app_config.dart';
import 'package:pesa_shop/models/theme_config.dart';

class ConfigService {
  static final ConfigService instance = ConfigService._internal();

  factory ConfigService() {
    return instance;
  }

  ConfigService._internal();

  AppConfig? _appConfig;
  String? _baseUrl;
  bool _initialized = false;

  AppConfig? get appConfig => _appConfig;
  String? get baseUrl => _baseUrl;
  bool get initialized => _initialized;

  // Quick access getters
  String? get siteName => _appConfig?.site.name;
  String? get siteUrl => _appConfig?.site.url;
  ThemeConfig get themeConfig => _appConfig?.theme ?? ThemeConfig.fromJson({});

  Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();

    // Get base URL from shared preferences or use default
    _baseUrl = prefs.getString('base_url') ?? 'https://your-site.com';

    // Try to load cached config
    final cachedConfig = prefs.getString('app_config');
    if (cachedConfig != null) {
      try {
        _appConfig = AppConfig.fromJson(jsonDecode(cachedConfig));
        _initialized = true;
      } catch (e) {
        print('Error loading cached config: $e');
      }
    }

    // Fetch fresh config from server
    try {
      await fetchConfig();
    } catch (e) {
      print('Error fetching config: $e');
      // If we have cached config, initialization is still successful
      if (_appConfig != null) {
        _initialized = true;
      }
    }
  }

  Future<void> setBaseUrl(String url) async {
    _baseUrl = url;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('base_url', url);
    await fetchConfig();
  }

  Future<AppConfig> fetchConfig() async {
    if (_baseUrl == null) {
      throw Exception('Base URL not set');
    }

    final url = '$_baseUrl/wp-json/pesa-shop/v1/config/app';

    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body);
        _appConfig = AppConfig.fromJson(jsonData);
        _initialized = true;

        // Cache the config
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('app_config', response.body);

        return _appConfig!;
      } else {
        throw Exception('Failed to load config: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching config: $e');
    }
  }

  Future<void> clearCache() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('app_config');
    _appConfig = null;
    _initialized = false;
  }

  Future<void> refreshConfig() async {
    await fetchConfig();
  }
}
