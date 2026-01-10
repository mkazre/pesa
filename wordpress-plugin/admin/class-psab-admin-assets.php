<?php
/**
 * Admin Assets
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_Admin_Assets Class
 */
class PSAB_Admin_Assets {

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
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_scripts($hook) {
        if (strpos($hook, 'pesa-shop-app-builder') === false && strpos($hook, 'psab-') === false) {
            return;
        }

        // Enqueue WordPress components
        wp_enqueue_style('wp-components');
        wp_enqueue_script('wp-element');
        wp_enqueue_script('wp-components');
        wp_enqueue_script('wp-api-fetch');

        // Enqueue admin CSS
        wp_enqueue_style(
            'psab-admin',
            PSAB_PLUGIN_URL . 'assets/css/admin.css',
            array('wp-components'),
            PSAB_VERSION
        );

        // Enqueue admin JS (builder app)
        wp_enqueue_script(
            'psab-admin-app',
            PSAB_PLUGIN_URL . 'assets/js/admin-app.js',
            array('wp-element', 'wp-components', 'wp-api-fetch', 'jquery', 'jquery-ui-sortable', 'jquery-ui-draggable', 'jquery-ui-droppable'),
            PSAB_VERSION,
            true
        );

        // Localize script
        wp_localize_script('psab-admin-app', 'psabAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('psab-admin'),
            'restUrl' => rest_url('pesa-shop/v1/'),
            'restNonce' => wp_create_nonce('wp_rest'),
            'siteUrl' => get_site_url(),
            'pluginUrl' => PSAB_PLUGIN_URL,
            'version' => PSAB_VERSION,
            'i18n' => array(
                'addBlock' => __('Add Block', 'pesa-shop-app-builder'),
                'editBlock' => __('Edit Block', 'pesa-shop-app-builder'),
                'deleteBlock' => __('Delete Block', 'pesa-shop-app-builder'),
                'savePage' => __('Save Page', 'pesa-shop-app-builder'),
                'addPage' => __('Add Page', 'pesa-shop-app-builder'),
                'editPage' => __('Edit Page', 'pesa-shop-app-builder'),
                'deletePage' => __('Delete Page', 'pesa-shop-app-builder'),
                'confirmDelete' => __('Are you sure you want to delete this?', 'pesa-shop-app-builder'),
                'saved' => __('Saved successfully', 'pesa-shop-app-builder'),
                'error' => __('An error occurred', 'pesa-shop-app-builder'),
            ),
        ));
    }
}
