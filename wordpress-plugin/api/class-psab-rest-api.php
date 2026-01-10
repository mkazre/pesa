<?php
/**
 * REST API Main Class
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_REST_API Class
 */
class PSAB_REST_API {

    /**
     * Single instance
     */
    protected static $_instance = null;

    /**
     * Namespace
     */
    const NAMESPACE_V1 = 'pesa-shop/v1';

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
        $this->init();
    }

    /**
     * Initialize REST API
     */
    public function init() {
        $this->register_routes();
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        $controllers = array(
            'PSAB_REST_Config_Controller',
            'PSAB_REST_Pages_Controller',
            'PSAB_REST_Blocks_Controller',
        );

        foreach ($controllers as $controller) {
            if (class_exists($controller)) {
                $controller_instance = new $controller();
                $controller_instance->register_routes();
            }
        }
    }

    /**
     * Check if user has permission
     */
    public static function check_permission() {
        return current_user_can('read');
    }

    /**
     * Check if user has admin permission
     */
    public static function check_admin_permission() {
        return current_user_can('manage_options');
    }
}
