<?php
/**
 * REST API Menus Controller
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_REST_Menus_Controller Class
 */
class PSAB_REST_Menus_Controller extends WP_REST_Controller {

    /**
     * Namespace
     */
    protected $namespace = 'pesa-shop/v1';

    /**
     * Rest base
     */
    protected $rest_base = 'menus';

    /**
     * Register routes
     */
    public function register_routes() {
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_menus'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_menu'),
                'permission_callback' => array('PSAB_REST_API', 'check_admin_permission'),
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_menu'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'id' => array(
                        'description' => __('Menu ID', 'pesa-shop-app-builder'),
                        'type' => 'integer',
                    ),
                ),
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_menu'),
                'permission_callback' => array('PSAB_REST_API', 'check_admin_permission'),
                'args' => array(
                    'id' => array(
                        'description' => __('Menu ID', 'pesa-shop-app-builder'),
                        'type' => 'integer',
                    ),
                ),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_menu'),
                'permission_callback' => array('PSAB_REST_API', 'check_admin_permission'),
                'args' => array(
                    'id' => array(
                        'description' => __('Menu ID', 'pesa-shop-app-builder'),
                        'type' => 'integer',
                    ),
                ),
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/key/(?P<key>[a-zA-Z0-9_-]+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_menu_by_key'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'key' => array(
                        'description' => __('Menu key', 'pesa-shop-app-builder'),
                        'type' => 'string',
                    ),
                ),
            ),
        ));

        // Menu items endpoints
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<menu_id>\d+)/items', array(
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_menu_item'),
                'permission_callback' => array('PSAB_REST_API', 'check_admin_permission'),
                'args' => array(
                    'menu_id' => array(
                        'description' => __('Menu ID', 'pesa-shop-app-builder'),
                        'type' => 'integer',
                    ),
                ),
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/items/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_menu_item'),
                'permission_callback' => array('PSAB_REST_API', 'check_admin_permission'),
                'args' => array(
                    'id' => array(
                        'description' => __('Item ID', 'pesa-shop-app-builder'),
                        'type' => 'integer',
                    ),
                ),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_menu_item'),
                'permission_callback' => array('PSAB_REST_API', 'check_admin_permission'),
                'args' => array(
                    'id' => array(
                        'description' => __('Item ID', 'pesa-shop-app-builder'),
                        'type' => 'integer',
                    ),
                ),
            ),
        ));
    }

    /**
     * Get menus
     */
    public function get_menus($request) {
        $menu_manager = PSAB_Menu_Manager::instance();

        $args = array();

        if ($request->get_param('is_active') !== null) {
            $args['is_active'] = (int) $request->get_param('is_active');
        }

        if ($request->get_param('menu_position')) {
            $args['menu_position'] = sanitize_text_field($request->get_param('menu_position'));
        }

        $menus = $menu_manager->get_menus($args);

        return rest_ensure_response($menus);
    }

    /**
     * Get menu
     */
    public function get_menu($request) {
        $menu_manager = PSAB_Menu_Manager::instance();
        $menu = $menu_manager->get_menu($request['id']);

        if (!$menu) {
            return new WP_Error('not_found', __('Menu not found.', 'pesa-shop-app-builder'), array('status' => 404));
        }

        return rest_ensure_response($menu);
    }

    /**
     * Get menu by key
     */
    public function get_menu_by_key($request) {
        $menu_manager = PSAB_Menu_Manager::instance();
        $menu = $menu_manager->get_menu_by_key($request['key']);

        if (!$menu) {
            return new WP_Error('not_found', __('Menu not found.', 'pesa-shop-app-builder'), array('status' => 404));
        }

        return rest_ensure_response($menu);
    }

    /**
     * Create menu
     */
    public function create_menu($request) {
        $menu_manager = PSAB_Menu_Manager::instance();

        $data = array(
            'menu_key' => $request->get_param('menu_key'),
            'menu_name' => $request->get_param('menu_name'),
            'menu_position' => $request->get_param('menu_position') ?: 'bottom',
            'menu_config' => $request->get_param('menu_config') ?: array(
                'layout' => 'tabs',
                'showLabels' => true,
                'showIcons' => true,
                'backgroundColor' => '#ffffff',
                'activeColor' => '#2271b1',
                'inactiveColor' => '#999999',
            ),
            'is_active' => $request->get_param('is_active') !== null ? (int) $request->get_param('is_active') : 1,
            'menu_order' => $request->get_param('menu_order') ?: 0,
        );

        $result = $menu_manager->create_menu($data);

        if (is_wp_error($result)) {
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => 400));
        }

        return rest_ensure_response($result);
    }

    /**
     * Update menu
     */
    public function update_menu($request) {
        $menu_manager = PSAB_Menu_Manager::instance();

        $data = array();

        if ($request->get_param('menu_key')) {
            $data['menu_key'] = $request->get_param('menu_key');
        }

        if ($request->get_param('menu_name')) {
            $data['menu_name'] = $request->get_param('menu_name');
        }

        if ($request->get_param('menu_position')) {
            $data['menu_position'] = $request->get_param('menu_position');
        }

        if ($request->get_param('menu_config')) {
            $data['menu_config'] = $request->get_param('menu_config');
        }

        if ($request->get_param('is_active') !== null) {
            $data['is_active'] = (int) $request->get_param('is_active');
        }

        if ($request->get_param('menu_order')) {
            $data['menu_order'] = (int) $request->get_param('menu_order');
        }

        $result = $menu_manager->update_menu($request['id'], $data);

        if (is_wp_error($result)) {
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => 400));
        }

        return rest_ensure_response($result);
    }

    /**
     * Delete menu
     */
    public function delete_menu($request) {
        $menu_manager = PSAB_Menu_Manager::instance();
        $result = $menu_manager->delete_menu($request['id']);

        if (is_wp_error($result)) {
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => 400));
        }

        return rest_ensure_response(array('deleted' => true));
    }

    /**
     * Create menu item
     */
    public function create_menu_item($request) {
        $menu_manager = PSAB_Menu_Manager::instance();

        $data = array(
            'menu_id' => $request['menu_id'],
            'item_label' => $request->get_param('item_label'),
            'item_icon' => $request->get_param('item_icon'),
            'item_type' => $request->get_param('item_type') ?: 'page',
            'item_target' => $request->get_param('item_target'),
            'item_config' => $request->get_param('item_config'),
            'item_order' => $request->get_param('item_order') ?: 0,
            'parent_id' => $request->get_param('parent_id'),
            'is_active' => $request->get_param('is_active') !== null ? (int) $request->get_param('is_active') : 1,
        );

        $result = $menu_manager->create_menu_item($data);

        if (is_wp_error($result)) {
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => 400));
        }

        return rest_ensure_response(array('id' => $result));
    }

    /**
     * Update menu item
     */
    public function update_menu_item($request) {
        $menu_manager = PSAB_Menu_Manager::instance();

        $data = array();

        if ($request->get_param('item_label')) {
            $data['item_label'] = $request->get_param('item_label');
        }

        if ($request->get_param('item_icon') !== null) {
            $data['item_icon'] = $request->get_param('item_icon');
        }

        if ($request->get_param('item_type')) {
            $data['item_type'] = $request->get_param('item_type');
        }

        if ($request->get_param('item_target')) {
            $data['item_target'] = $request->get_param('item_target');
        }

        if ($request->get_param('item_config')) {
            $data['item_config'] = $request->get_param('item_config');
        }

        if ($request->get_param('item_order') !== null) {
            $data['item_order'] = (int) $request->get_param('item_order');
        }

        if ($request->get_param('parent_id') !== null) {
            $data['parent_id'] = $request->get_param('parent_id');
        }

        if ($request->get_param('is_active') !== null) {
            $data['is_active'] = (int) $request->get_param('is_active');
        }

        $result = $menu_manager->update_menu_item($request['id'], $data);

        if (is_wp_error($result)) {
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => 400));
        }

        return rest_ensure_response(array('updated' => true));
    }

    /**
     * Delete menu item
     */
    public function delete_menu_item($request) {
        $menu_manager = PSAB_Menu_Manager::instance();
        $result = $menu_manager->delete_menu_item($request['id']);

        if (is_wp_error($result)) {
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => 400));
        }

        return rest_ensure_response(array('deleted' => true));
    }
}
