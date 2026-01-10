# PESA Shop - Flutter Mobile App

A production-ready Flutter mobile app that dynamically renders screens based on WordPress configuration.

## Features

- 🎨 **Dynamic Rendering** - Screens built from JSON configuration
- 🛍️ **Full WooCommerce** - Complete e-commerce functionality
- 📱 **Cross-Platform** - Works on Android and iOS
- 🔐 **Authentication** - JWT-based WordPress authentication
- 🎯 **Responsive** - Adapts to all screen sizes
- ⚡ **Fast** - Optimized performance with caching
- 🌐 **Offline Support** - Works without internet connection
- 🔄 **State Management** - Riverpod for reactive state

## Prerequisites

- Flutter SDK 3.0 or higher
- Dart 3.0 or higher
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- A configured PESA Shop WordPress site

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pesa.git
cd pesa/mobile-app
```

### 2. Install Dependencies

```bash
flutter pub get
```

### 3. Configure Your WordPress Site

Edit `lib/services/config_service.dart` and set your WordPress URL:

```dart
_baseUrl = prefs.getString('base_url') ?? 'https://your-site.com';
```

Or configure it dynamically in the app's settings screen.

### 4. Configure WooCommerce API

You'll need WooCommerce REST API credentials:

1. Go to your WordPress admin
2. Navigate to **WooCommerce → Settings → Advanced → REST API**
3. Create a new API key with **Read/Write** permissions
4. Note down the Consumer Key and Consumer Secret

These will be entered in the app during setup.

### 5. Run the App

**Android:**
```bash
flutter run
```

**iOS:**
```bash
flutter run -d ios
```

**Chrome (for testing):**
```bash
flutter run -d chrome
```

## Project Structure

```
mobile-app/
├── lib/
│   ├── main.dart                 # App entry point
│   │
│   ├── models/                   # Data models
│   │   ├── app_config.dart      # App configuration
│   │   ├── page_config.dart     # Page configuration
│   │   ├── block_model.dart     # Block model
│   │   └── theme_config.dart    # Theme configuration
│   │
│   ├── services/                 # Business logic
│   │   ├── config_service.dart  # Fetches app config
│   │   ├── woocommerce_service.dart  # WooCommerce API
│   │   └── auth_service.dart    # Authentication
│   │
│   ├── widgets/                  # UI components
│   │   ├── block_renderer.dart  # Dynamic block renderer
│   │   └── blocks/              # Individual block widgets
│   │       ├── text_block.dart
│   │       ├── image_block.dart
│   │       ├── button_block.dart
│   │       └── ... (20+ blocks)
│   │
│   ├── screens/                  # App screens
│   │   ├── splash_screen.dart
│   │   ├── home_screen.dart
│   │   ├── dynamic_page_screen.dart
│   │   ├── product_detail_screen.dart
│   │   └── login_screen.dart
│   │
│   └── utils/                    # Utilities
│       ├── app_router.dart      # Navigation
│       ├── theme_manager.dart   # Theme builder
│       └── style_helper.dart    # Style parsing
│
├── android/                      # Android configuration
├── ios/                         # iOS configuration
├── pubspec.yaml                 # Dependencies
└── README.md                    # This file
```

## Configuration

### App Configuration Service

The app fetches configuration from:

```
https://your-site.com/wp-json/pesa-shop/v1/config/app
```

This returns:
- All pages and their blocks
- Theme settings (colors, fonts)
- Site information
- WooCommerce settings

### Local Storage

The app uses:
- **SharedPreferences** - For simple key-value storage
- **Hive** - For structured local data
- **Cached Network Images** - For image caching

### State Management

The app uses **Riverpod** for state management:

```dart
final configProvider = Provider((ref) => ConfigService.instance);
final authProvider = Provider((ref) => AuthService.instance);
final wooProvider = Provider((ref) => WooCommerceService.instance);
```

## Architecture

### Dynamic Rendering System

The core of the app is the dynamic rendering system:

1. **Configuration Fetch** - Load page configurations from WordPress
2. **Block Parsing** - Parse JSON into block models
3. **Widget Building** - Render blocks as Flutter widgets
4. **Style Application** - Apply styling from configuration

```dart
// Example flow
ConfigService.instance.fetchConfig()
  → PageConfig with blocks
  → BlockRenderer builds widgets
  → StyleHelper applies styles
  → UI rendered
```

### Block System

Each block:
1. Extends `StatelessWidget` or `StatefulWidget`
2. Receives a `BlockModel` with configuration
3. Renders based on the configuration
4. Applies styles from `BlockStyle`

Example block:

```dart
class TextBlock extends StatelessWidget {
  final BlockModel block;

  @override
  Widget build(BuildContext context) {
    final text = block.config['text'] ?? '';
    return Text(
      text,
      style: StyleHelper.buildTextStyle(block.style),
    );
  }
}
```

## Available Blocks

### Layout Blocks

- **Container** - Groups other blocks
- **Row** - Horizontal layout
- **Column** - Vertical layout
- **Spacer** - Vertical spacing
- **Divider** - Horizontal line

### Content Blocks

- **Text** - Display text
- **Heading** - Display headings
- **Image** - Display images
- **Button** - Clickable buttons

### Media Blocks

- **Slider** - Image carousel

### WooCommerce Blocks

- **Product Grid** - Products in a grid
- **Product List** - Products in a list
- **Category Grid** - Product categories
- **Cart Items** - Shopping cart
- **Cart Totals** - Cart summary
- **Cart Coupon** - Coupon input

### Account Blocks

- **Account Info** - User profile
- **Order History** - Past orders

### Advanced Blocks

- **WebView** - Embedded web pages
- **HTML** - HTML content
- **Shortcode** - WordPress shortcodes
- **Meta Field** - Custom fields

## Customization

### Adding Custom Blocks

1. Create a new widget in `lib/widgets/blocks/`:

```dart
class CustomBlock extends StatelessWidget {
  final BlockModel block;

