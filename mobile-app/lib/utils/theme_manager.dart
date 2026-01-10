import 'package:flutter/material.dart';
import 'package:pesa_shop/models/theme_config.dart';

class ThemeManager {
  static ThemeData buildTheme(ThemeConfig config) {
    return ThemeData(
      primaryColor: config.primaryColorValue,
      colorScheme: ColorScheme.fromSeed(
        seedColor: config.primaryColorValue,
        secondary: config.secondaryColorValue,
      ),
      scaffoldBackgroundColor: config.backgroundColorValue,
      textTheme: TextTheme(
        bodyLarge: TextStyle(
          color: config.textColorValue,
          fontFamily: config.fontFamily,
        ),
        bodyMedium: TextStyle(
          color: config.textColorValue,
          fontFamily: config.fontFamily,
        ),
        bodySmall: TextStyle(
          color: config.textColorValue,
          fontFamily: config.fontFamily,
        ),
      ),
      fontFamily: config.fontFamily,
      appBarTheme: AppBarTheme(
        backgroundColor: config.primaryColorValue,
        foregroundColor: Colors.white,
        elevation: 2,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: config.primaryColorValue,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        filled: true,
        fillColor: Colors.grey[100],
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}
