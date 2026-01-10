import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';
import 'package:pesa_shop/utils/style_helper.dart';

class HeadingBlock extends StatelessWidget {
  final BlockModel block;
  final Map<String, dynamic>? context;

  const HeadingBlock({
    Key? key,
    required this.block,
    this.context,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final text = block.config['text'] ?? '';
    final level = block.config['level'] ?? 1;

    final textStyle = StyleHelper.buildTextStyle(block.style).copyWith(
      fontSize: block.style?.fontSize ?? _getDefaultFontSize(level),
      fontWeight: FontWeight.bold,
    );

    return Text(
      text,
      style: textStyle,
    );
  }

  double _getDefaultFontSize(int level) {
    switch (level) {
      case 1:
        return 32.0;
      case 2:
        return 28.0;
      case 3:
        return 24.0;
      case 4:
        return 20.0;
      case 5:
        return 18.0;
      case 6:
        return 16.0;
      default:
        return 24.0;
    }
  }
}
