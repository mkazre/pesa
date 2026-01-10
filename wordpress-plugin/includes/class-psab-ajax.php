<?php
/**
 * AJAX Handler
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_Ajax Class
 */
class PSAB_Ajax {

    /**
     * Hook in ajax handlers
     */
    public static function init() {
        self::add_ajax_events();
    }

    /**
     * Hook in methods
     */
    public static function add_ajax_events() {
        $ajax_events = array(
            'get_pages',
            'save_page',
            'delete_page',
            'update_page_order',
            'get_blocks',
            'get_shortcodes',
            'process_shortcode',
            'get_meta_keys',
            'get_categories',
            'get_products',
        );

        foreach ($ajax_events as $ajax_event) {
            add_action('wp_ajax_psab_' . $ajax_event, array(__CLASS__, $ajax_event));
        }
    }

    /**
     * Get pages
     */
    public static function get_pages() {
        check_ajax_referer('psab-admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'pesa-shop-app-builder')));
        }

        $page_manager = PSAB_Page_Manager::instance();
        $pages = $page_manager->get_pages();

        wp_send_json_success($pages);
    }

    /**
     * Save page
     */
    public static function save_page() {
        check_ajax_referer('psab-admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'pesa-shop-app-builder')));
        }

        $page_id = isset($_POST['page_id']) ? intval($_POST['page_id']) : 0;
        $page_data = isset($_POST['page_data']) ? json_decode(stripslashes($_POST['page_data']), true) : array();

        if (empty($page_data)) {
            wp_send_json_error(array('message' => __('Invalid page data.', 'pesa-shop-app-builder')));
        }

        $page_manager = PSAB_Page_Manager::instance();

        if ($page_id > 0) {
            $result = $page_manager->update_page($page_id, $page_data);
        } else {
            $result = $page_manager->create_page($page_data);
        }

        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }

        wp_send_json_success($result);
    }

    /**
     * Delete page
     */
    public static function delete_page() {
        check_ajax_referer('psab-admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'pesa-shop-app-builder')));
        }

        $page_id = isset($_POST['page_id']) ? intval($_POST['page_id']) : 0;

        if (!$page_id) {
            wp_send_json_error(array('message' => __('Invalid page ID.', 'pesa-shop-app-builder')));
        }

        $page_manager = PSAB_Page_Manager::instance();
        $result = $page_manager->delete_page($page_id);

        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }

        wp_send_json_success();
    }

    /**
     * Update page order
     */
    public static function update_page_order() {
        check_ajax_referer('psab-admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'pesa-shop-app-builder')));
        }

        $page_orders = isset($_POST['page_orders']) ? json_decode(stripslashes($_POST['page_orders']), true) : array();

        if (empty($page_orders)) {
            wp_send_json_error(array('message' => __('Invalid page order data.', 'pesa-shop-app-builder')));
        }

        $page_manager = PSAB_Page_Manager::instance();
        $page_manager->update_page_order($page_orders);

        wp_send_json_success();
    }

    /**
     * Get blocks
     */
    public static function get_blocks() {
        check_ajax_referer('psab-admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'pesa-shop-app-builder')));
        }

        $block_registry = PSAB_Block_Registry::instance();
        $blocks = $block_registry->get_blocks();
        $categories = $block_registry->get_categories();

        wp_send_json_success(array(
            'blocks' => $blocks,
            'categories' => $categories,
        ));
    }

    /**
     * Get shortcodes
     */
    public static function get_shortcodes() {
        check_ajax_referer('psab-admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'pesa-shop-app-builder')));
        }

        $shortcodes = PSAB_Shortcode_Processor::get_available_shortcodes();

        wp_send_json_success($shortcodes);
    }

    /**
     * Process shortcode
     */
    public static function process_shortcode() {
        check_ajax_referer('psab-admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'pesa-shop-app-builder')));
        }

        $shortcode = isset($_POST['shortcode']) ? sanitize_text_field($_POST['shortcode']) : '';
        $context = isset($_POST['context']) ? json_decode(stripslashes($_POST['context']), true) : array();

        if (empty($shortcode)) {
            wp_send_json_error(array('message' => __('No shortcode provided.', 'pesa-shop-app-builder')));
        }

        $output = PSAB_Shortcode_Processor::process($shortcode, $context);
        $output = PSAB_Shortcode_Processor::sanitize_output($output);

        wp_send_json_success(array('output' => $output));
    }

    /**
     * Get meta keys
     */
    public static function get_meta_keys() {
        check_ajax_referer('psab-admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'pesa-shop-app-builder')));
        }

        global $wpdb;

        $object_type = isset($_POST['object_type']) ? sanitize_text_field($_POST['object_type']) : 'post';

        $meta_keys = array();

        switch ($object_type) {
            case 'post':
                $meta_keys = $wpdb->get_col("SELECT DISTINCT meta_key FROM {$wpdb->postmeta} WHERE meta_key NOT LIKE '\_%' ORDER BY meta_key");
                break;

            case 'user':
                $meta_keys = $wpdb->get_col("SELECT DISTINCT meta_key FROM {$wpdb->usermeta} WHERE meta_key NOT LIKE '\_%' ORDER BY meta_key");
                break;

            case 'term':
                $meta_keys = $wpdb->get_col("SELECT DISTINCT meta_key FROM {$wpdb->termmeta} WHERE meta_key NOT LIKE '\_%' ORDER BY meta_key");
                break;
        }

        wp_send_json_success($meta_keys);
    }

    /**
     * Get categories
     */
    public static function get_categories() {
        check_ajax_referer('psab-admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'pesa-shop-app-builder')));
        }

        $categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
        ));

        if (is_wp_error($categories)) {
            wp_send_json_error(array('message' => $categories->get_error_message()));
        }

        wp_send_json_success($categories);
    }

    /**
     * Get products
     */
    public static function get_products() {
        check_ajax_referer('psab-admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'pesa-shop-app-builder')));
        }

        $args = array(
            'post_type' => 'product',
            'posts_per_page' => 20,
            'post_status' => 'publish',
        );

        $products = get_posts($args);

        $formatted_products = array_map(function($product) {
            return array(
                'id' => $product->ID,
                'name' => $product->post_title,
                'slug' => $product->post_name,
            );
        }, $products);

        wp_send_json_success($formatted_products);
    }
}

PSAB_Ajax::init();
