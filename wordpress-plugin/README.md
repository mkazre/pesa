# PESA Shop App Builder - WordPress Plugin

A powerful WordPress plugin that provides a drag-and-drop interface for building production-ready WooCommerce mobile apps.

## Features

- 🎨 **Visual Page Builder** - Drag-and-drop interface for creating app screens
- 📱 **Mobile-First** - Designed specifically for mobile app development
- 🛍️ **WooCommerce Integration** - Full e-commerce functionality
- 🔧 **Extensible** - Hook system for custom blocks and features
- 🌐 **REST API** - Complete API for mobile app consumption
- 🔐 **Secure** - Built with WordPress security best practices

## Installation

1. Upload the plugin folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Ensure WooCommerce is installed and active
4. Navigate to **App Builder** in the admin menu

## Requirements

- WordPress 5.8+
- PHP 7.4+
- WooCommerce 5.0+
- MySQL 5.6+

## Usage

### Creating Your First Page

1. Go to **App Builder → Builder**
2. Select a page from the dropdown (e.g., "Home")
3. Drag blocks from the left sidebar to the canvas
4. Click on a block to edit its properties
5. Click "Save Page" when done

### Available Blocks

#### Layout Blocks
- **Container** - Groups other blocks
- **Row** - Horizontal layout
- **Column** - Vertical layout
- **Spacer** - Adds vertical space
- **Divider** - Horizontal line

#### Content Blocks
- **Text** - Static or dynamic text
- **Heading** - Heading text (H1-H6)
- **Image** - Display images
- **Button** - Clickable button with actions

#### Media Blocks
- **Slider** - Image carousel/slider

#### WooCommerce Blocks
- **Product Grid** - Display products in a grid
- **Product List** - Display products in a list
- **Category Grid** - Display product categories
- **Cart Items** - Shopping cart items list
- **Cart Totals** - Cart totals and summary
- **Cart Coupon** - Coupon code input

#### Account Blocks
- **Account Info** - User profile information
- **Order History** - User's past orders

#### Advanced Blocks
- **WebView** - Embed web pages
- **HTML** - Custom HTML content
- **Shortcode** - WordPress shortcodes
- **Meta Field** - Custom meta fields

### Block Configuration

Each block supports various configuration options:

#### Text Block
```json
{
  "text": "Hello World",
  "isDynamic": false,
  "dynamicSource": "",
  "style": {
    "fontSize": 16,
    "color": "#000000",
    "fontWeight": "normal",
    "textAlign": "left"
  }
}
```

#### Button Block
```json
{
  "text": "Shop Now",
  "action": {
    "type": "navigate",
    "route": "/page/shop"
  },
  "style": {
    "backgroundColor": "#007bff",
    "textColor": "#ffffff",
    "borderRadius": 8,
    "padding": {
      "top": 12,
      "right": 24,
      "bottom": 12,
      "left": 24
    }
  }
}
```

### Styling Blocks

All blocks support comprehensive styling:

- **Padding** - Internal spacing
- **Margin** - External spacing
- **Colors** - Background, text, border
- **Typography** - Font size, weight, alignment
- **Borders** - Radius, width, color
- **Dimensions** - Width, height

### Visibility Rules

Control when blocks are visible:

```json
{
  "visibility": {
    "loggedIn": true,
    "loggedOut": false,
    "userRoles": ["customer", "subscriber"]
  }
}
```

- **loggedIn** - Show only to logged-in users
- **loggedOut** - Show only to logged-out users
- **userRoles** - Show only to specific user roles

### Shortcodes

Use WordPress shortcodes in your app:

1. Add a **Shortcode** block
2. Enter your shortcode: `[woocommerce_cart]`
3. Set context if needed (product ID, user ID, etc.)
4. The shortcode will be processed and rendered in the app

### Meta Fields

Display custom meta fields:

1. Add a **Meta Field** block
2. Set the meta key (e.g., `_custom_field`)
3. Set the object type (post, user, product, order)
4. Choose the format (text, number, date, image, etc.)

Works with:
- Advanced Custom Fields (ACF)
- Meta Box
- WooCommerce custom fields
- Any custom meta fields

### WebView Integration

Embed web pages in your app:

1. Add a **WebView** block
2. Set the URL (relative or absolute)
3. Enable authentication if needed
4. Set the height

Perfect for:
- Checkout pages
- Privacy policy
- Terms and conditions
- External content

## API Endpoints

### Get App Configuration

```
GET /wp-json/pesa-shop/v1/config/app
```

Returns complete app configuration including all pages, theme settings, and site info.

### Get Pages

```
GET /wp-json/pesa-shop/v1/pages
GET /wp-json/pesa-shop/v1/pages/{id}
GET /wp-json/pesa-shop/v1/pages/key/{key}
```

