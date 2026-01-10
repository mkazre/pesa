import 'package:flutter/material.dart';

class ThemeConfig {
  final String primaryColor;
  final String secondaryColor;
  final String backgroundColor;
  final String textColor;
  final String fontFamily;

  ThemeConfig({
    required this.primaryColor,
    required this.secondaryColor,
    required this.backgroundColor,
    required this.textColor,
    required this.fontFamily,
  });

  factory ThemeConfig.fromJson(Map<String, dynamic> json) {
    return ThemeConfig(
      primaryColor: json['primaryColor'] ?? '#007bff',
      secondaryColor: json['secondaryColor'] ?? '#6c757d',
      backgroundColor: json['backgroundColor'] ?? '#ffffff',
      textColor: json['textColor'] ?? '#000000',
      fontFamily: json['fontFamily'] ?? 'Roboto',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'primaryColor': primaryColor,
      'secondaryColor': secondaryColor,
      'backgroundColor': backgroundColor,
      'textColor': textColor,
      'fontFamily': fontFamily,
    };
  }

  Color get primaryColorValue => _parseColor(primaryColor);
  Color get secondaryColorValue => _parseColor(secondaryColor);
  Color get backgroundColorValue => _parseColor(backgroundColor);
  Color get textColorValue => _parseColor(textColor);

  Color _parseColor(String hexColor) {
    hexColor = hexColor.replaceAll('#', '');
    if (hexColor.length == 6) {
      hexColor = 'FF$hexColor';
    }
    return Color(int.parse(hexColor, radix: 16));
  }
}
