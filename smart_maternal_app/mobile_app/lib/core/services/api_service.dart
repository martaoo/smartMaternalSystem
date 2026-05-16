import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';

class ApiService {
  final String _baseUrl;
  
  ApiService() : _baseUrl = ApiConstants.baseUrl;
  
  Future<http.Response> get(String endpoint, {String? token}) async {
    final url = Uri.parse('$_baseUrl$endpoint');
    final headers = _buildHeaders(token);
    
    return await http.get(
      url,
      headers: headers,
    ).timeout(
      Duration(milliseconds: ApiConstants.connectionTimeout),
    );
  }
  
  Future<http.Response> post(String endpoint, {Map<String, dynamic>? body, String? token}) async {
    final url = Uri.parse('$_baseUrl$endpoint');
    final headers = _buildHeaders(token);
    
    return await http.post(
      url,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    ).timeout(
      Duration(milliseconds: ApiConstants.connectionTimeout),
    );
  }
  
  Future<http.Response> put(String endpoint, {Map<String, dynamic>? body, String? token}) async {
    final url = Uri.parse('$_baseUrl$endpoint');
    final headers = _buildHeaders(token);
    
    return await http.put(
      url,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    ).timeout(
      Duration(milliseconds: ApiConstants.connectionTimeout),
    );
  }

  Future<http.Response> patch(String endpoint, {Map<String, dynamic>? body, String? token}) async {
    final url = Uri.parse('$_baseUrl$endpoint');
    final headers = _buildHeaders(token);
    
    return await http.patch(
      url,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    ).timeout(
      Duration(milliseconds: ApiConstants.connectionTimeout),
    );
  }
  
  Future<http.Response> delete(String endpoint, {String? token}) async {
    final url = Uri.parse('$_baseUrl$endpoint');
    final headers = _buildHeaders(token);
    
    return await http.delete(
      url,
      headers: headers,
    ).timeout(
      Duration(milliseconds: ApiConstants.connectionTimeout),
    );
  }
  
  Map<String, String> _buildHeaders(String? token) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    return headers;
  }
}
