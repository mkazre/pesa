# PESA Shop - Quick Start Guide

Get your WooCommerce mobile app running in 15 minutes!

## Prerequisites Checklist

- [ ] WordPress site with WooCommerce installed
- [ ] WordPress admin access
- [ ] FTP/File access to your WordPress site
- [ ] Flutter SDK installed (for mobile app development)
- [ ] Android Studio or Xcode installed

## Part 1: WordPress Plugin Setup (5 minutes)

### Step 1: Install the Plugin

1. Download or copy the `wordpress-plugin` folder
2. Rename it to `pesa-shop-app-builder`
3. Upload to `/wp-content/plugins/` via FTP or File Manager
4. Activate via **Plugins → Installed Plugins**

### Step 2: Configure WooCommerce API

1. Go to **WooCommerce → Settings → Advanced → REST API**
2. Click **Add key**
3. Description: `PESA Shop Mobile App`
4. Permissions: **Read/Write**
5. Click **Generate API key**
6. **IMPORTANT:** Copy and save:
   - Consumer key
   - Consumer secret

### Step 3: Build Your First Page

1. Go to **App Builder → Builder** in WordPress admin
2. Select **Home** from the dropdown
3. Drag blocks from the left sidebar to the canvas:
   - Add a **Heading** block - Set text to "Welcome to PESA Shop"
   - Add a **Slider** block - Add some banner images
   - Add a **Product Grid** block - Will show your products
4. Click **Save Page**

**Congratulations!** Your app configuration is ready.

## Part 2: Mobile App Setup (10 minutes)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/pesa.git

# Navigate to mobile app
cd pesa/mobile-app

# Install dependencies
flutter pub get
```

### Step 2: Configure Your WordPress Site

Open `lib/services/config_service.dart` and update:

```dart
_baseUrl = prefs.getString('base_url') ?? 'https://YOUR-SITE.com';
```

Replace `YOUR-SITE.com` with your actual WordPress URL.

### Step 3: Run the App

```bash
# For Android
flutter run

# For iOS (macOS only)
flutter run -d ios

# For web testing
flutter run -d chrome
```

### Step 4: First Launch Configuration

When the app launches:

1. It will fetch configuration from your WordPress site
2. Navigate to Settings (add a settings screen if needed)
3. Enter your WooCommerce API credentials:
   - Consumer Key
   - Consumer Secret
4. Save

### Step 5: Test Your App

1. You should see your home page with the blocks you created
2. Navigate through different pages
3. Try adding products to cart
4. Test authentication

## Quick Customization

### Change App Colors

In WordPress:
1. Go to **App Builder → Settings**
2. Change colors:
   - Primary: `#007bff`
   - Secondary: `#6c757d`
3. Save
4. Restart your mobile app to see changes

### Add More Pages

1. Go to **App Builder → Pages**
2. Click **Add Page**
3. Set page key (e.g., `about`)
4. Build your page with blocks
5. Navigate to it in the app: `/page/about`

### Customize Cart Page

1. Go to **App Builder → Builder**
2. Select **Cart** page
3. Add/remove blocks:
   - **Cart Items** - Shows cart contents
   - **Cart Coupon** - Coupon input
   - **Cart Totals** - Shows totals
   - **Button** - "Proceed to Checkout"
4. Save

## Common Use Cases

### Use Case 1: Simple Product Catalog

**WordPress Setup:**
1. Home page:
   - Heading: "Our Products"
   - Product Grid (2 columns)
2. Product page: Default (auto-generated)

**Result:** Simple browsable product catalog

### Use Case 2: E-commerce with Cart

**WordPress Setup:**
1. Home page:
   - Slider with banners
   - Featured products
2. Shop page:
   - Product Grid (2 columns)
3. Cart page:
   - Cart Items
   - Cart Totals
   - Checkout Button
4. Checkout page:
   - WebView (loads WooCommerce checkout)

**Result:** Full shopping experience

### Use Case 3: Content + Commerce

**WordPress Setup:**
1. Home page:
   - Hero image
   - Text: "About Us"
   - Featured Products
2. Custom "Blog" page:
   - Recent posts (via shortcode)
3. Shop page:
   - Product Grid

**Result:** Content site with shopping

## Troubleshooting

### App shows "Config not found"

**Solution:**
- Verify WordPress URL in `config_service.dart`
- Check WordPress site is accessible
- Verify plugin is activated

### Products not showing

**Solution:**
- Check WooCommerce API keys
- Verify products are published in WooCommerce
- Check API endpoint: `/wp-json/wc/v3/products`

### Images not loading

**Solution:**
- Use full URLs for images (https://...)
- Check CORS settings on WordPress
- Verify images exist and are accessible

### Blocks not appearing

**Solution:**
- Check block configuration in WordPress
- Verify JSON is valid
- Check browser/app console for errors

## Next Steps

### Learn More

1. **Read Documentation:**
   - [Main README](README.md)
   - [Plugin Documentation](wordpress-plugin/README.md)
   - [App Documentation](mobile-app/README.md)

2. **Explore Blocks:**
   - Try all 20+ block types
   - Experiment with styling
   - Test visibility rules

3. **Customize:**
   - Create custom blocks
   - Add custom pages
   - Modify theme

### Advanced Features

1. **Dynamic Content:**
   - Use shortcodes for dynamic content
   - Display custom meta fields
   - Integrate third-party plugins

2. **User Experience:**
   - Add splash screen
   - Implement push notifications
   - Add offline mode

3. **E-commerce:**
   - Configure payment gateways
   - Set up shipping methods
   - Add product reviews

### Deploy

When ready to launch:

1. **WordPress:**
   - Use production domain
   - Enable HTTPS
   - Optimize database

2. **Mobile App:**
   - Build release version
   - Upload to Play Store
   - Upload to App Store

## Getting Help

### Resources

- **Documentation:** Full README files in each directory
- **Support:** support@pesashop.com
- **Issues:** GitHub Issues
- **Community:** Join our Discord

### Before Asking for Help

Please provide:
1. WordPress version
2. WooCommerce version
3. Plugin version
4. Flutter version
5. Error messages
6. Steps to reproduce

## Success Tips

### DO ✅

- Start simple, then add complexity
- Test on multiple devices
- Keep WordPress and plugins updated
- Use HTTPS everywhere
- Back up regularly

### DON'T ❌

- Overload pages with too many blocks
- Use HTTP (use HTTPS)
- Skip testing
- Forget to backup
- Hardcode sensitive data

## Example Apps

### Minimal Setup (5 blocks)

```
Home Page:
- Heading: "Welcome"
- Product Grid
- Button: "View All"
```

**Time to build:** 5 minutes

### Standard Setup (15 blocks)

```
Home: Slider, Heading, Featured Products, Categories
Shop: Product Grid, Filters
Cart: Cart Items, Totals, Coupon
Account: User Info, Orders
```

**Time to build:** 30 minutes

### Advanced Setup (50+ blocks)

```
Multiple custom pages
Dynamic content
Custom blocks
Shortcodes
Meta fields
WebViews
```

**Time to build:** 2-3 hours

## What's Next?

Now that you have a working app:

1. ✅ Customize your home page
2. ✅ Add your products
3. ✅ Configure checkout
4. ✅ Test on devices
5. ✅ Publish to stores

**Welcome to PESA Shop!** 🎉

---

**Need help?** Don't hesitate to reach out: support@pesashop.com

**Want to contribute?** We welcome pull requests and feedback!
