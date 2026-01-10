<?php
/**
 * REST API Blocks Controller
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_REST_Blocks_Controller Class
 */
class PSAB_REST_Blocks_Controller extends WP_REST_Controller {

    /**
     * Namespace
     */
    protected $namespace = 'pesa-shop/v1';

    /**
     * Rest base
     */
    protected $rest_base = 'blocks';

    /**
     * Register routes
     */
    public function register_routes() {
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_blocks'),
                'permission_callback' => '__return_true',
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/categories', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_categories'),
                'permission_callback' => '__return_true',
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<type>[a-zA-Z0-9_-]+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_block'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'type' => array(
                        'description' => __('Block type', 'pesa-shop-app-builder'),
                        'type' => 'string',
                    ),
                ),
            ),
        ));
    }

    /**
     * Get all blocks
     */
    public function get_blocks($request) {
        $block_registry = PSAB_Block_Registry::instance();
        $blocks = $block_registry->get_blocks();

        $category = $request->get_param('category');
        if ($category) {
            $blocks = $block_registry->get_blocks_by_category($category);
        }

        return rest_ensure_response($blocks);
    }

    /**
     * Get block by type
     */
    public function get_block($request) {
        $block_registry = PSAB_Block_Registry::instance();
        $block = $block_registry->get_block($request['type']);

        if (!$block) {
            return new WP_Error('not_found', __('Block not found.', 'pesa-shop-app-builder'), array('status' => 404));
        }

        return rest_ensure_response($block);
    }

    /**
     * Get categories
     */
    public function get_categories($request) {
        $block_registry = PSAB_Block_Registry::instance();
        $categories = $block_registry->get_categories();

        return rest_ensure_response($categories);
    }
}
