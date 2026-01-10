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
                    this.blocks = response;
                    this.loadCategories();
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
                    this.categories = response;
                    this.renderBlocksPalette();
                },
            });
        },

        renderBlocksPalette() {
            const $sidebar = $('.psab-builder__sidebar');
            if (!$sidebar.length) return;

            let html = '<div class="psab-blocks-palette">';
            html += '<h3>Blocks</h3>';

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

            $sidebar.html(html);

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
                    this.renderPageSelector(response);
                    if (response.length > 0) {
                        this.loadPage(response[0].id);
                    }
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
                    this.currentPage = pageId;
                    this.currentPageData = response;
                    this.renderCanvas();
                    $('.psab-toolbar__page-selector').val(pageId);
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
                        </div>
                        <div class="psab-toolbar__right">
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
        },

        initCanvas() {
            const $root = $('#psab-app-builder-root');
            if ($root.length && !$('.psab-builder').length) {
                $root.append(`
                    <div class="psab-builder">
                        <div class="psab-builder__sidebar"></div>
                        <div class="psab-builder__canvas">
                            <div class="psab-canvas psab-canvas--empty" id="psab-canvas"></div>
                        </div>
                        <div class="psab-builder__properties">
                            <div class="psab-properties">
                                <div class="psab-properties__title">Properties</div>
                                <div id="psab-properties-content">
                                    <p style="color: #999;">Select a block to edit its properties</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            }

            this.initCanvasDropZone();
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
                return;
            }

            blocks.forEach((block, index) => {
                this.renderBlock(block, index);
            });

            this.initBlockInteractions();
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
            const $content = $('#psab-properties-content');
            if (this.selectedBlock === null || !this.currentPageData) {
                $content.html('<p style="color: #999;">Select a block to edit its properties</p>');
                return;
            }

            const block = this.currentPageData.page_config.blocks[this.selectedBlock];
            const blockDef = this.blocks[block.type];

            if (!blockDef) return;

            let html = '<div class="psab-properties__section">';
            html += `<div class="psab-properties__section-title">${blockDef.label} Properties</div>`;

            for (const [key, schema] of Object.entries(blockDef.schema)) {
                html += this.renderPropertyField(key, schema, block.config[key]);
            }

            html += '</div>';

            $content.html(html);

            this.initPropertyFields();
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
            $('#psab-properties-content').on('change', 'input, textarea, select', (e) => {
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

                const block = this.currentPageData.page_config.blocks[this.selectedBlock];
                block.config[key] = value;

                this.renderCanvas();
                this.selectBlock(this.selectedBlock);
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
    };

    $(document).ready(() => {
        PSABBuilder.init();
    });
})(jQuery);
