/**
 * PESA Shop App Builder - Admin App
 */

(function ($) {
    'use strict';

    const PSABBuilder = {
        currentPage: null,
        currentPageData: null,
        selectedBlock: null,
        blocks: {},
        categories: {},

        init() {
            // First create the UI structure
            this.initToolbar();
            this.initCanvas();
            this.initPagesManager();

            // Then load data and populate UI
            this.loadBlocks();
            this.initPageSelector();
        },

        loadBlocks() {
            $.ajax({
                url: psabAdmin.restUrl + 'blocks',
                method: 'GET',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                success: (response) => {
                    console.log('Blocks loaded:', response);
                    this.blocks = response;
                    this.loadCategories();
                },
                error: (xhr, status, error) => {
                    console.error('Failed to load blocks:', error, xhr);
                    this.showNotification('Failed to load blocks. Please check browser console for details.', 'error');
                },
            });
        },

        loadCategories() {
            $.ajax({
                url: psabAdmin.restUrl + 'blocks/categories',
                method: 'GET',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                success: (response) => {
                    console.log('Categories loaded:', response);
                    this.categories = response;
                    this.renderBlocksPalette();
                },
                error: (xhr, status, error) => {
                    console.error('Failed to load categories:', error, xhr);
                    this.showNotification('Failed to load block categories.', 'error');
                },
            });
        },

        renderBlocksPalette() {
            const $content = $('#psab-sidebar-content');
            if (!$content.length) return;

            let html = '<div class="psab-blocks-palette">';

            for (const [categoryKey, categoryLabel] of Object.entries(this.categories)) {
                const categoryBlocks = Object.entries(this.blocks).filter(
                    ([type, block]) => block.category === categoryKey
                );

                if (categoryBlocks.length === 0) continue;

                html += '<div class="psab-blocks-palette__category">';
                html += `<div class="psab-blocks-palette__category-title">${categoryLabel}</div>`;

                categoryBlocks.forEach(([type, block]) => {
                    html += `<div class="psab-blocks-palette__block" data-block-type="${type}" draggable="true">`;
                    html += `<span class="psab-blocks-palette__block-icon">📦</span>`;
                    html += `<span class="psab-blocks-palette__block-label">${block.label}</span>`;
                    html += `</div>`;
                });

                html += '</div>';
            }

            html += '</div>';

            $content.html(html);

            this.initBlocksDragging();
        },

        initBlocksDragging() {
            $('.psab-blocks-palette__block').on('dragstart', (e) => {
                const blockType = $(e.currentTarget).data('block-type');
                e.originalEvent.dataTransfer.setData('blockType', blockType);
                e.originalEvent.dataTransfer.effectAllowed = 'copy';
            });
        },

        initPageSelector() {
            $.ajax({
                url: psabAdmin.restUrl + 'pages',
                method: 'GET',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                success: (response) => {
                    console.log('Pages loaded:', response);
                    this.renderPageSelector(response);
                    if (response.length > 0) {
                        this.loadPage(response[0].id);
                    } else {
                        this.showNoPagesMessage();
                    }
                },
                error: (xhr, status, error) => {
                    console.error('Failed to load pages:', error, xhr);
                    this.showNotification('Failed to load pages. Please check browser console for details.', 'error');
                    this.showNoPagesMessage();
                },
            });
        },

        renderPageSelector(pages) {
            const $selector = $('.psab-toolbar__page-selector');
            if (!$selector.length) return;

            let html = '<option value="">Select a page...</option>';
            pages.forEach((page) => {
                html += `<option value="${page.id}">${page.page_title}</option>`;
            });

            $selector.html(html);

            $selector.on('change', (e) => {
                const pageId = $(e.target).val();
                if (pageId) {
                    this.loadPage(pageId);
                }
            });
        },

        loadPage(pageId) {
            $.ajax({
                url: psabAdmin.restUrl + 'pages/' + pageId,
                method: 'GET',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                success: (response) => {
                    console.log('Page loaded:', response);
                    this.currentPage = pageId;
                    this.currentPageData = response;
                    this.renderCanvas();
                    $('.psab-toolbar__page-selector').val(pageId);
                },
                error: (xhr, status, error) => {
                    console.error('Failed to load page:', error, xhr);
                    this.showNotification('Failed to load page. Please try again.', 'error');
                },
            });
        },

        initToolbar() {
            const $toolbar = $('.psab-toolbar');
            if (!$toolbar.length) {
                $('#psab-app-builder-root').prepend(`
                    <div class="psab-toolbar">
                        <div class="psab-toolbar__left">
                            <select class="psab-toolbar__page-selector"></select>
                            <button class="psab-button psab-button--secondary" id="psab-create-page">
                                + New Page
                            </button>
                        </div>
                        <div class="psab-toolbar__right">
                            <button class="psab-button psab-button--secondary" id="psab-toggle-preview">
                                👁️ Preview
                            </button>
                            <button class="psab-button psab-button--primary" id="psab-save-page">
                                ${psabAdmin.i18n.savePage}
                            </button>
                        </div>
                    </div>
                `);
            }

            $(document).on('click', '#psab-save-page', () => {
                this.savePage();
            });

            $(document).on('click', '#psab-create-page', () => {
                this.showCreatePageModal();
            });

            $(document).on('click', '#psab-toggle-preview', () => {
                this.togglePreview();
            });
        },

        initCanvas() {
            const $root = $('#psab-app-builder-root');
            if ($root.length && !$('.psab-builder').length) {
                $root.append(`
                    <div class="psab-builder">
                        <div class="psab-builder__sidebar">
                            <div class="psab-sidebar-header">
                                <button class="psab-sidebar-toggle psab-sidebar-toggle--active" data-mode="elements">Elements</button>
                                <button class="psab-sidebar-toggle" data-mode="properties">Properties</button>
                            </div>
                            <div id="psab-sidebar-content"></div>
                        </div>
                        <div class="psab-builder__canvas">
                            <div class="psab-canvas psab-canvas--empty" id="psab-canvas"></div>
                        </div>
                        <div class="psab-builder__structure">
                            <div class="psab-structure">
                                <div class="psab-structure__title">Structure</div>
                                <div id="psab-structure-content">
                                    <p style="color: #999; padding: 10px;">Page structure will appear here</p>
                                </div>
                            </div>
                        </div>
                        <div class="psab-builder__preview" style="display: none;">
                            <div class="psab-preview">
                                <div class="psab-preview__header">
                                    <span>Live Preview</span>
                                    <button class="psab-preview__close">✕</button>
                                </div>
                                <div class="psab-preview__content">
                                    <iframe id="psab-preview-frame" style="width: 375px; height: 667px; border: none; background: #fff;"></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            }

            this.initCanvasDropZone();
            this.initSidebarToggle();

            // Preview close button
            $(document).on('click', '.psab-preview__close', () => {
                this.togglePreview();
            });
        },

        initCanvasDropZone() {
            const $canvas = $('#psab-canvas');

            $canvas.on('dragover', (e) => {
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'copy';
                $canvas.addClass('drag-over');
            });

            $canvas.on('dragleave', () => {
                $canvas.removeClass('drag-over');
            });

            $canvas.on('drop', (e) => {
                e.preventDefault();
                $canvas.removeClass('drag-over');

                const blockType = e.originalEvent.dataTransfer.getData('blockType');
                if (blockType) {
                    this.addBlock(blockType);
                }
            });
        },

        renderCanvas() {
            const $canvas = $('#psab-canvas');
            if (!$canvas.length || !this.currentPageData) return;

            $canvas.empty();
            $canvas.removeClass('psab-canvas--empty');

            const blocks = this.currentPageData.page_config.blocks || [];

            if (blocks.length === 0) {
                $canvas.addClass('psab-canvas--empty');
                this.renderStructureTree();
                return;
            }

            blocks.forEach((block, index) => {
                this.renderBlock(block, index);
            });

            this.initBlockInteractions();
            this.renderStructureTree();

            // Update preview if visible
            if ($('.psab-builder__preview').is(':visible')) {
                this.updatePreview();
            }
        },

        renderBlock(block, index) {
            const $canvas = $('#psab-canvas');
            const blockDef = this.blocks[block.type];

            if (!blockDef) return;

            const blockHtml = `
                <div class="psab-canvas__block" data-block-index="${index}" data-block-type="${block.type}">
                    <div class="psab-canvas__block-header">
                        <div class="psab-canvas__block-title">${blockDef.label}</div>
                        <div class="psab-canvas__block-actions">
                            <button class="psab-canvas__block-action psab-canvas__block-edit" title="Edit">✏️</button>
                            <button class="psab-canvas__block-action psab-canvas__block-delete" title="Delete">🗑️</button>
                        </div>
                    </div>
                    <div class="psab-canvas__block-content">
                        ${this.renderBlockPreview(block)}
                    </div>
                </div>
            `;

            $canvas.append(blockHtml);
        },

        renderBlockPreview(block) {
            const config = block.config || {};

            switch (block.type) {
                case 'text':
                case 'heading':
                    return config.text || 'No text';
                case 'image':
                    return config.src ? `<img src="${config.src}" style="max-width: 100px;" />` : 'No image';
                case 'button':
                    return `Button: ${config.text || 'Click me'}`;
                case 'spacer':
                    return `Spacer: ${config.height || 16}px`;
                case 'divider':
                    return `Divider`;
                case 'product_grid':
                    return `Product Grid (${config.columns || 2} columns)`;
                case 'product_list':
                    return `Product List`;
                case 'category_grid':
                    return `Category Grid (${config.columns || 3} columns)`;
                case 'cart_items':
                    return `Cart Items List`;
                case 'cart_totals':
                    return `Cart Totals`;
                case 'webview':
                    return `WebView: ${config.url || 'No URL'}`;
                case 'shortcode':
                    return `Shortcode: ${config.shortcode || '[shortcode]'}`;
                default:
                    return `${block.type} block`;
            }
        },

        initBlockInteractions() {
            const $canvas = $('#psab-canvas');

            $canvas.on('click', '.psab-canvas__block', (e) => {
                if ($(e.target).closest('.psab-canvas__block-action').length) return;

                $('.psab-canvas__block').removeClass('selected');
                $(e.currentTarget).addClass('selected');

                const index = $(e.currentTarget).data('block-index');
                this.selectBlock(index);
            });

            $canvas.on('click', '.psab-canvas__block-delete', (e) => {
                e.stopPropagation();
                if (confirm(psabAdmin.i18n.confirmDelete)) {
                    const index = $(e.currentTarget).closest('.psab-canvas__block').data('block-index');
                    this.deleteBlock(index);
                }
            });

            $canvas.on('click', '.psab-canvas__block-edit', (e) => {
                e.stopPropagation();
                const index = $(e.currentTarget).closest('.psab-canvas__block').data('block-index');
                this.selectBlock(index);
            });

            this.initBlocksSorting();
        },

        initBlocksSorting() {
            $('#psab-canvas').sortable({
                items: '.psab-canvas__block',
                handle: '.psab-canvas__block-header',
                placeholder: 'psab-canvas__block-placeholder',
                update: () => {
                    this.updateBlockOrder();
                },
            });
        },

        updateBlockOrder() {
            const newOrder = [];
            $('.psab-canvas__block').each((i, el) => {
                const index = $(el).data('block-index');
                newOrder.push(this.currentPageData.page_config.blocks[index]);
            });
            this.currentPageData.page_config.blocks = newOrder;
        },

        addBlock(blockType) {
            const blockDef = this.blocks[blockType];
            if (!blockDef) return;

            const newBlock = {
                id: 'block-' + Date.now(),
                type: blockType,
                config: this.getDefaultBlockConfig(blockType, blockDef),
            };

            if (!this.currentPageData.page_config.blocks) {
                this.currentPageData.page_config.blocks = [];
            }

            this.currentPageData.page_config.blocks.push(newBlock);
            this.renderCanvas();
        },

        getDefaultBlockConfig(blockType, blockDef) {
            const config = {};
            for (const [key, schema] of Object.entries(blockDef.schema)) {
                config[key] = schema.default;
            }
            return config;
        },

        selectBlock(index) {
            this.selectedBlock = index;
            this.renderProperties();
        },

        renderProperties() {
            const $content = $('#psab-sidebar-content');
            if (this.selectedBlock === null || !this.currentPageData) {
                $content.html('<p style="color: #999; padding: 15px;">Select an element to edit its properties</p>');
                return;
            }

            const block = this.currentPageData.page_config.blocks[this.selectedBlock];
            const blockDef = this.blocks[block.type];

            if (!blockDef) return;

            let html = '<div class="psab-properties-panel">';
            html += `<div class="psab-properties-panel__header">${blockDef.label}</div>`;

            // Tabs for Primary and Advanced
            html += '<div class="psab-properties-tabs">';
            html += '<button class="psab-properties-tab psab-properties-tab--active" data-tab="primary">Primary</button>';
            html += '<button class="psab-properties-tab" data-tab="advanced">Advanced</button>';
            html += '</div>';

            // Primary Tab Content
            html += '<div class="psab-properties-tab-content psab-properties-tab-content--active" data-tab-content="primary">';
            html += this.renderPrimaryProperties(block, blockDef);
            html += '</div>';

            // Advanced Tab Content
            html += '<div class="psab-properties-tab-content" data-tab-content="advanced">';
            html += this.renderAdvancedProperties(block, blockDef);
            html += '</div>';

            html += '</div>';

            $content.html(html);

            this.initPropertyTabs();
            this.initPropertyFields();
        },

        renderPrimaryProperties(block, blockDef) {
            let html = '';

            // Content properties
            if (block.type === 'text' || block.type === 'heading') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Content</div>';
                html += this.renderVisualField('text', 'Text', block.config.text || '', 'textarea');
                html += '</div>';
            }

            if (block.type === 'button') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Content</div>';
                html += this.renderVisualField('text', 'Button Text', block.config.text || '', 'text');
                html += this.renderVisualField('link', 'Link URL', block.config.link || '', 'text');
                html += '</div>';
            }

            if (block.type === 'image') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Image</div>';
                html += this.renderVisualField('src', 'Image URL', block.config.src || '', 'text');
                html += '</div>';
            }

            // Style properties
            html += '<div class="psab-prop-group">';
            html += '<div class="psab-prop-group__title">Typography</div>';

            if (block.type === 'text' || block.type === 'heading' || block.type === 'button') {
                const style = block.config.style || {};
                html += this.renderVisualField('style.fontSize', 'Font Size', style.fontSize || 14, 'slider', {min: 8, max: 72, unit: 'px'});
                html += this.renderVisualField('style.fontWeight', 'Font Weight', style.fontWeight || 'normal', 'select', {
                    options: [
                        {value: 'normal', label: 'Normal'},
                        {value: 'bold', label: 'Bold'},
                        {value: '300', label: 'Light'},
                        {value: '600', label: 'Semi Bold'},
                        {value: '900', label: 'Black'}
                    ]
                });
                html += this.renderVisualField('style.color', 'Color', style.color || '#000000', 'color');
                html += this.renderVisualField('style.textAlign', 'Alignment', style.textAlign || 'left', 'alignment');
            }

            html += '</div>';

            // Layout properties for containers
            if (block.type === 'container' || block.type === 'row' || block.type === 'column') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Layout</div>';
                const style = block.config.style || {};
                html += this.renderVisualField('style.backgroundColor', 'Background', style.backgroundColor || '#ffffff', 'color');
                html += this.renderVisualField('style.padding', 'Padding', style.padding || 0, 'slider', {min: 0, max: 100, unit: 'px'});
                html += '</div>';
            }

            return html;
        },

        renderAdvancedProperties(block, blockDef) {
            let html = '<div class="psab-prop-group">';
            html += '<div class="psab-prop-group__title">All Properties (JSON)</div>';

            for (const [key, schema] of Object.entries(blockDef.schema)) {
                html += this.renderPropertyField(key, schema, block.config[key]);
            }

            html += '</div>';

            return html;
        },

        renderVisualField(key, label, value, type, options = {}) {
            let html = `<div class="psab-visual-field" data-field-key="${key}">`;
            html += `<label class="psab-visual-field__label">${label}</label>`;

            switch (type) {
                case 'text':
                    html += `<input type="text" class="psab-visual-field__input" data-key="${key}" value="${value}" />`;
                    break;

                case 'textarea':
                    html += `<textarea class="psab-visual-field__textarea" data-key="${key}" rows="4">${value}</textarea>`;
                    break;

                case 'color':
                    html += `<div class="psab-visual-field__color">`;
                    html += `<input type="color" class="psab-visual-field__color-picker" data-key="${key}" value="${value}" />`;
                    html += `<input type="text" class="psab-visual-field__color-text" data-key="${key}" value="${value}" />`;
                    html += `</div>`;
                    break;

                case 'slider':
                    html += `<div class="psab-visual-field__slider">`;
                    html += `<input type="range" class="psab-visual-field__slider-input" data-key="${key}" value="${value}" min="${options.min || 0}" max="${options.max || 100}" />`;
                    html += `<span class="psab-visual-field__slider-value">${value}${options.unit || ''}</span>`;
                    html += `</div>`;
                    break;

                case 'select':
                    html += `<select class="psab-visual-field__select" data-key="${key}">`;
                    options.options.forEach(opt => {
                        html += `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`;
                    });
                    html += `</select>`;
                    break;

                case 'alignment':
                    html += `<div class="psab-visual-field__alignment">`;
                    ['left', 'center', 'right', 'justify'].forEach(align => {
                        const icon = {left: '⇤', center: '↔', right: '⇥', justify: '≡'}[align];
                        html += `<button class="psab-visual-field__alignment-btn ${value === align ? 'active' : ''}" data-key="${key}" data-value="${align}">${icon}</button>`;
                    });
                    html += `</div>`;
                    break;
            }

            html += `</div>`;
            return html;
        },

        initPropertyTabs() {
            $('.psab-properties-tab').on('click', function() {
                const tab = $(this).data('tab');

                $('.psab-properties-tab').removeClass('psab-properties-tab--active');
                $(this).addClass('psab-properties-tab--active');

                $('.psab-properties-tab-content').removeClass('psab-properties-tab-content--active');
                $(`.psab-properties-tab-content[data-tab-content="${tab}"]`).addClass('psab-properties-tab-content--active');
            });
        },

        renderPropertyField(key, schema, value) {
            let html = '<div class="psab-properties__field">';
            html += `<label class="psab-properties__field-label">${this.formatLabel(key)}</label>`;

            const inputId = `psab-prop-${key}`;

            switch (schema.type) {
                case 'string':
                    html += `<input type="text" id="${inputId}" class="psab-properties__field-input" data-key="${key}" value="${value || ''}" />`;
                    break;
                case 'number':
                    html += `<input type="number" id="${inputId}" class="psab-properties__field-input" data-key="${key}" value="${value || 0}" />`;
                    break;
                case 'boolean':
                    html += `<input type="checkbox" id="${inputId}" class="psab-properties__field-checkbox" data-key="${key}" ${value ? 'checked' : ''} />`;
                    break;
                case 'array':
                    html += `<textarea id="${inputId}" class="psab-properties__field-textarea" data-key="${key}">${JSON.stringify(value || [])}</textarea>`;
                    break;
                case 'object':
                    html += `<textarea id="${inputId}" class="psab-properties__field-textarea" data-key="${key}">${JSON.stringify(value || {})}</textarea>`;
                    break;
                default:
                    html += `<input type="text" id="${inputId}" class="psab-properties__field-input" data-key="${key}" value="${value || ''}" />`;
            }

            html += '</div>';

            return html;
        },

        formatLabel(key) {
            return key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
                .trim();
        },

        initPropertyFields() {
            const updateBlockConfig = (key, value) => {
                const block = this.currentPageData.page_config.blocks[this.selectedBlock];

                // Handle nested keys like 'style.fontSize'
                if (key.includes('.')) {
                    const parts = key.split('.');
                    let obj = block.config;

                    for (let i = 0; i < parts.length - 1; i++) {
                        if (!obj[parts[i]]) obj[parts[i]] = {};
                        obj = obj[parts[i]];
                    }

                    obj[parts[parts.length - 1]] = value;
                } else {
                    block.config[key] = value;
                }

                this.renderCanvas();
                if ($('.psab-builder__preview').is(':visible')) {
                    this.updatePreview();
                }
            };

            // Visual field inputs
            $('#psab-sidebar-content').on('input change', '.psab-visual-field__input, .psab-visual-field__textarea, .psab-visual-field__select', (e) => {
                const key = $(e.target).data('key');
                let value = $(e.target).val();
                updateBlockConfig(key, value);
            });

            // Color picker
            $('#psab-sidebar-content').on('input change', '.psab-visual-field__color-picker', (e) => {
                const key = $(e.target).data('key');
                const value = $(e.target).val();
                $(e.target).siblings('.psab-visual-field__color-text').val(value);
                updateBlockConfig(key, value);
            });

            $('#psab-sidebar-content').on('input change', '.psab-visual-field__color-text', (e) => {
                const key = $(e.target).data('key');
                const value = $(e.target).val();
                $(e.target).siblings('.psab-visual-field__color-picker').val(value);
                updateBlockConfig(key, value);
            });

            // Slider
            $('#psab-sidebar-content').on('input', '.psab-visual-field__slider-input', (e) => {
                const key = $(e.target).data('key');
                const value = parseFloat($(e.target).val());
                const $field = $(e.target).closest('.psab-visual-field');
                const unit = $field.find('.psab-visual-field__slider-value').text().replace(/[0-9.-]/g, '');
                $field.find('.psab-visual-field__slider-value').text(value + unit);
                updateBlockConfig(key, value);
            });

            // Alignment buttons
            $('#psab-sidebar-content').on('click', '.psab-visual-field__alignment-btn', function(e) {
                e.preventDefault();
                const key = $(this).data('key');
                const value = $(this).data('value');

                $(this).siblings().removeClass('active');
                $(this).addClass('active');

                updateBlockConfig(key, value);
            });

            // Traditional property fields (Advanced tab)
            $('#psab-sidebar-content').on('change', '.psab-properties__field-input, .psab-properties__field-textarea, .psab-properties__field-select', (e) => {
                const $field = $(e.target);
                const key = $field.data('key');
                let value = $field.val();

                if ($field.attr('type') === 'checkbox') {
                    value = $field.is(':checked');
                } else if ($field.attr('type') === 'number') {
                    value = parseFloat(value);
                }

                try {
                    if ($field.hasClass('psab-properties__field-textarea')) {
                        value = JSON.parse(value);
                    }
                } catch (e) {
                    // Keep as string if not valid JSON
                }

                updateBlockConfig(key, value);
            });
        },

        deleteBlock(index) {
            this.currentPageData.page_config.blocks.splice(index, 1);
            this.selectedBlock = null;
            this.renderCanvas();
            this.renderProperties();
        },

        savePage() {
            if (!this.currentPage || !this.currentPageData) return;

            const $button = $('#psab-save-page');
            $button.prop('disabled', true).html('<span class="psab-loading"></span> Saving...');

            $.ajax({
                url: psabAdmin.restUrl + 'pages/' + this.currentPage,
                method: 'POST',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                data: {
                    page_config: this.currentPageData.page_config,
                },
                success: () => {
                    this.showNotification(psabAdmin.i18n.saved, 'success');
                    $button.prop('disabled', false).html(psabAdmin.i18n.savePage);
                },
                error: (xhr) => {
                    this.showNotification(xhr.responseJSON?.message || psabAdmin.i18n.error, 'error');
                    $button.prop('disabled', false).html(psabAdmin.i18n.savePage);
                },
            });
        },

        showNotification(message, type = 'success') {
            const $notification = $(`<div class="psab-notification psab-notification--${type}">${message}</div>`);
            $('body').append($notification);

            setTimeout(() => {
                $notification.fadeOut(() => $notification.remove());
            }, 3000);
        },

        showNoPagesMessage() {
            const $canvas = $('#psab-canvas');
            $canvas.html(`
                <div style="text-align: center; padding: 60px 20px; color: #666;">
                    <h2 style="margin-bottom: 16px;">No Pages Found</h2>
                    <p style="margin-bottom: 20px;">
                        It appears no pages have been created yet.
                        This might indicate an installation issue.
                    </p>
                    <p style="margin-bottom: 20px;">
                        Please try deactivating and reactivating the plugin to trigger the installation process.
                    </p>
                    <p>
                        <a href="${psabAdmin.siteUrl}/wp-admin/plugins.php" class="button button-primary">
                            Go to Plugins
                        </a>
                    </p>
                </div>
            `);
        },

        initPagesManager() {
            const $pagesRoot = $('#psab-pages-root');
            if (!$pagesRoot.length) return;

            $.ajax({
                url: psabAdmin.restUrl + 'pages',
                method: 'GET',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                success: (response) => {
                    this.renderPagesTable(response);
                },
            });
        },

        renderPagesTable(pages) {
            const $root = $('#psab-pages-root');

            let html = '<table class="psab-pages-table">';
            html += '<thead><tr>';
            html += '<th>Title</th>';
            html += '<th>Type</th>';
            html += '<th>Key</th>';
            html += '<th>Status</th>';
            html += '<th>Actions</th>';
            html += '</tr></thead>';
            html += '<tbody>';

            pages.forEach((page) => {
                html += '<tr>';
                html += `<td>${page.page_title}</td>`;
                html += `<td>${page.page_type}</td>`;
                html += `<td><code>${page.page_key}</code></td>`;
                html += `<td>${page.is_active ? '✅ Active' : '❌ Inactive'}</td>`;
                html += '<td class="psab-pages-table__actions">';
                html += `<a href="admin.php?page=pesa-shop-app-builder" class="psab-button psab-button--secondary">Edit</a>`;
                html += '</td>';
                html += '</tr>';
            });

            html += '</tbody></table>';

            $root.html(html);
        },

        // New Page Creation
        showCreatePageModal() {
            const modalHtml = `
                <div class="psab-modal" id="psab-create-page-modal">
                    <div class="psab-modal__overlay"></div>
                    <div class="psab-modal__content">
                        <div class="psab-modal__header">
                            <h2>Create New Page</h2>
                            <button class="psab-modal__close">×</button>
                        </div>
                        <div class="psab-modal__body">
                            <div class="psab-form-field">
                                <label for="new-page-title">Page Title *</label>
                                <input type="text" id="new-page-title" placeholder="e.g., Contact Us" />
                            </div>
                            <div class="psab-form-field">
                                <label for="new-page-key">Page Key *</label>
                                <input type="text" id="new-page-key" placeholder="e.g., contact-us" />
                                <small>Unique identifier (lowercase, hyphens only)</small>
                            </div>
                            <div class="psab-form-field">
                                <label for="new-page-type">Page Type *</label>
                                <select id="new-page-type">
                                    <option value="custom">Custom</option>
                                    <option value="home">Home</option>
                                    <option value="shop">Shop</option>
                                    <option value="product">Product</option>
                                    <option value="cart">Cart</option>
                                    <option value="account">Account</option>
                                </select>
                            </div>
                        </div>
                        <div class="psab-modal__footer">
                            <button class="psab-button psab-button--secondary psab-modal__cancel">Cancel</button>
                            <button class="psab-button psab-button--primary" id="psab-create-page-submit">Create Page</button>
                        </div>
                    </div>
                </div>
            `;

            $('body').append(modalHtml);

            $('#psab-create-page-modal .psab-modal__close, #psab-create-page-modal .psab-modal__cancel, #psab-create-page-modal .psab-modal__overlay').on('click', () => {
                $('#psab-create-page-modal').remove();
            });

            // Auto-generate key from title
            $('#new-page-title').on('input', (e) => {
                const title = $(e.target).val();
                const key = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                $('#new-page-key').val(key);
            });

            $('#psab-create-page-submit').on('click', () => {
                this.createNewPage();
            });
        },

        createNewPage() {
            const title = $('#new-page-title').val().trim();
            const key = $('#new-page-key').val().trim();
            const type = $('#new-page-type').val();

            if (!title || !key) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }

            $.ajax({
                url: psabAdmin.restUrl + 'pages',
                method: 'POST',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                data: {
                    page_title: title,
                    page_key: key,
                    page_type: type,
                    page_config: {
                        blocks: [],
                        settings: {
                            backgroundColor: '#ffffff',
                        },
                    },
                },
                success: (response) => {
                    this.showNotification('Page created successfully!', 'success');
                    $('#psab-create-page-modal').remove();
                    this.initPageSelector();
                    setTimeout(() => {
                        this.loadPage(response.id);
                    }, 500);
                },
                error: (xhr) => {
                    this.showNotification(xhr.responseJSON?.message || 'Failed to create page', 'error');
                },
            });
        },

        // Sidebar Toggle between Elements and Properties
        initSidebarToggle() {
            this.sidebarMode = 'elements';
            this.renderBlocksPalette();

            $('.psab-sidebar-toggle').on('click', (e) => {
                const mode = $(e.currentTarget).data('mode');
                this.sidebarMode = mode;

                $('.psab-sidebar-toggle').removeClass('psab-sidebar-toggle--active');
                $(e.currentTarget).addClass('psab-sidebar-toggle--active');

                if (mode === 'elements') {
                    this.renderBlocksPalette();
                } else {
                    this.renderProperties();
                }
            });
        },

        // Structure Tree Rendering
        renderStructureTree() {
            const $content = $('#psab-structure-content');
            if (!this.currentPageData || !this.currentPageData.page_config.blocks) {
                $content.html('<p style="color: #999; padding: 10px;">No elements yet</p>');
                return;
            }

            let html = '<div class="psab-structure-tree">';
            html += this.renderStructureTreeBlock(this.currentPageData.page_config.blocks);
            html += '</div>';

            $content.html(html);

            this.initStructureInteractions();
        },

        renderStructureTreeBlock(blocks, level = 0) {
            let html = '';

            blocks.forEach((block, index) => {
                const blockDef = this.blocks[block.type];
                if (!blockDef) return;

                const hasChildren = block.children && block.children.length > 0;
                const indent = level * 20;

                html += `
                    <div class="psab-structure-item" data-block-index="${index}" data-block-id="${block.id}" style="padding-left: ${indent}px;">
                        <div class="psab-structure-item__content">
                            ${hasChildren ? '<span class="psab-structure-toggle">▼</span>' : '<span class="psab-structure-spacer"></span>'}
                            <span class="psab-structure-icon">📦</span>
                            <span class="psab-structure-label">${blockDef.label}</span>
                            <button class="psab-structure-action psab-structure-delete" title="Delete">🗑️</button>
                        </div>
                `;

                if (hasChildren) {
                    html += '<div class="psab-structure-children">';
                    html += this.renderStructureTreeBlock(block.children, level + 1);
                    html += '</div>';
                }

                html += '</div>';
            });

            return html;
        },

        initStructureInteractions() {
            $('.psab-structure-item__content').on('click', function(e) {
                if ($(e.target).hasClass('psab-structure-delete')) return;

                $('.psab-structure-item__content').removeClass('active');
                $(this).addClass('active');

                const blockId = $(this).parent().data('block-id');
                PSABBuilder.selectBlockById(blockId);
            });

            $('.psab-structure-toggle').on('click', function(e) {
                e.stopPropagation();
                const $item = $(this).closest('.psab-structure-item');
                $item.find('> .psab-structure-children').first().toggle();
                $(this).text($(this).text() === '▼' ? '▶' : '▼');
            });

            $('.psab-structure-delete').on('click', function(e) {
                e.stopPropagation();
                if (confirm(psabAdmin.i18n.confirmDelete)) {
                    const blockId = $(this).closest('.psab-structure-item').data('block-id');
                    PSABBuilder.deleteBlockById(blockId);
                }
            });
        },

        selectBlockById(blockId) {
            // Find block index by ID
            const findBlockIndex = (blocks) => {
                for (let i = 0; i < blocks.length; i++) {
                    if (blocks[i].id === blockId) {
                        return i;
                    }
                    if (blocks[i].children) {
                        const childIndex = findBlockIndex(blocks[i].children);
                        if (childIndex !== -1) return i;
                    }
                }
                return -1;
            };

            const index = findBlockIndex(this.currentPageData.page_config.blocks);
            if (index !== -1) {
                this.selectBlock(index);
                this.sidebarMode = 'properties';
                $('.psab-sidebar-toggle').removeClass('psab-sidebar-toggle--active');
                $('.psab-sidebar-toggle[data-mode="properties"]').addClass('psab-sidebar-toggle--active');
                this.renderProperties();
            }
        },

        deleteBlockById(blockId) {
            const deleteFromBlocks = (blocks) => {
                for (let i = blocks.length - 1; i >= 0; i--) {
                    if (blocks[i].id === blockId) {
                        blocks.splice(i, 1);
                        return true;
                    }
                    if (blocks[i].children && deleteFromBlocks(blocks[i].children)) {
                        return true;
                    }
                }
                return false;
            };

            deleteFromBlocks(this.currentPageData.page_config.blocks);
            this.renderCanvas();
            this.renderStructureTree();
        },

        // Preview Toggle
        togglePreview() {
            const $preview = $('.psab-builder__preview');
            const $button = $('#psab-toggle-preview');

            if ($preview.is(':visible')) {
                $preview.hide();
                $button.text('👁️ Preview');
            } else {
                $preview.show();
                $button.text('✕ Close Preview');
                this.updatePreview();
            }
        },

        updatePreview() {
            // This would load the mobile app preview
            // For now, we'll show a placeholder
            const $frame = $('#psab-preview-frame');
            const previewHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        .preview-block { padding: 15px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; }
                    </style>
                </head>
                <body>
                    <h3 style="text-align: center; color: #666;">Live Preview</h3>
                    ${this.generatePreviewHTML()}
                </body>
                </html>
            `;

            const blob = new Blob([previewHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            $frame.attr('src', url);
        },

        generatePreviewHTML() {
            if (!this.currentPageData || !this.currentPageData.page_config.blocks) {
                return '<p style="text-align: center; color: #999;">No content yet</p>';
            }

            let html = '';
            this.currentPageData.page_config.blocks.forEach(block => {
                html += this.generateBlockPreviewHTML(block);
            });

            return html;
        },

        generateBlockPreviewHTML(block) {
            const config = block.config || {};
            let html = '<div class="preview-block">';

            switch (block.type) {
                case 'text':
                case 'heading':
                    html += `<${block.type === 'heading' ? 'h2' : 'p'}>${config.text || 'Text'}</${block.type === 'heading' ? 'h2' : 'p'}>`;
                    break;
                case 'button':
                    html += `<button style="padding: 10px 20px; background: #2271b1; color: white; border: none; border-radius: 4px;">${config.text || 'Button'}</button>`;
                    break;
                case 'image':
                    html += config.src ? `<img src="${config.src}" style="max-width: 100%;" />` : '<div style="background: #f0f0f0; padding: 40px; text-align: center;">Image</div>';
                    break;
                default:
                    html += `<div style="padding: 10px; background: #f9f9f9;">${block.type}</div>`;
            }

            if (block.children && block.children.length > 0) {
                block.children.forEach(child => {
                    html += this.generateBlockPreviewHTML(child);
                });
            }

            html += '</div>';
            return html;
        },
    };

    $(document).ready(() => {
        PSABBuilder.init();
    });
})(jQuery);
