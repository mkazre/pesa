<?php
/**
 * REST API Pages Controller
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_REST_Pages_Controller Class
 */
class PSAB_REST_Pages_Controller extends WP_REST_Controller {

    /**
     * Namespace
     */
    protected $namespace = 'pesa-shop/v1';

    /**
     * Rest base
     */
    protected $rest_base = 'pages';

    /**
     * Register routes
     */
    public function register_routes() {
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_pages'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_page'),
                'permission_callback' => array('PSAB_REST_API', 'check_admin_permission'),
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_page'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'id' => array(
                        'description' => __('Page ID', 'pesa-shop-app-builder'),
                        'type' => 'integer',
                    ),
                ),
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_page'),
                'permission_callback' => array('PSAB_REST_API', 'check_admin_permission'),
                'args' => array(
                    'id' => array(
                        'description' => __('Page ID', 'pesa-shop-app-builder'),
                        'type' => 'integer',
                    ),
                ),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_page'),
                'permission_callback' => array('PSAB_REST_API', 'check_admin_permission'),
                'args' => array(
                    'id' => array(
                        'description' => __('Page ID', 'pesa-shop-app-builder'),
                        'type' => 'integer',
                    ),
                ),
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/key/(?P<key>[a-zA-Z0-9_-]+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_page_by_key'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'key' => array(
                        'description' => __('Page key', 'pesa-shop-app-builder'),
                        'type' => 'string',
                    ),
                ),
            ),
        ));
    }

    /**
     * Get pages
     */
    public function get_pages($request) {
        $page_manager = PSAB_Page_Manager::instance();

        $args = array();

        if ($request->get_param('is_active') !== null) {
            $args['is_active'] = (int) $request->get_param('is_active');
        }

        if ($request->get_param('page_type')) {
            $args['page_type'] = sanitize_text_field($request->get_param('page_type'));
        }

        $pages = $page_manager->get_pages($args);

        return rest_ensure_response($pages);
    }

    /**
     * Get page
     */
    public function get_page($request) {
        $page_manager = PSAB_Page_Manager::instance();
        $page = $page_manager->get_page($request['id']);

        if (!$page) {
            return new WP_Error('not_found', __('Page not found.', 'pesa-shop-app-builder'), array('status' => 404));
        }

        return rest_ensure_response($page);
    }

    /**
     * Get page by key
     */
    public function get_page_by_key($request) {
        $page_manager = PSAB_Page_Manager::instance();
        $page = $page_manager->get_page_by_key($request['key']);

        if (!$page) {
            return new WP_Error('not_found', __('Page not found.', 'pesa-shop-app-builder'), array('status' => 404));
        }

        return rest_ensure_response($page);
    }

    /**
     * Create page
     */
    public function create_page($request) {
        $page_manager = PSAB_Page_Manager::instance();

        $data = array(
            'page_key' => $request->get_param('page_key'),
            'page_title' => $request->get_param('page_title'),
            'page_type' => $request->get_param('page_type') ?: 'custom',
            'page_config' => $request->get_param('page_config') ?: array('blocks' => array(), 'settings' => array()),
            'is_active' => $request->get_param('is_active') !== null ? (int) $request->get_param('is_active') : 1,
            'menu_order' => $request->get_param('menu_order') ?: 0,
        );

        $result = $page_manager->create_page($data);

        if (is_wp_error($result)) {
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => 400));
        }

        return rest_ensure_response($result);
    }

    /**
     * Update page
     */
    public function update_page($request) {
        $page_manager = PSAB_Page_Manager::instance();

        $data = array();

        if ($request->get_param('page_key')) {
            $data['page_key'] = $request->get_param('page_key');
        }

        if ($request->get_param('page_title')) {
            $data['page_title'] = $request->get_param('page_title');
        }

        if ($request->get_param('page_type')) {
            $data['page_type'] = $request->get_param('page_type');
        }

        if ($request->get_param('page_config')) {
            $data['page_config'] = $request->get_param('page_config');
        }

        if ($request->get_param('is_active') !== null) {
            $data['is_active'] = (int) $request->get_param('is_active');
        }

        if ($request->get_param('menu_order')) {
            $data['menu_order'] = (int) $request->get_param('menu_order');
        }

        $result = $page_manager->update_page($request['id'], $data);

        if (is_wp_error($result)) {
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => 400));
        }

        return rest_ensure_response($result);
    }

    /**
     * Delete page
     */
    public function delete_page($request) {
        $page_manager = PSAB_Page_Manager::instance();
        $result = $page_manager->delete_page($request['id']);

        if (is_wp_error($result)) {
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => 400));
        }

        return rest_ensure_response(array('deleted' => true));
    }
}
