import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';
import 'package:pesa_shop/utils/style_helper.dart';

class TextBlock extends StatelessWidget {
  final BlockModel block;
  final Map<String, dynamic>? context;

  const TextBlock({
    Key? key,
    required this.block,
    this.context,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final text = block.config['text'] ?? '';
    final isDynamic = block.config['isDynamic'] ?? false;
    final textAlign = StyleHelper.parseTextAlign(block.style?.textAlign);

    String displayText = text;

    // Handle dynamic text
    if (isDynamic && this.context != null) {
      final dynamicSource = block.config['dynamicSource'];
      if (dynamicSource != null && this.context!.containsKey(dynamicSource)) {
        displayText = this.context![dynamicSource].toString();
      }
    }

    return Text(
      displayText,
      textAlign: textAlign,
      style: StyleHelper.buildTextStyle(block.style),
    );
  }
}
