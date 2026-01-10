<?php
/**
 * Block Registry - Manages all available block types
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_Block_Registry Class
 */
class PSAB_Block_Registry {

    /**
     * Single instance
     */
    protected static $_instance = null;

    /**
     * Registered blocks
     */
    private $blocks = array();

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
        $this->register_default_blocks();
    }

    /**
     * Register default blocks
     */
    private function register_default_blocks() {
        // Layout blocks
        $this->register_block('container', array(
            'label' => __('Container', 'pesa-shop-app-builder'),
            'category' => 'layout',
            'icon' => 'layout',
            'description' => __('A container to hold other blocks', 'pesa-shop-app-builder'),
            'schema' => array(
                'children' => array('type' => 'array', 'default' => array()),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('row', array(
            'label' => __('Row', 'pesa-shop-app-builder'),
            'category' => 'layout',
            'icon' => 'columns',
            'description' => __('Horizontal row layout', 'pesa-shop-app-builder'),
            'schema' => array(
                'children' => array('type' => 'array', 'default' => array()),
                'mainAxisAlignment' => array('type' => 'string', 'default' => 'start'),
                'crossAxisAlignment' => array('type' => 'string', 'default' => 'center'),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('column', array(
            'label' => __('Column', 'pesa-shop-app-builder'),
            'category' => 'layout',
            'icon' => 'columns',
            'description' => __('Vertical column layout', 'pesa-shop-app-builder'),
            'schema' => array(
                'children' => array('type' => 'array', 'default' => array()),
                'mainAxisAlignment' => array('type' => 'string', 'default' => 'start'),
                'crossAxisAlignment' => array('type' => 'string', 'default' => 'start'),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('spacer', array(
            'label' => __('Spacer', 'pesa-shop-app-builder'),
            'category' => 'layout',
            'icon' => 'minus',
            'description' => __('Add space between elements', 'pesa-shop-app-builder'),
            'schema' => array(
                'height' => array('type' => 'number', 'default' => 16)
            )
        ));

        $this->register_block('divider', array(
            'label' => __('Divider', 'pesa-shop-app-builder'),
            'category' => 'layout',
            'icon' => 'minus',
            'description' => __('Horizontal divider line', 'pesa-shop-app-builder'),
            'schema' => array(
                'color' => array('type' => 'string', 'default' => '#e0e0e0'),
                'thickness' => array('type' => 'number', 'default' => 1),
                'margin' => array('type' => 'object', 'default' => array('top' => 8, 'bottom' => 8))
            )
        ));

        // Content blocks
        $this->register_block('text', array(
            'label' => __('Text', 'pesa-shop-app-builder'),
            'category' => 'content',
            'icon' => 'text',
            'description' => __('Display text content', 'pesa-shop-app-builder'),
            'schema' => array(
                'text' => array('type' => 'string', 'default' => ''),
                'isDynamic' => array('type' => 'boolean', 'default' => false),
                'dynamicSource' => array('type' => 'string', 'default' => ''),
                'style' => array('type' => 'object', 'default' => array(
                    'fontSize' => 14,
                    'fontWeight' => 'normal',
                    'color' => '#000000',
                    'textAlign' => 'left'
                ))
            )
        ));

        $this->register_block('heading', array(
            'label' => __('Heading', 'pesa-shop-app-builder'),
            'category' => 'content',
            'icon' => 'heading',
            'description' => __('Display heading text', 'pesa-shop-app-builder'),
            'schema' => array(
                'text' => array('type' => 'string', 'default' => ''),
                'level' => array('type' => 'number', 'default' => 1),
                'style' => array('type' => 'object', 'default' => array(
                    'fontSize' => 24,
                    'fontWeight' => 'bold',
                    'color' => '#000000'
                ))
            )
        ));

        $this->register_block('image', array(
            'label' => __('Image', 'pesa-shop-app-builder'),
            'category' => 'content',
            'icon' => 'image',
            'description' => __('Display an image', 'pesa-shop-app-builder'),
            'schema' => array(
                'src' => array('type' => 'string', 'default' => ''),
                'alt' => array('type' => 'string', 'default' => ''),
                'width' => array('type' => 'number', 'default' => null),
                'height' => array('type' => 'number', 'default' => null),
                'fit' => array('type' => 'string', 'default' => 'cover'),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('button', array(
            'label' => __('Button', 'pesa-shop-app-builder'),
            'category' => 'content',
            'icon' => 'button',
            'description' => __('Clickable button', 'pesa-shop-app-builder'),
            'schema' => array(
                'text' => array('type' => 'string', 'default' => 'Click me'),
                'action' => array('type' => 'object', 'default' => array('type' => 'none')),
                'style' => array('type' => 'object', 'default' => array(
                    'backgroundColor' => '#007bff',
                    'textColor' => '#ffffff',
                    'borderRadius' => 4,
                    'padding' => array('top' => 12, 'right' => 24, 'bottom' => 12, 'left' => 24)
                ))
            )
        ));

        // Media blocks
        $this->register_block('slider', array(
            'label' => __('Slider / Carousel', 'pesa-shop-app-builder'),
            'category' => 'media',
            'icon' => 'carousel',
            'description' => __('Image slider or carousel', 'pesa-shop-app-builder'),
            'schema' => array(
                'images' => array('type' => 'array', 'default' => array()),
                'autoPlay' => array('type' => 'boolean', 'default' => true),
                'interval' => array('type' => 'number', 'default' => 3000),
                'height' => array('type' => 'number', 'default' => 200),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        // WooCommerce blocks
        $this->register_block('product_grid', array(
            'label' => __('Product Grid', 'pesa-shop-app-builder'),
            'category' => 'woocommerce',
            'icon' => 'grid',
            'description' => __('Display products in a grid', 'pesa-shop-app-builder'),
            'schema' => array(
                'source' => array('type' => 'string', 'default' => 'latest'),
                'columns' => array('type' => 'number', 'default' => 2),
                'limit' => array('type' => 'number', 'default' => 10),
                'categoryId' => array('type' => 'number', 'default' => null),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('product_list', array(
            'label' => __('Product List', 'pesa-shop-app-builder'),
            'category' => 'woocommerce',
            'icon' => 'list',
            'description' => __('Display products in a list', 'pesa-shop-app-builder'),
            'schema' => array(
                'source' => array('type' => 'string', 'default' => 'latest'),
                'limit' => array('type' => 'number', 'default' => 10),
                'categoryId' => array('type' => 'number', 'default' => null),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('category_grid', array(
            'label' => __('Category Grid', 'pesa-shop-app-builder'),
            'category' => 'woocommerce',
            'icon' => 'grid',
            'description' => __('Display product categories', 'pesa-shop-app-builder'),
            'schema' => array(
                'columns' => array('type' => 'number', 'default' => 3),
                'limit' => array('type' => 'number', 'default' => 9),
                'parentId' => array('type' => 'number', 'default' => 0),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('cart_items', array(
            'label' => __('Cart Items', 'pesa-shop-app-builder'),
            'category' => 'woocommerce',
            'icon' => 'cart',
            'description' => __('Display cart items list', 'pesa-shop-app-builder'),
            'schema' => array(
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('cart_totals', array(
            'label' => __('Cart Totals', 'pesa-shop-app-builder'),
            'category' => 'woocommerce',
            'icon' => 'calculator',
            'description' => __('Display cart totals', 'pesa-shop-app-builder'),
            'schema' => array(
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('cart_coupon', array(
            'label' => __('Cart Coupon', 'pesa-shop-app-builder'),
            'category' => 'woocommerce',
            'icon' => 'ticket',
            'description' => __('Coupon code input', 'pesa-shop-app-builder'),
            'schema' => array(
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        // Account blocks
        $this->register_block('account_info', array(
            'label' => __('Account Info', 'pesa-shop-app-builder'),
            'category' => 'account',
            'icon' => 'user',
            'description' => __('Display user account information', 'pesa-shop-app-builder'),
            'schema' => array(
                'fields' => array('type' => 'array', 'default' => array('name', 'email')),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('order_history', array(
            'label' => __('Order History', 'pesa-shop-app-builder'),
            'category' => 'account',
            'icon' => 'list',
            'description' => __('Display user order history', 'pesa-shop-app-builder'),
            'schema' => array(
                'limit' => array('type' => 'number', 'default' => 10),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        // Advanced blocks
        $this->register_block('webview', array(
            'label' => __('WebView', 'pesa-shop-app-builder'),
            'category' => 'advanced',
            'icon' => 'browser',
            'description' => __('Embed a web page', 'pesa-shop-app-builder'),
            'schema' => array(
                'url' => array('type' => 'string', 'default' => ''),
                'enableAuth' => array('type' => 'boolean', 'default' => false),
                'height' => array('type' => 'number', 'default' => 400)
            )
        ));

        $this->register_block('html', array(
            'label' => __('HTML', 'pesa-shop-app-builder'),
            'category' => 'advanced',
            'icon' => 'code',
            'description' => __('Custom HTML content', 'pesa-shop-app-builder'),
            'schema' => array(
                'html' => array('type' => 'string', 'default' => ''),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('shortcode', array(
            'label' => __('Shortcode', 'pesa-shop-app-builder'),
            'category' => 'advanced',
            'icon' => 'shortcode',
            'description' => __('WordPress shortcode', 'pesa-shop-app-builder'),
            'schema' => array(
                'shortcode' => array('type' => 'string', 'default' => ''),
                'context' => array('type' => 'object', 'default' => array()),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        $this->register_block('meta_field', array(
            'label' => __('Meta Field', 'pesa-shop-app-builder'),
            'category' => 'advanced',
            'icon' => 'field',
            'description' => __('Display custom meta field', 'pesa-shop-app-builder'),
            'schema' => array(
                'metaKey' => array('type' => 'string', 'default' => ''),
                'objectType' => array('type' => 'string', 'default' => 'post'),
                'format' => array('type' => 'string', 'default' => 'text'),
                'style' => array('type' => 'object', 'default' => array())
            )
        ));

        do_action('psab_register_blocks', $this);
    }

    /**
     * Register a block
     */
    public function register_block($type, $args) {
        $defaults = array(
            'label' => '',
            'category' => 'other',
            'icon' => 'block',
            'description' => '',
            'schema' => array(),
        );

        $this->blocks[$type] = wp_parse_args($args, $defaults);

        return true;
    }

    /**
     * Unregister a block
     */
    public function unregister_block($type) {
        if (isset($this->blocks[$type])) {
            unset($this->blocks[$type]);
            return true;
        }
        return false;
    }

    /**
     * Get all blocks
     */
    public function get_blocks() {
        return $this->blocks;
    }

    /**
     * Get block by type
     */
    public function get_block($type) {
        return isset($this->blocks[$type]) ? $this->blocks[$type] : null;
    }

    /**
     * Get blocks by category
     */
    public function get_blocks_by_category($category) {
        return array_filter($this->blocks, function($block) use ($category) {
            return $block['category'] === $category;
        });
    }

    /**
     * Get all categories
     */
    public function get_categories() {
        $categories = array(
            'layout' => __('Layout', 'pesa-shop-app-builder'),
            'content' => __('Content', 'pesa-shop-app-builder'),
            'media' => __('Media', 'pesa-shop-app-builder'),
            'woocommerce' => __('WooCommerce', 'pesa-shop-app-builder'),
            'account' => __('Account', 'pesa-shop-app-builder'),
            'advanced' => __('Advanced', 'pesa-shop-app-builder'),
            'other' => __('Other', 'pesa-shop-app-builder'),
        );

        return apply_filters('psab_block_categories', $categories);
    }
}
