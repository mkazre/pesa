import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:pesa_shop/models/block_model.dart';
import 'package:pesa_shop/utils/style_helper.dart';

class ButtonBlock extends StatelessWidget {
  final BlockModel block;
  final Map<String, dynamic>? context;

  const ButtonBlock({Key? key, required this.block, this.context}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final text = block.config['text'] ?? 'Button';
    final action = block.config['action'] ?? {};

    return ElevatedButton(
      onPressed: () => _handleAction(context, action),
      style: _buildButtonStyle(),
      child: Text(text),
    );
  }

  ButtonStyle _buildButtonStyle() {
    final style = block.style;
    if (style == null) return ElevatedButton.styleFrom();

    return ElevatedButton.styleFrom(
      backgroundColor: style.backgroundColor != null
          ? StyleHelper._parseColor(style.backgroundColor!)
          : null,
      foregroundColor: style.textColor != null
          ? StyleHelper._parseColor(style.textColor!)
          : null,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(style.borderRadius ?? 4),
      ),
      padding: style.padding != null
          ? StyleHelper._parseEdgeInsets(style.padding!)
          : null,
    );
  }

  void _handleAction(BuildContext context, Map<String, dynamic> action) {
    final actionType = action['type'] ?? 'none';

    switch (actionType) {
      case 'navigate':
        final route = action['route'];
        if (route != null) {
          context.go(route);
        }
        break;
      case 'url':
        final url = action['url'];
        // Handle external URL
        break;
      case 'custom':
        // Handle custom action
        break;
      default:
        break;
    }
  }
}

// Extension to access private methods from StyleHelper
extension StyleHelperExtension on StyleHelper {
  static Color _parseColor(String hexColor) {
    hexColor = hexColor.replaceAll('#', '');
    if (hexColor.length == 6) {
      hexColor = 'FF$hexColor';
    }
    return Color(int.parse(hexColor, radix: 16));
  }

  static EdgeInsets _parseEdgeInsets(Map<String, dynamic> padding) {
    return EdgeInsets.only(
      top: (padding['top'] ?? 0).toDouble(),
      right: (padding['right'] ?? 0).toDouble(),
      bottom: (padding['bottom'] ?? 0).toDouble(),
      left: (padding['left'] ?? 0).toDouble(),
    );
  }
}
