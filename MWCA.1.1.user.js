// ==UserScript==
// @name         MWCA-让微博重新干净（又卫生）
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  让微博重新干净（又卫生）
// @author       qiqikuka
// @match        *://weibo.com/*
// @match        *://www.weibo.com/*
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
        /* 适配 2025/12月最新版内容卡片圆角 */
article[class*="_wrap_m3n8j_"],
.wbpro-scroller-item article {
    border-radius: 18px !important; /* 强制覆盖行内样式的 4px */
    overflow: hidden !important;
    border: 1px solid rgba(0,0,0,0.05) !important;
    margin-bottom: 12px !important;
}
/* 专门针对分组页面的主容器和侧边栏适配 */
div[class*="Main_full_"] {
    width: 960px !important;
    margin: 0 auto !important;
}

div[class*="_pic_a2k8z_"] {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 1 / 1 !important; /* 强制正方形预览 */
    object-fit: cover !important;
}
/* 确保高清图加载后正常显示 */
img[class*="woo-picture-img"],
img[class*="_focusImg_"] {
    position: relative !important; /* 必须是 relative 才能自适应高度 */
    width: 100% !important;
    height: auto !important;
    object-fit: contain !important;
}
/* 1. 强制多图宫格容器宽度为 100%，消除侧边缩进 */
div[class*="_row_"].picture {
    width: 100% !important;
    display: block !important;
}

/* 2. 让 3 列宫格容器撑满父级宽度，并重置负边距以对齐文本 */
.u-col-3[class*="_inlineNum3_"] {
    width: 100% !important;
    max-width: none !important;
    margin-left: 0 !important; /* 根据需要调整，确保与文字左对齐 */
    display: flex !important;
    flex-wrap: wrap !important;
}

/* 3. 动态计算宫格内每张图片的宽度 (3列布局则为 33.3%) */
.u-col-3[class*="_inlineNum3_"] > div[class*="_item_"] {
    width: 33.33% !important; /* 强制三等分 */
    flex-grow: 1 !important;
    box-sizing: border-box !important;
    padding-right: 4px !important; /* 图片间距，可根据喜好调整 */
    padding-bottom: 4px !important;
}

/* 4. 确保图片预览容器本身是自适应的，不再是固定宽高 */
div[class*="_pic_a2k8z_"].woo-picture-main {
    width: 100% !important;
    height: 0 !important;
    padding-bottom: 100% !important; /* 保持正方形比例 */
    position: relative !important;
}

/* 5. 配合之前的高清化逻辑，让图片填充整个自适应容器 */
img[class*="_focusImg_"] {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
}
/* 隐藏分组页特有的右侧模块 */
.rightSide,
aside[aria-label="栏目"] {
    display: none !important;
}
/* 彻底移除包含无障碍按钮及分隔线的整个容器块 */
div._box_o416e_2,
div[class*="_box_o416e_"] {
    display: none !important;
    visibility: hidden !important;
    width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
}
/* 隐藏搜索框的预置文字 */
.woo-input-main::placeholder {
    color: transparent !important;
}
/* 1. 强制预览模式下的图片容器宽度与卡片一致 */
div[class*="_imgWrap_1jk00_"] {
    width: 100% !important;
    height: auto !important; /* 覆盖行内的固定像素高度 */
    display: block !important;
    text-align: center;
}

/* 2. 调整预览大图本身的样式 */
img[class*="_pic_1jk00_"] {
    width: 100% !important;
    height: auto !important;
    max-width: none !important;
    display: block;
    margin: 0 auto;
}

/* 3. 隐藏背景层可能存在的模糊占位图（如果有） */
div[class*="_imgWrap_1jk00_"] > div[style*="blur"] {
    display: none !important;
}

/* 4. 确保工具栏（收起、旋转、大图）也对齐宽度 */
div[class*="_toolbarSpin_wl1l9_"] {
    width: 100% !important;
    box-sizing: border-box;
    padding: 0 16px;
}
/* 兼容不同浏览器的写法 */
.woo-input-main::-webkit-input-placeholder {
    color: transparent !important;
}
/* 适配分组页面的主内容容器 */
main[role="main"],
div[class*="Main_full_"],
div[class*="Main_wrap_"] {
    width: 960px !important;
    margin: 0 auto !important;
    flex: none !important;
}
/* 1. 强制单张图片的容器宽度为 100%（与文字对齐） */
div[class*="_singleImg_"],
div[class*="_pic_a2k8z_"] {
    width: 100% !important;
    height: auto !important;
    max-width: none !important;
}

/* 2. 移除为了固定比例而设置的占位高度 */
div[class*="_pic_a2k8z_"] > div[style*="padding-bottom"] {
    display: none !important;
}

