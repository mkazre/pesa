<?php
/**
 * Menu Manager
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_Menu_Manager Class
 */
class PSAB_Menu_Manager {

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
     * Get menus
     */
    public function get_menus($args = array()) {
        global $wpdb;

        $where = array('1=1');
        $values = array();

        if (isset($args['is_active'])) {
            $where[] = 'is_active = %d';
            $values[] = $args['is_active'];
        }

        if (isset($args['menu_position'])) {
            $where[] = 'menu_position = %s';
            $values[] = $args['menu_position'];
        }

        $where_clause = implode(' AND ', $where);

        if (!empty($values)) {
            $query = $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}psab_menus WHERE {$where_clause} ORDER BY menu_order ASC, id ASC",
                $values
            );
        } else {
            $query = "SELECT * FROM {$wpdb->prefix}psab_menus WHERE {$where_clause} ORDER BY menu_order ASC, id ASC";
        }

        $results = $wpdb->get_results($query);

        $menus = array();
        foreach ($results as $row) {
            $menus[] = $this->format_menu($row);
        }

        return $menus;
    }

    /**
     * Get menu
     */
    public function get_menu($id) {
        global $wpdb;

        $menu = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}psab_menus WHERE id = %d",
            $id
        ));

        if (!$menu) {
            return null;
        }

        return $this->format_menu($menu);
    }

    /**
     * Get menu by key
     */
    public function get_menu_by_key($key) {
        global $wpdb;

        $menu = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}psab_menus WHERE menu_key = %s",
            $key
        ));

        if (!$menu) {
            return null;
        }

        return $this->format_menu($menu);
    }

    /**
     * Get menu items
     */
    public function get_menu_items($menu_id, $parent_id = null) {
        global $wpdb;

        if ($parent_id === null) {
            $query = $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}psab_menu_items WHERE menu_id = %d AND (parent_id IS NULL OR parent_id = 0) ORDER BY item_order ASC",
                $menu_id
            );
        } else {
            $query = $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}psab_menu_items WHERE menu_id = %d AND parent_id = %d ORDER BY item_order ASC",
                $menu_id,
                $parent_id
            );
        }

        $results = $wpdb->get_results($query);

        $items = array();
        foreach ($results as $row) {
            $item = $this->format_menu_item($row);
            // Recursively get children
            $item['children'] = $this->get_menu_items($menu_id, $row->id);
            $items[] = $item;
        }

        return $items;
    }

    /**
     * Create menu
     */
    public function create_menu($data) {
        global $wpdb;

        // Validate required fields
        if (empty($data['menu_key']) || empty($data['menu_name'])) {
            return new WP_Error('missing_fields', __('Menu key and name are required.', 'pesa-shop-app-builder'));
        }

        // Check for duplicate key
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}psab_menus WHERE menu_key = %s",
            $data['menu_key']
        ));

        if ($existing) {
            return new WP_Error('duplicate_key', __('A menu with this key already exists.', 'pesa-shop-app-builder'));
        }

        // Prepare menu data
        $menu_data = array(
            'menu_key' => sanitize_key($data['menu_key']),
            'menu_name' => sanitize_text_field($data['menu_name']),
            'menu_position' => isset($data['menu_position']) ? sanitize_text_field($data['menu_position']) : 'bottom',
            'menu_config' => is_array($data['menu_config']) ? json_encode($data['menu_config']) : $data['menu_config'],
            'is_active' => isset($data['is_active']) ? (int) $data['is_active'] : 1,
            'menu_order' => isset($data['menu_order']) ? (int) $data['menu_order'] : 0,
        );

        $result = $wpdb->insert(
            $wpdb->prefix . 'psab_menus',
            $menu_data,
            array('%s', '%s', '%s', '%s', '%d', '%d')
        );

        if ($result === false) {
            return new WP_Error('insert_failed', __('Failed to create menu.', 'pesa-shop-app-builder'));
        }

        return $this->get_menu($wpdb->insert_id);
    }

    /**
     * Update menu
     */
    public function update_menu($id, $data) {
        global $wpdb;

        // Check if menu exists
        $menu = $this->get_menu($id);
        if (!$menu) {
            return new WP_Error('not_found', __('Menu not found.', 'pesa-shop-app-builder'));
        }

        $menu_data = array();

        if (isset($data['menu_key'])) {
            // Check for duplicate key (excluding current menu)
            $existing = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM {$wpdb->prefix}psab_menus WHERE menu_key = %s AND id != %d",
                $data['menu_key'],
                $id
            ));

            if ($existing) {
                return new WP_Error('duplicate_key', __('A menu with this key already exists.', 'pesa-shop-app-builder'));
            }

            $menu_data['menu_key'] = sanitize_key($data['menu_key']);
        }

        if (isset($data['menu_name'])) {
            $menu_data['menu_name'] = sanitize_text_field($data['menu_name']);
        }

        if (isset($data['menu_position'])) {
            $menu_data['menu_position'] = sanitize_text_field($data['menu_position']);
        }

        if (isset($data['menu_config'])) {
            $menu_data['menu_config'] = is_array($data['menu_config']) ? json_encode($data['menu_config']) : $data['menu_config'];
        }

        if (isset($data['is_active'])) {
            $menu_data['is_active'] = (int) $data['is_active'];
        }

        if (isset($data['menu_order'])) {
            $menu_data['menu_order'] = (int) $data['menu_order'];
        }

        if (empty($menu_data)) {
            return new WP_Error('no_data', __('No data to update.', 'pesa-shop-app-builder'));
        }

        $result = $wpdb->update(
            $wpdb->prefix . 'psab_menus',
            $menu_data,
            array('id' => $id),
            null,
            array('%d')
        );

        if ($result === false) {
            return new WP_Error('update_failed', __('Failed to update menu.', 'pesa-shop-app-builder'));
        }

        return $this->get_menu($id);
    }

    /**
     * Delete menu
     */
    public function delete_menu($id) {
        global $wpdb;

        // Check if menu exists
        $menu = $this->get_menu($id);
        if (!$menu) {
            return new WP_Error('not_found', __('Menu not found.', 'pesa-shop-app-builder'));
        }

        // Delete menu items first
        $wpdb->delete(
            $wpdb->prefix . 'psab_menu_items',
            array('menu_id' => $id),
            array('%d')
        );

        // Delete menu
        $result = $wpdb->delete(
            $wpdb->prefix . 'psab_menus',
            array('id' => $id),
            array('%d')
        );

        if ($result === false) {
            return new WP_Error('delete_failed', __('Failed to delete menu.', 'pesa-shop-app-builder'));
        }

        return true;
    }

    /**
     * Create menu item
     */
    public function create_menu_item($data) {
        global $wpdb;

        // Validate required fields
        if (empty($data['menu_id']) || empty($data['item_label'])) {
            return new WP_Error('missing_fields', __('Menu ID and label are required.', 'pesa-shop-app-builder'));
        }

        // Prepare item data
        $item_data = array(
            'menu_id' => (int) $data['menu_id'],
            'item_label' => sanitize_text_field($data['item_label']),
            'item_icon' => isset($data['item_icon']) ? sanitize_text_field($data['item_icon']) : null,
            'item_type' => isset($data['item_type']) ? sanitize_text_field($data['item_type']) : 'page',
            'item_target' => sanitize_text_field($data['item_target']),
            'item_config' => isset($data['item_config']) ? (is_array($data['item_config']) ? json_encode($data['item_config']) : $data['item_config']) : null,
            'item_order' => isset($data['item_order']) ? (int) $data['item_order'] : 0,
            'parent_id' => isset($data['parent_id']) ? (int) $data['parent_id'] : null,
            'is_active' => isset($data['is_active']) ? (int) $data['is_active'] : 1,
        );

        $result = $wpdb->insert(
            $wpdb->prefix . 'psab_menu_items',
            $item_data,
            array('%d', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%d')
        );

        if ($result === false) {
            return new WP_Error('insert_failed', __('Failed to create menu item.', 'pesa-shop-app-builder'));
        }

        return $wpdb->insert_id;
    }

    /**
     * Update menu item
     */
    public function update_menu_item($id, $data) {
        global $wpdb;

        $item_data = array();

        if (isset($data['item_label'])) {
            $item_data['item_label'] = sanitize_text_field($data['item_label']);
        }

        if (isset($data['item_icon'])) {
            $item_data['item_icon'] = sanitize_text_field($data['item_icon']);
        }

        if (isset($data['item_type'])) {
            $item_data['item_type'] = sanitize_text_field($data['item_type']);
        }

        if (isset($data['item_target'])) {
            $item_data['item_target'] = sanitize_text_field($data['item_target']);
        }

        if (isset($data['item_config'])) {
            $item_data['item_config'] = is_array($data['item_config']) ? json_encode($data['item_config']) : $data['item_config'];
        }

        if (isset($data['item_order'])) {
            $item_data['item_order'] = (int) $data['item_order'];
        }

        if (isset($data['parent_id'])) {
            $item_data['parent_id'] = (int) $data['parent_id'];
        }

        if (isset($data['is_active'])) {
            $item_data['is_active'] = (int) $data['is_active'];
        }

        if (empty($item_data)) {
            return new WP_Error('no_data', __('No data to update.', 'pesa-shop-app-builder'));
        }

        $result = $wpdb->update(
            $wpdb->prefix . 'psab_menu_items',
            $item_data,
            array('id' => $id),
            null,
            array('%d')
        );

        if ($result === false) {
            return new WP_Error('update_failed', __('Failed to update menu item.', 'pesa-shop-app-builder'));
        }

        return true;
    }

    /**
     * Delete menu item
     */
    public function delete_menu_item($id) {
        global $wpdb;

        // Delete children first
        $children = $wpdb->get_results($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}psab_menu_items WHERE parent_id = %d",
            $id
        ));

        foreach ($children as $child) {
            $this->delete_menu_item($child->id);
        }

        // Delete item
        $result = $wpdb->delete(
            $wpdb->prefix . 'psab_menu_items',
            array('id' => $id),
            array('%d')
        );

        if ($result === false) {
            return new WP_Error('delete_failed', __('Failed to delete menu item.', 'pesa-shop-app-builder'));
        }

        return true;
    }

    /**
     * Format menu
     */
    private function format_menu($menu) {
        $formatted = array(
            'id' => (int) $menu->id,
            'menu_key' => $menu->menu_key,
            'menu_name' => $menu->menu_name,
            'menu_position' => $menu->menu_position,
            'menu_config' => json_decode($menu->menu_config, true),
            'is_active' => (bool) $menu->is_active,
            'menu_order' => (int) $menu->menu_order,
            'created_at' => $menu->created_at,
            'updated_at' => $menu->updated_at,
        );

        // Get menu items
        $formatted['items'] = $this->get_menu_items($menu->id);

        return $formatted;
    }

    /**
     * Format menu item
     */
    private function format_menu_item($item) {
        return array(
            'id' => (int) $item->id,
            'menu_id' => (int) $item->menu_id,
            'item_label' => $item->item_label,
            'item_icon' => $item->item_icon,
            'item_type' => $item->item_type,
            'item_target' => $item->item_target,
            'item_config' => $item->item_config ? json_decode($item->item_config, true) : null,
            'item_order' => (int) $item->item_order,
            'parent_id' => $item->parent_id ? (int) $item->parent_id : null,
            'is_active' => (bool) $item->is_active,
            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at,
        );
    }
}
