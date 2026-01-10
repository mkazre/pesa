<?php
/**
 * Plugin Name: PESA Shop - Mobile App Builder
 * Plugin URI: https://github.com/mkazre/pesa
 * Description: A powerful drag-and-drop app builder for creating production-ready WooCommerce mobile apps with complete visual control and flexibility.
 * Version: 1.0.0
 * Author: PESA Shop
 * Author URI: https://pesashop.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: pesa-shop-app-builder
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 * WC requires at least: 5.0
 * WC tested up to: 8.5
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

if (!defined('PSAB_VERSION')) {
    define('PSAB_VERSION', '1.0.0');
}

if (!defined('PSAB_PLUGIN_FILE')) {
    define('PSAB_PLUGIN_FILE', __FILE__);
}

if (!defined('PSAB_PLUGIN_DIR')) {
    define('PSAB_PLUGIN_DIR', plugin_dir_path(__FILE__));
}

if (!defined('PSAB_PLUGIN_URL')) {
    define('PSAB_PLUGIN_URL', plugin_dir_url(__FILE__));
}

if (!defined('PSAB_PLUGIN_BASENAME')) {
    define('PSAB_PLUGIN_BASENAME', plugin_basename(__FILE__));
}

/**
 * Check if WooCommerce is active
 */
if (!function_exists('psab_is_woocommerce_active')) {
    function psab_is_woocommerce_active() {
        return class_exists('WooCommerce');
    }
}

/**
 * Main PESA Shop App Builder Class
 */
final class PESA_Shop_App_Builder {

    /**
     * Single instance of the class
     *
     * @var PESA_Shop_App_Builder
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
        $this->includes();
        $this->init_hooks();
    }

    /**
     * Include required core files
     */
    public function includes() {
        // Core
        require_once PSAB_PLUGIN_DIR . 'includes/class-psab-install.php';
        require_once PSAB_PLUGIN_DIR . 'includes/class-psab-ajax.php';
        require_once PSAB_PLUGIN_DIR . 'includes/class-psab-page-manager.php';
        require_once PSAB_PLUGIN_DIR . 'includes/class-psab-block-registry.php';
        require_once PSAB_PLUGIN_DIR . 'includes/class-psab-shortcode-processor.php';
        require_once PSAB_PLUGIN_DIR . 'includes/class-psab-meta-field-processor.php';

        // Admin
        if (is_admin()) {
            require_once PSAB_PLUGIN_DIR . 'admin/class-psab-admin.php';
            require_once PSAB_PLUGIN_DIR . 'admin/class-psab-admin-menus.php';
            require_once PSAB_PLUGIN_DIR . 'admin/class-psab-admin-assets.php';
        }

        // API
        require_once PSAB_PLUGIN_DIR . 'api/class-psab-rest-api.php';
        require_once PSAB_PLUGIN_DIR . 'api/class-psab-rest-config-controller.php';
        require_once PSAB_PLUGIN_DIR . 'api/class-psab-rest-pages-controller.php';
        require_once PSAB_PLUGIN_DIR . 'api/class-psab-rest-blocks-controller.php';
    }

    /**
     * Hook into actions and filters
     */
    private function init_hooks() {
        register_activation_hook(PSAB_PLUGIN_FILE, array('PSAB_Install', 'activate'));
        register_deactivation_hook(PSAB_PLUGIN_FILE, array('PSAB_Install', 'deactivate'));

        add_action('plugins_loaded', array($this, 'on_plugins_loaded'), -1);
        add_action('init', array($this, 'init'), 0);
        add_action('rest_api_init', array($this, 'init_rest_api'));

        // Declare HPOS compatibility
        add_action('before_woocommerce_init', array($this, 'declare_hpos_compatibility'));
    }

    /**
     * Declare compatibility with WooCommerce High-Performance Order Storage (HPOS)
     */
    public function declare_hpos_compatibility() {
        if (class_exists('\Automattic\WooCommerce\Utilities\FeaturesUtil')) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', PSAB_PLUGIN_FILE, true);
        }
    }

    /**
     * When WP has loaded all plugins
     */
    public function on_plugins_loaded() {
        do_action('psab_loaded');
    }

    /**
     * Init when WordPress initializes
     */
    public function init() {
        // Set up localization
        $this->load_plugin_textdomain();

        // Initialize components
        PSAB_Block_Registry::instance();
        PSAB_Page_Manager::instance();

        if (is_admin()) {
            PSAB_Admin::instance();
        }

        do_action('psab_init');
    }

    /**
     * Initialize REST API
     */
    public function init_rest_api() {
        PSAB_REST_API::instance();
    }

    /**
     * Load localization files
     */
    public function load_plugin_textdomain() {
        load_plugin_textdomain('pesa-shop-app-builder', false, dirname(PSAB_PLUGIN_BASENAME) . '/languages');
    }

    /**
     * Get plugin version
     */
    public function version() {
        return PSAB_VERSION;
    }
}

/**
 * Main instance of PESA_Shop_App_Builder
 */
function PSAB() {
    return PESA_Shop_App_Builder::instance();
}

// Global for backwards compatibility
$GLOBALS['pesa_shop_app_builder'] = PSAB();
