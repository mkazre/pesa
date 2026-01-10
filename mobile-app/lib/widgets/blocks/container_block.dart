import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';
import 'package:pesa_shop/widgets/block_renderer.dart';

class ContainerBlock extends StatelessWidget {
  final BlockModel block;
  final Map<String, dynamic>? context;

  const ContainerBlock({Key? key, required this.block, this.context}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final children = block.children ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: children.map((child) => BlockRenderer(block: child, context: this.context)).toList(),
    );
  }
}
