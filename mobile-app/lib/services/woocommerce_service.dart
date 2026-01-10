import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pesa_shop/services/config_service.dart';

class WooCommerceService {
  static final WooCommerceService instance = WooCommerceService._internal();

  factory WooCommerceService() {
    return instance;
  }

  WooCommerceService._internal();

  String? _consumerKey;
  String? _consumerSecret;
  String? _baseUrl;

  Future<void> initialize(String consumerKey, String consumerSecret) async {
    _consumerKey = consumerKey;
    _consumerSecret = consumerSecret;
    _baseUrl = ConfigService.instance.baseUrl;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('wc_consumer_key', consumerKey);
    await prefs.setString('wc_consumer_secret', consumerSecret);
  }

  Future<void> loadCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    _consumerKey = prefs.getString('wc_consumer_key');
    _consumerSecret = prefs.getString('wc_consumer_secret');
    _baseUrl = ConfigService.instance.baseUrl;
  }

  bool get isInitialized => _consumerKey != null && _consumerSecret != null;

  String _buildUrl(String endpoint, {Map<String, String>? queryParams}) {
    final params = queryParams ?? {};
    params['consumer_key'] = _consumerKey!;
    params['consumer_secret'] = _consumerSecret!;

    final uri = Uri.parse('$_baseUrl/wp-json/wc/v3/$endpoint');
    return uri.replace(queryParameters: params).toString();
  }

  Future<Map<String, dynamic>> _makeRequest(
    String method,
    String endpoint, {
    Map<String, String>? queryParams,
    Map<String, dynamic>? body,
  }) async {
    if (!isInitialized) {
      throw Exception('WooCommerce service not initialized');
    }

    final url = _buildUrl(endpoint, queryParams: queryParams);
    http.Response response;

    switch (method.toUpperCase()) {
      case 'GET':
        response = await http.get(Uri.parse(url));
        break;
      case 'POST':
        response = await http.post(
          Uri.parse(url),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(body),
        );
        break;
      case 'PUT':
        response = await http.put(
          Uri.parse(url),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(body),
        );
        break;
      case 'DELETE':
        response = await http.delete(Uri.parse(url));
        break;
      default:
        throw Exception('Unsupported HTTP method: $method');
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }

  // Products
  Future<List<dynamic>> getProducts({
    int page = 1,
    int perPage = 10,
    String? category,
    String? search,
    String orderBy = 'date',
    String order = 'desc',
  }) async {
    final queryParams = {
      'page': page.toString(),
      'per_page': perPage.toString(),
      'orderby': orderBy,
      'order': order,
    };

    if (category != null) {
      queryParams['category'] = category;
    }

    if (search != null) {
      queryParams['search'] = search;
    }

    final response = await _makeRequest('GET', 'products', queryParams: queryParams);
    return response is List ? response : [response];
  }

  Future<Map<String, dynamic>> getProduct(int productId) async {
    return await _makeRequest('GET', 'products/$productId');
  }

  // Categories
  Future<List<dynamic>> getCategories({
    int page = 1,
    int perPage = 100,
    int parent = 0,
  }) async {
    final queryParams = {
      'page': page.toString(),
      'per_page': perPage.toString(),
      'parent': parent.toString(),
    };

    final response = await _makeRequest('GET', 'products/categories', queryParams: queryParams);
    return response is List ? response : [response];
  }

  // Cart (requires WooCommerce Cart REST API plugin or custom endpoints)
  Future<Map<String, dynamic>> getCart() async {
    // Note: This requires additional WooCommerce cart endpoints
    // You may need to implement custom endpoints or use a cart plugin
    return await _makeRequest('GET', 'cart');
  }

  Future<Map<String, dynamic>> addToCart(int productId, int quantity) async {
    return await _makeRequest('POST', 'cart/add', body: {
      'product_id': productId,
      'quantity': quantity,
    });
  }

  Future<Map<String, dynamic>> updateCartItem(String itemKey, int quantity) async {
    return await _makeRequest('PUT', 'cart/item/$itemKey', body: {
      'quantity': quantity,
    });
  }

  Future<Map<String, dynamic>> removeCartItem(String itemKey) async {
    return await _makeRequest('DELETE', 'cart/item/$itemKey');
  }

  // Orders
  Future<List<dynamic>> getOrders({
    int page = 1,
    int perPage = 10,
    int? customerId,
  }) async {
    final queryParams = {
      'page': page.toString(),
      'per_page': perPage.toString(),
    };

    if (customerId != null) {
      queryParams['customer'] = customerId.toString();
    }

    final response = await _makeRequest('GET', 'orders', queryParams: queryParams);
    return response is List ? response : [response];
  }

  Future<Map<String, dynamic>> getOrder(int orderId) async {
    return await _makeRequest('GET', 'orders/$orderId');
  }

  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> orderData) async {
    return await _makeRequest('POST', 'orders', body: orderData);
  }

  // Customers
  Future<Map<String, dynamic>> getCustomer(int customerId) async {
    return await _makeRequest('GET', 'customers/$customerId');
  }

  Future<Map<String, dynamic>> createCustomer(Map<String, dynamic> customerData) async {
    return await _makeRequest('POST', 'customers', body: customerData);
  }

  Future<Map<String, dynamic>> updateCustomer(int customerId, Map<String, dynamic> customerData) async {
    return await _makeRequest('PUT', 'customers/$customerId', body: customerData);
  }
}
