<?php
/**
 * Admin Menus
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_Admin_Menus Class
 */
class PSAB_Admin_Menus {

    /**
     * Single instance
     */
    protected static $_instance = null;

    /**
     * Main instance
     */
    public static function instance() {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'admin_menu'));
    }

    /**
     * Add admin menu
     */
    public function admin_menu() {
        add_menu_page(
            __('PESA Shop App Builder', 'pesa-shop-app-builder'),
            __('App Builder', 'pesa-shop-app-builder'),
            'manage_options',
            'pesa-shop-app-builder',
            array($this, 'app_builder_page'),
            'dashicons-smartphone',
            56
        );

        add_submenu_page(
            'pesa-shop-app-builder',
            __('App Builder', 'pesa-shop-app-builder'),
            __('Builder', 'pesa-shop-app-builder'),
            'manage_options',
            'pesa-shop-app-builder',
            array($this, 'app_builder_page')
        );

        add_submenu_page(
            'pesa-shop-app-builder',
            __('Pages', 'pesa-shop-app-builder'),
            __('Pages', 'pesa-shop-app-builder'),
            'manage_options',
            'psab-pages',
            array($this, 'pages_page')
        );

        add_submenu_page(
            'pesa-shop-app-builder',
            __('Settings', 'pesa-shop-app-builder'),
            __('Settings', 'pesa-shop-app-builder'),
            'manage_options',
            'psab-settings',
            array($this, 'settings_page')
        );

        add_submenu_page(
            'pesa-shop-app-builder',
            __('API Keys', 'pesa-shop-app-builder'),
            __('API Keys', 'pesa-shop-app-builder'),
            'manage_options',
            'psab-api-keys',
            array($this, 'api_keys_page')
        );
    }

    /**
     * App builder page
     */
    public function app_builder_page() {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('PESA Shop App Builder', 'pesa-shop-app-builder'); ?></h1>
            <div id="psab-app-builder-root"></div>
        </div>
        <?php
    }

    /**
     * Pages page
     */
    public function pages_page() {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Manage Pages', 'pesa-shop-app-builder'); ?></h1>
            <div id="psab-pages-root"></div>
        </div>
        <?php
    }

    /**
     * Settings page
     */
    public function settings_page() {
        if (isset($_POST['psab_repair_database'])) {
            check_admin_referer('psab_repair_database');

            // Force reinstall
            PSAB_Install::install();

            echo '<div class="notice notice-success"><p>' . esc_html__('Database repaired successfully. Default pages have been reinstalled.', 'pesa-shop-app-builder') . '</p></div>';
        }

        if (isset($_POST['psab_settings_submit'])) {
            check_admin_referer('psab_settings');

            update_option('psab_theme_primary_color', sanitize_hex_color($_POST['primary_color']));
            update_option('psab_theme_secondary_color', sanitize_hex_color($_POST['secondary_color']));
            update_option('psab_theme_bg_color', sanitize_hex_color($_POST['bg_color']));
            update_option('psab_theme_text_color', sanitize_hex_color($_POST['text_color']));
            update_option('psab_theme_font_family', sanitize_text_field($_POST['font_family']));

            echo '<div class="notice notice-success"><p>' . esc_html__('Settings saved.', 'pesa-shop-app-builder') . '</p></div>';
        }

        $primary_color = get_option('psab_theme_primary_color', '#007bff');
        $secondary_color = get_option('psab_theme_secondary_color', '#6c757d');
        $bg_color = get_option('psab_theme_bg_color', '#ffffff');
        $text_color = get_option('psab_theme_text_color', '#000000');
        $font_family = get_option('psab_theme_font_family', 'Roboto');

        ?>
        <div class="wrap">
            <h1><?php esc_html_e('App Builder Settings', 'pesa-shop-app-builder'); ?></h1>

            <form method="post" action="">
                <?php wp_nonce_field('psab_settings'); ?>

                <table class="form-table">
                    <tbody>
                        <tr>
                            <th scope="row">
                                <label for="primary_color"><?php esc_html_e('Primary Color', 'pesa-shop-app-builder'); ?></label>
                            </th>
                            <td>
                                <input type="color" name="primary_color" id="primary_color" value="<?php echo esc_attr($primary_color); ?>" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="secondary_color"><?php esc_html_e('Secondary Color', 'pesa-shop-app-builder'); ?></label>
                            </th>
                            <td>
                                <input type="color" name="secondary_color" id="secondary_color" value="<?php echo esc_attr($secondary_color); ?>" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="bg_color"><?php esc_html_e('Background Color', 'pesa-shop-app-builder'); ?></label>
                            </th>
                            <td>
                                <input type="color" name="bg_color" id="bg_color" value="<?php echo esc_attr($bg_color); ?>" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="text_color"><?php esc_html_e('Text Color', 'pesa-shop-app-builder'); ?></label>
                            </th>
                            <td>
                                <input type="color" name="text_color" id="text_color" value="<?php echo esc_attr($text_color); ?>" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="font_family"><?php esc_html_e('Font Family', 'pesa-shop-app-builder'); ?></label>
                            </th>
                            <td>
                                <select name="font_family" id="font_family">
                                    <option value="Roboto" <?php selected($font_family, 'Roboto'); ?>>Roboto</option>
                                    <option value="Open Sans" <?php selected($font_family, 'Open Sans'); ?>>Open Sans</option>
                                    <option value="Lato" <?php selected($font_family, 'Lato'); ?>>Lato</option>
                                    <option value="Montserrat" <?php selected($font_family, 'Montserrat'); ?>>Montserrat</option>
                                    <option value="Poppins" <?php selected($font_family, 'Poppins'); ?>>Poppins</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <p class="submit">
                    <input type="submit" name="psab_settings_submit" class="button button-primary" value="<?php esc_attr_e('Save Settings', 'pesa-shop-app-builder'); ?>" />
                </p>
            </form>

            <hr style="margin: 40px 0;" />

            <div class="card">
                <h2><?php esc_html_e('Database Maintenance', 'pesa-shop-app-builder'); ?></h2>
                <p>
                    <?php esc_html_e('If you are experiencing issues with the App Builder (such as missing pages or blank interface), you can repair the database to reinstall default pages and tables.', 'pesa-shop-app-builder'); ?>
                </p>
                <p>
                    <strong><?php esc_html_e('Note:', 'pesa-shop-app-builder'); ?></strong>
                    <?php esc_html_e('This will not delete your existing pages. It will only create any missing default pages and tables.', 'pesa-shop-app-builder'); ?>
                </p>
                <form method="post" action="" onsubmit="return confirm('<?php echo esc_js(__('Are you sure you want to repair the database?', 'pesa-shop-app-builder')); ?>');">
                    <?php wp_nonce_field('psab_repair_database'); ?>
                    <p>
                        <input type="submit" name="psab_repair_database" class="button button-secondary" value="<?php esc_attr_e('Repair Database', 'pesa-shop-app-builder'); ?>" />
                    </p>
                </form>
            </div>
        </div>
        <?php
    }

    /**
     * API keys page
     */
    public function api_keys_page() {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('API Keys', 'pesa-shop-app-builder'); ?></h1>

            <div class="card">
                <h2><?php esc_html_e('WooCommerce API Keys', 'pesa-shop-app-builder'); ?></h2>
                <p><?php esc_html_e('To use this plugin with your mobile app, you need to create WooCommerce REST API keys.', 'pesa-shop-app-builder'); ?></p>

                <ol>
                    <li><?php esc_html_e('Go to WooCommerce → Settings → Advanced → REST API', 'pesa-shop-app-builder'); ?></li>
                    <li><?php esc_html_e('Click "Add key"', 'pesa-shop-app-builder'); ?></li>
                    <li><?php esc_html_e('Give it a description (e.g., "Mobile App")', 'pesa-shop-app-builder'); ?></li>
                    <li><?php esc_html_e('Select "Read/Write" permissions', 'pesa-shop-app-builder'); ?></li>
                    <li><?php esc_html_e('Click "Generate API key"', 'pesa-shop-app-builder'); ?></li>
                    <li><?php esc_html_e('Copy the Consumer key and Consumer secret to your mobile app configuration', 'pesa-shop-app-builder'); ?></li>
                </ol>

                <p>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=wc-settings&tab=advanced&section=keys')); ?>" class="button button-primary">
                        <?php esc_html_e('Manage WooCommerce API Keys', 'pesa-shop-app-builder'); ?>
                    </a>
                </p>
            </div>

            <div class="card" style="margin-top: 20px;">
                <h2><?php esc_html_e('App Configuration Endpoint', 'pesa-shop-app-builder'); ?></h2>
                <p><?php esc_html_e('Use this endpoint in your mobile app to fetch the app configuration:', 'pesa-shop-app-builder'); ?></p>

                <code style="display: block; padding: 10px; background: #f5f5f5; margin: 10px 0;">
                    <?php echo esc_url(rest_url('pesa-shop/v1/config/app')); ?>
                </code>
            </div>
        </div>
        <?php
    }
}
