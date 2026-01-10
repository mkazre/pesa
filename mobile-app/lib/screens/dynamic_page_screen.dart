import 'package:flutter/material.dart';
import 'package:pesa_shop/services/config_service.dart';
import 'package:pesa_shop/widgets/block_renderer.dart';

class DynamicPageScreen extends StatelessWidget {
  final String pageKey;

  const DynamicPageScreen({Key? key, required this.pageKey}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final configService = ConfigService.instance;
    final page = configService.appConfig?.getPageByKey(pageKey);

    return Scaffold(
      appBar: AppBar(
        title: Text(page?.title ?? pageKey),
      ),
      body: page == null
          ? Center(child: Text('Page "$pageKey" not found'))
          : SingleChildScrollView(
              child: Column(
                children: page.config.blocks
                    .map((block) => BlockRenderer(block: block))
                    .toList(),
              ),
            ),
    );
  }
}
