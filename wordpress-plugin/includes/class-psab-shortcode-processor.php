<?php
/**
 * Shortcode Processor - Handles shortcode rendering and processing
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_Shortcode_Processor Class
 */
class PSAB_Shortcode_Processor {

    /**
     * Process shortcode with context
     */
    public static function process($shortcode, $context = array()) {
        global $post, $product;

        // Store current state
        $original_post = $post;
        $original_product = $product;

        // Set context if provided
        if (isset($context['post_id'])) {
            $post = get_post($context['post_id']);
            setup_postdata($post);
        }

        if (isset($context['product_id']) && function_exists('wc_get_product')) {
            $product = wc_get_product($context['product_id']);
        }

        // Process shortcode
        $output = do_shortcode($shortcode);

        // Restore original state
        $post = $original_post;
        $product = $original_product;

        if ($original_post) {
            wp_reset_postdata();
        }

        return $output;
    }

    /**
     * Check if shortcode exists
     */
    public static function shortcode_exists($shortcode) {
        global $shortcode_tags;

        // Extract shortcode name from full shortcode string
        preg_match('/\[([^\s\]]+)/', $shortcode, $matches);

        if (isset($matches[1])) {
            return array_key_exists($matches[1], $shortcode_tags);
        }

        return false;
    }

    /**
     * Get available shortcodes
     */
    public static function get_available_shortcodes() {
        global $shortcode_tags;

        $shortcodes = array();

        foreach ($shortcode_tags as $tag => $callback) {
            $shortcodes[] = array(
                'tag' => $tag,
                'example' => '[' . $tag . ']',
            );
        }

        return $shortcodes;
    }

    /**
     * Sanitize shortcode output for mobile app
     */
    public static function sanitize_output($html) {
        // Remove scripts
        $html = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $html);

        // Remove styles (inline styles are kept)
        $html = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $html);

        // Remove event handlers
        $html = preg_replace('/\s*on\w+="[^"]*"/i', '', $html);

        return $html;
    }
}
