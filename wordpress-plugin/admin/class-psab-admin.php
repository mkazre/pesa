<?php
/**
 * Admin Main Class
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_Admin Class
 */
class PSAB_Admin {

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
        $this->init();
    }

    /**
     * Initialize admin
     */
    public function init() {
        PSAB_Admin_Menus::instance();
        PSAB_Admin_Assets::instance();

        add_action('admin_notices', array($this, 'admin_notices'));
    }

    /**
     * Admin notices
     */
    public function admin_notices() {
        if (!psab_is_woocommerce_active()) {
            ?>
            <div class="notice notice-error">
                <p><?php esc_html_e('PESA Shop App Builder requires WooCommerce to be installed and active.', 'pesa-shop-app-builder'); ?></p>
            </div>
            <?php
        }
    }
}
