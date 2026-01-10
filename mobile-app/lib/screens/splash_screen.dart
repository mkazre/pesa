import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:pesa_shop/services/config_service.dart';
import 'package:pesa_shop/services/auth_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    final configService = ConfigService.instance;
    if (configService.initialized) {
      context.go('/home');
    } else {
      // Show setup screen
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.shopping_bag, size: 100, color: Colors.blue),
            const SizedBox(height: 20),
            Text(
              'PESA Shop',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 40),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
