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

        renderBlock(block, index, $parent = null, path = []) {
            const $container = $parent || $('#psab-canvas');
            const blockDef = this.blocks[block.type];

            if (!blockDef) return;

            const currentPath = [...path, index];
            const hasChildren = block.children && block.children.length > 0;
            const canHaveChildren = block.type === 'container' || block.type === 'row';

            let blockHtml = `
                <div class="psab-canvas__block" data-block-index="${index}" data-block-type="${block.type}" data-block-id="${block.id}" data-block-path="${JSON.stringify(currentPath).replace(/"/g, '&quot;')}">
                    <div class="psab-canvas__block-header">
                        <div class="psab-canvas__block-title">${blockDef.label}</div>
                        <div class="psab-canvas__block-actions">
                            <button class="psab-canvas__block-action psab-canvas__block-edit" title="Edit">✏️</button>
                            <button class="psab-canvas__block-action psab-canvas__block-delete" title="Delete">🗑️</button>
                        </div>
                    </div>
                    <div class="psab-canvas__block-content">
                        ${this.renderBlockPreview(block)}
            `;

            // Add drop zone for nesting if block can have children
            if (canHaveChildren) {
                blockHtml += `<div class="psab-canvas__block-children" data-parent-path="${JSON.stringify(currentPath).replace(/"/g, '&quot;')}">`;

                if (hasChildren) {
                    // Temporarily close content div to add children properly
                    blockHtml += `</div></div></div>`;
                    const $blockEl = $(blockHtml);
                    $container.append($blockEl);

                    const $childrenContainer = $blockEl.find('.psab-canvas__block-children').first();
                    block.children.forEach((childBlock, childIndex) => {
                        this.renderBlock(childBlock, childIndex, $childrenContainer, currentPath);
                    });

                    this.makeBlockDroppable($childrenContainer);
                    return;
                } else {
                    blockHtml += `<div class="psab-canvas__block-empty">Drop elements here</div>`;
                }

                blockHtml += `</div>`;
            }

            blockHtml += `</div></div>`;

            const $blockEl = $(blockHtml);
            $container.append($blockEl);

            // Make droppable if has children area
            if (canHaveChildren) {
                const $childrenContainer = $blockEl.find('.psab-canvas__block-children').first();
                this.makeBlockDroppable($childrenContainer);
            }
        },

        makeBlockDroppable($element) {
            $element.on('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.originalEvent.dataTransfer.dropEffect = 'copy';
                $element.addClass('drop-target');
            });

            $element.on('dragleave', (e) => {
                e.stopPropagation();
                if (!$element.is(e.target)) return;
                $element.removeClass('drop-target');
            });

            $element.on('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                $element.removeClass('drop-target');

                const blockType = e.originalEvent.dataTransfer.getData('blockType');
                if (blockType) {
                    const parentPathStr = $element.data('parent-path');
                    const parentPath = typeof parentPathStr === 'string' ? JSON.parse(parentPathStr) : parentPathStr;
                    this.addBlock(blockType, parentPath);
                }
            });
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

        addBlock(blockType, parentPath = null) {
            const blockDef = this.blocks[blockType];
            if (!blockDef) return;

            // Special handling for column blocks - show configuration modal
            if (blockType === 'column') {
                this.showColumnConfigModal(parentPath);
                return;
            }

            const newBlock = {
                id: 'block-' + Date.now(),
                type: blockType,
                config: this.getDefaultBlockConfig(blockType, blockDef),
                children: (blockType === 'container' || blockType === 'row') ? [] : undefined,
            };

            if (!this.currentPageData.page_config.blocks) {
                this.currentPageData.page_config.blocks = [];
            }

            // Add to parent or root level
            if (parentPath !== null && Array.isArray(parentPath)) {
                const parent = this.getBlockByPath(parentPath);
                if (parent && parent.children) {
                    parent.children.push(newBlock);
                }
            } else {
                this.currentPageData.page_config.blocks.push(newBlock);
            }

            this.renderCanvas();
        },

        getDefaultBlockConfig(blockType, blockDef) {
            const config = {};
            for (const [key, schema] of Object.entries(blockDef.schema)) {
                config[key] = schema.default;
            }
            return config;
        },

        getBlockByPath(path) {
            if (!path || path.length === 0) return null;

            let blocks = this.currentPageData.page_config.blocks;
            let block = null;

            for (let i = 0; i < path.length; i++) {
                block = blocks[path[i]];
                if (!block) return null;
                if (i < path.length - 1) {
                    blocks = block.children || [];
                }
            }

            return block;
        },

        showColumnConfigModal(parentPath = null) {
            const modalHtml = `
                <div class="psab-modal" id="psab-column-config-modal">
                    <div class="psab-modal__overlay"></div>
                    <div class="psab-modal__content">
                        <div class="psab-modal__header">
                            <h2>Column Configuration</h2>
                            <button class="psab-modal__close">×</button>
                        </div>
                        <div class="psab-modal__body">
                            <div class="psab-form-field">
                                <label>Number of Columns</label>
                                <div class="psab-column-options">
                                    <div class="psab-column-option" data-columns="2">
                                        <div class="psab-column-preview">
                                            <div class="psab-column-preview__col"></div>
                                            <div class="psab-column-preview__col"></div>
                                        </div>
                                        <div class="psab-column-option__label">2 Columns</div>
                                    </div>
                                    <div class="psab-column-option" data-columns="3">
                                        <div class="psab-column-preview">
                                            <div class="psab-column-preview__col"></div>
                                            <div class="psab-column-preview__col"></div>
                                            <div class="psab-column-preview__col"></div>
                                        </div>
                                        <div class="psab-column-option__label">3 Columns</div>
                                    </div>
                                    <div class="psab-column-option" data-columns="4">
                                        <div class="psab-column-preview">
                                            <div class="psab-column-preview__col"></div>
                                            <div class="psab-column-preview__col"></div>
                                            <div class="psab-column-preview__col"></div>
                                            <div class="psab-column-preview__col"></div>
                                        </div>
                                        <div class="psab-column-option__label">4 Columns</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="psab-modal__footer">
                            <button class="psab-button psab-button--secondary psab-modal__cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            `;

            $('body').append(modalHtml);

            // Close handlers
            $('#psab-column-config-modal .psab-modal__close, #psab-column-config-modal .psab-modal__cancel, #psab-column-config-modal .psab-modal__overlay').on('click', () => {
                $('#psab-column-config-modal').remove();
            });

            // Column selection
            $('.psab-column-option').on('click', (e) => {
                const numColumns = $(e.currentTarget).data('columns');
                this.createColumnBlock(numColumns, parentPath);
                $('#psab-column-config-modal').remove();
            });
        },

        createColumnBlock(numColumns, parentPath = null) {
            const rowBlock = {
                id: 'block-' + Date.now(),
                type: 'row',
                config: {
                    style: {
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 10,
                    }
                },
                children: []
            };

            // Create column children
            const columnWidth = Math.floor(100 / numColumns);
            for (let i = 0; i < numColumns; i++) {
                rowBlock.children.push({
                    id: 'block-' + Date.now() + '-col-' + i,
                    type: 'container',
                    config: {
                        style: {
                            flex: 1,
                            minHeight: 100,
                            border: '1px dashed #ccc',
                            padding: 10,
                        }
                    },
                    children: []
                });
            }

            if (!this.currentPageData.page_config.blocks) {
                this.currentPageData.page_config.blocks = [];
            }

            // Add to parent or root level
            if (parentPath !== null && Array.isArray(parentPath)) {
                const parent = this.getBlockByPath(parentPath);
                if (parent && parent.children) {
                    parent.children.push(rowBlock);
                }
            } else {
                this.currentPageData.page_config.blocks.push(rowBlock);
            }

            this.renderCanvas();
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
            const style = block.config.style || {};

            // TEXT ELEMENT
            if (block.type === 'text') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Content</div>';
                html += this.renderVisualField('text', 'Text Content', block.config.text || '', 'textarea');
                html += this.renderVisualField('isDynamic', 'Dynamic Content', block.config.isDynamic || false, 'checkbox');
                if (block.config.isDynamic) {
                    html += this.renderVisualField('dynamicSource', 'Source', block.config.dynamicSource || '', 'select', {
                        options: [
                            {value: 'post_title', label: 'Post Title'},
                            {value: 'post_content', label: 'Post Content'},
                            {value: 'product_name', label: 'Product Name'},
                            {value: 'product_price', label: 'Product Price'},
                            {value: 'user_name', label: 'User Name'}
                        ]
                    });
                }
                html += '</div>';

                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Typography</div>';
                html += this.renderVisualField('style.fontSize', 'Font Size', style.fontSize || 14, 'slider', {min: 8, max: 72, unit: 'px'});
                html += this.renderVisualField('style.fontWeight', 'Font Weight', style.fontWeight || 'normal', 'select', {
                    options: [
                        {value: '300', label: 'Light'},
                        {value: 'normal', label: 'Normal'},
                        {value: '600', label: 'Semi Bold'},
                        {value: 'bold', label: 'Bold'},
                        {value: '900', label: 'Black'}
                    ]
                });
                html += this.renderVisualField('style.color', 'Color', style.color || '#000000', 'color');
                html += this.renderVisualField('style.textAlign', 'Alignment', style.textAlign || 'left', 'alignment');
                html += '</div>';
            }

            // HEADING ELEMENT
            else if (block.type === 'heading') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Content</div>';
                html += this.renderVisualField('text', 'Heading Text', block.config.text || '', 'textarea');
                html += this.renderVisualField('level', 'Heading Level', block.config.level || 1, 'select', {
                    options: [
                        {value: 1, label: 'H1'},
                        {value: 2, label: 'H2'},
                        {value: 3, label: 'H3'},
                        {value: 4, label: 'H4'},
                        {value: 5, label: 'H5'},
                        {value: 6, label: 'H6'}
                    ]
                });
                html += '</div>';

                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Typography</div>';
                html += this.renderVisualField('style.fontSize', 'Font Size', style.fontSize || 24, 'slider', {min: 12, max: 72, unit: 'px'});
                html += this.renderVisualField('style.fontWeight', 'Font Weight', style.fontWeight || 'bold', 'select', {
                    options: [
                        {value: '300', label: 'Light'},
                        {value: 'normal', label: 'Normal'},
                        {value: '600', label: 'Semi Bold'},
                        {value: 'bold', label: 'Bold'},
                        {value: '900', label: 'Black'}
                    ]
                });
                html += this.renderVisualField('style.color', 'Color', style.color || '#000000', 'color');
                html += this.renderVisualField('style.textAlign', 'Alignment', style.textAlign || 'left', 'alignment');
                html += '</div>';
            }

            // IMAGE ELEMENT
            else if (block.type === 'image') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Image</div>';
                html += this.renderVisualField('src', 'Image URL', block.config.src || '', 'text');
                html += '<button class="psab-button psab-button--secondary" style="margin: 10px 0;" onclick="PSABBuilder.openMediaLibrary(\'src\')">Select Image</button>';
                html += this.renderVisualField('alt', 'Alt Text', block.config.alt || '', 'text');
                html += this.renderVisualField('fit', 'Image Fit', block.config.fit || 'cover', 'select', {
                    options: [
                        {value: 'cover', label: 'Cover'},
                        {value: 'contain', label: 'Contain'},
                        {value: 'fill', label: 'Fill'},
                        {value: 'scale-down', label: 'Scale Down'}
                    ]
                });
                html += '</div>';

                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Dimensions</div>';
                html += this.renderVisualField('width', 'Width', block.config.width || '', 'text');
                html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">e.g., 300 or auto</small>';
                html += this.renderVisualField('height', 'Height', block.config.height || '', 'text');
                html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">e.g., 200 or auto</small>';
                html += '</div>';
            }

            // BUTTON ELEMENT
            else if (block.type === 'button') {
                const action = block.config.action || {type: 'none'};

                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Button Content</div>';
                html += this.renderVisualField('text', 'Button Text', block.config.text || 'Click me', 'text');
                html += '</div>';

                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Button Action</div>';
                html += this.renderVisualField('action.type', 'Action Type', action.type || 'none', 'select', {
                    options: [
                        {value: 'none', label: 'No Action'},
                        {value: 'page', label: 'Navigate to Page'},
                        {value: 'url', label: 'Open URL'},
                        {value: 'product', label: 'View Product'},
                        {value: 'category', label: 'View Category'},
                        {value: 'cart', label: 'Add to Cart'},
                        {value: 'checkout', label: 'Go to Checkout'}
                    ]
                });

                if (action.type === 'page') {
                    html += this.renderVisualField('action.pageKey', 'Page', action.pageKey || '', 'text');
                    html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">Enter page key (e.g., home, shop)</small>';
                } else if (action.type === 'url') {
                    html += this.renderVisualField('action.url', 'URL', action.url || '', 'text');
                    html += this.renderVisualField('action.external', 'Open in Browser', action.external || false, 'checkbox');
                } else if (action.type === 'product') {
                    html += this.renderVisualField('action.productId', 'Product ID', action.productId || '', 'text');
                } else if (action.type === 'category') {
                    html += this.renderVisualField('action.categoryId', 'Category ID', action.categoryId || '', 'text');
                } else if (action.type === 'cart') {
                    html += this.renderVisualField('action.productId', 'Product ID', action.productId || '', 'text');
                    html += this.renderVisualField('action.quantity', 'Quantity', action.quantity || 1, 'text');
                }
                html += '</div>';

                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Button Style</div>';
                html += this.renderVisualField('style.backgroundColor', 'Background Color', style.backgroundColor || '#007bff', 'color');
                html += this.renderVisualField('style.color', 'Text Color', style.color || '#ffffff', 'color');
                html += this.renderVisualField('style.fontSize', 'Font Size', style.fontSize || 14, 'slider', {min: 10, max: 24, unit: 'px'});
                html += this.renderVisualField('style.borderRadius', 'Border Radius', style.borderRadius || 4, 'slider', {min: 0, max: 50, unit: 'px'});
                html += '</div>';
            }

            // SLIDER / CAROUSEL ELEMENT
            else if (block.type === 'slider') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Slider Images</div>';
                html += '<div id="slider-images-list"></div>';
                html += '<button class="psab-button psab-button--secondary" onclick="PSABBuilder.addSliderImage()">+ Add Image</button>';
                html += '</div>';

                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Slider Settings</div>';
                html += this.renderVisualField('autoPlay', 'Auto Play', block.config.autoPlay !== false, 'checkbox');
                html += this.renderVisualField('interval', 'Interval (ms)', block.config.interval || 3000, 'text');
                html += this.renderVisualField('height', 'Height', block.config.height || 200, 'slider', {min: 100, max: 600, unit: 'px'});
                html += '</div>';

                // Render slider images after HTML is added
                setTimeout(() => this.renderSliderImages(block.config.images || []), 100);
            }

            // PRODUCT GRID ELEMENT
            else if (block.type === 'product_grid') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Product Source</div>';
                html += this.renderVisualField('source', 'Source', block.config.source || 'latest', 'select', {
                    options: [
                        {value: 'latest', label: 'Latest Products'},
                        {value: 'featured', label: 'Featured Products'},
                        {value: 'on_sale', label: 'On Sale'},
                        {value: 'category', label: 'By Category'},
                        {value: 'ids', label: 'Specific Products (by ID)'}
                    ]
                });

                if (block.config.source === 'category') {
                    html += this.renderVisualField('categoryId', 'Category ID', block.config.categoryId || '', 'text');
                    html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">Enter WooCommerce category ID</small>';
                } else if (block.config.source === 'ids') {
                    html += this.renderVisualField('productIds', 'Product IDs', block.config.productIds || '', 'text');
                    html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">Comma-separated IDs (e.g., 123, 456, 789)</small>';
                }

                html += this.renderVisualField('limit', 'Number of Products', block.config.limit || 10, 'slider', {min: 1, max: 50, unit: ''});
                html += '</div>';

                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Grid Layout</div>';
                html += this.renderVisualField('columns', 'Columns', block.config.columns || 2, 'select', {
                    options: [
                        {value: 1, label: '1 Column'},
                        {value: 2, label: '2 Columns'},
                        {value: 3, label: '3 Columns'},
                        {value: 4, label: '4 Columns'}
                    ]
                });
                html += '</div>';
            }

            // PRODUCT LIST ELEMENT
            else if (block.type === 'product_list') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Product Source</div>';
                html += this.renderVisualField('source', 'Source', block.config.source || 'latest', 'select', {
                    options: [
                        {value: 'latest', label: 'Latest Products'},
                        {value: 'featured', label: 'Featured Products'},
                        {value: 'on_sale', label: 'On Sale'},
                        {value: 'category', label: 'By Category'},
                        {value: 'ids', label: 'Specific Products (by ID)'}
                    ]
                });

                if (block.config.source === 'category') {
                    html += this.renderVisualField('categoryId', 'Category ID', block.config.categoryId || '', 'text');
                    html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">Enter WooCommerce category ID</small>';
                } else if (block.config.source === 'ids') {
                    html += this.renderVisualField('productIds', 'Product IDs', block.config.productIds || '', 'text');
                    html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">Comma-separated IDs</small>';
                }

                html += this.renderVisualField('limit', 'Number of Products', block.config.limit || 10, 'slider', {min: 1, max: 50, unit: ''});
                html += '</div>';
            }

            // CATEGORY GRID ELEMENT
            else if (block.type === 'category_grid') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Category Settings</div>';
                html += this.renderVisualField('parentId', 'Parent Category ID', block.config.parentId || 0, 'text');
                html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">0 for all top-level categories</small>';
                html += this.renderVisualField('limit', 'Number of Categories', block.config.limit || 9, 'slider', {min: 1, max: 50, unit: ''});
                html += this.renderVisualField('columns', 'Columns', block.config.columns || 3, 'select', {
                    options: [
                        {value: 2, label: '2 Columns'},
                        {value: 3, label: '3 Columns'},
                        {value: 4, label: '4 Columns'}
                    ]
                });
                html += '</div>';
            }

            // WEBVIEW ELEMENT
            else if (block.type === 'webview') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">WebView Settings</div>';
                html += this.renderVisualField('url', 'URL', block.config.url || '', 'text');
                html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">Full URL including https://</small>';
                html += this.renderVisualField('enableAuth', 'Pass User Authentication', block.config.enableAuth || false, 'checkbox');
                html += this.renderVisualField('height', 'Height', block.config.height || 400, 'slider', {min: 200, max: 1000, unit: 'px'});
                html += '</div>';
            }

            // HTML ELEMENT
            else if (block.type === 'html') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">HTML Content</div>';
                html += this.renderVisualField('html', 'HTML Code', block.config.html || '', 'textarea');
                html += '<small style="color: #666; display: block; margin-top: -8px;">Enter custom HTML code</small>';
                html += '</div>';
            }

            // SHORTCODE ELEMENT
            else if (block.type === 'shortcode') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Shortcode</div>';
                html += this.renderVisualField('shortcode', 'Shortcode', block.config.shortcode || '', 'text');
                html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">e.g., [products limit="4"]</small>';
                html += '</div>';
            }

            // SPACER ELEMENT
            else if (block.type === 'spacer') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Spacer Settings</div>';
                html += this.renderVisualField('height', 'Height', block.config.height || 16, 'slider', {min: 4, max: 200, unit: 'px'});
                html += '</div>';
            }

            // DIVIDER ELEMENT
            else if (block.type === 'divider') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Divider Settings</div>';
                html += this.renderVisualField('color', 'Color', block.config.color || '#e0e0e0', 'color');
                html += this.renderVisualField('thickness', 'Thickness', block.config.thickness || 1, 'slider', {min: 1, max: 10, unit: 'px'});
                html += '</div>';
            }

            // ROW/COLUMN ALIGNMENT
            else if (block.type === 'row' || block.type === 'column') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Alignment</div>';
                html += this.renderVisualField('mainAxisAlignment', 'Main Axis', block.config.mainAxisAlignment || 'start', 'select', {
                    options: [
                        {value: 'start', label: 'Start'},
                        {value: 'center', label: 'Center'},
                        {value: 'end', label: 'End'},
                        {value: 'space-between', label: 'Space Between'},
                        {value: 'space-around', label: 'Space Around'}
                    ]
                });
                html += this.renderVisualField('crossAxisAlignment', 'Cross Axis', block.config.crossAxisAlignment || 'center', 'select', {
                    options: [
                        {value: 'start', label: 'Start'},
                        {value: 'center', label: 'Center'},
                        {value: 'end', label: 'End'},
                        {value: 'stretch', label: 'Stretch'}
                    ]
                });
                html += '</div>';

                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Background</div>';
                html += this.renderVisualField('style.backgroundColor', 'Background Color', style.backgroundColor || 'transparent', 'color');
                html += this.renderVisualField('style.padding', 'Padding', style.padding || 0, 'slider', {min: 0, max: 100, unit: 'px'});
                html += '</div>';
            }

            // CONTAINER LAYOUT
            else if (block.type === 'container') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Container Style</div>';
                html += this.renderVisualField('style.backgroundColor', 'Background Color', style.backgroundColor || 'transparent', 'color');
                html += this.renderVisualField('style.padding', 'Padding', style.padding || 10, 'slider', {min: 0, max: 100, unit: 'px'});
                html += '</div>';
            }

            // ACCOUNT INFO
            else if (block.type === 'account_info') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Display Fields</div>';
                const fields = block.config.fields || ['name', 'email'];
                html += this.renderVisualField('fields.name', 'Show Name', fields.includes('name'), 'checkbox');
                html += this.renderVisualField('fields.email', 'Show Email', fields.includes('email'), 'checkbox');
                html += this.renderVisualField('fields.phone', 'Show Phone', fields.includes('phone'), 'checkbox');
                html += this.renderVisualField('fields.address', 'Show Address', fields.includes('address'), 'checkbox');
                html += '</div>';
            }

            // ORDER HISTORY
            else if (block.type === 'order_history') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Order History Settings</div>';
                html += this.renderVisualField('limit', 'Number of Orders', block.config.limit || 10, 'slider', {min: 1, max: 50, unit: ''});
                html += '</div>';
            }

            // META FIELD
            else if (block.type === 'meta_field') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Meta Field Settings</div>';
                html += this.renderVisualField('metaKey', 'Meta Key', block.config.metaKey || '', 'text');
                html += this.renderVisualField('objectType', 'Object Type', block.config.objectType || 'post', 'select', {
                    options: [
                        {value: 'post', label: 'Post'},
                        {value: 'product', label: 'Product'},
                        {value: 'user', label: 'User'},
                        {value: 'term', label: 'Term'}
                    ]
                });
                html += this.renderVisualField('format', 'Format', block.config.format || 'text', 'select', {
                    options: [
                        {value: 'text', label: 'Text'},
                        {value: 'number', label: 'Number'},
                        {value: 'date', label: 'Date'},
                        {value: 'image', label: 'Image'},
                        {value: 'url', label: 'URL'}
                    ]
                });
                html += '</div>';
            }

            return html;
        },

        renderAdvancedProperties(block, blockDef) {
            const style = block.config.style || {};
            let html = '';

            // Size & Spacing
            html += '<div class="psab-prop-group">';
            html += '<div class="psab-prop-group__title">Size & Spacing</div>';
            html += this.renderUnitField('style.width', 'Width', style.width);
            html += this.renderUnitField('style.height', 'Height', style.height);
            html += this.renderUnitField('style.minWidth', 'Min Width', style.minWidth);
            html += this.renderUnitField('style.minHeight', 'Min Height', style.minHeight);
            html += this.renderUnitField('style.maxWidth', 'Max Width', style.maxWidth);
            html += this.renderUnitField('style.maxHeight', 'Max Height', style.maxHeight);
            html += '</div>';

            // Margin
            html += '<div class="psab-prop-group">';
            html += '<div class="psab-prop-group__title">Margin</div>';
            html += '<div class="psab-prop-row">';
            html += this.renderUnitField('style.marginTop', 'Top', style.marginTop);
            html += this.renderUnitField('style.marginRight', 'Right', style.marginRight);
            html += '</div>';
            html += '<div class="psab-prop-row">';
            html += this.renderUnitField('style.marginBottom', 'Bottom', style.marginBottom);
            html += this.renderUnitField('style.marginLeft', 'Left', style.marginLeft);
            html += '</div>';
            html += '</div>';

            // Padding
            html += '<div class="psab-prop-group">';
            html += '<div class="psab-prop-group__title">Padding</div>';
            html += '<div class="psab-prop-row">';
            html += this.renderUnitField('style.paddingTop', 'Top', style.paddingTop);
            html += this.renderUnitField('style.paddingRight', 'Right', style.paddingRight);
            html += '</div>';
            html += '<div class="psab-prop-row">';
            html += this.renderUnitField('style.paddingBottom', 'Bottom', style.paddingBottom);
            html += this.renderUnitField('style.paddingLeft', 'Left', style.paddingLeft);
            html += '</div>';
            html += '</div>';

            // Borders
            html += '<div class="psab-prop-group">';
            html += '<div class="psab-prop-group__title">Borders</div>';
            html += this.renderVisualField('style.borderWidth', 'Border Width', style.borderWidth || 0, 'slider', {min: 0, max: 20, unit: 'px'});
            html += this.renderVisualField('style.borderStyle', 'Border Style', style.borderStyle || 'solid', 'select', {
                options: [
                    {value: 'none', label: 'None'},
                    {value: 'solid', label: 'Solid'},
                    {value: 'dashed', label: 'Dashed'},
                    {value: 'dotted', label: 'Dotted'}
                ]
            });
            html += this.renderVisualField('style.borderColor', 'Border Color', style.borderColor || '#000000', 'color');
            html += this.renderVisualField('style.borderRadius', 'Border Radius', style.borderRadius || 0, 'slider', {min: 0, max: 50, unit: 'px'});
            html += '</div>';

            // Shadows
            html += '<div class="psab-prop-group">';
            html += '<div class="psab-prop-group__title">Shadows & Effects</div>';
            html += this.renderVisualField('style.boxShadow', 'Box Shadow', style.boxShadow || '', 'text');
            html += this.renderVisualField('style.textShadow', 'Text Shadow', style.textShadow || '', 'text');
            html += this.renderVisualField('style.opacity', 'Opacity', style.opacity || 1, 'slider', {min: 0, max: 1, step: 0.1, unit: ''});
            html += '</div>';

            // Transform
            html += '<div class="psab-prop-group">';
            html += '<div class="psab-prop-group__title">Transform</div>';
            html += this.renderVisualField('style.transform', 'Transform', style.transform || '', 'text');
            html += '<small style="color: #666; display: block; margin-top: -8px; margin-bottom: 12px;">e.g., rotate(45deg) scale(1.2)</small>';
            html += '</div>';

            // Flexbox (for containers)
            if (block.type === 'container' || block.type === 'row') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Flexbox Layout</div>';
                html += this.renderVisualField('style.display', 'Display', style.display || 'block', 'select', {
                    options: [
                        {value: 'block', label: 'Block'},
                        {value: 'flex', label: 'Flex'},
                        {value: 'inline-flex', label: 'Inline Flex'},
                        {value: 'grid', label: 'Grid'}
                    ]
                });
                html += this.renderVisualField('style.flexDirection', 'Flex Direction', style.flexDirection || 'row', 'select', {
                    options: [
                        {value: 'row', label: 'Row'},
                        {value: 'column', label: 'Column'},
                        {value: 'row-reverse', label: 'Row Reverse'},
                        {value: 'column-reverse', label: 'Column Reverse'}
                    ]
                });
                html += this.renderVisualField('style.justifyContent', 'Justify Content', style.justifyContent || 'flex-start', 'select', {
                    options: [
                        {value: 'flex-start', label: 'Start'},
                        {value: 'center', label: 'Center'},
                        {value: 'flex-end', label: 'End'},
                        {value: 'space-between', label: 'Space Between'},
                        {value: 'space-around', label: 'Space Around'}
                    ]
                });
                html += this.renderVisualField('style.alignItems', 'Align Items', style.alignItems || 'stretch', 'select', {
                    options: [
                        {value: 'stretch', label: 'Stretch'},
                        {value: 'flex-start', label: 'Start'},
                        {value: 'center', label: 'Center'},
                        {value: 'flex-end', label: 'End'}
                    ]
                });
                html += this.renderUnitField('style.gap', 'Gap', style.gap);
                html += '</div>';
            }

            // Position
            html += '<div class="psab-prop-group">';
            html += '<div class="psab-prop-group__title">Position</div>';
            html += this.renderVisualField('style.position', 'Position', style.position || 'static', 'select', {
                options: [
                    {value: 'static', label: 'Static'},
                    {value: 'relative', label: 'Relative'},
                    {value: 'absolute', label: 'Absolute'},
                    {value: 'fixed', label: 'Fixed'},
                    {value: 'sticky', label: 'Sticky'}
                ]
            });
            if (style.position && style.position !== 'static') {
                html += this.renderUnitField('style.top', 'Top', style.top);
                html += this.renderUnitField('style.right', 'Right', style.right);
                html += this.renderUnitField('style.bottom', 'Bottom', style.bottom);
                html += this.renderUnitField('style.left', 'Left', style.left);
                html += this.renderVisualField('style.zIndex', 'Z-Index', style.zIndex || 0, 'text');
            }
            html += '</div>';

            // Advanced Typography (for text elements)
            if (block.type === 'text' || block.type === 'heading' || block.type === 'button') {
                html += '<div class="psab-prop-group">';
                html += '<div class="psab-prop-group__title">Advanced Typography</div>';
                html += this.renderVisualField('style.fontFamily', 'Font Family', style.fontFamily || 'inherit', 'text');
                html += this.renderUnitField('style.lineHeight', 'Line Height', style.lineHeight);
                html += this.renderUnitField('style.letterSpacing', 'Letter Spacing', style.letterSpacing);
                html += this.renderVisualField('style.textTransform', 'Text Transform', style.textTransform || 'none', 'select', {
                    options: [
                        {value: 'none', label: 'None'},
                        {value: 'uppercase', label: 'Uppercase'},
                        {value: 'lowercase', label: 'Lowercase'},
                        {value: 'capitalize', label: 'Capitalize'}
                    ]
                });
                html += this.renderVisualField('style.textDecoration', 'Text Decoration', style.textDecoration || 'none', 'select', {
                    options: [
                        {value: 'none', label: 'None'},
                        {value: 'underline', label: 'Underline'},
                        {value: 'line-through', label: 'Line Through'}
                    ]
                });
                html += '</div>';
            }

            // Custom CSS
            html += '<div class="psab-prop-group">';
            html += '<div class="psab-prop-group__title">Custom CSS Classes</div>';
            html += this.renderVisualField('customClasses', 'CSS Classes', block.config.customClasses || '', 'text');
            html += '<small style="color: #666; display: block; margin-top: -8px;">Space-separated class names</small>';
            html += '</div>';

            return html;
        },

        renderUnitField(key, label, value) {
            const numValue = typeof value === 'number' ? value : (parseInt(value) || '');
            const unit = typeof value === 'string' ? value.replace(/[0-9.-]/g, '') : 'px';

            let html = `<div class="psab-visual-field" data-field-key="${key}">`;
            html += `<label class="psab-visual-field__label">${label}</label>`;
            html += `<div class="psab-prop-unit-input">`;
            html += `<input type="number" class="psab-visual-field__input" data-key="${key}" data-unit-field="true" value="${numValue}" />`;
            html += `<select class="psab-visual-field__unit" data-key="${key}" data-unit-select="true">`;
            html += `<option value="px" ${unit === 'px' ? 'selected' : ''}>px</option>`;
            html += `<option value="%" ${unit === '%' ? 'selected' : ''}>%</option>`;
            html += `<option value="em" ${unit === 'em' ? 'selected' : ''}>em</option>`;
            html += `<option value="rem" ${unit === 'rem' ? 'selected' : ''}>rem</option>`;
            html += `<option value="vh" ${unit === 'vh' ? 'selected' : ''}>vh</option>`;
            html += `<option value="vw" ${unit === 'vw' ? 'selected' : ''}>vw</option>`;
            html += `<option value="auto" ${unit === 'auto' ? 'selected' : ''}>auto</option>`;
            html += `</select>`;
            html += `</div>`;
            html += `</div>`;

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

                case 'checkbox':
                    html += `<div class="psab-visual-field__checkbox">`;
                    html += `<input type="checkbox" id="psab-field-${key.replace(/\./g, '-')}" class="psab-visual-field__checkbox-input" data-key="${key}" ${value ? 'checked' : ''} />`;
                    html += `<label for="psab-field-${key.replace(/\./g, '-')}">${label}</label>`;
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

            // Checkbox inputs
            $('#psab-sidebar-content').on('change', '.psab-visual-field__checkbox-input', (e) => {
                const key = $(e.target).data('key');
                const value = $(e.target).is(':checked');
                updateBlockConfig(key, value);
            });

            // Unit field inputs (number + unit select)
            $('#psab-sidebar-content').on('input change', '[data-unit-field="true"]', (e) => {
                const key = $(e.target).data('key');
                const numValue = $(e.target).val();
                const $unitSelect = $(e.target).siblings('[data-unit-select="true"]');
                const unit = $unitSelect.val();

                let value;
                if (unit === 'auto' || numValue === '') {
                    value = unit === 'auto' ? 'auto' : undefined;
                } else {
                    value = numValue + unit;
                }

                updateBlockConfig(key, value);
            });

            $('#psab-sidebar-content').on('change', '[data-unit-select="true"]', (e) => {
                const key = $(e.target).data('key');
                const unit = $(e.target).val();
                const $numInput = $(e.target).siblings('[data-unit-field="true"]');
                const numValue = $numInput.val();

                let value;
                if (unit === 'auto') {
                    value = 'auto';
                    $numInput.prop('disabled', true);
                } else {
                    $numInput.prop('disabled', false);
                    value = numValue === '' ? undefined : numValue + unit;
                }

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
            // Make structure items draggable
            $('.psab-structure-item__content').attr('draggable', 'true');

            $('.psab-structure-item__content').on('dragstart', function(e) {
                const blockId = $(this).parent().data('block-id');
                e.originalEvent.dataTransfer.setData('blockId', blockId);
                e.originalEvent.dataTransfer.effectAllowed = 'move';
                $(this).parent().addClass('dragging');
            });

            $('.psab-structure-item__content').on('dragend', function(e) {
                $(this).parent().removeClass('dragging');
                $('.psab-structure-item').removeClass('drag-over');
            });

            // Allow dropping on structure items
            $('.psab-structure-item__content').on('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).parent().addClass('drag-over');
            });

            $('.psab-structure-item__content').on('dragleave', function(e) {
                e.stopPropagation();
                $(this).parent().removeClass('drag-over');
            });

            $('.psab-structure-item__content').on('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).parent().removeClass('drag-over');

                const draggedBlockId = e.originalEvent.dataTransfer.getData('blockId');
                const targetBlockId = $(this).parent().data('block-id');

                if (draggedBlockId && targetBlockId && draggedBlockId !== targetBlockId) {
                    PSABBuilder.moveBlockToTarget(draggedBlockId, targetBlockId);
                }
            });

            // Click handlers
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

        moveBlockToTarget(draggedBlockId, targetBlockId) {
            // Find and remove dragged block
            const draggedBlock = this.findAndRemoveBlockById(draggedBlockId);
            if (!draggedBlock) return;

            // Find target block and add dragged block as child
            const targetBlock = this.findBlockById(targetBlockId);
            if (!targetBlock) return;

            // If target can have children, add as child
            if (targetBlock.type === 'container' || targetBlock.type === 'row') {
                if (!targetBlock.children) {
                    targetBlock.children = [];
                }
                targetBlock.children.push(draggedBlock);
            }

            this.renderCanvas();
            this.renderStructureTree();
        },

        findBlockById(blockId, blocks = null) {
            if (!blocks) {
                blocks = this.currentPageData.page_config.blocks;
            }

            for (let block of blocks) {
                if (block.id === blockId) {
                    return block;
                }
                if (block.children) {
                    const found = this.findBlockById(blockId, block.children);
                    if (found) return found;
                }
            }

            return null;
        },

        findAndRemoveBlockById(blockId, blocks = null) {
            if (!blocks) {
                blocks = this.currentPageData.page_config.blocks;
            }

            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].id === blockId) {
                    return blocks.splice(i, 1)[0];
                }
                if (blocks[i].children) {
                    const found = this.findAndRemoveBlockById(blockId, blocks[i].children);
                    if (found) return found;
                }
            }

            return null;
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
            const $previewContent = $('.psab-preview__content');

            // Generate phone mockup HTML
            const phoneHtml = `
                <div class="psab-phone-mockup">
                    <div class="psab-phone-screen">
                        <div class="psab-phone-statusbar">
                            <span class="psab-phone-time">9:41</span>
                            <span class="psab-phone-indicators">
                                <span>📶</span>
                                <span>📡</span>
                                <span>🔋</span>
                            </span>
                        </div>
                        <div class="psab-phone-content">
                            <iframe id="psab-preview-frame" style="width: 100%; height: 100%; border: none;"></iframe>
                        </div>
                        <div class="psab-phone-home-indicator"></div>
                    </div>
                </div>
            `;

            $previewContent.html(phoneHtml);

            // Now update the iframe content
            const $frame = $('#psab-preview-frame');
            const previewHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        * { box-sizing: border-box; }
                        body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f5f5f5; }
                        .preview-block { padding: 12px; margin-bottom: 8px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                        .preview-container { border: 2px dashed #ddd; padding: 12px; margin-bottom: 8px; border-radius: 8px; min-height: 50px; }
                        .preview-row { display: flex; gap: 8px; margin-bottom: 8px; }
                        .preview-column { flex: 1; border: 1px dashed #ddd; padding: 8px; border-radius: 4px; min-height: 80px; }
                    </style>
                </head>
                <body>
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
            const style = config.style || {};

            // Generate inline styles from style config
            let inlineStyle = '';
            if (style.backgroundColor) inlineStyle += `background-color: ${style.backgroundColor};`;
            if (style.color) inlineStyle += `color: ${style.color};`;
            if (style.fontSize) inlineStyle += `font-size: ${style.fontSize}px;`;
            if (style.fontWeight) inlineStyle += `font-weight: ${style.fontWeight};`;
            if (style.textAlign) inlineStyle += `text-align: ${style.textAlign};`;
            if (style.padding) inlineStyle += `padding: ${style.padding}px;`;

            let html = '';

            switch (block.type) {
                case 'container':
                    html += `<div class="preview-container" style="${inlineStyle}">`;
                    if (block.children && block.children.length > 0) {
                        block.children.forEach(child => {
                            html += this.generateBlockPreviewHTML(child);
                        });
                    } else {
                        html += '<p style="color: #999; text-align: center;">Empty container</p>';
                    }
                    html += '</div>';
                    break;

                case 'row':
                    html += `<div class="preview-row" style="${inlineStyle}">`;
                    if (block.children && block.children.length > 0) {
                        block.children.forEach(child => {
                            html += '<div class="preview-column">';
                            if (child.children && child.children.length > 0) {
                                child.children.forEach(grandChild => {
                                    html += this.generateBlockPreviewHTML(grandChild);
                                });
                            } else {
                                html += '<p style="color: #999; font-size: 12px; text-align: center;">Empty</p>';
                            }
                            html += '</div>';
                        });
                    }
                    html += '</div>';
                    break;

                case 'text':
                case 'heading':
                    html += '<div class="preview-block">';
                    html += `<${block.type === 'heading' ? 'h2' : 'p'} style="${inlineStyle}">${config.text || 'Text'}</${block.type === 'heading' ? 'h2' : 'p'}>`;
                    html += '</div>';
                    break;

                case 'button':
                    html += '<div class="preview-block">';
                    html += `<button style="padding: 10px 20px; background: #2271b1; color: white; border: none; border-radius: 8px; font-size: 14px; ${inlineStyle}">${config.text || 'Button'}</button>`;
                    html += '</div>';
                    break;

                case 'image':
                    html += '<div class="preview-block">';
                    html += config.src ? `<img src="${config.src}" style="max-width: 100%; border-radius: 8px; ${inlineStyle}" />` : '<div style="background: #f0f0f0; padding: 40px; text-align: center; border-radius: 8px;">Image</div>';
                    html += '</div>';
                    break;

                default:
                    html += `<div class="preview-block" style="${inlineStyle}">`;
                    html += `<div style="padding: 10px; background: #f9f9f9; border-radius: 4px;">${block.type}</div>`;
                    if (block.children && block.children.length > 0) {
                        block.children.forEach(child => {
                            html += this.generateBlockPreviewHTML(child);
                        });
                    }
                    html += '</div>';
            }

            return html;
        },

        // Helper: Render slider images
        renderSliderImages(images) {
            const $list = $('#slider-images-list');
            if (!$list.length) return;

            let html = '';
            images.forEach((img, index) => {
                html += `<div class="psab-slider-image-item" data-index="${index}">`;
                html += `<img src="${img.url}" style="width: 60px; height: 60px; object-fit: cover;" />`;
                html += `<input type="text" class="psab-slider-image-url" value="${img.url}" placeholder="Image URL" />`;
                html += `<button class="psab-button psab-button--small psab-slider-image-remove" data-index="${index}">Remove</button>`;
                html += `</div>`;
            });

            $list.html(html);

            // Event handlers
            $('.psab-slider-image-url').on('change', (e) => {
                const index = $(e.target).closest('.psab-slider-image-item').data('index');
                const block = this.currentPageData.page_config.blocks[this.selectedBlock];
                if (!block.config.images) block.config.images = [];
                block.config.images[index].url = $(e.target).val();
                this.renderCanvas();
            });

            $('.psab-slider-image-remove').on('click', (e) => {
                const index = $(e.target).data('index');
                const block = this.currentPageData.page_config.blocks[this.selectedBlock];
                block.config.images.splice(index, 1);
                this.renderSliderImages(block.config.images);
                this.renderCanvas();
            });
        },

        // Helper: Add slider image
        addSliderImage() {
            const block = this.currentPageData.page_config.blocks[this.selectedBlock];
            if (!block.config.images) block.config.images = [];

            block.config.images.push({
                url: '',
                caption: ''
            });

            this.renderSliderImages(block.config.images);
        },

        // Helper: Open media library (stub for now - would integrate with WordPress media library)
        openMediaLibrary(configKey) {
            const url = prompt('Enter image URL:');
            if (url) {
                const block = this.currentPageData.page_config.blocks[this.selectedBlock];
                block.config[configKey] = url;
                this.renderProperties();
                this.renderCanvas();
            }
        },
    };

    $(document).ready(() => {
        PSABBuilder.init();
        PSABMenus.init();
    });
})(jQuery);

