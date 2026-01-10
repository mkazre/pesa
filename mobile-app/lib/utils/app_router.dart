import 'package:go_router/go_router.dart';
import 'package:pesa_shop/screens/splash_screen.dart';
import 'package:pesa_shop/screens/home_screen.dart';
import 'package:pesa_shop/screens/dynamic_page_screen.dart';
import 'package:pesa_shop/screens/product_detail_screen.dart';
import 'package:pesa/screens/login_screen.dart';

class AppRouter {
  static final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/page/:pageKey',
        builder: (context, state) {
          final pageKey = state.pathParameters['pageKey']!;
          return DynamicPageScreen(pageKey: pageKey);
        },
      ),
      GoRoute(
        path: '/product/:productId',
        builder: (context, state) {
          final productId = int.parse(state.pathParameters['productId']!);
          return ProductDetailScreen(productId: productId);
        },
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
    ],
  );
}
