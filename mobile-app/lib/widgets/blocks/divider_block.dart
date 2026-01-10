import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';
import 'package:pesa_shop/utils/style_helper.dart';

class DividerBlock extends StatelessWidget {
  final BlockModel block;

  const DividerBlock({Key? key, required this.block}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final color = block.config['color'];
    final thickness = (block.config['thickness'] ?? 1).toDouble();
    final margin = block.config['margin'];

    Widget divider = Divider(
      color: color != null ? _parseColor(color) : null,
      thickness: thickness,
    );

    if (margin != null) {
      divider = Padding(
        padding: _parseEdgeInsets(margin),
        child: divider,
      );
    }

    return divider;
  }

  Color _parseColor(String hexColor) {
    hexColor = hexColor.replaceAll('#', '');
    if (hexColor.length == 6) {
      hexColor = 'FF$hexColor';
    }
    return Color(int.parse(hexColor, radix: 16));
  }

  EdgeInsets _parseEdgeInsets(Map<String, dynamic> margin) {
    return EdgeInsets.only(
      top: (margin['top'] ?? 0).toDouble(),
      bottom: (margin['bottom'] ?? 0).toDouble(),
    );
  }
}
