// ==UserScript==
// @name         MWCA-让微博重新干净（又卫生）
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  让微博重新干净（又卫生）
// @author       qiqikuka
// @match        https://weibo.com/*
// @grant        GM_addStyle
// @run-at       document-start
// @license      CC BY-NC-SA 4.0 (禁止商业用途)
// ==/UserScript==

(function() {
    'use strict';

    
    // --- CSS 注入区 (核心：导航栏完全原生 + 优化) ---
    GM_addStyle(`
        /* ======================================= */
        /* === 核心样式：导航栏原生正常 + 所有有效优化保留 === */
        /* ======================================= */
        :root {
            --mid-width: 960px !important;
            --simple-width: 960px !important;
            --main-width: 960px !important;
            --left-width: 0px !important;
            --mini-left-width: 0px !important;
            --right-width: 0px !important;
            --weibo-top-nav-borderTop: none !important;
        }

        /* 移除指定模块 + 强化VIP图标屏蔽 + 移除图片工具栏冗余图标 */
        .index_box_MkWee,
        .hotBand,
        .wbpro-side.woo-panel-main,
        .Main_sideMain_263ZF,
        .Main_side_i7Vti,
        .Nav_main_32v4H,
        .Frame_side_3G0Bf,
        .Links_box_17T3k,
        .RepostCommentFeed_mar2_3V2Sd,
        .Search_senior_19eQR, /* V33.4 移除搜索高级选项 */
        span.woo-icon-main.woo-icon-vip,
        span[class="woo-icon-main woo-icon-vip"],
        [class*="woo-icon-vip"].woo-icon-main,
        [class*="woo-icon-main"][class*="woo-icon-vip"],
        .woo-icon-vip.woo-icon-main,
        .Nav_top_1X6G5,
        .woo-font.woo-font--imgFold.picture-tool-bar_icon_3UbxU,
        .woo-font.woo-font--imgRotate.picture-tool-bar_icon_3UbxU,
        .woo-font.woo-font--imgFull.picture-tool-bar_icon_3UbxU
        {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
            border-top: none !important;
            pointer-events: none !important;
        }

        /* 核心配置：父容器max-width=960px，无错位 */
        .picture-viewer_wrap_1GrIH {
            background: #f9f9f9 !important;
            background: var(--feed-retweet-bg) !important;
            margin-left: -80px !important;
            padding: 10px 0 10px 80px !important;
            max-width: 960px !important;
            position: relative !important;
            overflow: visible !important;
        }

        /* 核心配置：强制图片包裹层height:auto */
        .picture-viewer_imgWrap_ICKHT {
            width: 860px !important;
            position: relative !important;
            display: -webkit-box !important;
            display: -ms-flexbox !important;
            display: flex !important;
            -webkit-box-align: center !important;
            -ms-flex-align: center !important;
            align-items: center !important;
            -webkit-box-pack: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
        }

        /* 图片容器：860px固定宽度，高度自适应 */
        .picture-viewer_pic_37YQ3 {
            border-radius: 4px !important;
            -o-object-fit: contain !important;
            object-fit: contain !important;
            cursor: -webkit-zoom-out !important;
            cursor: zoom-out !important;
            width: 860px !important;
            max-width: 860px !important;
            position: relative !important;
            z-index: 1 !important;
            height: auto !important;
            display: block !important;
            margin: 0 auto !important;
        }

        /* 左侧遮罩 */
        .picture-viewer_leftMask_31Sib.picture-viewer_mask_2e9KD {
            position: absolute !important;
            z-index: 10 !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            width: 50px !important;
            height: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: linear-gradient(to right, rgba(0,0,0,0.3), transparent) !important;
            pointer-events: auto !important;
        }

        /* 右侧遮罩 */
        .picture-viewer_rightMask_3Rvy2.picture-viewer_mask_2e9KD {
            position: absolute !important;
            z-index: 10 !important;
            right: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            width: 50px !important;
            height: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: linear-gradient(to left, rgba(0,0,0,0.3), transparent) !important;
            pointer-events: auto !important;
        }

        /* 布局调整 */
        .Main_wrap_2GRrG,
        .Main_full_1dfQX,
        .Home_feed_3o7ry {
            max-width: none !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }

        .picture_inlineNum3_3P7k1 {
            width: 100% !important;
        }

        .u-col-3 [class*=box-item],
        .u-col-3 [data-type=w-box-item] {
            width: 50% !important;
        }

        /* V33.4 修改：内容卡片圆角保持 18px */
        .wbpro-feed-content {
            font-size: 18px !important;
            font-weight: 500 !important;
            line-height: 1.6 !important;
        }

        /* V33.5 新增：文字截断字号调整 */
        .wbpro-textcut {
            font-size: 13px !important;
        }

        .Feed_wrap_3v9LH,
        div[class*="Feed_wrap_"] {
            border-radius: 18px !important;
            overflow: hidden !important;
            border: 1px solid rgba(0,0,0,0.05);
        }

        /* V33.4 修改：侧边栏 SecBar_visable_16JHY 及其内部卡片圆角更新为 23px */
        .SecBar_visable_16JHY,
        .SecBar_visable_16JHY .Card_wrap_2ibWe {
            border-radius: 23px !important;
            overflow: hidden !important; /* 确保内容在圆角内部被裁剪 */
        }

        /* SVG 基础样式 */
        .Nav_logo_1BwBq svg,
        [data-custom-icon="true"] {
            display: block !important;
            object-fit: contain !important;
            preserveAspectRatio: xMidYMid meet !important;
        }

        /* 回顶部按钮（基础样式 - 日间模式） */
        .BackTop_main_3m3aB {
            width: 40px !important;
            height: 40px !important;
            border-radius: 50% !important;
            overflow: hidden !important;
            background-color: #ffffff !important; /* 日间默认白色 */
            box-shadow: 0 4px 16px 3px rgba(0, 0, 0, 0.04) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 10px !important;
            transition: box-shadow 0.3s ease, background-color 0.3s ease !important;
        }

        .BackTop_main_3m3aB:hover {
            box-shadow: 0 6px 20px 4px rgba(0, 0, 0, 0.06) !important;
        }

        .BackTop_mainin_1sH8n {
            width: 100% !important;
            height: 100% !important;
            border-radius: 50% !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        /* V33.0 修改：回顶部 SVG 图标样式 (向上移动 4px) */
        .BackTop_main_3m3aB svg,
        .BackTop_mainin_1sH8n svg {
            width: 20px !important;
            height: 20px !important;
            margin: auto !important;
            color: #666666 !important;
            opacity: 0.4 !important;
            flex-shrink: 0 !important;
            transition: opacity 0.2s ease !important;
            transform: translateY(-2px) !important;
        }

        .BackTop_main_3m3aB:hover svg {
            opacity: 0.8 !important;
        }

        /* ======================================= */
        /* === 修复：图标颜色与夜间模式支持 === */
        /* ======================================= */

        .IconBox_btn_10GoC.IconBox_wrap_W3Oz_ {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 6px !important;
        }

        .IconBox_btn_10GoC.IconBox_wrap_W3Oz_ [data-custom-icon="true"] {
            fill: currentColor !important;
            color: inherit !important;
            transition: transform 0.2s ease !important;
            width: 16px !important;
            height: 16px !important;
        }

        .IconBox_btn_10GoC.IconBox_wrap_W3Oz_:hover [data-custom-icon="true"] {
            transform: scale(1.05) !important;
        }

        .IconBox_wrap_W3Oz_.IconBox_pub_1zIJ8 .IconBox_icon_1dS2Y,
        .IconBox_wrap_W3Oz_.IconBox_pub_1zIJ8 svg {
            color: #ffffff !important;
            color: var(--w-contrast, #ffffff) !important;
            fill: currentColor !important;
        }

        @media (prefers-color-scheme: dark) {
             .IconBox_wrap_W3Oz_ .IconBox_icon_1dS2Y {
                 color: #ffffff !important;
             }
        }

        /* ======================================= */
        /* === 回顶部按钮夜间模式背景修正 === */
        /* ======================================= */

        /* 1. 系统级夜间模式 */
        @media (prefers-color-scheme: dark) {
            .BackTop_main_3m3aB {
                background-color: rgba(255, 255, 255, 0.15) !important;
            }
        }

        /* 2. 微博网页内部切换夜间模式 */
        html[theme="dark"] .BackTop_main_3m3aB,
        html[data-theme="dark"] .BackTop_main_3m3aB,
        body[class*="dark"] .BackTop_main_3m3aB {
            background-color: rgba(255, 255, 255, 0.15) !important;
        }
    `);

    // --- DOM 操作 ---

    // SVG 定义
    const customLogoSvg = `
        <svg viewBox="0 0 100 100" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">
            <g>
                <path fill="#E6162D" d="M73.615,48.447c-1.314-0.399-2.216-0.657-1.533-2.383c5.033-13.409-7.597-15.071-20.803-9.416 c0,0-2.989,1.301-2.216-1.056c1.456-4.702,1.237-8.63-1.03-10.91c-5.152-5.165-18.871,0.193-30.632,11.954 C8.603,45.433,3.489,54.771,3.489,62.848c0,15.432,19.799,24.822,39.159,24.822c25.389,0,42.277-14.749,42.277-26.458 C84.938,54.127,78.974,50.108,73.615,48.447z"></path>
                <path fill="#F1F1F1" d="M42.713,82.131C27.255,83.664,13.91,76.67,12.906,66.532c-1.058-24.473,52.225-29.73,55.956-5.539 C69.88,71.144,58.158,80.611,42.713,82.131z"></path>
                <path fill="#FF9933" d="M90.144,20.486c-6.132-6.801-15.174-9.39-23.521-7.613c-1.932,0.412-3.156,2.319-2.744,4.238 c0.412,1.932,2.306,3.156,4.238,2.744c13.098-2.893,24.605,9.876,20.391,22.594c-1.338,4.509,5.24,6.64,6.801,2.203 C97.931,36.543,96.283,27.28,90.144,20.486z"></path>
                <path fill="#FF9933" d="M79.412,42.69c1.623,0.515,3.349-0.361,3.877-1.984c2.94-8.629-5.084-17.528-13.964-15.47 c-1.662,0.348-2.718,1.997-2.37,3.658c0.361,1.662,1.997,2.718,3.645,2.357c1.984-0.425,4.148,0.193,5.603,1.803 c1.456,1.623,1.855,3.826,1.224,5.758C76.913,40.423,77.789,42.162,79.412,42.69z"></path>
                <path d="M44.246,53.2c-7.355-1.919-15.664,1.752-18.858,8.231c-3.259,6.608-0.103,13.95,7.317,16.346 c7.703,2.486,16.772-1.327,19.927-8.45C55.749,62.346,51.859,55.171,44.246,53.2z M38.63,70.075 c-3.249,5.211-12.149,2.467-8.695-3.852C33.164,61.1,41.972,63.757,38.63,70.075z M43.563,63.763 c-1.113,2.019-4.608,1.073-3.349-1.34C41.332,60.439,44.749,61.343,43.563,63.763z"></path>
            </g>
        </svg>
    `.trim();

    const customBackToTopSvg = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" preserveAspectRatio="xMidYMid meet">
            <path d="M5 15L10 9.84985C10.2563 9.57616 10.566 9.35814 10.9101 9.20898C11.2541 9.05983 11.625 8.98291 12 8.98291C12.375 8.98291 12.7459 9.05983 13.0899 9.20898C13.434 9.35814 13.7437 9.57616 14 9.84985L19 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
    `.trim();

    const customConfigSvg = `
        <svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-custom-icon="true" preserveAspectRatio="xMidYMid meet">
            <path d="M502.325,307.303l-39.006-30.805c-6.215-4.908-9.665-12.429-9.668-20.348c0-0.084,0-0.168,0-0.252 c-0.014-7.936,3.44-15.478,9.667-20.396l39.007-30.806c8.933-7.055,12.093-19.185,7.737-29.701l-17.134-41.366 c-4.356-10.516-15.167-16.86-26.472-15.532l-49.366,5.8c-7.881,0.926-15.656-1.966-21.258-7.586 c-0.059-0.06-0.118-0.119-0.177-0.178c-5.597-5.602-8.476-13.36-7.552-21.225l5.799-49.363 c1.328-11.305-5.015-22.116-15.531-26.472L337.004,1.939c-10.516-4.356-22.646-1.196-29.701,7.736l-30.805,39.005 c-4.908,6.215-12.43,9.665-20.349,9.668c-0.084,0-0.168,0-0.252,0c-7.935,0.014-15.477-3.44-20.395-9.667L204.697,9.675 c-7.055-8.933-19.185-12.092-29.702-7.736L133.63,19.072c-10.516,4.356-16.86,15.167-15.532,26.473l5.799,49.366 c0.926,7.881-1.964,15.656-7.585,21.257c-0.059,0.059-0.118,0.118-0.178,0.178c-5.602,5.598-13.36,8.477-21.226,7.552 l-49.363-5.799c-11.305-1.328-22.116,5.015-26.472,15.531L1.939,174.996c-4.356,10.516-1.196,22.646,7.736,29.701l39.006,30.805 c6.215,4.908,9.665,12.429,9.668,20.348c0,0.084,0,0.167,0,0.251c0.014,7.935-3.44,15.477-9.667,20.395L9.675,307.303 c-8.933,7.055-12.092,19.185-7.736,29.701l17.134,41.365c4.356,10.516,15.168,16.86,26.472,15.532l49.366-5.799 c7.882-0.926,15.656,1.965,21.258,7.586c0.059,0.059,0.118,0.119,0.178,0.178c5.597,5.603,8.476,13.36,7.552,21.226l-5.799,49.364 c-1.328,11.305,5.015,22.116,15.532,26.472l41.366,17.134c10.516,4.356,22.646,1.196,29.701-7.736l30.804-39.005 c4.908-6.215,12.43-9.665,20.348-9.669c0.084,0,0.168,0,0.251,0c7.936-0.014,15.478,3.44,20.396,9.667l30.806,39.007 c7.055,8.933,19.185,12.093,29.701,7.736l41.366-17.134c10.516-4.356,16.86-15.168,15.532-26.472l-5.8-49.366 c-0.926-7.881,1.965-15.656,7.586-21.257c0.059-0.059,0.119-0.119,0.178-0.178c5.602-5.597,13.36-8.476,21.225-7.552l49.364,5.799 c11.305,1.328,22.117-5.015,26.472-15.531l17.134-41.365C514.418,326.488,511.258,314.358,502.325,307.303z M281.292,329.698 c-39.68,16.436-85.172-2.407-101.607-42.087c-16.436-39.68,2.407-85.171,42.087-101.608c39.68-16.436,85.172,2.407,101.608,42.088 C339.815,267.771,320.972,313.262,281.292,329.698z"/>
        </svg>
    `.trim();

    /**
     * 辅助函数：创建 SVG 元素
     */
    function createSvgElement(svgString) {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgString;
            return tempDiv.firstChild || null;
        } catch (e) {
            console.error("创建SVG容错：", e);
            return null;
        }
    }

    /**
     * 核心功能函数
     */
    function replaceLogo() {
        try {
            const logoWrapper = document.querySelector('.Nav_logo_1BwBq');
            if (logoWrapper && !logoWrapper.dataset.customLogo && logoWrapper.children.length > 0) {
                const newSvg = createSvgElement(customLogoSvg);
                if (newSvg) {
                    newSvg.style.height = '36px';
                    newSvg.style.width = 'auto';
                    logoWrapper.replaceChild(newSvg, logoWrapper.children[0]);
                    logoWrapper.dataset.customLogo = 'true';
                }
            }
        } catch (e) {
            console.error("替换Logo容错：", e);
        }
    }

    function replaceBackToTopIcon() {
        try {
            const backTopButton = document.querySelector('.BackTop_main_3m3aB');
            const parentContainer = document.querySelector('.BackTop_mainin_1sH8n') || backTopButton;
            if (parentContainer && !parentContainer.dataset.backTopReplaced) {
                const originalIcon = parentContainer.querySelector('.woo-font--backTop') || parentContainer.querySelector('svg');
                if (originalIcon) {
                    const newSvg = createSvgElement(customBackToTopSvg);
                    if (newSvg) {
                        newSvg.style.width = '20px !important';
                        newSvg.style.height = '20px !important';
                        newSvg.style.color = '#666666 !important';
                        newSvg.style.opacity = '0.4 !important';
                        newSvg.style.flexShrink = '0';
                        originalIcon.parentNode.replaceChild(newSvg, originalIcon);
                        parentContainer.dataset.backTopReplaced = 'true';
                    }
                }
            }
        } catch (e) {
            console.error("替换回顶部图标容错：", e);
        }
    }

    function replaceConfigIcon() {
        try {
            const configButtons = document.querySelectorAll('button.IconBox_btn_10GoC.IconBox_wrap_W3Oz_[title="设置"]');
            configButtons.forEach(button => {
                if (button.dataset.configReplaced) return;
                const originalIcon = button.querySelector('svg') || button.querySelector('use');
                if (originalIcon) {
                    const newSvg = createSvgElement(customConfigSvg);
                    if (newSvg) {
                        newSvg.style.width = '16px !important';
                        newSvg.style.height = '16px !important';
                        newSvg.style.color = 'inherit';
                        newSvg.style.margin = 'auto';
                        button.innerHTML = '';
                        button.appendChild(newSvg);
                        button.dataset.configReplaced = 'true';
                    }
                }
            });
        } catch (e) {
            console.error("替换配置图标容错：", e);
        }
    }

    function removeTopNavBorder() {
        try {
            document.documentElement.style.setProperty('--weibo-top-nav-borderTop', 'none !important');
            const topNavElements = document.querySelectorAll('.Nav_top_1X6G5, .Nav_wrap_2w2Ly, header');
            topNavElements.forEach(el => {
                el.style.borderTop = 'none !important';
            });
        } catch (e) {
            console.error("移除顶部边框容错：", e);
        }
    }

    function removeVipIcons() {
        try {
            const vipSelectors = [
                'span.woo-icon-main.woo-icon-vip',
                'span[class="woo-icon-main woo-icon-vip"]',
                '[class*="woo-icon-vip"].woo-icon-main',
                '[class*="woo-icon-main"][class*="woo-icon-vip"]',
                '.woo-icon-vip.woo-icon-main',
                'i.woo-icon-main.woo-icon-vip',
                'div.woo-icon-main.woo-icon-vip'
            ];

            const allVipIcons = [...new Set(vipSelectors.flatMap(selector =>
                Array.from(document.querySelectorAll(selector))
            ))];

            allVipIcons.forEach(icon => {
                if (icon.parentNode) {
                    const parent = icon.parentNode;
                    if (parent.classList.length === 1 && parent.classList.contains('woo-icon-wrap')) {
                        parent.remove();
                    } else {
                        icon.remove();
                    }
                } else {
                    icon.remove();
                }
            });
        } catch (e) {
            console.error("移除VIP图标容错：", e);
        }
    }

    // --- MutationObserver ---
    const observer = new MutationObserver((mutationsList, observer) => {
        try {
            replaceLogo();
            replaceBackToTopIcon();
            replaceConfigIcon();
            removeTopNavBorder();
            removeVipIcons();
        } catch (e) {
            console.error("Observer容错：", e);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'title']
    });

    // --- 首次执行 + 延迟重试 ---
    setTimeout(() => {
        replaceLogo();
        replaceBackToTopIcon();
        replaceConfigIcon();
        removeTopNavBorder();
        removeVipIcons();
    }, 100);

    setTimeout(() => {
        removeVipIcons();
    }, 300);

    setTimeout(() => {
        removeVipIcons();
    }, 800);

    setTimeout(() => {
        removeVipIcons();
    }, 2000);

})();