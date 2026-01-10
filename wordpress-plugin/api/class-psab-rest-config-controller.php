<?php
/**
 * REST API Config Controller
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_REST_Config_Controller Class
 */
class PSAB_REST_Config_Controller extends WP_REST_Controller {

    /**
     * Namespace
     */
    protected $namespace = 'pesa-shop/v1';

    /**
     * Rest base
     */
    protected $rest_base = 'config';

    /**
     * Register routes
     */
    public function register_routes() {
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_config'),
                'permission_callback' => '__return_true',
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/app', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_app_config'),
                'permission_callback' => '__return_true',
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<key>[a-zA-Z0-9_-]+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_config_by_key'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'key' => array(
                        'description' => __('Config key', 'pesa-shop-app-builder'),
                        'type' => 'string',
                    ),
                ),
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_config'),
                'permission_callback' => array('PSAB_REST_API', 'check_admin_permission'),
                'args' => array(
                    'key' => array(
                        'description' => __('Config key', 'pesa-shop-app-builder'),
                        'type' => 'string',
                    ),
                    'value' => array(
                        'description' => __('Config value', 'pesa-shop-app-builder'),
                        'type' => 'string',
                    ),
                ),
            ),
        ));
    }

    /**
     * Get full configuration
     */
    public function get_config($request) {
        global $wpdb;

        $config = array();

        $results = $wpdb->get_results("SELECT config_key, config_value FROM {$wpdb->prefix}psab_app_config", ARRAY_A);

        foreach ($results as $row) {
            $config[$row['config_key']] = json_decode($row['config_value'], true);
        }

        // Add site info
        $config['site'] = array(
            'url' => get_site_url(),
            'name' => get_bloginfo('name'),
            'description' => get_bloginfo('description'),
        );

        // Add WooCommerce info
        if (psab_is_woocommerce_active()) {
            $config['woocommerce'] = array(
                'currency' => get_woocommerce_currency(),
                'currency_symbol' => get_woocommerce_currency_symbol(),
                'price_decimals' => wc_get_price_decimals(),
            );
        }

        return rest_ensure_response($config);
    }

    /**
     * Get app configuration (for mobile app)
     */
    public function get_app_config($request) {
        $page_manager = PSAB_Page_Manager::instance();
        $block_registry = PSAB_Block_Registry::instance();

        // Get all active pages
        $pages = $page_manager->get_pages(array('is_active' => 1));

        // Format pages for app
        $formatted_pages = array();
        foreach ($pages as $page) {
            $formatted_pages[] = array(
                'id' => $page['id'],
                'key' => $page['page_key'],
                'title' => $page['page_title'],
                'type' => $page['page_type'],
                'config' => $page['page_config'],
            );
        }

        $config = array(
            'version' => PSAB_VERSION,
            'pages' => $formatted_pages,
            'theme' => $this->get_theme_config(),
            'site' => array(
                'url' => get_site_url(),
                'name' => get_bloginfo('name'),
                'description' => get_bloginfo('description'),
                'logo' => get_site_icon_url(),
            ),
            'woocommerce' => array(
                'enabled' => psab_is_woocommerce_active(),
                'currency' => psab_is_woocommerce_active() ? get_woocommerce_currency() : 'USD',
                'currency_symbol' => psab_is_woocommerce_active() ? get_woocommerce_currency_symbol() : '$',
                'price_decimals' => psab_is_woocommerce_active() ? wc_get_price_decimals() : 2,
            ),
        );

        return rest_ensure_response($config);
    }

    /**
     * Get theme configuration
     */
    private function get_theme_config() {
        $theme = array(
            'primaryColor' => get_option('psab_theme_primary_color', '#007bff'),
            'secondaryColor' => get_option('psab_theme_secondary_color', '#6c757d'),
            'backgroundColor' => get_option('psab_theme_bg_color', '#ffffff'),
            'textColor' => get_option('psab_theme_text_color', '#000000'),
            'fontFamily' => get_option('psab_theme_font_family', 'Roboto'),
        );

        return apply_filters('psab_theme_config', $theme);
    }

    /**
     * Get config by key
     */
    public function get_config_by_key($request) {
        global $wpdb;

        $key = $request['key'];

        $result = $wpdb->get_var($wpdb->prepare(
            "SELECT config_value FROM {$wpdb->prefix}psab_app_config WHERE config_key = %s",
            $key
        ));

        if (!$result) {
            return new WP_Error('not_found', __('Config not found.', 'pesa-shop-app-builder'), array('status' => 404));
        }

        return rest_ensure_response(json_decode($result, true));
    }

    /**
     * Update config
     */
    public function update_config($request) {
        global $wpdb;

        $key = $request['key'];
        $value = $request['value'];

        // Check if config exists
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}psab_app_config WHERE config_key = %s",
            $key
        ));

        if ($exists) {
            $result = $wpdb->update(
                $wpdb->prefix . 'psab_app_config',
                array('config_value' => is_string($value) ? $value : json_encode($value)),
                array('config_key' => $key),
                array('%s'),
                array('%s')
            );
        } else {
            $result = $wpdb->insert(
                $wpdb->prefix . 'psab_app_config',
                array(
                    'config_key' => $key,
                    'config_value' => is_string($value) ? $value : json_encode($value),
                ),
                array('%s', '%s')
            );
        }

        if ($result === false) {
            return new WP_Error('db_error', __('Failed to update config.', 'pesa-shop-app-builder'), array('status' => 500));
        }

        return rest_ensure_response(array('success' => true));
    }
}