/* 3. 让图片本身自适应宽度，并保持原始比例 */
img[class*="_focusImg_"],
img.woo-picture-img {
    width: 100% !important;
    height: auto !important;
    position: static !important; /* 覆盖原本的 absolute 定位 */
    object-fit: contain !important;
}

/* 4. 修复图片包裹层的布局 */
div.picture[class*="_row_"] {
    width: 100% !important;
    display: block !important;
}
/* 隐藏分组页右侧多出的热搜和推荐模块 */
div[class*="rightSide"],
aside[aria-label="栏目"],
div[class*="Index_box_"] {
    display: none !important;
}
/* 适配卡片内的底部操作栏圆角（防止底部直角） */
article[class*="_wrap_m3n8j_"] footer {
    border-radius: 0 0 18px 18px !important;
}
/* 适配“微博已看完”提示图 */
div[class*="_emptyPic_"],
._emptyPic_gykin_16 {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
}
/* 适配并隐藏左侧多出来的长条背景 */
div[class*="_inner_mmtyp_"],
._inner_mmtyp_7 {
    display: none !important;
    visibility: hidden !important;
    width: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
}
/* 适配导航栏失效的按钮（如“游戏”按钮） */
a[title="游戏"],
a[href*="game.weibo.com"],
a[class*="_btn_pn2mr_"],
div[class*="_btn_pn2mr_"] {
    display: none !important;
    visibility: hidden !important;
    width: 0 !important;
}
/* 适配新版右侧边栏容器 */
aside,
div[class*="rightSide"],
div[class*="_sideBox_"],
.rightSide._sideBox_14sov_2 {
    display: none !important;
    visibility: hidden !important;
    width: 0 !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
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

        /* 核心配置：点开后的图片灰色背景层对齐卡片边缘 */
        div[class*="_wrap_1jk00_"] {
            background: #f9f9f9 !important;
            background: var(--feed-retweet-bg) !important;
            margin-left: -80px !important;
            padding: 10px 0 10px 80px !important;
            max-width: 960px !important; /* 已从 100% 改为 960px */
            position: relative !important;
            overflow: visible !important;
        }
        /* 适配新版发布框/卡片容器 */
div[class*="_publishCard_"],
div[class*="_wrap_6c8b7_"],
._publishCard_gykin_19 {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
}

        /* 核心配置：强制图片包裹层height:auto */
        .picture-viewer_imgWrap_ICKHT,
        div[class*="_imgWrap_1jk00_"] {
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
        /* 隐藏图片预览模式下的工具栏（收起、旋转、查看大图） */
div[class*="_toolbarSpin_wl1l9_"] {
    display: none !important;
}
/* 彻底隐藏所有等级的会员图标 */
span[aria-label^="vip"],
img.woo-icon-vipimg,
span[title*="会员"] {
    display: none !important;
}
        /* 图片容器：860px固定宽度，高度自适应 */
        .picture-viewer_pic_37YQ3,
        img[class*="_pic_1jk00_"] {
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
        .picture-viewer_leftMask_31Sib.picture-viewer_mask_2e9KD,
        div[class*="_leftMask_1jk00_"] {
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
        .picture-viewer_rightMask_3Rvy2.picture-viewer_mask_2e9KD,
        div[class*="_rightMask_1jk00_"] {
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
/* 自定义返回顶部按钮样式 */
#custom-back-to-top {
    position: fixed !important;
    bottom: 50px !important;
    right: 50px !important;
    width: 44px !important;
    height: 44px !important;
    border-radius: 50% !important;
    background-color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    display: none; /* 初始隐藏 */
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    z-index: 999999 !important;
    transition: transform 0.2s, opacity 0.3s !important;
}

#custom-back-to-top:hover {
    transform: scale(1.1) !important;
}

/* 按钮内的箭头图标 */
#custom-back-to-top svg {
    width: 24px !important;
    height: 24px !important;
    color: #666 !important;
}

/* 适配微博夜间模式 */
html[theme="dark"] #custom-back-to-top,
body.dark #custom-back-to-top {
    background-color: #2c2c2c !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
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
        // 使用新版类名和 aria-label 双重定位
        const logoWrapper = document.querySelector('._logoWrap_18dhr_77') || document.querySelector('a[aria-label="Weibo"]');

        if (logoWrapper && !logoWrapper.dataset.customLogo) {
            // 查找容器内的 SVG 节点
            const originalSvg = logoWrapper.querySelector('svg');
            if (originalSvg) {
                const newSvg = createSvgElement(customLogoSvg);
                if (newSvg) {
                    // 保持与原 Logo 比例一致
                    newSvg.setAttribute('style', 'height: 30px; width: 90px;');
                    originalSvg.replaceWith(newSvg);
                    logoWrapper.dataset.customLogo = 'true';
                }
            }
        }
    } catch (e) {
        console.error("替换Logo失败：", e);
    }
}
    function injectBackTop() {
    // 防止重复注入
    if (document.getElementById('custom-back-to-top')) return;

    // 创建按钮元素
    const btn = document.createElement('div');
    btn.id = 'custom-back-to-top';
    btn.title = '返回顶部';

    // 注入箭头图标 (SVG)
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 15l-6-6-6 6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;

    // 点击事件：平滑滚动到顶部
    btn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.body.appendChild(btn);

    // 监听滚动事件控制显示隐藏
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    }, { passive: true });
}

