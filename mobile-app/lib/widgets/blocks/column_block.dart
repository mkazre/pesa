import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';
import 'package:pesa_shop/widgets/block_renderer.dart';
import 'package:pesa_shop/utils/style_helper.dart';

class ColumnBlock extends StatelessWidget {
  final BlockModel block;
  final Map<String, dynamic>? context;

  const ColumnBlock({Key? key, required this.block, this.context}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final children = block.children ?? [];
    final mainAxisAlignment = StyleHelper.parseMainAxisAlignment(
      block.config['mainAxisAlignment'],
    );
    final crossAxisAlignment = StyleHelper.parseCrossAxisAlignment(
      block.config['crossAxisAlignment'],
    );

    return Column(
      mainAxisAlignment: mainAxisAlignment,
      crossAxisAlignment: crossAxisAlignment,
      children: children.map((child) => BlockRenderer(block: child, context: this.context)).toList(),
    );
  }
}