/**
 * PESA Shop App Builder - Menu Manager
 */
(function($) {
    'use strict';

    window.PSABMenus = {
        currentMenu: null,
        pages: [],

        init() {
            const $root = $('#psab-menus-root');
            if ($root.length) {
                this.loadPages();
                this.renderMenusList();
            }
        },

        loadPages() {
            $.ajax({
                url: psabAdmin.restUrl + 'pages',
                method: 'GET',
                async: false,
                success: (response) => {
                    this.pages = response;
                }
            });
        },

        renderMenusList() {
            $.ajax({
                url: psabAdmin.restUrl + 'menus',
                method: 'GET',
                success: (response) => {
                    this.renderMenusTable(response);
                },
                error: () => {
                    $('#psab-menus-root').html('<p>Error loading menus</p>');
                }
            });
        },

        renderMenusTable(menus) {
            const $root = $('#psab-menus-root');

            let html = '<div class="psab-menus-header" style="margin-bottom: 20px;">';
            html += '<button class="button button-primary" id="psab-create-menu">+ Create New Menu</button>';
            html += '</div>';

            html += '<table class="wp-list-table widefat fixed striped">';
            html += '<thead><tr>';
            html += '<th>Menu Name</th>';
            html += '<th>Position</th>';
            html += '<th>Items</th>';
            html += '<th>Status</th>';
            html += '<th>Actions</th>';
            html += '</tr></thead>';
            html += '<tbody>';

            menus.forEach((menu) => {
                html += '<tr>';
                html += `<td><strong>${menu.menu_name}</strong><br><code>${menu.menu_key}</code></td>`;
                html += `<td>${menu.menu_position}</td>`;
                html += `<td>${menu.items?.length || 0} items</td>`;
                html += `<td>${menu.is_active ? '<span style="color: green;">●</span> Active' : '<span style="color: red;">●</span> Inactive'}</td>`;
                html += '<td>';
                html += `<button class="button button-small psab-edit-menu" data-menu-id="${menu.id}">Edit</button> `;
                html += `<button class="button button-small psab-delete-menu" data-menu-id="${menu.id}">Delete</button>`;
                html += '</td>';
                html += '</tr>';
            });

            html += '</tbody></table>';

            $root.html(html);

            $('#psab-create-menu').on('click', () => this.showCreateMenuModal());
            $('.psab-edit-menu').on('click', (e) => this.editMenu($(e.currentTarget).data('menu-id')));
            $('.psab-delete-menu').on('click', (e) => this.deleteMenu($(e.currentTarget).data('menu-id')));
        },

        showCreateMenuModal() {
            const modalHtml = `
                <div class="psab-modal" id="psab-menu-modal">
                    <div class="psab-modal__overlay"></div>
                    <div class="psab-modal__content" style="max-width: 600px;">
                        <div class="psab-modal__header">
                            <h2>Create New Menu</h2>
                            <button class="psab-modal__close">×</button>
                        </div>
                        <div class="psab-modal__body">
                            <div class="psab-form-field">
                                <label>Menu Name *</label>
                                <input type="text" id="menu-name" placeholder="e.g., Main Navigation" />
                            </div>
                            <div class="psab-form-field">
                                <label>Menu Key *</label>
                                <input type="text" id="menu-key" placeholder="e.g., main-navigation" />
                                <small>Unique identifier (lowercase, hyphens only)</small>
                            </div>
                            <div class="psab-form-field">
                                <label>Position *</label>
                                <select id="menu-position">
                                    <option value="bottom">Bottom</option>
                                    <option value="top">Top</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                        </div>
                        <div class="psab-modal__footer">
                            <button class="psab-button psab-button--secondary psab-modal__cancel">Cancel</button>
                            <button class="psab-button psab-button--primary" id="psab-menu-submit">Create Menu</button>
                        </div>
                    </div>
                </div>
            `;

            $('body').append(modalHtml);

            $('#psab-menu-modal .psab-modal__close, #psab-menu-modal .psab-modal__cancel, #psab-menu-modal .psab-modal__overlay').on('click', () => {
                $('#psab-menu-modal').remove();
            });

            $('#menu-name').on('input', (e) => {
                const name = $(e.target).val();
                const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                $('#menu-key').val(key);
            });

            $('#psab-menu-submit').on('click', () => this.createMenu());
        },

        createMenu() {
            const name = $('#menu-name').val().trim();
            const key = $('#menu-key').val().trim();
            const position = $('#menu-position').val();

            if (!name || !key) {
                alert('Please fill in all required fields');
                return;
            }

            $.ajax({
                url: psabAdmin.restUrl + 'menus',
                method: 'POST',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                data: {
                    menu_name: name,
                    menu_key: key,
                    menu_position: position,
                },
                success: (response) => {
                    $('#psab-menu-modal').remove();
                    this.editMenu(response.id);
                },
                error: (xhr) => {
                    alert(xhr.responseJSON?.message || 'Failed to create menu');
                },
            });
        },

        editMenu(menuId) {
            $.ajax({
                url: psabAdmin.restUrl + 'menus/' + menuId,
                method: 'GET',
                success: (menu) => {
                    this.currentMenu = menu;
                    this.showMenuEditor(menu);
                },
                error: () => {
                    alert('Failed to load menu');
                }
            });
        },

        showMenuEditor(menu) {
            const $root = $('#psab-menus-root');

            let html = '<div class="psab-menu-editor">';
            html += '<div style="margin-bottom: 20px;">';
            html += `<button class="button" id="psab-back-to-menus">← Back to Menus</button>`;
            html += `<button class="button button-primary" id="psab-save-menu" style="float: right;">Save Menu</button>`;
            html += '</div>';

            html += '<div style="display: flex; gap: 20px;">';

            // Left panel - Menu Settings
            html += '<div style="flex: 0 0 300px; background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px;">';
            html += '<h2>Menu Settings</h2>';

            html += '<div class="psab-form-field">';
            html += '<label>Menu Name</label>';
            html += `<input type="text" id="menu-name-edit" value="${menu.menu_name}" />`;
            html += '</div>';

            html += '<div class="psab-form-field">';
            html += '<label>Position</label>';
            html += '<select id="menu-position-edit">';
            html += `<option value="bottom" ${menu.menu_position === 'bottom' ? 'selected' : ''}>Bottom</option>`;
            html += `<option value="top" ${menu.menu_position === 'top' ? 'selected' : ''}>Top</option>`;
            html += `<option value="left" ${menu.menu_position === 'left' ? 'selected' : ''}>Left</option>`;
            html += `<option value="right" ${menu.menu_position === 'right' ? 'selected' : ''}>Right</option>`;
            html += '</select>';
            html += '</div>';

            html += '<h3 style="margin-top: 30px;">Layout Options</h3>';

            html += '<div class="psab-form-field">';
            html += '<label>Layout Style</label>';
            html += '<select id="menu-layout">';
            html += `<option value="tabs" ${menu.menu_config?.layout === 'tabs' ? 'selected' : ''}>Tabs</option>`;
            html += `<option value="list" ${menu.menu_config?.layout === 'list' ? 'selected' : ''}>List</option>`;
            html += `<option value="grid" ${menu.menu_config?.layout === 'grid' ? 'selected' : ''}>Grid</option>`;
            html += '</select>';
            html += '</div>';

            html += '<div class="psab-form-field">';
            html += `<label><input type="checkbox" id="menu-show-labels" ${menu.menu_config?.showLabels ? 'checked' : ''} /> Show Labels</label>`;
            html += '</div>';

            html += '<div class="psab-form-field">';
            html += `<label><input type="checkbox" id="menu-show-icons" ${menu.menu_config?.showIcons ? 'checked' : ''} /> Show Icons</label>`;
            html += '</div>';

            html += '<h3 style="margin-top: 30px;">Colors</h3>';

            html += '<div class="psab-form-field">';
            html += '<label>Background Color</label>';
            html += `<input type="color" id="menu-bg-color" value="${menu.menu_config?.backgroundColor || '#ffffff'}" />`;
            html += '</div>';

            html += '<div class="psab-form-field">';
            html += '<label>Active Color</label>';
            html += `<input type="color" id="menu-active-color" value="${menu.menu_config?.activeColor || '#2271b1'}" />`;
            html += '</div>';

            html += '<div class="psab-form-field">';
            html += '<label>Inactive Color</label>';
            html += `<input type="color" id="menu-inactive-color" value="${menu.menu_config?.inactiveColor || '#999999'}" />`;
            html += '</div>';

            html += '</div>';

            // Right panel - Menu Items
            html += '<div style="flex: 1; background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px;">';
            html += '<h2>Menu Items</h2>';
            html += '<button class="button" id="psab-add-menu-item" style="margin-bottom: 15px;">+ Add Menu Item</button>';
            html += '<div id="psab-menu-items-list"></div>';
            html += '</div>';

            html += '</div>';
            html += '</div>';

            $root.html(html);

            $('#psab-back-to-menus').on('click', () => this.renderMenusList());
            $('#psab-save-menu').on('click', () => this.saveMenu());
            $('#psab-add-menu-item').on('click', () => this.showAddMenuItemModal());

            this.renderMenuItems();
        },

        renderMenuItems() {
            const $list = $('#psab-menu-items-list');
            if (!this.currentMenu.items || this.currentMenu.items.length === 0) {
                $list.html('<p style="color: #666;">No menu items yet. Click "Add Menu Item" to get started.</p>');
                return;
            }

            let html = '<div class="psab-menu-items">';
            this.currentMenu.items.forEach((item, index) => {
                html += this.renderMenuItem(item, index);
            });
            html += '</div>';

            $list.html(html);

            $('.psab-menu-item-delete').on('click', (e) => {
                const itemId = $(e.currentTarget).data('item-id');
                this.deleteMenuItem(itemId);
            });
        },

        renderMenuItem(item, index) {
            let html = '<div class="psab-menu-item" style="padding: 15px; margin-bottom: 10px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;">';
            html += '<div style="display: flex; justify-content: space-between; align-items: center;">';
            html += '<div>';
            html += `<strong>${item.item_label}</strong><br>`;
            html += `<small style="color: #666;">Icon: ${item.item_icon || 'none'} | Target: ${item.item_target}</small>`;
            html += '</div>';
            html += '<div>';
            html += `<button class="button button-small psab-menu-item-delete" data-item-id="${item.id}">Delete</button>`;
            html += '</div>';
            html += '</div>';
            html += '</div>';
            return html;
        },

        showAddMenuItemModal() {
            const modalHtml = `
                <div class="psab-modal" id="psab-menu-item-modal">
                    <div class="psab-modal__overlay"></div>
                    <div class="psab-modal__content">
                        <div class="psab-modal__header">
                            <h2>Add Menu Item</h2>
                            <button class="psab-modal__close">×</button>
                        </div>
                        <div class="psab-modal__body">
                            <div class="psab-form-field">
                                <label>Label *</label>
                                <input type="text" id="item-label" placeholder="e.g., Home" />
                            </div>
                            <div class="psab-form-field">
                                <label>Icon</label>
                                <input type="text" id="item-icon" placeholder="e.g., home, shopping-bag" />
                                <small>Icon name from your icon library</small>
                            </div>
                            <div class="psab-form-field">
                                <label>Link To *</label>
                                <select id="item-type">
                                    <option value="page">Page</option>
                                    <option value="url">Custom URL</option>
                                </select>
                            </div>
                            <div class="psab-form-field" id="item-target-page">
                                <label>Select Page</label>
                                <select id="item-target-page-select">
                                    ${this.pages.map(page => `<option value="${page.page_key}">${page.page_title}</option>`).join('')}
                                </select>
                            </div>
                            <div class="psab-form-field" id="item-target-url" style="display: none;">
                                <label>URL</label>
                                <input type="text" id="item-target-url-input" placeholder="https://example.com" />
                            </div>
                        </div>
                        <div class="psab-modal__footer">
                            <button class="psab-button psab-button--secondary psab-modal__cancel">Cancel</button>
                            <button class="psab-button psab-button--primary" id="psab-menu-item-submit">Add Item</button>
                        </div>
                    </div>
                </div>
            `;

            $('body').append(modalHtml);

            $('#psab-menu-item-modal .psab-modal__close, #psab-menu-item-modal .psab-modal__cancel, #psab-menu-item-modal .psab-modal__overlay').on('click', () => {
                $('#psab-menu-item-modal').remove();
            });

            $('#item-type').on('change', (e) => {
                if ($(e.target).val() === 'page') {
                    $('#item-target-page').show();
                    $('#item-target-url').hide();
                } else {
                    $('#item-target-page').hide();
                    $('#item-target-url').show();
                }
            });

            $('#psab-menu-item-submit').on('click', () => this.createMenuItem());
        },

        createMenuItem() {
            const label = $('#item-label').val().trim();
            const icon = $('#item-icon').val().trim();
            const type = $('#item-type').val();
            const target = type === 'page' ? $('#item-target-page-select').val() : $('#item-target-url-input').val().trim();

            if (!label || !target) {
                alert('Please fill in all required fields');
                return;
            }

            $.ajax({
                url: psabAdmin.restUrl + 'menus/' + this.currentMenu.id + '/items',
                method: 'POST',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                data: {
                    item_label: label,
                    item_icon: icon,
                    item_type: type,
                    item_target: target,
                    item_order: this.currentMenu.items?.length || 0,
                },
                success: () => {
                    $('#psab-menu-item-modal').remove();
                    this.editMenu(this.currentMenu.id);
                },
                error: (xhr) => {
                    alert(xhr.responseJSON?.message || 'Failed to create menu item');
                },
            });
        },

        deleteMenuItem(itemId) {
            if (!confirm('Are you sure you want to delete this menu item?')) {
                return;
            }

            $.ajax({
                url: psabAdmin.restUrl + 'menus/items/' + itemId,
                method: 'DELETE',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                success: () => {
                    this.editMenu(this.currentMenu.id);
                },
                error: () => {
                    alert('Failed to delete menu item');
                }
            });
        },

        saveMenu() {
            const data = {
                menu_name: $('#menu-name-edit').val(),
                menu_position: $('#menu-position-edit').val(),
                menu_config: {
                    layout: $('#menu-layout').val(),
                    showLabels: $('#menu-show-labels').is(':checked'),
                    showIcons: $('#menu-show-icons').is(':checked'),
                    backgroundColor: $('#menu-bg-color').val(),
                    activeColor: $('#menu-active-color').val(),
                    inactiveColor: $('#menu-inactive-color').val(),
                },
            };

            $.ajax({
                url: psabAdmin.restUrl + 'menus/' + this.currentMenu.id,
                method: 'PUT',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                data: data,
                success: () => {
                    alert('Menu saved successfully!');
                },
                error: () => {
                    alert('Failed to save menu');
                }
            });
        },

        deleteMenu(menuId) {
            if (!confirm('Are you sure you want to delete this menu?')) {
                return;
            }

            $.ajax({
                url: psabAdmin.restUrl + 'menus/' + menuId,
                method: 'DELETE',
                beforeSend: (xhr) => {
                    xhr.setRequestHeader('X-WP-Nonce', psabAdmin.restNonce);
                },
                success: () => {
                    this.renderMenusList();
                },
                error: () => {
                    alert('Failed to delete menu');
                }
            });
        },
    };
})(jQuery);
