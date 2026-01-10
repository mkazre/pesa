import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';

class SpacerBlock extends StatelessWidget {
  final BlockModel block;

  const SpacerBlock({Key? key, required this.block}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final height = (block.config['height'] ?? 16).toDouble();
    return SizedBox(height: height);
  }
}
