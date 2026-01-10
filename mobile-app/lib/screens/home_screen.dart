import 'package:flutter/material.dart';
import 'package:pesa_shop/services/config_service.dart';
import 'package:pesa_shop/widgets/block_renderer.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final configService = ConfigService.instance;
    final homePage = configService.appConfig?.getPageByKey('home');

    return Scaffold(
      appBar: AppBar(
        title: Text(configService.siteName ?? 'PESA Shop'),
      ),
      body: homePage == null
          ? const Center(child: Text('Home page not configured'))
          : SingleChildScrollView(
              child: Column(
                children: homePage.config.blocks
                    .map((block) => BlockRenderer(block: block))
                    .toList(),
              ),
            ),
    );
  }
}
