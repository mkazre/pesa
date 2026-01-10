import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';

class meta_field_block extends StatelessWidget {
  final BlockModel block;
  final Map<String, dynamic>? context;
  const meta_field_block({Key? key, required this.block, this.context}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Text('meta field block - Implementation pending'),
    );
  }
}
