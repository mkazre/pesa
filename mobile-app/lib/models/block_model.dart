class BlockModel {
  final String id;
  final String type;
  final Map<String, dynamic> config;
  final BlockStyle? style;
  final List<BlockModel>? children;
  final VisibilityRules? visibility;

  BlockModel({
    required this.id,
    required this.type,
    required this.config,
    this.style,
    this.children,
    this.visibility,
  });

  factory BlockModel.fromJson(Map<String, dynamic> json) {
    return BlockModel(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      config: json['config'] ?? {},
      style: json['style'] != null ? BlockStyle.fromJson(json['style']) : null,
      children: (json['children'] as List?)
          ?.map((child) => BlockModel.fromJson(child))
          .toList(),
      visibility: json['visibility'] != null
          ? VisibilityRules.fromJson(json['visibility'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'config': config,
      'style': style?.toJson(),
      'children': children?.map((child) => child.toJson()).toList(),
      'visibility': visibility?.toJson(),
    };
  }
}

class BlockStyle {
  final Map<String, dynamic>? padding;
  final Map<String, dynamic>? margin;
  final String? backgroundColor;
  final String? textColor;
  final double? fontSize;
  final String? fontWeight;
  final String? textAlign;
  final double? borderRadius;
  final String? borderColor;
  final double? borderWidth;
  final double? width;
  final double? height;

  BlockStyle({
    this.padding,
    this.margin,
    this.backgroundColor,
    this.textColor,
    this.fontSize,
    this.fontWeight,
    this.textAlign,
    this.borderRadius,
    this.borderColor,
    this.borderWidth,
    this.width,
    this.height,
  });

  factory BlockStyle.fromJson(Map<String, dynamic> json) {
    return BlockStyle(
      padding: json['padding'],
      margin: json['margin'],
      backgroundColor: json['backgroundColor'],
      textColor: json['textColor'] ?? json['color'],
      fontSize: json['fontSize']?.toDouble(),
      fontWeight: json['fontWeight'],
      textAlign: json['textAlign'],
      borderRadius: json['borderRadius']?.toDouble(),
      borderColor: json['borderColor'],
      borderWidth: json['borderWidth']?.toDouble(),
      width: json['width']?.toDouble(),
      height: json['height']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'padding': padding,
      'margin': margin,
      'backgroundColor': backgroundColor,
      'textColor': textColor,
      'fontSize': fontSize,
      'fontWeight': fontWeight,
      'textAlign': textAlign,
      'borderRadius': borderRadius,
      'borderColor': borderColor,
      'borderWidth': borderWidth,
      'width': width,
      'height': height,
    };
  }
}

class VisibilityRules {
  final bool? loggedIn;
  final bool? loggedOut;
  final List<String>? userRoles;

  VisibilityRules({
    this.loggedIn,
    this.loggedOut,
    this.userRoles,
  });

  factory VisibilityRules.fromJson(Map<String, dynamic> json) {
    return VisibilityRules(
      loggedIn: json['loggedIn'],
      loggedOut: json['loggedOut'],
      userRoles: (json['userRoles'] as List?)?.cast<String>(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'loggedIn': loggedIn,
      'loggedOut': loggedOut,
      'userRoles': userRoles,
    };
  }

  bool isVisible(bool isUserLoggedIn, List<String> currentUserRoles) {
    if (loggedIn == true && !isUserLoggedIn) return false;
    if (loggedOut == true && isUserLoggedIn) return false;

    if (userRoles != null && userRoles!.isNotEmpty) {
      if (!currentUserRoles.any((role) => userRoles!.contains(role))) {
        return false;
      }
    }

    return true;
  }
}
