import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';

class ProductGridBlock extends StatelessWidget {
  final BlockModel block;
  const ProductGridBlock({Key? key, required this.block}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: const Text('Product Grid - Implementation pending'),
    );
  }
}
