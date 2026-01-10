import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';

class cart_totals_block extends StatelessWidget {
  final BlockModel block;
  final Map<String, dynamic>? context;
  const cart_totals_block({Key? key, required this.block, this.context}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Text('cart totals block - Implementation pending'),
    );
  }
}
