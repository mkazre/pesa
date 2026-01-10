import 'package:pesa_shop/models/block_model.dart';

class PageConfig {
  final int id;
  final String key;
  final String title;
  final String type;
  final PageSettings config;

  PageConfig({
    required this.id,
    required this.key,
    required this.title,
    required this.type,
    required this.config,
  });

  factory PageConfig.fromJson(Map<String, dynamic> json) {
    return PageConfig(
      id: json['id'] ?? 0,
      key: json['key'] ?? '',
      title: json['title'] ?? '',
      type: json['type'] ?? 'custom',
      config: PageSettings.fromJson(json['config'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'key': key,
      'title': title,
      'type': type,
      'config': config.toJson(),
    };
  }
}

class PageSettings {
  final List<BlockModel> blocks;
  final Map<String, dynamic> settings;

  PageSettings({
    required this.blocks,
    required this.settings,
  });

  factory PageSettings.fromJson(Map<String, dynamic> json) {
    return PageSettings(
      blocks: (json['blocks'] as List?)
              ?.map((block) => BlockModel.fromJson(block))
              .toList() ??
          [],
      settings: json['settings'] ?? {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'blocks': blocks.map((block) => block.toJson()).toList(),
      'settings': settings,
    };
  }

  String? get backgroundColor => settings['backgroundColor'];
  Map<String, dynamic>? get padding => settings['padding'];
}
