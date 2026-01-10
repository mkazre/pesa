import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:pesa_shop/services/config_service.dart';
import 'package:pesa_shop/services/auth_service.dart';
import 'package:pesa_shop/services/woocommerce_service.dart';
import 'package:pesa_shop/utils/app_router.dart';
import 'package:pesa_shop/utils/theme_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Hive for local storage
  await Hive.initFlutter();

  // Initialize services
  await ConfigService.instance.initialize();

  runApp(
    const ProviderScope(
      child: PESAShopApp(),
    ),
  );
}

class PESAShopApp extends ConsumerWidget {
  const PESAShopApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final configService = ConfigService.instance;
    final theme = ThemeManager.buildTheme(configService.themeConfig);

    return MaterialApp.router(
      title: configService.siteName ?? 'PESA Shop',
      theme: theme,
      routerConfig: AppRouter.router,
      debugShowCheckedModeBanner: false,
    );
  }
}
