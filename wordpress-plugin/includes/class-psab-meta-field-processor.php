<?php
/**
 * Meta Field Processor - Handles custom meta field retrieval and processing
 *
 * @package PesaShopAppBuilder
 */

defined('ABSPATH') || exit;

/**
 * PSAB_Meta_Field_Processor Class
 */
class PSAB_Meta_Field_Processor {

    /**
     * Get meta field value
     */
    public static function get_meta($object_id, $meta_key, $object_type = 'post') {
        $value = null;

        switch ($object_type) {
            case 'post':
                $value = get_post_meta($object_id, $meta_key, true);
                break;

            case 'user':
                $value = get_user_meta($object_id, $meta_key, true);
                break;

            case 'term':
                $value = get_term_meta($object_id, $meta_key, true);
                break;

            case 'product':
                if (function_exists('wc_get_product')) {
                    $product = wc_get_product($object_id);
                    if ($product) {
                        $value = $product->get_meta($meta_key, true);
                    }
                }
                break;

            case 'order':
                if (function_exists('wc_get_order')) {
                    $order = wc_get_order($object_id);
                    if ($order) {
                        $value = $order->get_meta($meta_key, true);
                    }
                }
                break;

            default:
                $value = apply_filters('psab_get_custom_meta', null, $object_id, $meta_key, $object_type);
                break;
        }

        return apply_filters('psab_meta_field_value', $value, $object_id, $meta_key, $object_type);
    }

    /**
     * Format meta field value based on type
     */
    public static function format_meta($value, $format = 'text') {
        if (empty($value)) {
            return '';
        }

        switch ($format) {
            case 'text':
                return is_array($value) ? implode(', ', $value) : (string) $value;

            case 'number':
                return is_numeric($value) ? (float) $value : 0;

            case 'boolean':
                return (bool) $value;

            case 'json':
                return is_string($value) ? json_decode($value, true) : $value;

            case 'date':
                return is_numeric($value) ? date('Y-m-d', $value) : $value;

            case 'datetime':
                return is_numeric($value) ? date('Y-m-d H:i:s', $value) : $value;

            case 'url':
                return esc_url($value);

            case 'image':
                if (is_numeric($value)) {
                    return wp_get_attachment_url($value);
                }
                return $value;

            case 'gallery':
                if (is_string($value)) {
                    $ids = explode(',', $value);
                } elseif (is_array($value)) {
                    $ids = $value;
                } else {
                    return array();
                }

                $images = array();
                foreach ($ids as $id) {
                    if ($url = wp_get_attachment_url(trim($id))) {
                        $images[] = $url;
                    }
                }
                return $images;

            case 'html':
                return wp_kses_post($value);

            default:
                return apply_filters('psab_format_meta_custom', $value, $format);
        }
    }

    /**
     * Get ACF field value if ACF is active
     */
    public static function get_acf_field($object_id, $field_name, $object_type = 'post') {
        if (!function_exists('get_field')) {
            return null;
        }

        $format = true;

        switch ($object_type) {
            case 'user':
                return get_field($field_name, 'user_' . $object_id, $format);

            case 'term':
                return get_field($field_name, 'term_' . $object_id, $format);

            case 'product':
            case 'post':
            default:
                return get_field($field_name, $object_id, $format);
        }
    }

    /**
     * Get all meta fields for an object
     */
    public static function get_all_meta($object_id, $object_type = 'post') {
        $meta = array();

        switch ($object_type) {
            case 'post':
                $meta = get_post_meta($object_id);
                break;

            case 'user':
                $meta = get_user_meta($object_id);
                break;

            case 'term':
                $meta = get_term_meta($object_id);
                break;

            case 'product':
                if (function_exists('wc_get_product')) {
                    $product = wc_get_product($object_id);
                    if ($product) {
                        $meta = $product->get_meta_data();
                    }
                }
                break;
        }

        // Filter out private meta fields (starting with _)
        $filtered_meta = array();
        foreach ($meta as $key => $value) {
            if (substr($key, 0, 1) !== '_') {
                $filtered_meta[$key] = is_array($value) && count($value) === 1 ? $value[0] : $value;
            }
        }

        return apply_filters('psab_all_meta_fields', $filtered_meta, $object_id, $object_type);
    }

    /**
     * Check if meta key exists
     */
    public static function meta_exists($object_id, $meta_key, $object_type = 'post') {
        switch ($object_type) {
            case 'post':
                return metadata_exists('post', $object_id, $meta_key);

            case 'user':
                return metadata_exists('user', $object_id, $meta_key);

            case 'term':
                return metadata_exists('term', $object_id, $meta_key);

            default:
                return false;
        }
    }
}
