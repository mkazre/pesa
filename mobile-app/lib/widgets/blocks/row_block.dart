import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';
import 'package:pesa_shop/widgets/block_renderer.dart';
import 'package:pesa_shop/utils/style_helper.dart';

class RowBlock extends StatelessWidget {
  final BlockModel block;
  final Map<String, dynamic>? context;

  const RowBlock({Key? key, required this.block, this.context}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final children = block.children ?? [];
    final mainAxisAlignment = StyleHelper.parseMainAxisAlignment(
      block.config['mainAxisAlignment'],
    );
    final crossAxisAlignment = StyleHelper.parseCrossAxisAlignment(
      block.config['crossAxisAlignment'],
    );

    return Row(
      mainAxisAlignment: mainAxisAlignment,
      crossAxisAlignment: crossAxisAlignment,
      children: children.map((child) => Expanded(
        child: BlockRenderer(block: child, context: this.context),
      )).toList(),
    );
  }
}
