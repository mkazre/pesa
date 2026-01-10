import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:pesa_shop/models/block_model.dart';

class SliderBlock extends StatelessWidget {
  final BlockModel block;

  const SliderBlock({Key? key, required this.block}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final images = (block.config['images'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final autoPlay = block.config['autoPlay'] ?? true;
    final interval = block.config['interval'] ?? 3000;
    final height = (block.config['height'] ?? 200).toDouble();

    if (images.isEmpty) {
      return Container(
        height: height,
        color: Colors.grey[300],
        child: const Center(child: Text('No images')),
      );
    }

    return CarouselSlider(
      options: CarouselOptions(
        height: height,
        autoPlay: autoPlay,
        autoPlayInterval: Duration(milliseconds: interval),
        enlargeCenterPage: true,
        viewportFraction: 1.0,
      ),
      items: images.map((image) {
        return CachedNetworkImage(
          imageUrl: image['url'] ?? '',
          fit: BoxFit.cover,
          width: double.infinity,
          placeholder: (context, url) => Container(
            color: Colors.grey[300],
            child: const Center(child: CircularProgressIndicator()),
          ),
          errorWidget: (context, url, error) => Container(
            color: Colors.grey[300],
            child: const Center(child: Icon(Icons.error)),
          ),
        );
      }).toList(),
    );
  }
}
