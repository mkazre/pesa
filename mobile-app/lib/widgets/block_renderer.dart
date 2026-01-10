import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';
import 'package:pesa_shop/services/auth_service.dart';
import 'package:pesa_shop/widgets/blocks/text_block.dart';
import 'package:pesa_shop/widgets/blocks/heading_block.dart';
import 'package:pesa_shop/widgets/blocks/image_block.dart';
import 'package:pesa_shop/widgets/blocks/button_block.dart';
import 'package:pesa_shop/widgets/blocks/spacer_block.dart';
import 'package:pesa_shop/widgets/blocks/divider_block.dart';
import 'package:pesa_shop/widgets/blocks/container_block.dart';
import 'package:pesa_shop/widgets/blocks/row_block.dart';
import 'package:pesa_shop/widgets/blocks/column_block.dart';
import 'package:pesa_shop/widgets/blocks/slider_block.dart';
import 'package:pesa_shop/widgets/blocks/product_grid_block.dart';
import 'package:pesa_shop/widgets/blocks/product_list_block.dart';
import 'package:pesa_shop/widgets/blocks/category_grid_block.dart';
import 'package:pesa_shop/widgets/blocks/cart_items_block.dart';
import 'package:pesa_shop/widgets/blocks/cart_totals_block.dart';
import 'package:pesa_shop/widgets/blocks/cart_coupon_block.dart';
import 'package:pesa_shop/widgets/blocks/account_info_block.dart';
import 'package:pesa_shop/widgets/blocks/order_history_block.dart';
import 'package:pesa_shop/widgets/blocks/webview_block.dart';
import 'package:pesa_shop/widgets/blocks/html_block.dart';
import 'package:pesa_shop/widgets/blocks/shortcode_block.dart';
import 'package:pesa_shop/widgets/blocks/meta_field_block.dart';
import 'package:pesa_shop/utils/style_helper.dart';

class BlockRenderer extends StatelessWidget {
  final BlockModel block;
  final Map<String, dynamic>? context;

  const BlockRenderer({
    Key? key,
    required this.block,
    this.context,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Check visibility rules
    if (block.visibility != null) {
      final authService = AuthService.instance;
      final isVisible = block.visibility!.isVisible(
        authService.isLoggedIn,
        authService.getUserRoles(),
      );

      if (!isVisible) {
        return const SizedBox.shrink();
      }
    }

    // Render block based on type
    Widget blockWidget = _buildBlock();

    // Apply styles
    if (block.style != null) {
      blockWidget = StyleHelper.applyStyle(blockWidget, block.style!);
    }

    return blockWidget;
  }

  Widget _buildBlock() {
    switch (block.type) {
      // Layout blocks
      case 'container':
        return ContainerBlock(block: block, context: context);
      case 'row':
        return RowBlock(block: block, context: context);
      case 'column':
        return ColumnBlock(block: block, context: context);
      case 'spacer':
        return SpacerBlock(block: block);
      case 'divider':
        return DividerBlock(block: block);

      // Content blocks
      case 'text':
        return TextBlock(block: block, context: context);
      case 'heading':
        return HeadingBlock(block: block, context: context);
      case 'image':
        return ImageBlock(block: block);
      case 'button':
        return ButtonBlock(block: block, context: context);

      // Media blocks
      case 'slider':
        return SliderBlock(block: block);

      // WooCommerce blocks
      case 'product_grid':
        return ProductGridBlock(block: block);
      case 'product_list':
        return ProductListBlock(block: block);
      case 'category_grid':
        return CategoryGridBlock(block: block);
      case 'cart_items':
        return CartItemsBlock(block: block);
      case 'cart_totals':
        return CartTotalsBlock(block: block);
      case 'cart_coupon':
        return CartCouponBlock(block: block);

      // Account blocks
      case 'account_info':
        return AccountInfoBlock(block: block);
      case 'order_history':
        return OrderHistoryBlock(block: block);

      // Advanced blocks
      case 'webview':
        return WebViewBlock(block: block);
      case 'html':
        return HtmlBlock(block: block);
      case 'shortcode':
        return ShortcodeBlock(block: block, context: context);
      case 'meta_field':
        return MetaFieldBlock(block: block, context: context);

      default:
        return _buildUnknownBlock();
    }
  }

  Widget _buildUnknownBlock() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.orange, width: 2),
        borderRadius: BorderRadius.circular(4),
        color: Colors.orange.withOpacity(0.1),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning, color: Colors.orange),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Unknown block type: ${block.type}',
              style: const TextStyle(color: Colors.orange),
            ),
          ),
        ],
      ),
    );
  }
}
