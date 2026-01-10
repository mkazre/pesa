import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pesa_shop/services/config_service.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class AuthService {
  static final AuthService instance = AuthService._internal();

  factory AuthService() {
    return instance;
  }

  AuthService._internal();

  String? _token;
  Map<String, dynamic>? _user;
  bool _isLoggedIn = false;

  bool get isLoggedIn => _isLoggedIn;
  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  int? get userId => _user?['id'];
  String? get userEmail => _user?['email'];
  String? get userName => _user?['name'];

  Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    final userJson = prefs.getString('user_data');

    if (_token != null && userJson != null) {
      try {
        // Check if token is expired
        if (!JwtDecoder.isExpired(_token!)) {
          _user = jsonDecode(userJson);
          _isLoggedIn = true;
        } else {
          // Token expired, clear data
          await logout();
        }
      } catch (e) {
        print('Error loading auth data: $e');
        await logout();
      }
    }
  }

  Future<bool> login(String username, String password) async {
    final baseUrl = ConfigService.instance.baseUrl;
    if (baseUrl == null) {
      throw Exception('Base URL not set');
    }

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/wp-json/jwt-auth/v1/token'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        _user = {
          'id': data['user_id'],
          'email': data['user_email'],
          'name': data['user_nicename'],
          'displayName': data['user_display_name'],
        };
        _isLoggedIn = true;

        // Save to shared preferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        await prefs.setString('user_data', jsonEncode(_user));

        return true;
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Login failed');
      }
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  Future<bool> register(String username, String email, String password) async {
    final baseUrl = ConfigService.instance.baseUrl;
    if (baseUrl == null) {
      throw Exception('Base URL not set');
    }

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/wp-json/wp/v2/users/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Auto-login after registration
        return await login(username, password);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Registration failed');
      }
    } catch (e) {
      throw Exception('Registration error: $e');
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    _isLoggedIn = false;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }

  Future<Map<String, dynamic>> getProfile() async {
    if (!_isLoggedIn || _token == null) {
      throw Exception('Not logged in');
    }

    final baseUrl = ConfigService.instance.baseUrl;
    if (baseUrl == null) {
      throw Exception('Base URL not set');
    }

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/wp-json/wp/v2/users/me'),
        headers: {
          'Authorization': 'Bearer $_token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _user = {
          'id': data['id'],
          'email': data['email'],
          'name': data['name'],
          'displayName': data['name'],
        };

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(_user));

        return _user!;
      } else {
        throw Exception('Failed to get profile');
      }
    } catch (e) {
      throw Exception('Profile error: $e');
    }
  }

  Future<Map<String, String>> getAuthHeaders() async {
    if (_token == null) {
      return {};
    }

    return {
      'Authorization': 'Bearer $_token',
      'Content-Type': 'application/json',
    };
  }

  List<String> getUserRoles() {
    if (_user == null) return [];
    return (_user!['roles'] as List?)?.cast<String>() ?? [];
  }
}
