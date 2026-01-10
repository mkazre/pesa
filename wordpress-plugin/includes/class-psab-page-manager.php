<?php
/**
 * Page Manager - Handles all page CRUD operations
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_Page_Manager Class
 */
class PSAB_Page_Manager {

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
        // Reserved for hooks
    }

    /**
     * Get all pages
     */
    public function get_pages($args = array()) {
        global $wpdb;

        $defaults = array(
            'is_active' => null,
            'page_type' => null,
            'orderby' => 'menu_order',
            'order' => 'ASC',
        );

        $args = wp_parse_args($args, $defaults);

        $where = array('1=1');
        $where_values = array();

        if (!is_null($args['is_active'])) {
            $where[] = 'is_active = %d';
            $where_values[] = $args['is_active'];
        }

        if (!is_null($args['page_type'])) {
            $where[] = 'page_type = %s';
            $where_values[] = $args['page_type'];
        }

        $where_clause = implode(' AND ', $where);
        $order_clause = sprintf('%s %s', $args['orderby'], $args['order']);

        $query = "SELECT * FROM {$wpdb->prefix}psab_pages WHERE {$where_clause} ORDER BY {$order_clause}";

        if (!empty($where_values)) {
            $query = $wpdb->prepare($query, $where_values);
        }

        $results = $wpdb->get_results($query, ARRAY_A);

        if (!$results) {
            return array();
        }

        return array_map(array($this, 'format_page'), $results);
    }

    /**
     * Get page by ID
     */
    public function get_page($id) {
        global $wpdb;

        $result = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}psab_pages WHERE id = %d",
            $id
        ), ARRAY_A);

        if (!$result) {
            return null;
        }

        return $this->format_page($result);
    }

    /**
     * Get page by key
     */
    public function get_page_by_key($page_key) {
        global $wpdb;

        $result = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}psab_pages WHERE page_key = %s",
            $page_key
        ), ARRAY_A);

        if (!$result) {
            return null;
        }

        return $this->format_page($result);
    }

    /**
     * Create page
     */
    public function create_page($data) {
        global $wpdb;

        $defaults = array(
            'page_key' => '',
            'page_title' => '',
            'page_type' => 'custom',
            'page_config' => json_encode(array('blocks' => array(), 'settings' => array())),
            'is_active' => 1,
            'menu_order' => 0,
        );

        $data = wp_parse_args($data, $defaults);

        // Validate required fields
        if (empty($data['page_key']) || empty($data['page_title'])) {
            return new WP_Error('invalid_data', __('Page key and title are required.', 'pesa-shop-app-builder'));
        }

        // Check if page_key already exists
        $existing = $this->get_page_by_key($data['page_key']);
        if ($existing) {
            return new WP_Error('duplicate_key', __('Page key already exists.', 'pesa-shop-app-builder'));
        }

        // Ensure page_config is JSON string
        if (is_array($data['page_config'])) {
            $data['page_config'] = json_encode($data['page_config']);
        }

        $result = $wpdb->insert(
            $wpdb->prefix . 'psab_pages',
            $data,
            array('%s', '%s', '%s', '%s', '%d', '%d')
        );

        if ($result === false) {
            return new WP_Error('db_error', __('Failed to create page.', 'pesa-shop-app-builder'));
        }

        return $this->get_page($wpdb->insert_id);
    }

    /**
     * Update page
     */
    public function update_page($id, $data) {
        global $wpdb;

        $page = $this->get_page($id);
        if (!$page) {
            return new WP_Error('not_found', __('Page not found.', 'pesa-shop-app-builder'));
        }

        // Ensure page_config is JSON string
        if (isset($data['page_config']) && is_array($data['page_config'])) {
            $data['page_config'] = json_encode($data['page_config']);
        }

        // Check for duplicate page_key if being updated
        if (isset($data['page_key']) && $data['page_key'] !== $page['page_key']) {
            $existing = $this->get_page_by_key($data['page_key']);
            if ($existing && $existing['id'] !== $id) {
                return new WP_Error('duplicate_key', __('Page key already exists.', 'pesa-shop-app-builder'));
            }
        }

        $result = $wpdb->update(
            $wpdb->prefix . 'psab_pages',
            $data,
            array('id' => $id),
            null,
            array('%d')
        );

        if ($result === false) {
            return new WP_Error('db_error', __('Failed to update page.', 'pesa-shop-app-builder'));
        }

        return $this->get_page($id);
    }

    /**
     * Delete page
     */
    public function delete_page($id) {
        global $wpdb;

        $page = $this->get_page($id);
        if (!$page) {
            return new WP_Error('not_found', __('Page not found.', 'pesa-shop-app-builder'));
        }

        // Prevent deletion of core pages
        $core_pages = array('home', 'shop', 'cart', 'checkout', 'account', 'product');
        if (in_array($page['page_key'], $core_pages)) {
            return new WP_Error('protected_page', __('Cannot delete core pages.', 'pesa-shop-app-builder'));
        }

        $result = $wpdb->delete(
            $wpdb->prefix . 'psab_pages',
            array('id' => $id),
            array('%d')
        );

        if ($result === false) {
            return new WP_Error('db_error', __('Failed to delete page.', 'pesa-shop-app-builder'));
        }

        return true;
    }

    /**
     * Format page data
     */
    private function format_page($page) {
        if (isset($page['page_config']) && is_string($page['page_config'])) {
            $page['page_config'] = json_decode($page['page_config'], true);
        }

        $page['id'] = (int) $page['id'];
        $page['is_active'] = (int) $page['is_active'];
        $page['menu_order'] = (int) $page['menu_order'];

        return $page;
    }

    /**
     * Update page order
     */
    public function update_page_order($page_orders) {
        global $wpdb;

        foreach ($page_orders as $order_data) {
            if (!isset($order_data['id']) || !isset($order_data['menu_order'])) {
                continue;
            }

            $wpdb->update(
                $wpdb->prefix . 'psab_pages',
                array('menu_order' => $order_data['menu_order']),
                array('id' => $order_data['id']),
                array('%d'),
                array('%d')
            );
        }

        return true;
    }
}