// 在页面加载及 DOM 变化时尝试执行
injectBackTop();
function upgradeImageQuality() {
    try {
        // 1. 扩大搜索范围：包含预览模式大图 _pic_1jk00_ 和预览列表小图 _focusImg_1jk00_
        const images = document.querySelectorAll('img[class*="woo-picture-img"], img[class*="_focusImg_"], img[class*="_pic_1jk00_"]');

        images.forEach(img => {
            // 获取地址，优先尝试 data-src 以应对懒加载
            let src = img.getAttribute('data-src') || img.src;

            // 2. 核心替换逻辑：匹配并替换规格 orj360 和 mw690 为 mw2000
            if (src && (src.includes('/orj360/') || src.includes('/mw690/'))) {
                const highResUrl = src.replace(/\/(orj360|mw690)\//, '/mw2000/');

                // 强制同步所有可能的图片源属性
                if (img.src !== highResUrl) img.src = highResUrl;
                img.setAttribute('data-src', highResUrl);
                img.setAttribute('loading', 'eager');

                // 3. 处理预览模式特有的容器限制
                // 找到包含大图的容器 _imgWrap_1jk00_
                const viewerWrap = img.closest('div[class*="_imgWrap_1jk00_"]');
                if (viewerWrap) {
                    // 强制清除行内 style 的高度限制，允许它自适应宽度
                    viewerWrap.style.setProperty('height', 'auto', 'important');
                    viewerWrap.style.setProperty('width', '100%', 'important');
                    viewerWrap.style.setProperty('display', 'block', 'important');
                }

                // 针对图片本身，清除可能存在的样式干扰
                if (img.classList.contains('_pic_1jk00_34')) {
                    img.style.setProperty('width', '100%', 'important');
                    img.style.setProperty('height', 'auto', 'important');
                }
            }
        });
    } catch (e) {
        console.error("高清化逻辑执行异常：", e);
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
        // 1. 使用 title 属性精准定位“设置”按钮
        const configButtons = document.querySelectorAll('button[title="设置"]');

        configButtons.forEach(button => {
            // 2. 检查是否已经替换过，避免重复执行
            if (button.dataset.configReplaced) return;

            // 3. 查找按钮内部原生的 svg 或 i 标签
            const originalIcon = button.querySelector('svg');

            if (originalIcon) {
                const newSvg = createSvgElement(customConfigSvg);
                if (newSvg) {
                    // 4. 保持图标样式与原生一致
                    newSvg.setAttribute('style', 'width: 16px !important; height: 16px !important; color: inherit; margin: auto;');
                    // 5. 替换图标
                    originalIcon.replaceWith(newSvg);
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

    // --- 核心逻辑执行函数 (封装所有修复动作) ---
    function runAllFixes() {
        try {
            replaceLogo();
            if (typeof upgradeImageQuality === "function") upgradeImageQuality();
            if (typeof replaceBackToTopIcon === "function") replaceBackToTopIcon();
            if (typeof replaceConfigIcon === "function") replaceConfigIcon();
            if (typeof removeTopNavBorder === "function") removeTopNavBorder();
            if (typeof removeVipIcons === "function") removeVipIcons();
            // 如果有 applyFixes() 也可以加上
            if (typeof applyFixes === "function") applyFixes();
        } catch (e) {
            console.error("修复逻辑执行容错：", e);
        }
    }

    // --- 1. MutationObserver: 监听滚动和页面内容变化 ---
    const observer = new MutationObserver((mutationsList) => {
        // 微博内容是动态加载的，滚动时会不断触发
        runAllFixes();
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
            // 去掉了 attributes 监听，以提升性能并减少冲突
        });
    }

    // --- 2. URL 变化监听: 解决单页应用切换（如进入分组页）不生效问题 ---
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            console.log("检测到路由变化，重新加载配置...");
            // 给页面渲染留出一点缓冲时间
            setTimeout(runAllFixes, 500);
        }
    });
    urlObserver.observe(document, { subtree: true, childList: true });

    // --- 3. 首次执行策略 ---
    // 页面加载后立即执行，并分别在不同阶段重试，确保元素加载完成
    runAllFixes();
    setTimeout(runAllFixes, 500);
    setTimeout(runAllFixes, 2000);

})(); // 脚本结束
