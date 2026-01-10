import 'package:flutter/material.dart';
import 'package:pesa_shop/models/block_model.dart';

class StyleHelper {
  static Widget applyStyle(Widget child, BlockStyle style) {
    Widget styledWidget = child;

    // Apply padding
    if (style.padding != null) {
      styledWidget = Padding(
        padding: _parseEdgeInsets(style.padding!),
        child: styledWidget,
      );
    }

    // Apply container styles (margin, background, border, size)
    if (style.margin != null ||
        style.backgroundColor != null ||
        style.borderRadius != null ||
        style.borderColor != null ||
        style.width != null ||
        style.height != null) {
      styledWidget = Container(
        margin: style.margin != null ? _parseEdgeInsets(style.margin!) : null,
        width: style.width,
        height: style.height,
        decoration: BoxDecoration(
          color: style.backgroundColor != null
              ? _parseColor(style.backgroundColor!)
              : null,
          borderRadius: style.borderRadius != null
              ? BorderRadius.circular(style.borderRadius!)
              : null,
          border: style.borderColor != null
              ? Border.all(
                  color: _parseColor(style.borderColor!),
                  width: style.borderWidth ?? 1,
                )
              : null,
        ),
        child: styledWidget,
      );
    }

    return styledWidget;
  }

  static EdgeInsets _parseEdgeInsets(Map<String, dynamic> padding) {
    return EdgeInsets.only(
      top: (padding['top'] ?? 0).toDouble(),
      right: (padding['right'] ?? 0).toDouble(),
      bottom: (padding['bottom'] ?? 0).toDouble(),
      left: (padding['left'] ?? 0).toDouble(),
    );
  }

  static Color _parseColor(String hexColor) {
    hexColor = hexColor.replaceAll('#', '');
    if (hexColor.length == 6) {
      hexColor = 'FF$hexColor';
    }
    return Color(int.parse(hexColor, radix: 16));
  }

  static TextStyle buildTextStyle(BlockStyle? style) {
    if (style == null) return const TextStyle();

    return TextStyle(
      fontSize: style.fontSize,
      color: style.textColor != null ? _parseColor(style.textColor!) : null,
      fontWeight: _parseFontWeight(style.fontWeight),
    );
  }

  static TextAlign parseTextAlign(String? align) {
    switch (align?.toLowerCase()) {
      case 'left':
        return TextAlign.left;
      case 'center':
        return TextAlign.center;
      case 'right':
        return TextAlign.right;
      case 'justify':
        return TextAlign.justify;
      default:
        return TextAlign.left;
    }
  }

  static FontWeight _parseFontWeight(String? weight) {
    switch (weight?.toLowerCase()) {
      case 'bold':
        return FontWeight.bold;
      case 'normal':
        return FontWeight.normal;
      case '100':
        return FontWeight.w100;
      case '200':
        return FontWeight.w200;
      case '300':
        return FontWeight.w300;
      case '400':
        return FontWeight.w400;
      case '500':
        return FontWeight.w500;
      case '600':
        return FontWeight.w600;
      case '700':
        return FontWeight.w700;
      case '800':
        return FontWeight.w800;
      case '900':
        return FontWeight.w900;
      default:
        return FontWeight.normal;
    }
  }

  static MainAxisAlignment parseMainAxisAlignment(String? alignment) {
    switch (alignment?.toLowerCase()) {
      case 'start':
        return MainAxisAlignment.start;
      case 'center':
        return MainAxisAlignment.center;
      case 'end':
        return MainAxisAlignment.end;
      case 'space-between':
        return MainAxisAlignment.spaceBetween;
      case 'space-around':
        return MainAxisAlignment.spaceAround;
      case 'space-evenly':
        return MainAxisAlignment.spaceEvenly;
      default:
        return MainAxisAlignment.start;
    }
  }

  static CrossAxisAlignment parseCrossAxisAlignment(String? alignment) {
    switch (alignment?.toLowerCase()) {
      case 'start':
        return CrossAxisAlignment.start;
      case 'center':
        return CrossAxisAlignment.center;
      case 'end':
        return CrossAxisAlignment.end;
      case 'stretch':
        return CrossAxisAlignment.stretch;
      default:
        return CrossAxisAlignment.start;
    }
  }

  static BoxFit parseBoxFit(String? fit) {
    switch (fit?.toLowerCase()) {
      case 'fill':
        return BoxFit.fill;
      case 'contain':
        return BoxFit.contain;
      case 'cover':
        return BoxFit.cover;
      case 'fitwidth':
        return BoxFit.fitWidth;
      case 'fitheight':
        return BoxFit.fitHeight;
      case 'none':
        return BoxFit.none;
      case 'scaledown':
        return BoxFit.scaleDown;
      default:
        return BoxFit.cover;
    }
  }
}