  const CustomBlock({Key? key, required this.block}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Your custom implementation
    return Container(
      child: Text('Custom Block'),
    );
  }
}
```

2. Register in `BlockRenderer`:

```dart
case 'custom_block':
  return CustomBlock(block: block);
```

3. Register in WordPress plugin

### Theming

Theme is automatically applied from WordPress configuration:

```dart
ThemeData theme = ThemeManager.buildTheme(configService.themeConfig);
```

Override theme properties in `utils/theme_manager.dart`.

### Navigation

Navigation is handled by `go_router`:

```dart
context.go('/page/shop');
context.go('/product/123');
```

Add new routes in `utils/app_router.dart`.

## API Integration

### WooCommerce API

The app uses the WooCommerce REST API v3:

```dart
// Get products
final products = await WooCommerceService.instance.getProducts(
  page: 1,
  perPage: 10,
  orderBy: 'date',
);

// Get product
final product = await WooCommerceService.instance.getProduct(123);

// Add to cart
await WooCommerceService.instance.addToCart(productId, quantity);
```

### WordPress Authentication

JWT authentication with WordPress:

```dart
// Login
await AuthService.instance.login(username, password);

// Check auth status
if (AuthService.instance.isLoggedIn) {
  // User is logged in
}

// Logout
await AuthService.instance.logout();
```

### Caching

Configurations are cached locally:

```dart
// Refresh config
await ConfigService.instance.refreshConfig();

// Clear cache
await ConfigService.instance.clearCache();
```

## Building for Production

### Android

**APK:**
```bash
flutter build apk --release
```

**App Bundle (recommended for Play Store):**
```bash
flutter build appbundle --release
```

Output: `build/app/outputs/`

### iOS

```bash
flutter build ios --release
```

Then open in Xcode and archive for App Store.

### Configuration for Production

1. **Update API URL** - Set production WordPress URL
2. **Enable Obfuscation** - Add to build commands:
   ```bash
   --obfuscate --split-debug-info=/symbols
   ```
3. **Configure App Icons** - Use `flutter_launcher_icons`
4. **Configure Splash Screen** - Use `flutter_native_splash`
5. **Update App Name** - In `android/app/src/main/AndroidManifest.xml` and `ios/Runner/Info.plist`

## Testing

### Run Unit Tests

```bash
flutter test
```

### Run Integration Tests

```bash
flutter test integration_test
```

### Test on Devices

```bash
flutter devices
flutter run -d <device-id>
```

## Debugging

### Enable Logging

```dart
// In main.dart
void main() {
  debugPrint('App starting...');
  // ...
}
```

### Use Flutter DevTools

```bash
flutter pub global activate devtools
flutter pub global run devtools
```

### Common Issues

**Config not loading:**
- Check WordPress URL
- Verify REST API is accessible
- Check CORS settings

**Authentication failing:**
- Ensure JWT plugin is installed on WordPress
- Check credentials
- Verify token expiration

**Images not loading:**
- Check image URLs
- Verify HTTPS
- Check CORS headers

## Performance Optimization

### Image Optimization

- Use `CachedNetworkImage` for remote images
- Compress images before upload
- Use appropriate image sizes

### State Management

- Use `const` constructors where possible
- Avoid unnecessary rebuilds
- Use `Consumer` widgets wisely

### List Performance

- Use `ListView.builder` for long lists
- Implement pagination
- Use `AutomaticKeepAliveClientMixin` for tabs

### Network Optimization

- Cache API responses
- Implement retry logic
- Use timeouts
- Batch requests

## Deployment

### Android Play Store

1. Create keystore
2. Configure signing in `android/app/build.gradle`
3. Build app bundle
4. Upload to Play Console
5. Complete store listing
6. Submit for review

### iOS App Store

1. Configure app in App Store Connect
2. Build archive in Xcode
3. Upload to App Store Connect
4. Complete store listing
5. Submit for review

## Security

### Best Practices

- ✅ Store API keys securely
- ✅ Use HTTPS only
- ✅ Validate all inputs
- ✅ Handle tokens securely
- ✅ Implement certificate pinning (optional)
- ✅ Obfuscate code in production
- ✅ Use ProGuard rules for Android

### API Security

```dart
// Always use HTTPS
const String BASE_URL = 'https://your-site.com';

// Store tokens securely
await secureStorage.write(key: 'auth_token', value: token);
```

## Troubleshooting

### Build Fails

```bash
flutter clean
flutter pub get
flutter run
```

### Dependencies Issues

```bash
flutter pub upgrade
flutter pub outdated
```

### Platform-Specific Issues

**Android:**
- Check `minSdkVersion` in `android/app/build.gradle`
- Verify gradle version
- Check permissions in `AndroidManifest.xml`

**iOS:**
- Check deployment target in `ios/Runner/Info.plist`
- Verify pod versions
- Check signing certificates

## Resources

### Official Documentation

- [Flutter Docs](https://flutter.dev/docs)
- [Dart Docs](https://dart.dev/guides)
- [WooCommerce API](https://woocommerce.github.io/woocommerce-rest-api-docs/)

### Packages Used

- `flutter_riverpod` - State management
- `go_router` - Navigation
- `dio` - HTTP client
- `cached_network_image` - Image caching
- `hive` - Local storage
- `webview_flutter` - WebView
- `carousel_slider` - Image sliders

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

GPL v2 or later

## Support

For support:
- GitHub Issues
- Email: support@pesashop.com
- Documentation: https://pesashop.com/docs

---

**Version:** 1.0.0
**Flutter:** 3.0+
**Dart:** 3.0+
