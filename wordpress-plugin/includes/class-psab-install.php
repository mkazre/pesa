<?php
/**
 * Installation related functions and actions
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_Install Class
 */
class PSAB_Install {

    /**
     * DB updates that need to be run per version
     */
    private static $db_updates = array(
        '1.0.0' => array(
            'psab_update_100_create_tables',
            'psab_update_100_default_pages',
        ),
    );

    /**
     * Hook in tabs
     */
    public static function init() {
        add_action('init', array(__CLASS__, 'check_version'), 5);
    }

    /**
     * Check version and run the updater if necessary
     */
    public static function check_version() {
        $current_db_version = get_option('psab_db_version', '0.0.0');
        $current_version = get_option('psab_version', '0.0.0');

        // If no version is set or version is outdated, run install
        if (!$current_db_version || version_compare($current_db_version, PSAB_VERSION, '<')) {
            self::install();
        }
    }

    /**
     * Install PSAB
     */
    public static function install() {
        if (!is_blog_installed()) {
            return;
        }

        // Check if we are not already running this routine
        if ('yes' === get_transient('psab_installing')) {
            return;
        }

        // Set transient to prevent simultaneous installs
        set_transient('psab_installing', 'yes', MINUTE_IN_SECONDS * 10);

        self::create_tables();
        self::create_default_pages();
        self::create_default_blocks();
        self::update_version();

        delete_transient('psab_installing');

        do_action('psab_installed');
    }

    /**
     * Activation hook
     */
    public static function activate() {
        if (!psab_is_woocommerce_active()) {
            deactivate_plugins(PSAB_PLUGIN_BASENAME);
            wp_die(
                __('PESA Shop App Builder requires WooCommerce to be installed and active.', 'pesa-shop-app-builder'),
                __('Plugin Activation Error', 'pesa-shop-app-builder'),
                array('back_link' => true)
            );
        }

        self::install();
        flush_rewrite_rules();
    }

    /**
     * Deactivation hook
     */
    public static function deactivate() {
        flush_rewrite_rules();
    }

    /**
     * Create tables
     */
    private static function create_tables() {
        global $wpdb;

        $wpdb->hide_errors();

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $charset_collate = $wpdb->get_charset_collate();

        $tables = "
        CREATE TABLE {$wpdb->prefix}psab_pages (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            page_key varchar(100) NOT NULL,
            page_title varchar(255) NOT NULL,
            page_type varchar(50) NOT NULL DEFAULT 'custom',
            page_config longtext NOT NULL,
            is_active tinyint(1) NOT NULL DEFAULT 1,
            menu_order int(11) NOT NULL DEFAULT 0,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY page_key (page_key),
            KEY page_type (page_type),
            KEY is_active (is_active)
        ) $charset_collate;

        CREATE TABLE {$wpdb->prefix}psab_blocks (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            block_type varchar(100) NOT NULL,
            block_name varchar(255) NOT NULL,
            block_config longtext NOT NULL,
            is_active tinyint(1) NOT NULL DEFAULT 1,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY block_type (block_type),
            KEY is_active (is_active)
        ) $charset_collate;

        CREATE TABLE {$wpdb->prefix}psab_app_config (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            config_key varchar(100) NOT NULL,
            config_value longtext NOT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY config_key (config_key)
        ) $charset_collate;
        ";

        dbDelta($tables);
    }

    /**
     * Create default pages
     */
    private static function create_default_pages() {
        global $wpdb;

        $default_pages = array(
            array(
                'page_key' => 'home',
                'page_title' => 'Home',
                'page_type' => 'home',
                'page_config' => json_encode(array(
                    'blocks' => array(),
                    'settings' => array(
                        'backgroundColor' => '#ffffff',
                        'padding' => array('top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0)
                    )
                )),
                'is_active' => 1,
                'menu_order' => 1
            ),
            array(
                'page_key' => 'shop',
                'page_title' => 'Shop',
                'page_type' => 'shop',
                'page_config' => json_encode(array(
                    'blocks' => array(),
                    'settings' => array(
                        'backgroundColor' => '#ffffff',
                        'padding' => array('top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0)
                    )
                )),
                'is_active' => 1,
                'menu_order' => 2
            ),
            array(
                'page_key' => 'cart',
                'page_title' => 'Cart',
                'page_type' => 'cart',
                'page_config' => json_encode(array(
                    'blocks' => array(),
                    'settings' => array(
                        'backgroundColor' => '#ffffff',
                        'padding' => array('top' => 16, 'right' => 16, 'bottom' => 16, 'left' => 16)
                    )
                )),
                'is_active' => 1,
                'menu_order' => 3
            ),
            array(
                'page_key' => 'checkout',
                'page_title' => 'Checkout',
                'page_type' => 'checkout',
                'page_config' => json_encode(array(
                    'blocks' => array(
                        array(
                            'id' => 'checkout-webview-1',
                            'type' => 'webview',
                            'config' => array(
                                'url' => '/checkout',
                                'enableAuth' => true
                            )
                        )
                    ),
                    'settings' => array(
                        'backgroundColor' => '#ffffff',
                        'padding' => array('top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0)
                    )
                )),
                'is_active' => 1,
                'menu_order' => 4
            ),
            array(
                'page_key' => 'account',
                'page_title' => 'Account',
                'page_type' => 'account',
                'page_config' => json_encode(array(
                    'blocks' => array(),
                    'settings' => array(
                        'backgroundColor' => '#ffffff',
                        'padding' => array('top' => 16, 'right' => 16, 'bottom' => 16, 'left' => 16)
                    )
                )),
                'is_active' => 1,
                'menu_order' => 5
            ),
            array(
                'page_key' => 'product',
                'page_title' => 'Product Detail',
                'page_type' => 'product',
                'page_config' => json_encode(array(
                    'blocks' => array(),
                    'settings' => array(
                        'backgroundColor' => '#ffffff',
                        'padding' => array('top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0)
                    )
                )),
                'is_active' => 1,
                'menu_order' => 6
            )
        );

        foreach ($default_pages as $page) {
            $existing = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM {$wpdb->prefix}psab_pages WHERE page_key = %s",
                $page['page_key']
            ));

            if (!$existing) {
                $result = $wpdb->insert(
                    $wpdb->prefix . 'psab_pages',
                    $page,
                    array('%s', '%s', '%s', '%s', '%d', '%d')
                );

                if ($result === false) {
                    error_log('PSAB: Failed to insert page: ' . $page['page_key'] . ' - Error: ' . $wpdb->last_error);
                }
            }
        }
    }

    /**
     * Create default block configurations
     */
    private static function create_default_blocks() {
        // Reserved for future use: Pre-defined block templates
    }

    /**
     * Update version
     */
    private static function update_version() {
        update_option('psab_version', PSAB_VERSION);
        update_option('psab_db_version', PSAB_VERSION);
    }
}

PSAB_Install::init();