### Get Blocks

```
GET /wp-json/pesa-shop/v1/blocks
GET /wp-json/pesa-shop/v1/blocks/{type}
GET /wp-json/pesa-shop/v1/blocks/categories
```

### Manage Pages (Admin Only)

```
POST   /wp-json/pesa-shop/v1/pages
PUT    /wp-json/pesa-shop/v1/pages/{id}
DELETE /wp-json/pesa-shop/v1/pages/{id}
```

## WooCommerce Setup

### Create API Keys

1. Go to **WooCommerce → Settings → Advanced → REST API**
2. Click **Add key**
3. Set description: "Mobile App"
4. Set permissions: **Read/Write**
5. Click **Generate API key**
6. Copy the Consumer Key and Consumer Secret
7. Configure these in your mobile app

## Theme Settings

Configure your app's theme:

1. Go to **App Builder → Settings**
2. Set colors:
   - Primary Color
   - Secondary Color
   - Background Color
   - Text Color
3. Choose font family
4. Click **Save Settings**

## Database Tables

The plugin creates three tables:

- `{prefix}_psab_pages` - Stores page configurations
- `{prefix}_psab_blocks` - Stores reusable blocks
- `{prefix}_psab_app_config` - Stores app settings

## Hooks and Filters

### Register Custom Blocks

```php
add_action('psab_register_blocks', function($registry) {
    $registry->register_block('my_custom_block', [
        'label' => 'My Custom Block',
        'category' => 'custom',
        'icon' => 'block-default',
        'description' => 'A custom block',
        'schema' => [
            'title' => ['type' => 'string', 'default' => ''],
            'content' => ['type' => 'string', 'default' => ''],
        ],
    ]);
});
```

### Modify Theme Config

```php
add_filter('psab_theme_config', function($theme) {
    $theme['primaryColor'] = '#ff0000';
    return $theme;
});
```

### Process Meta Fields

```php
add_filter('psab_meta_field_value', function($value, $object_id, $meta_key, $object_type) {
    // Modify meta field value
    return $value;
}, 10, 4);
```

### Format Custom Meta

```php
add_filter('psab_format_meta_custom', function($value, $format) {
    if ($format === 'my_format') {
        // Custom formatting
        return $formatted_value;
    }
    return $value;
}, 10, 2);
```

## Security

### Permissions

- Only administrators can access the app builder
- REST API endpoints are publicly accessible for read operations
- Write operations require authentication and admin permissions

### Data Sanitization

All input is sanitized:
- Text fields: `sanitize_text_field()`
- HTML: `wp_kses_post()`
- URLs: `esc_url()`
- JSON: `json_encode()` / `json_decode()`

### Nonce Verification

All AJAX requests require valid nonces:

```javascript
wp_ajax_nonce: 'psab-admin'
```

## Troubleshooting

### Plugin Won't Activate

- Ensure WooCommerce is installed and active
- Check PHP version (7.4+ required)
- Check WordPress version (5.8+ required)

### Builder Interface Not Loading

- Check browser console for JavaScript errors
- Ensure WordPress admin assets are loading
- Clear browser cache

### API Returns Errors

- Check WooCommerce API keys
- Ensure permalinks are enabled
- Check server .htaccess rules

### Pages Not Updating

- Clear WordPress object cache
- Check database table permissions
- Verify REST API is accessible

## Performance

### Optimization Tips

1. **Enable Caching** - Use WordPress caching plugins
2. **Optimize Images** - Compress images before upload
3. **Limit Blocks** - Don't overload pages with too many blocks
4. **CDN** - Use a CDN for assets
5. **Database** - Regularly optimize database tables

### Caching

The plugin is compatible with:
- WP Super Cache
- W3 Total Cache
- WP Rocket
- Redis Object Cache

## Uninstallation

1. Deactivate the plugin
2. Delete the plugin files

Note: Database tables are preserved. To remove them, run:

```sql
DROP TABLE IF EXISTS wp_psab_pages;
DROP TABLE IF EXISTS wp_psab_blocks;
DROP TABLE IF EXISTS wp_psab_app_config;
```

## Support

For support, please:
- Open an issue on GitHub
- Email: support@pesashop.com
- Visit: https://pesashop.com/docs

## Changelog

### 1.0.0 - 2026-01-10
- Initial release
- Drag-and-drop page builder
- 20+ built-in blocks
- Full WooCommerce integration
- REST API
- Theme customization
- Visibility rules
- Shortcode support
- Meta field support
- WebView support

## License

GPL v2 or later

---

**Version:** 1.0.0
**Requires:** WordPress 5.8+, WooCommerce 5.0+
**Tested up to:** WordPress 6.4
