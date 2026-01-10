import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:pesa_shop/models/block_model.dart';
import 'package:pesa_shop/utils/style_helper.dart';

class ImageBlock extends StatelessWidget {
  final BlockModel block;

  const ImageBlock({Key? key, required this.block}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final src = block.config['src'] ?? '';
    final alt = block.config['alt'] ?? '';
    final width = block.config['width']?.toDouble();
    final height = block.config['height']?.toDouble();
    final fit = StyleHelper.parseBoxFit(block.config['fit']);

    if (src.isEmpty) {
      return Container(
        width: width ?? double.infinity,
        height: height ?? 200,
        color: Colors.grey[300],
        child: const Center(child: Icon(Icons.image, size: 48)),
      );
    }

    return CachedNetworkImage(
      imageUrl: src,
      width: width,
      height: height,
      fit: fit,
      placeholder: (context, url) => Container(
        color: Colors.grey[300],
        child: const Center(child: CircularProgressIndicator()),
      ),
      errorWidget: (context, url, error) => Container(
        color: Colors.grey[300],
        child: const Center(child: Icon(Icons.error)),
      ),
    );
  }
}
