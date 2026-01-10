import 'package:pesa_shop/models/page_config.dart';
import 'package:pesa_shop/models/theme_config.dart';

class AppConfig {
  final String version;
  final List<PageConfig> pages;
  final ThemeConfig theme;
  final SiteInfo site;
  final WooCommerceConfig woocommerce;

  AppConfig({
    required this.version,
    required this.pages,
    required this.theme,
    required this.site,
    required this.woocommerce,
  });

  factory AppConfig.fromJson(Map<String, dynamic> json) {
    return AppConfig(
      version: json['version'] ?? '1.0.0',
      pages: (json['pages'] as List?)
              ?.map((page) => PageConfig.fromJson(page))
              .toList() ??
          [],
      theme: ThemeConfig.fromJson(json['theme'] ?? {}),
      site: SiteInfo.fromJson(json['site'] ?? {}),
      woocommerce: WooCommerceConfig.fromJson(json['woocommerce'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'version': version,
      'pages': pages.map((page) => page.toJson()).toList(),
      'theme': theme.toJson(),
      'site': site.toJson(),
      'woocommerce': woocommerce.toJson(),
    };
  }

  PageConfig? getPageByKey(String key) {
    try {
      return pages.firstWhere((page) => page.key == key);
    } catch (e) {
      return null;
    }
  }

  PageConfig? getPageByType(String type) {
    try {
      return pages.firstWhere((page) => page.type == type);
    } catch (e) {
      return null;
    }
  }
}

class SiteInfo {
  final String url;
  final String name;
  final String description;
  final String? logo;

  SiteInfo({
    required this.url,
    required this.name,
    required this.description,
    this.logo,
  });

  factory SiteInfo.fromJson(Map<String, dynamic> json) {
    return SiteInfo(
      url: json['url'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      logo: json['logo'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'url': url,
      'name': name,
      'description': description,
      'logo': logo,
    };
  }
}

class WooCommerceConfig {
  final bool enabled;
  final String currency;
  final String currencySymbol;
  final int priceDecimals;

  WooCommerceConfig({
    required this.enabled,
    required this.currency,
    required this.currencySymbol,
    required this.priceDecimals,
  });

  factory WooCommerceConfig.fromJson(Map<String, dynamic> json) {
    return WooCommerceConfig(
      enabled: json['enabled'] ?? true,
      currency: json['currency'] ?? 'USD',
      currencySymbol: json['currency_symbol'] ?? r'$',
      priceDecimals: json['price_decimals'] ?? 2,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'enabled': enabled,
      'currency': currency,
      'currency_symbol': currencySymbol,
      'price_decimals': priceDecimals,
    };
  }
}
