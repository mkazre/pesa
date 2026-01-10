# PESA Shop - Production-Ready WooCommerce Mobile App Builder

A complete, flexible, and production-ready solution for building WooCommerce mobile apps with full visual control. Inspired by Cirilla, but fully customizable from WordPress.

## 🚀 Overview

PESA Shop consists of two tightly integrated components:

1. **WordPress App Builder Plugin** - A drag-and-drop visual builder inside WordPress
2. **Flutter Mobile App** - A dynamic mobile app that renders based on plugin configuration

## ✨ Key Features

### Complete Visual Control
- **Drag-and-drop interface** for building app screens
- **No hardcoded pages** - every screen is fully customizable
- **Modular block system** - mix and match elements freely
- **Dynamic content rendering** - app updates based on plugin configuration

### Flexible Block System
- Layout blocks (Container, Row, Column, Spacer, Divider)
- Content blocks (Text, Heading, Image, Button)
- Media blocks (Slider/Carousel)
- WooCommerce blocks (Product Grid/List, Categories, Cart, Totals)
- Account blocks (User Info, Order History)
- Advanced blocks (WebView, HTML, Shortcodes, Meta Fields)

### Maximum Flexibility
- **Custom pages** - create unlimited custom pages
- **Shortcode support** - render WordPress shortcodes in the app
- **Meta field support** - display custom fields from ACF, MetaBox, etc.
- **WebView integration** - embed web pages for checkout and custom content
- **Visibility rules** - show/hide blocks based on login status and user roles

### Full WooCommerce Integration
- Complete product catalog
- Shopping cart functionality
- Order management
- Customer accounts
- Native and hybrid checkout options

## 📁 Project Structure

```
pesa/
├── wordpress-plugin/          # WordPress App Builder Plugin
│   ├── includes/             # Core classes
│   ├── admin/               # Admin interface
│   ├── api/                 # REST API endpoints
│   ├── assets/              # CSS, JS, images
│   └── pesa-shop-app-builder.php
│
├── mobile-app/              # Flutter Mobile App
│   ├── lib/
│   │   ├── models/         # Data models
│   │   ├── services/       # API and business logic
│   │   ├── widgets/        # UI components and blocks
│   │   ├── screens/        # App screens
│   │   ├── utils/          # Utilities and helpers
│   │   └── main.dart       # App entry point
│   ├── android/            # Android configuration
│   ├── ios/                # iOS configuration
│   └── pubspec.yaml        # Flutter dependencies
│
└── README.md               # This file
```

## 🔧 Installation

### Prerequisites

**For WordPress Plugin:**
- WordPress 5.8 or higher
- PHP 7.4 or higher
- WooCommerce 5.0 or higher
- MySQL 5.6 or higher

**For Flutter App:**
- Flutter SDK 3.0 or higher
- Dart 3.0 or higher
- Android Studio / Xcode
- Android SDK (for Android)
- Xcode (for iOS on macOS)

### WordPress Plugin Installation

1. Upload the `wordpress-plugin` directory to `/wp-content/plugins/`
2. Rename it to `pesa-shop-app-builder`
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Go to **App Builder** in the WordPress admin menu

### Flutter App Setup

See [mobile-app/README.md](mobile-app/README.md) for detailed Flutter setup instructions.

## 📚 Documentation

### Quick Start Guides

1. **WordPress Plugin Setup** - [wordpress-plugin/README.md](wordpress-plugin/README.md)
2. **Flutter App Setup** - [mobile-app/README.md](mobile-app/README.md)
3. **Building Your First App** - See plugin documentation
4. **API Integration** - See API documentation below

### Core Concepts

#### Pages
Pages are the main screens in your app. Each page contains a collection of blocks that define the layout and content.

**Default Pages:**
- Home
- Shop
- Cart
- Checkout
- Account
- Product Detail

You can also create unlimited custom pages.

#### Blocks
Blocks are modular UI elements that can be dragged and arranged to build pages. Each block has:
- **Configuration** - block-specific settings
- **Styling** - padding, margin, colors, typography
- **Visibility Rules** - show/hide based on conditions

#### Dynamic Content
Blocks can display dynamic content from:
- WordPress shortcodes
- Custom meta fields
- WooCommerce data
- User data

### API Endpoints

The plugin exposes REST API endpoints for the mobile app:

```
GET  /wp-json/pesa-shop/v1/config/app      # Get app configuration
GET  /wp-json/pesa-shop/v1/pages           # Get all pages
GET  /wp-json/pesa-shop/v1/pages/{id}      # Get specific page
GET  /wp-json/pesa-shop/v1/blocks          # Get available blocks
```

Plus standard WooCommerce REST API endpoints for:
- Products
- Categories
- Cart
- Orders
- Customers

## 🎨 Customization

### Theme Customization

Configure your app's theme in **App Builder → Settings**:
- Primary Color
- Secondary Color
- Background Color
- Text Color
- Font Family

### Block Styling

Every block supports comprehensive styling:
- **Padding** - top, right, bottom, left
- **Margin** - top, right, bottom, left
- **Colors** - background, text, border
- **Typography** - font size, weight, alignment
- **Borders** - radius, width, color
- **Dimensions** - width, height

### Custom Blocks

Developers can register custom blocks using the plugin's filter system:

```php
add_action('psab_register_blocks', function($registry) {
    $registry->register_block('custom_block', [
        'label' => 'Custom Block',
        'category' => 'custom',
        'schema' => [
            'text' => ['type' => 'string', 'default' => ''],
        ],
    ]);
});
```

Then implement the Flutter widget for your custom block.

## 🔐 Security

### WordPress Plugin
- Nonce verification on all AJAX requests
- Capability checks for admin functions
- Input sanitization and validation
- Output escaping

### Mobile App
- JWT authentication for WordPress
- Secure storage of credentials
- HTTPS for all API requests
- Token refresh handling

## 🛠️ Development

### Setting Up Development Environment

**WordPress Plugin:**
```bash
cd wordpress-plugin
# No build process required - pure PHP
```

**Flutter App:**
```bash
cd mobile-app
flutter pub get
flutter run
```

### Running Tests

**WordPress Plugin:**
```bash
# Install PHPUnit and run tests
composer install
./vendor/bin/phpunit
```

**Flutter App:**
```bash
flutter test
```

## 🚢 Deployment

### WordPress Plugin
1. Zip the plugin directory
2. Upload to WordPress.org or distribute privately
3. Install on production site

### Mobile App

**Android:**
```bash
flutter build apk --release
# or
flutter build appbundle --release
```

**iOS:**
```bash
flutter build ios --release
# Then archive and upload via Xcode
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

GPL v2 or later

## 🙋 Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Contact: support@pesashop.com

## 🎯 Roadmap

- [ ] Advanced product filtering
- [ ] Push notifications
- [ ] Wishlist functionality
- [ ] Social login
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline mode
- [ ] Product reviews
- [ ] Advanced analytics

## 📸 Screenshots

*Screenshots will be added here*

## 🌟 Credits

Developed with ❤️ for the WooCommerce community

Inspired by Cirilla's flexibility, built for maximum control.

---

**Version:** 1.0.0
**Last Updated:** January 2026
