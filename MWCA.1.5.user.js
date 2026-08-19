// ==UserScript==
// @name         MWCA-让微博重新干净（又卫生）
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  让微博重新干净（又卫生）
// @author       qiqikuka
// @match        *://weibo.com/*
// @match        *://www.weibo.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// @license      CC BY‑NC‑SA 4.0
// ==/UserScript==

(function() {
    'use strict';

    // ======= 0. 设置项管理 =======
    let showSidebar = GM_getValue("mwca_show_sidebar", false);
    let showPublishCard = GM_getValue("mwca_show_publish_card", true);
    let useHammerLogo = GM_getValue("mwca_use_hammer_logo", true);

    GM_registerMenuCommand(showSidebar ? "隐藏左侧栏" : "显示左侧栏", () => {
        GM_setValue("mwca_show_sidebar", !showSidebar);
        location.reload();
    });

    GM_registerMenuCommand(showPublishCard ? "隐藏发微博模块" : "显示发微博模块", () => {
        GM_setValue("mwca_show_publish_card", !showPublishCard);
        location.reload();
    });

    GM_registerMenuCommand(useHammerLogo ? "恢复默认微博 Logo" : "启用锤子系统微博 Logo", () => {
        GM_setValue("mwca_use_hammer_logo", !useHammerLogo);
        location.reload();
    });


    // ======= 2. 核心 CSS 布局 =======
    GM_addStyle(`
/* 顶部导航栏顶部边框清零: --weibo-top-nav-borderTop 设 0px */
:root {
    --weibo-top-nav-borderTop: 0px !important;
}
/* 替换评论图标：仅隐藏原有字体图标，保留容器 */
.woo-font.woo-font--comment._commentIcon_198pe_122::before {
    content: none !important; /* 清除原有字体图标 */
}
/* 强制图标容器样式，保证SVG显示 */
.woo-font.woo-font--comment._commentIcon_198pe_122 {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 1em !important;
    height: 1em !important;
    color: inherit !important; /* 继承父元素颜色 */
}
/* 强制SVG继承颜色，且不超出容器 */
.woo-font.woo-font--comment._commentIcon_198pe_122 svg {
    width: 100% !important;
    height: 100% !important;
    fill: currentColor !important; /* 关键：继承容器颜色 */
    stroke: none !important;
}
        /* [1] 物理中心锁定
           注: 诊断显示 DOM 链是 BODY → DIV → _wrap_1ubn9_8 → _content_1ubn9_18 → ...
           没有 Frame_main / Main_wrap 元素, 这条规则在新版微博首页不匹配, 留作旧版兼容 */
        main.Main_wrap_2GRrG, [class*="Main_wrap"], [class*="Frame_main"] {
            display: flex !important;
            justify-content: center !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
        }

        /* [2] 锁定主内容流宽度 960px */
        .Main_full_1dfQX, [class*="Main_full"], #homeWrap, .vue-recycle-scroller {
            width: 960px !important;
            max-width: 960px !important;
            margin: 0 auto !important;
            flex: none !important;
        }

        /* [3] 内容卡片样式 (20px圆角)
              新增 [class*="_card_"] 兼容新哈希 _card_1ishf_
              (小写 c, 不匹配 _publishCard_ 大写 C, 不会误伤发微博模块)
              _empty_13iyx_ 不再套用卡片样式: 它是内容卡(_wrap_6c8b7_2)内部的
              "暂无数据"填充层, 套 border/圆角/边距会在卡片里又出现一张带边框的
              小卡, 看起来像两层叠在一起 */
        article, [class*="Feed_wrap"], [class*="Card_wrap"],
        [class*="_card_"],
        [class*="_feed_gykin_"] .woo-panel-main {
            width: 960px !important;
            border-radius: 20px !important;
            border: 1px solid rgba(0,0,0,0.06) !important;
            margin-bottom: 16px !important;
            box-sizing: border-box !important;
        }
        /* [3.1] 发微博模块: 圆角 + 显隐开关
              选择器去哈希, 用 [class*="_publishCard_"] 兼容 _publishCard_1ishf_ 及未来重建 */
        [class*="_publishCard_"] {
            border-radius: 20px !important;
            display: ${showPublishCard ? "block" : "none"} !important;
        }

        /* [3.2] Tab 卡片 (含 _container_14sig_ 的 _card_): 胶囊型背景
           - 卡片高 45 (微博原生), 圆角 42.5 (超 height/2=22.5 自动收敛, 形成完美胶囊端)
           - 选择器前加 [class*="_visable_r36s9_"] 祖先, 特异性提到 (0,4,0)
             压过脚本下方 [class*="_visable_r36s9_"] [class*="woo-panel-main"]
             设的 border-bottom-*-radius:20 (否则底部圆角被钉死成 20, 出现"上大下小")
           - 清 woo-panel padding, 让 senior 绝对定位以 border box 为参考 */
        [class*="_visable_r36s9_"] [class*="_card_"]:has([class*="_container_14sig_"]) {
            padding: 0 !important;
            border: none !important;
            border-radius: 42.5px !important;
            background-color: var(--w-card-bg, #fff) !important;
            overflow: hidden !important;
            position: relative !important;
        }

        /* [3.2a] Tab 栏通用胶囊(不限 _container_14sig_ 变体):
           _visable_r36s9_ 下直接子级标签栏(_card_1v3kz_ 或 _wrap_6c8b7_+_bottomGap_)
           统一 42.5px 胶囊端。
           必须用 3 个类(0,3,0)压过下方 [class*="_visable_r36s9_"] [class*="woo-panel-main"]
           的 border-bottom-*-radius:20 (同为 !important 但排在后面), 否则底部圆角被钉成 20,
           出现"上大下小" */
        [class*="_visable_r36s9_"] > [class*="_card_1v3kz_"][class*="_bottomGap_6c8b7_"],
        [class*="_visable_r36s9_"] > [class*="_wrap_6c8b7_"][class*="_bottomGap_6c8b7_"] {
            border-radius: 42.5px !important;
        }

        /* [3.2b] 高级搜索模块(_card_1ishf_ + _container_14sig_): 点击"高级搜索"后
           展开成完整表单卡, 圆角应为 20px, 覆盖上面 [3.2]/[3.2a] 给的 42.5px 胶囊。
           (0,4,0) 特异性压过 [3.2a] 的 (0,3,0) */
        [class*="_visable_r36s9_"] > [class*="_card_1ishf_"][class*="_wrap_6c8b7_"][class*="_bottomGap_6c8b7_"] {
            border-radius: 20px !important;
        }

        /* [3.3] senior abs, 用 max-content + min-width:0 + max-width:none 三件套
           强力收缩 senior 到按钮自然宽度
           - 之前 width:auto 失败, 推测微博设了 width 或 min-width: 125 !important
           - max-content 显式按内容计算宽度, 配合 min-width:0/max-width:none 清掉所有约束
           - senior shrink 后 = 按钮宽度, 二者右边缘重合, 不再有内部空白
           - 按钮恢复 in-flow (不再 abs), 由 senior 的 right:7.5 间接定位到 7.5 处 */
        [class*="_visable_r36s9_"] [class*="_card_"]:has([class*="_container_14sig_"]) [class*="_senior_14sig_"] {
            position: absolute !important;
            top: 7.5px !important;
            bottom: 7.5px !important;
            right: 7.5px !important;
            width: max-content !important;
            min-width: 0 !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
        }

        /* [3.4] 按钮恢复 in-flow, 跟随 senior shrink-to-fit
           (移除之前的 button abs 定位, 避免与 senior abs 双重偏移) */
        [class*="_visable_r36s9_"] [class*="_card_"]:has([class*="_container_14sig_"]) [class*="_senior_14sig_"] > button,
        [class*="_visable_r36s9_"] [class*="_card_"]:has([class*="_container_14sig_"]) [class*="_senior_14sig_"] .woo-button-main {
            position: static !important;
            width: auto !important;
            margin: 0 !important;
            box-sizing: border-box !important;
        }

        /* [3.5] 隐藏按钮内的搜索图标 woo-font--search ( woo-button-icon )
           display:none 让图标占 0 宽度, woo-button-wrap 的 flex 布局自动让后面的
           woo-button-content (含"高级搜索"+下拉箭头) 左移到图标原位置 */
        [class*="_visable_r36s9_"] [class*="_card_"]:has([class*="_container_14sig_"]) [class*="_senior_14sig_"] .woo-font--search.woo-button-icon {
            display: none !important;
        }

        /* [3.6] Tab 文字: 字号 15→13, 字重 medium(500)
           覆盖微博原生 CSS 的 font-size:15px, 加 medium 字重让小字更清晰。
           兼容新旧两套标签类: 旧 .wbpro-textcut, 新 .text._nowrap_(含 _nowrap_ 子串),
           以及个人主页 woo-tab-nav 的 _btn_1v3kz_ 标签按钮文字 */
        .wbpro-tab2 .wbpro-textcut,
        .wbpro-tab2 [class*="_nowrap_"],
        .woo-tab-nav [class*="_btn_1v3kz_"] {
            font-size: 13px !important;
            font-weight: 500 !important;
        }

        /* --- 个人主页 (Profile) 深度定制 --- */

        /* 1. 强制隐藏个人主页左侧边栏 */
        [class*="Profile_wrap"] [class*="_side_1ubn9_"] {
            display: none !important;
        }

        /* 2. 内容流 _full_1l406_7 (含发布框+卡片流) 锁死 960 宽, 不伸缩
              居中由父级 MAIN (_wrap_1l406_) 的 justify-content:center 负责
              加 html body + :not(.mwca-dummy) 把特异性提到 (0,2,2), 压过微博 !important */
        html body [class*="_full_1l406_"]:not(.mwca-dummy) {
            width: 960px !important;
            max-width: 960px !important;
            min-width: 960px !important;
            flex: 0 0 960px !important;
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            box-sizing: border-box !important;
            border-radius: 20px 20px 0 0 !important;
            overflow: hidden !important;
        }

        /* 2.1 中间层: [2] _content_1ubn9_ 全视口宽 + flex 居中其子项;
                       [1] DIV (无 class) 锁宽 1250 (匹配 MAIN 自然宽 = content 960 + 右栏 282 + 16 gap)
           - [1] 固定宽度让 [2] 有 leftover 空间, justify-content:center 把 [侧栏+[1]] 整组居中
           - 整组随 viewport 变化左右移动, 但 [侧栏→内容流] 间距恒为 16px (sidebar margin-right)
           - 用 3 个 :not(.mwca-dN) 把特异性提到 (0,4,2), 稳压微博可能的 (0,3,0) !important
             (否则 sidebar 显示时 justify-content:center 失效, 整组贴左 flex-start) */
        html body [class*="_content_1ubn9_"]:not(.mwca-d1):not(.mwca-d2):not(.mwca-d3) {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            box-sizing: border-box !important;
        }
        /* [1] DIV (无 class, 但不能匹配 sidebar _side_1ubn9_)
           用 :not([class*="_side_"]) 排除掉 sidebar, 否则 sidebar 会被这条规则
           强制设成同样宽度 (sidebar 类名含 _side_, 不含 _content_, 但它是 [2] 的直接 div 子元素)
           同步用 3 个 :not(.mwca-dN) 提特异性

           宽度 960 (匹配 content, 因右栏 _side_1l406_ 已隐藏):
           [1] = content, [sidebar + content] 整组居中 = LCA 的 [sidebar + [1]] 居中 */
        html body [class*="_content_1ubn9_"]:not(.mwca-d1):not(.mwca-d2):not(.mwca-d3) > div:not([class*="_side_"]) {
            width: 960px !important;
            max-width: 960px !important;
            margin: 0 !important;
            padding: 0 !important;
            flex: 0 0 960px !important;
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            box-sizing: border-box !important;
        }

        /* 2.2 MAIN (_wrap_1l406_) 定位随 sidebar 状态切换
           - 侧栏隐藏: margin:0 auto + justify-content:center
             [1] DIV 全视口宽, MAIN 居中, content_stream 在 MAIN 内再居中 → 视口中心 ✓
           - 侧栏显示: margin:0 + justify-content:flex-start
             MAIN 贴 [1] 左边 (= sidebar_right + 16), content 贴 MAIN 左边
             → gap = 16, 与 viewport 无关 ✓ */
        [class*="_wrap_1l406_"]:not([class*="_full_1l406_"]):not([class*="_side_1l406_"]) {
            margin: ${showSidebar ? "0 !important" : "0 auto !important"};
            display: flex !important;
            justify-content: ${showSidebar ? "flex-start !important" : "center !important"};
            align-items: flex-start !important;
        }
/* [1] 针对个人主页 Tab 模块背景色的最终修复 */
[class*="_visable_r36s9_"] .woo-panel-main,
[class*="_visable_r36s9_"] [class*="_card_1v3kz_"],
[class*="_visable_r36s9_"] [class*="_wrap_6c8b7_"],
[class*="_visable_r36s9_"] .woo-tab-nav {
    background-color: var(--w-card-bg) !important;
    background-image: none !important;
    /* 适配边框颜色，防止深色模式下出现白边 */
    border-color: var(--w-main-border, rgba(128,128,128,0.15)) !important;
}
/* 1. 适配侧边栏背景：使用变量 + 自动回退方案防止透明 */
[class*="_side_1ubn9_"] [class*="_main_mmtyp_"],
[class*="_side_1ubn9_"] [class*="_inner_mmtyp_"],
[class*="_side_1ubn9_"] .woo-panel-main {
    /* 使用 light-dark 函数或变量回退，确保任何模式下都有实色底 */
    background-color: var(--w-card-bg, #ffffff) !important;
    color: var(--w-main-text, #333333) !important;
}

/* 2. 强制覆盖深色模式（针对部分变量加载失败的情况） */
/* 微博深色模式通常在 html 标签上有 .v-dark 类或 data-theme='dark' */
html[data-theme='dark'] [class*="_main_mmtyp_"],
html[data-theme='dark'] [class*="_inner_mmtyp_"],
.v-dark [class*="_main_mmtyp_"],
.v-dark [class*="_inner_mmtyp_"] {
    background-color: #161616 !important; /* 微博标准的深色卡片背景 */
    color: #ebebeb !important; /* 微博标准的深色文字颜色 */
}

/* 3. 移除可能导致冲突的灰色背景强制设定 */
[class*="_side_1ubn9_"].grayTheme {
    background-color: transparent !important;
}
/* [2] 修复文字颜色：确保在深色背景下文字为浅色 */
[class*="_visable_r36s9_"] [class*="_btn_1v3kz_"],
[class*="_visable_r36s9_"] .woo-tab-item-main {
    color: var(--w-main-text) !important;
}
/* 调整个人页面特定模块高度 */
.wbpro-screen-v2 {
    height: 60px !important;
}
/* [3] 强制深色模式硬编码覆盖 (针对变量加载延迟的情况) */
html[data-theme='dark'] [class*="_visable_r36s9_"] .woo-panel-main,
.v-dark [class*="_visable_r36s9_"] .woo-panel-main {
    background-color: #161616 !important; /* 强制深灰底 */
}

html[data-theme='dark'] [class*="_visable_r36s9_"] [class*="_btn_1v3kz_"],
.v-dark [class*="_visable_r36s9_"] [class*="_btn_1v3kz_"] {
    color: #ebebeb !important; /* 强制浅白字 */
}
        /* 修复 class="_main_137iq_" 偏下问题，使其与头部顶部对齐 */
        [class*="_main_137iq_"] {
            margin-top: -1px !important;
            padding-top: 0 !important;
            position: relative !important;
            top: 0 !important;
        }
        /* 用户页标签栏(容器 _visable_r36s9_8, 滚动后动态加 _secBar_r36s9_2)与卡片间距:
           原生标签卡 _card_1v3kz_12 margin-top:-12px 上拉贴住上方资料卡 → 取消上拉并留 8px,
           容器再留 8px, 与资料卡自身 mB=8 合计约 16px 视觉间距 */
        [class*="_card_1v3kz_"] {
            margin-top: 8px !important;
        }
        [class*="_visable_r36s9_"] {
            margin-top: 8px !important;
        }
        /* 用户页标签栏(_visable_r36s9_8)在左侧栏选择"最新微博"等时会被隐藏:
           此时应移除它的全部高度与边距, 不留空档(展示"全部关注"时则正常显示) */
        [class*="_visable_r36s9_"][style*="display: none"],
        [class*="_visable_r36s9_"][style*="visibility: hidden"],
        [class*="_visable_r36s9_"]:empty {
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        /* 滚动粘性状态兜底: sticky 标签栏上下各 16px */
        [class*="_secBar_r36s9_"] {
            margin-top: 16px !important;
            margin-bottom: 16px !important;
        }
        /* 内容卡(_wrap_6c8b7_)背景底部两角圆角与顶部一致(顶部原生已是圆角) */
        [class*="_wrap_6c8b7_"] {
            border-bottom-left-radius: 20px !important;
            border-bottom-right-radius: 20px !important;
        }
        /* /at/weibo 等消息中心页的内容卡(_wrap_13iyx_11 下的 _wrap_6c8b7_):
           顶部原生只有 4px, 与底部统一为 20px */
        [class*="_wrap_13iyx_11"] > [class*="_wrap_6c8b7_"] {
            border-radius: 20px !important;
        }

        /* 3. 个人主页导航栏容器底部圆角化 */
        /* 针对包含 class="_visable_r36s9_" 的容器下的 panel 进行圆角处理 */
        [class*="_visable_r36s9_"] [class*="woo-panel-main"] {
            border-bottom-left-radius: 20px !important;
            border-bottom-right-radius: 20px !important;
            border-top: none !important;
            overflow: hidden !important;
            background-color: var(--w-card-bg, #fff) !important;
            box-shadow: none !important;
        }

        /* 确保内容区居中 */
        [class*="Profile_content"] {
            justify-content: center !important;
        }

        /* --- 侧边栏基础定制 (仅首页/信息流受控) ---
           保留 in-flow：侧栏显示时 [侧栏 + 内容流] 被 LCA (_content_1ubn9_)
           原生的 justify-content:center 当一组居中；侧栏隐藏时内容流单独居中
           （由 _full_1l406_7 的原生 flex:0 0 960px + MAIN 的条件式定位保证）

           显式锁宽 240px: 微博原生 sidebar 宽 1250px (用扫描脚本确认),
           必须用三件套 + flex:0 0 240px + 3 个 :not(.mwca-dN) 把特异性提到 (0,4,2),
           压过微博原生 !important (sidebar 才能从 1250 缩到 240) */
        html body [class*="_side_1ubn9_"]:not(.mwca-d1):not(.mwca-d2):not(.mwca-d3) {
            display: ${showSidebar ? "block" : "none"} !important;
            width: 240px !important;
            min-width: 240px !important;
            max-width: 240px !important;
            flex: 0 0 240px !important;
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            margin-right: 16px !important;
            padding: 0 !important;
            background: transparent !important;
            position: sticky !important;
            top: 12px !important;
            align-self: flex-start !important;
            height: fit-content !important;
            z-index: 100;
        }

        /* 右侧栏 _side_1l406_ (藏在 MAIN 里、内容流右边的第二侧栏)
           始终隐藏: 若显示会占 [1] DIV 右半段, 把 content 推到 [1] 左边,
           导致 LCA 居中时 [sidebar + content] 偏左 (实测偏左 ~144px)
           隐藏后 [1] 缩到 960 = content, [sidebar + content] 整组真正居中 */
        [class*="_side_1l406_"] {
            display: none !important;
        }

        /* --- [5] 净化：屏蔽干扰模块 --- */
        [class*="_toolbarSpin_"],
        [class*="picture-viewer_topPlaceholder"],
        [class*="_emptyPic_"],
        [class*="_aria_pn2mr_"],
        [class*="_backTop_imrbt_"],
        [class*="Main_side"],
        [class*="Frame_side"],
        [class*="Links_box"],
        [class*="rightSide"],
        [class*="index_box"],
        [class*="Hot_box"],
        [class*="aside_"],
        /* 新增：屏蔽内容卡片上的特定模块 (如广告标签等) */
        [class*="_wrap_sssx9_"],
        .Main_side_i7Vti,
        .Search_senior_19eQR,
        [aria-label="首页导航"],
        [title="游戏"],
        a[href*="game.weibo.com"],
        [class*="Nav_game"],
        [aria-label="无障碍"],
        [class*="Aria_box_"],
        div[class*="BackTop_wrap"],
        /* 用户要求新增 (第二十八轮): */
        /* 1. 导航里的徽章: 首页导航(_alink_xxx)与视频页导航(Ctrls_alink_xxx)组件不同,
              但都在 .woo-tab-nav 内, 统一用该选择器覆盖, 避免视频页匹配不到 */
        .woo-tab-nav .woo-badge-main.woo-badge-bubble,
        [class*="_alink_1z046_"] .woo-badge-main.woo-badge-bubble,
        /* 2. 分隔线 */
        [class*="_line_2z30i_49"],
        /* 3. 计时器描述图 ( woo-picture-square 类) */
        .woo-picture-main.woo-picture-square.woo-picture-hover[class*="_timer_desc_2z30i_"],
        /* 用户要求新增 (第三十一轮): */
        /* 4. VIP 创作者经营会员徽章 (title 稳定, 跨重建兼容) */
        [title="微博创作者经营会员"],
        /* 5. 粉丝/定制活动徽章 (如"一举夺魁"等, 用 _fans_ 前缀统一捕获) */
        [class*="_fans_"] {
            display: none !important;
        }

        /* 4. 隐藏发微博模块里 input/textarea 的 placeholder 文字
              (用 ::placeholder 伪元素, 兼容所有 input 类, 不依赖具体类名) */
        [class*="_publishCard_"] input::placeholder,
        [class*="_publishCard_"] textarea::placeholder {
            color: transparent !important;
        }

        /* 5. 发微博输入框 wbpro-form 的 focus 状态描边 2px
              - .focus 类: 微博 JS 在 input 获焦时给 form 加的 state class
              - :focus-within: 兜底, 万一 .focus 没加 (浏览器原生伪类, form 内任意 input 获焦即触发)
              - 同步用 :not(.mwca-dN) 提特异性到 (0,5,3), 压过微博 !important
              - border-style: solid 防止微博原生 focus 状态用了 none 导致 width 失效 */
        html body .wbpro-form.focus[class*="_wbproform_"]:not(.mwca-d1):not(.mwca-d2):not(.mwca-d3),
        html body .wbpro-form[class*="_wbproform_"]:not(.mwca-d1):not(.mwca-d2):not(.mwca-d3):focus-within {
            border-width: 2px !important;
            border-style: solid !important;
        }
/* ==================================================
   MWCA 评论区稳定修复（只追加）
   ================================================== */

/* 1. 评论输入框：宽度 & 自动高度不炸 */
.wbpro-form textarea,
textarea#comment-textarea {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    resize: none !important;
    min-height: 24px !important;
    line-height: 24px !important;
}

/* 2. 评论工具栏整体横排 */
._mar1_1n75r_2 > .woo-box-flex {
    display: flex !important;
    align-items: center !important;
    flex-wrap: nowrap !important;
    gap: 8px !important;
}

/* 3. 表情 / 图片 图标区 */
._mar1_1n75r_2 ._iconbox2_1n75r_10 {
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
}

/* 4. “同时转发”修复（外层 + 本体） */
._mar1_1n75r_2 > .woo-box-flex > .woo-box-item-flex {
    min-width: 0 !important;
    display: flex !important;
    align-items: center !important;
    flex: 0 0 auto !important;
}

._check_1n75r_18 {
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    line-height: 1 !important;
}

._check_1n75r_18 .woo-checkbox-text {
    white-space: nowrap !important;
    writing-mode: horizontal-tb !important;
}

/* 5. 隐藏评论字数 */
._mar1_1n75r_2 ._count_1n75r_33 {
    display: none !important;
}

/* 6. 评论按钮靠右 */
._mar1_1n75r_2 button.woo-button-main {
    margin-left: auto !important;
    flex-shrink: 0 !important;
}

        /* ... 其余原有 CSS 保持不变 ... */
        [class*="_side_1ubn9_"] [class*="_main_mmtyp_"],
        [class*="_side_1ubn9_"] .woo-panel-main,
        [class*="_side_1ubn9_"] [class*="_inner_mmtyp_"] {
            height: auto !important;
            padding: 16px 0 !important;
            border-radius: 20px !important;
            overflow: hidden !important;
            border: none !important;
            box-shadow: none !important;
            background-color: var(--w-card-bg, #fff) !important;
        }
        [class*="_main_118ye_"] { padding-left: 32px !important; justify-content: flex-start !important; background-color: transparent !important; }
        [class*="_side_1ubn9_"] i.woo-font, [class*="_side_1ubn9_"] svg[class*="woo-tip-icon"] { display: none !important; }
        h2[class*="_title_mmtyp_"], [class*="_side_1ubn9_"] i[class*="woo-font--nav"] { display: none !important; }
        [class*="_side_1ubn9_"] button.woo-button-main { border: none !important; box-shadow: none !important; background: transparent !important; }
        [class*="_side_1ubn9_"] h3[class*="_title_r9kj3_"] { margin-left: 32px !important; padding-left: 0 !important; }
        [class*="detail_wbtext_"], [class*="wbpro-feed-ogText"] { font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif !important; font-weight: 500 !important; line-height: 1.6 !important; }
        [class*="_wrap_1jk00_"], [class*="_showPictureViewer_"] { background: transparent !important; width: 860px !important; margin-left: -80px !important; padding: 10px 0 10px 80px !important; height: auto !important; }
        [class*="_imgWrap_1jk00_"], [class*="_pic_1jk00_"] { width: 860px !important; height: auto !important; max-height: none !important; object-fit: initial !important; display: block !important; }
        /* 顶栏内容模块 SVG 图标垂直微调: 覆盖微博原 top:-3px */
        ._itemin_2z30i_118._itemin2_2z30i_124 ._svg_2z30i_129 {
            position: relative !important;
            top: 0.5px !important;
        }
        /* 头像用户图标: 头像 tab 项(首页 _avatarItem_ / 视频页 Ctrls_avatarItem_)会设白色,
           强制其 color:inherit 继承上级 tab 项的颜色 —— 与其余 4 个图标完全相同的机制:
           stroke=currentColor 跟随导航色, 明暗模式/选中态自动一致, 不依赖任何 CSS 变量。
           覆盖白色用 !important 压过微博的 avatarItem 规则 */
        .woo-tab-nav [class*="avatarItem"] {
            color: inherit !important;
        }
        #mwca-custom-backtop { position: fixed !important; bottom: 50px !important; right: 50px !important; width: 44px !important; height: 44px !important; border-radius: 50% !important; background-color: #ffffff !important; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; display: none; align-items: center !important; justify-content: center !important; cursor: pointer !important; z-index: 999999 !important; transition: opacity 0.3s; }
        #mwca-custom-backtop svg { width: 13px !important; height: 13px !important; fill: #666 !important; opacity: 0.6 !important; }
        /* /tv/home 视频网格(u-col-3): 统一卡片间距 16px, 上下左右相同。
           纵向间距 = item padding-top(16) + 卡片 margin-bottom(0) = 16px;
           横向间距 = item padding-left(16)。
           同时恢复卡片自动宽度: 上方 960px 规则会把每张卡片(Card_wrap_2ibWe /
           Item_card_2iMTW 含 _card_ 子串)拉宽到 960px, 溢出其 377px 列容器, 与相邻列重叠
           (推荐区与热门区两个网格都会命中, 故作用域取 Frame_main 而非 .recommend)。 */
        [class*="Frame_main"] .u-col-3 {
            margin: -16px 0px 0px -16px !important;
        }
        [class*="Frame_main"] .u-col-3 .woo-box-item-inlineBlock {
            padding: 16px 0px 0px 16px !important;
        }
        [class*="Frame_main"] .u-col-3 [class*="Card_wrap"] {
            width: auto !important;
            margin-bottom: 0 !important;
        }
        /* 首页内容卡"九宫格"多图网格(u-col-3 + woo-picture-square): 强制 3 列等宽占满容器。
           新版微博(hash _a3hty_)多图网格的子项缺少 33.33% 宽度规则时, 图片按内容宽度
           排布, 整行不满 860px, 右侧留白。语义选择: 网格内含有 woo-picture-square 方图
           才命中; /tv/home 视频卡用 woo-picture-wide / woo-picture-cover, 不受影响。
           width:100% 防网格容器自身没撑满; gap:0 防原生 gap 与子项 33.33% 叠加导致溢出换行。 */
        .u-col-3:has([class*="woo-picture-square"]) {
            width: 100% !important;
            gap: 0 !important;
        }
        .u-col-3:has([class*="woo-picture-square"]) > .woo-box-item-inlineBlock {
            flex: 0 0 33.33333% !important;
            width: 33.33333% !important;
            max-width: 33.33333% !important;
            box-sizing: border-box !important;
        }
        /* /tv/home 顶部 Banner 卡片移除(CSS 兜底, JS 会同时 remove 节点) */
        [class*="Banner_card_"] { display: none !important; }
        /* /tv/home "推荐视频" 标题移除(CSS 兜底, 作用域限定在 .recommend 内) */
        .recommend [class*="Tit_tit_"] { display: none !important; }
        /* 移除微博原生"返回顶部"按钮(只保留本脚本的 #mwca-custom-backtop) */
        [class*="BackTop_main_"], [class*="App_backTop_"] { display: none !important; }
        /* 移除用户页面的筛选/排序工具条(_bar_137iq_54, CSS 兜底, JS 会同时 remove 节点) */
        [class*="_bar_137iq_"] { display: none !important; }
    `);

    // ======= 3. JS 功能模块 =======
    const LOGO_SVG = '<svg viewBox="0 0 100 100" style="height: 30px; width: 90px;"><g><path fill="#E6162D" d="M73.615,48.447c-1.314-0.399-2.216-0.657-1.533-2.383c5.033-13.409-7.597-15.071-20.803-9.416 c0,0-2.989,1.301-2.216-1.056c1.456-4.702,1.237-8.63-1.03-10.91c-5.152-5.165-18.871,0.193-30.632,11.954 C8.603,45.433,3.489,54.771,3.489,62.848c0,15.432,19.799,24.822,39.159,24.822c25.389,0,42.277-14.749,42.277-26.458 C84.938,54.127,78.974,50.108,73.615,48.447z"></path><path fill="#F1F1F1" d="M42.713,82.131C27.255,83.664,13.91,76.67,12.906,66.532c-1.058-24.473,52.225-29.73,55.956-5.539 C69.88,71.144,58.158,80.611,42.713,82.131z"></path><path fill="#FF9933" d="M90.144,20.486c-6.132-6.801-15.174-9.39-23.521-7.613c-1.932,0.412-3.156,2.319-2.744,4.238 c0.412,1.932,2.306,3.156,4.238,2.744c13.098-2.893,24.605,9.876,20.391,22.594c-1.338,4.509,5.24,6.64,6.801,2.203 C97.931,36.543,96.283,27.28,90.144,20.486z"></path><path fill="#FF9933" d="M79.412,42.69c1.623,0.515,3.349-0.361,3.877-1.984c2.94-8.629-5.084-17.528-13.964-15.47 c-1.662,0.348-2.718,1.997-2.37,3.658c0.361,1.662,1.997,2.718,3.645,2.357c1.984-0.425,4.148,0.193,5.603,1.803 c1.456,1.623,1.855,3.826,1.224,5.758C76.913,40.423,77.789,42.162,79.412,42.69z"></path><path d="M44.246,53.2c-7.355-1.919-15.664,1.752-18.858,8.231c-3.259,6.608-0.103,13.95,7.317,16.346 c7.703,2.486,16.772-1.327,19.927-8.45C55.749,62.346,51.859,55.171,44.246,53.2z M38.63,70.075 c-3.249,5.211-12.149,2.467-8.695-3.852C33.164,61.1,41.972,63.757,38.63,70.075z M43.563,63.763 c-1.113,2.019-4.608,1.073-3.349-1.34C41.332,60.439,44.749,61.343,43.563,63.763z"></path></g></svg>';
    const SETTING_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="currentColor" style="width: 18px; height: 18px;"><path fill-rule="evenodd" clip-rule="evenodd" d="m5.557 0.69 -0.463 1.195 -1.594 0.904 -1.27 -0.194a1.077 1.077 0 0 0 -1.078 0.528l-0.43 0.754a1.077 1.077 0 0 0 0.086 1.217l0.807 1.001v1.81L0.83 8.906a1.077 1.077 0 0 0 -0.086 1.217l0.43 0.754a1.077 1.077 0 0 0 1.078 0.528l1.27 -0.194 1.573 0.904 0.463 1.196a1.076 1.076 0 0 0 1 0.689h0.905a1.076 1.076 0 0 0 1.002 -0.69l0.463 -1.195 1.572 -0.904 1.27 0.194a1.077 1.077 0 0 0 1.078 -0.528l0.43 -0.754a1.077 1.077 0 0 0 -0.086 -1.217l-0.807 -1.001v-1.81l0.786 -1.001a1.077 1.077 0 0 0 0.086 -1.217l-0.43 -0.754a1.076 1.076 0 0 0 -1.078 -0.528l-1.27 0.194 -1.573 -0.904L8.443 0.689A1.077 1.077 0 0 0 7.442 0h-0.884a1.077 1.077 0 0 0 -1.001 0.69ZM7 9.25a2.25 2.25 0 1 0 0 -4.5 2.25 2.25 0 0 0 0 4.5Z"/></svg>';
    // 顶部导航图标 (Streamline Flex 系列, 描边式)。stroke=currentColor 继承按钮颜色, 明暗模式自动适配。
    // class 沿用微博原 _icon_1z046_35, 保持与原始图标一致的尺寸; data-mwca-nav 用于防重复替换/重渲染兜底。
    const NAV_HOME_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.5 -1.5 42 42" fill="none" stroke="currentColor" aria-hidden="true" class="_icon_1z046_35" data-slot="icon" data-mwca-nav="home"><path stroke-linecap="round" stroke-linejoin="round" d="M10.688200714285713 35.647392857142854h17.624127857142856c1.8647571428571428 0 3.4509428571428566 -1.360542857142857 3.7348071428571425 -3.2038499999999996 0.45100714285714283 -2.9294571428571428 0.55575 -5.899028571428571 0.3131142857142857 -8.847957857142857h3.408878571428571c1.0984071428571427 0 1.7644714285714285 -1.2122314285714284 1.1755714285714285 -2.1395399999999998l-0.5897357142857143 -0.9287849999999999C32.80735714285714 14.94137357142857 28.293385714285712 10.032109285714284 23.023928571428574 6.029511428571428l-1.8387107142857142 -1.3966735714285714c-0.9959764285714285 -0.7565164285714284 -2.374041428571428 -0.7565164285714284 -3.3700178571428574 0l-1.8389614285714284 1.3968407142857144C10.706920714285715 10.032137142857142 6.1927264285714285 14.941317857142856 2.6452251428571425 20.527092857142854l-0.5899557857142856 0.9289242857142856c-0.5889334285714285 0.9273085714285714 0.07725064285714285 2.139567857142857 1.1757692142857141 2.139567857142857h3.409045714285714c-0.24244071428571426 2.9489292857142853 -0.13789285714285715 5.918500714285714 0.31319785714285714 8.847957857142857 0.28383642857142855 1.8433071428571426 1.8699385714285712 3.2038499999999996 3.7349185714285715 3.2038499999999996Z" stroke-width="3"></path><path stroke-linecap="round" stroke-linejoin="round" d="M19.500362142857142 22.533280714285713c2.5656149999999998 0 4.645485 2.0798421428571428 4.645485 4.645485v8.468348571428571H14.854877142857141V27.178765714285714c0 -2.565642857142857 2.0798421428571428 -4.645485 4.645485 -4.645485Z" stroke-width="3"></path></svg>';
    const NAV_HOT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.5 -1.5 42 42" fill="none" stroke="currentColor" aria-hidden="true" class="_icon_1z046_35" data-slot="icon" data-mwca-nav="hot"><path stroke-linecap="round" stroke-linejoin="round" d="M16.658571428571427 2.2369285714285714a1.0418571428571428 1.0418571428571428 0 0 0 -1.0669285714285714 0 0.6964285714285714 0.6964285714285714 0 0 0 -0.15878571428571428 0.9081428571428571c2.381785714285714 4.122857142857143 3.398571428571428 9.329357142857143 2.0725714285714285 13.510714285714284 -0.858 2.702142857142857 -4.345714285714286 2.858142857142857 -5.788714285714285 0.41507142857142854a14.741999999999999 14.741999999999999 0 0 1 -0.7994999999999999 -1.56 10.390714285714285 10.390714285714285 0 0 0 -5.343 9.351642857142858c0.28135714285714286 6.9503571428571425 4.755214285714286 12.023142857142856 13.3575 12.023142857142856s13.065000000000001 -5.343 13.3575 -12.023142857142856C32.63464285714286 16.848 26.946214285714284 6.9921428571428565 16.658571428571427 2.2369285714285714Z" stroke-width="3"></path></svg>';
    const NAV_VIDEO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.5 -1.5 42 42" fill="none" stroke="currentColor" aria-hidden="true" class="_icon_1z046_35" data-slot="icon" data-mwca-nav="video"><path stroke-linecap="round" stroke-linejoin="round" d="M9.928174285714285 15.838986428571427c4.316993571428571 0 6.745300714285714 -2.4283071428571428 6.745300714285714 -6.745300714285714 0 -4.316965714285714 -2.4283071428571428 -6.745278428571428 -6.745300714285714 -6.745278428571428 -4.316965714285714 0 -6.745272857142857 2.428312714285714 -6.745272857142857 6.745278428571428 0 4.316993571428571 2.4283071428571428 6.745300714285714 6.745272857142857 6.745300714285714Z" stroke-width="3"></path><path stroke-linecap="round" stroke-linejoin="round" d="M27.462685714285712 15.839682857142858c2.986007142857143 0 4.665514285714286 -1.679590714285714 4.665514285714286 -4.665542142857142 0 -2.9859235714285717 -1.6795071428571429 -4.665514285714286 -4.665514285714286 -4.665514285714286 -2.985951428571428 0 -4.665542142857142 1.679590714285714 -4.665542142857142 4.665514285714286 0 2.985951428571428 1.679590714285714 4.665542142857142 4.665542142857142 4.665542142857142Z" stroke-width="3"></path><path stroke-linecap="round" stroke-linejoin="round" d="M11.395549285714283 36.19060714285714c-1.332852857142857 -0.11532857142857142 -2.421732857142857 -1.1427 -2.6183207142857143 -2.466192857142857 -0.25024071428571426 -1.6845214285714285 -0.5017071428571429 -3.4286571428571424 -0.5017071428571429 -5.214578571428571 0 -1.785977142857143 0.2514664285714286 -3.5298899999999995 0.5017071428571429 -5.214578571428571 0.19658785714285712 -1.3233257142857142 1.285467857142857 -2.3507249999999997 2.6183207142857143 -2.4661092857142854 0.22720285714285712 -0.01966714285714286 0.4552135714285714 -0.039640714285714286 0.68406 -0.05967 2.2539492857142855 -0.19734 4.58796 -0.40167214285714287 6.978743571428571 -0.40167214285714287 2.3907835714285715 0 4.724822142857143 0.20433214285714285 6.978743571428571 0.40167214285714287 0.22884642857142856 0.020029285714285715 0.45688499999999993 0.04000285714285714 0.68406 0.05967 1.3329364285714287 0.1153842857142857 2.4218721428571426 1.1427835714285712 2.618265 2.4661092857142854 0.10669285714285714 0.7171821428571429 0.2133857142857143 1.4451171428571428 0.3008571428571429 2.18244 1.5756 -0.7043121428571428 3.4576285714285717 -1.782717857142857 4.726521428571429 -2.542744285714286 0.7549285714285714 -0.4520935714285714 1.750542857142857 -0.12468857142857143 2.0084999999999997 0.716457857142857 1.0460357142857142 3.4093242857142854 1.0644214285714284 6.488067857142857 0.014764285714285714 9.764625 -0.2643642857142857 0.8254071428571429 -1.2452142857142856 1.135457142857143 -1.9887214285714285 0.6897428571428571 -1.2691714285714286 -0.7610571428571428 -3.1709785714285714 -1.8527785714285714 -4.761064285714286 -2.563414285714286 -0.08747142857142856 0.7371 -0.1941642857142857 1.465007142857143 -0.3008571428571428 2.18205 -0.19639285714285712 1.3234928571428572 -1.2853285714285714 2.3508642857142856 -2.618265 2.466192857142857 -0.227175 0.01977857142857143 -0.4552135714285714 0.03955714285714286 -0.68406 0.05961428571428571 -2.2539214285714286 0.19750714285714285 -4.58796 0.40169999999999995 -6.978743571428571 0.40169999999999995 -2.390755714285714 0 -4.724794285714285 -0.20419285714285715 -6.978687857142857 -0.40169999999999995 -0.2288742857142857 -0.020057142857142857 -0.4569128571428571 -0.03983571428571429 -0.6841157142857143 -0.05961428571428571Z" stroke-width="3"></path></svg>';
    const NAV_MSG_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.5 -1.5 42 42" fill="none" stroke="currentColor" aria-hidden="true" class="_icon_1z046_35" data-slot="icon" data-mwca-nav="msg"><path stroke-linecap="round" stroke-linejoin="round" d="M2.874857142857143 29.35307142857143a5.827714285714285 5.827714285714285 0 0 0 5.159142857142857 5.053285714285714c3.7022142857142852 0.39 7.535357142857142 0.7967142857142856 11.466 0.7967142857142856 3.9278571428571425 0 7.763785714285714 -0.4095 11.466 -0.7967142857142856a5.822142857142857 5.822142857142857 0 0 0 5.159142857142857 -5.053285714285714c0.3955714285714285 -3.1868571428571424 0.7855714285714285 -6.479571428571428 0.7855714285714285 -9.853071428571427 0 -3.3707142857142856 -0.39 -6.666214285714285 -0.7855714285714285 -9.853071428571427a5.827714285714285 5.827714285714285 0 0 0 -5.159142857142857 -5.056071428571428C27.263785714285714 4.206428571428571 23.427857142857142 3.799714285714286 19.5 3.799714285714286c-3.9278571428571425 0 -7.763785714285714 0.4095 -11.466 0.7967142857142856a5.822142857142857 5.822142857142857 0 0 0 -5.159142857142857 5.053285714285714C2.479285714285714 12.833785714285714 2.0892857142857144 16.129285714285714 2.0892857142857144 19.5s0.39 6.666214285714285 0.7855714285714285 9.853071428571427Z" stroke-width="3"></path><path stroke-linecap="round" stroke-linejoin="round" d="m2.952857142857143 8.925428571428572 13.09842857142857 10.329428571428572a5.571428571428571 5.571428571428571 0 0 0 6.897428571428571 0l13.09842857142857 -10.329428571428572" stroke-width="3"></path></svg>';
    const NAV_USER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.5 -1.5 42 42" fill="none" stroke="currentColor" aria-hidden="true" class="_icon_1z046_35" data-slot="icon" data-mwca-nav="user"><path stroke-linecap="round" stroke-linejoin="round" d="M29.819678571428568 33.524678571428566c-0.5752499999999999 -2.165892857142857 -1.8190714285714285 -4.101407142857142 -3.5623435714285714 -5.5263 -1.9069049999999999 -1.5586349999999998 -4.294011428571428 -2.4100607142857142 -6.756833571428571 -2.4100607142857142 -2.462822142857143 0 -4.849900714285714 0.8514257142857143 -6.756805714285714 2.4100607142857142 -1.7432442857142856 1.424892857142857 -2.987149285714286 3.3604071428571425 -3.5622599999999998 5.5263" stroke-width="3"></path><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 37.607142857142854c11.588571428571429 0 18.107142857142858 -6.518571428571428 18.107142857142858 -18.107142857142858S31.088571428571427 1.3928571428571428 19.5 1.3928571428571428 1.3928571428571428 7.911428571428571 1.3928571428571428 19.5s6.518571428571428 18.107142857142858 18.107142857142858 18.107142857142858Z" stroke-width="3"></path><path stroke-linecap="round" stroke-linejoin="round" d="M19.49727 21.115937142857142c3.8999999999999995 0 6.09375 -2.1937499999999996 6.09375 -6.09375s-2.1937499999999996 -6.09375 -6.09375 -6.09375 -6.09375 2.1937499999999996 -6.09375 6.09375 2.1937499999999996 6.09375 6.09375 6.09375Z" stroke-width="3"></path></svg>';
    const LOGO_HAMMER_IMG = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1QzlFRTA2RkJENTYxMUUzQkQ2N0ZFM0FGNTNBQjQzNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1QzlFRTA3MEJENTYxMUUzQkQ2N0ZFM0FGNTNBQjQzNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjVDOUVFMDZEQkQ1NjExRTNCRDY3RkUzQUY1M0FCNDM3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjVDOUVFMDZFQkQ1NjExRTNCRDY3RkUzQUY1M0FCNDM3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+zKElzQAA0j9JREFUeNrkvQeg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" style="height: 30px; width: 30px; object-fit: contain;" alt="Weibo">';
    const DARK_MODE_SVG = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 14 14\" fill=\"currentColor\" style=\"width: 18px; height: 18px;\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M0 7c0 -3.86599 3.13401 -7 7 -7 3.866 0 7 3.13401 7 7 0 3.866 -3.134 7 -7 7 -3.86599 0 -7 -3.134 -7 -7Zm7.00076 -0.01865c0 -1.35815 1.101 -2.45915 2.45916 -2.45915 0.25029 0 0.44144 -0.3009 0.25794 -0.47113 -0.71301 -0.66144 -1.66783 -1.06584 -2.7171 -1.06584 -2.207 0 -3.99612 1.78913 -3.99612 3.99612 0 2.207 1.78912 3.99615 3.99612 3.99615 1.04927 0 2.00409 -0.4044 2.7171 -1.06587 0.1835 -0.17022 -0.00765 -0.47112 -0.25794 -0.47112 -1.35816 0 -2.45916 -1.101 -2.45916 -2.45916Z\"/></svg>';
    const LIGHT_MODE_SVG = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 14 14\" fill=\"currentColor\" style=\"width: 18px; height: 18px;\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M7 0c0.41421 0 0.75 0.335786 0.75 0.75v1c0 0.41421 -0.33579 0.75 -0.75 0.75s-0.75 -0.33579 -0.75 -0.75v-1C6.25 0.335786 6.58579 0 7 0Zm2.25 7c0 1.24264 -1.00736 2.25 -2.25 2.25S4.75 8.24264 4.75 7 5.75736 4.75 7 4.75 9.25 5.75736 9.25 7Zm-1.5 5.25c0 -0.4142 -0.33579 -0.75 -0.75 -0.75s-0.75 0.3358 -0.75 0.75v1c0 0.4142 0.33579 0.75 0.75 0.75s0.75 -0.3358 0.75 -0.75v-1ZM11.5 7c0 -0.41421 0.3358 -0.75 0.75 -0.75h1c0.4142 0 0.75 0.33579 0.75 0.75s-0.3358 0.75 -0.75 0.75h-1c-0.4142 0 -0.75 -0.33579 -0.75 -0.75ZM0.75 6.25C0.335786 6.25 0 6.58579 0 7s0.335786 0.75 0.75 0.75h1c0.41421 0 0.75 -0.33579 0.75 -0.75s-0.33579 -0.75 -0.75 -0.75h-1Zm1.30024 -4.19976c0.29289 -0.2929 0.76776 -0.2929 1.06066 0l0.86066 0.86066c0.29289 0.29289 0.29289 0.76776 0 1.06066 -0.2929 0.29289 -0.76777 0.29289 -1.06066 0l-0.86066 -0.86066c-0.2929 -0.2929 -0.2929 -0.76777 0 -1.06066Zm9.03886 7.97806c-0.2929 -0.29293 -0.7678 -0.29293 -1.0607 0 -0.29285 0.2929 -0.29285 0.7677 0 1.0606l0.8607 0.8607c0.2929 0.2929 0.7678 0.2929 1.0607 0 0.2929 -0.2929 0.2929 -0.7678 0 -1.0607l-0.8607 -0.8606Zm0.8607 -7.97806c0.2929 0.29289 0.2929 0.76776 0 1.06066l-0.8607 0.86066c-0.2929 0.29289 -0.7678 0.29289 -1.0607 0 -0.29285 -0.2929 -0.29285 -0.76777 0 -1.06066l0.8607 -0.86066c0.2929 -0.2929 0.7678 -0.2929 1.0607 0ZM3.97156 11.0889c0.29289 -0.2929 0.29289 -0.7677 0 -1.0606 -0.2929 -0.29293 -0.76777 -0.29293 -1.06066 0l-0.86066 0.8606c-0.2929 0.2929 -0.2929 0.7678 0 1.0607 0.29289 0.2929 0.76776 0.2929 1.06066 0l0.86066 -0.8607Z\"/></svg>';

    function injectNewBackTop() {
        if (document.getElementById('mwca-custom-backtop')) return;
        const btn = document.createElement('div');
        btn.id = 'mwca-custom-backtop';
        btn.innerHTML = '<svg viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg"><path d="M6.2018 0.927786C6.98743 -0.309261 8.79277 -0.309262 9.5784 0.927785L15.4653 10.1972C16.3109 11.5287 15.3543 13.2694 13.777 13.2694H2.00324C0.425879 13.2694 -0.530695 11.5287 0.31494 10.1972L6.2018 0.927786Z"></path></svg>';
        btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.appendChild(btn);
        window.addEventListener('scroll', () => {
            btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
        }, { passive: true });
    }

    // 主题切换按钮图标同步 (需求映射: 夜间模式→太阳, 日间模式→月亮)
    // 微博原始语义是"图标=切换目标": 日间模式显示 title="夜间模式" 的月亮按钮(点它去夜间),
    // 夜间模式显示 title="日间模式" 的太阳按钮(点它回日间)。本脚本按用户要求反转:
    // 图标表示当前所处模式 —— 夜间模式显示太阳(LIGHT_MODE_SVG), 日间模式显示月亮(DARK_MODE_SVG)。
    // 用户提供的 Brightness-1--Streamline-Core.svg 的 path 与 LIGHT_MODE_SVG 完全一致, 直接复用。
    // 判定"当前是否夜间模式"不能只靠按钮 title(微博可能不更新它): 优先看 html/body 的
    // 暗色标记(data-theme="dark" / v-dark), 兜底再看按钮 title(title="日间模式" 的按钮
    // 只出现在夜间模式)。每次同步都重新判定, 仅当目标图标与已应用的不同才写 innerHTML,
    // 保证自终止、不随观察器高频触发而反复写 DOM。
    function syncThemeToggleIcon() {
        const btn = document.querySelector('button[title="夜间模式"], button[title="日间模式"]');
        if (!btn) return;

        let isNight = false;
        const root = document.documentElement;
        if (root && root.matches('[data-theme="dark"], [class*="v-dark"]')) isNight = true;
        if (!isNight && document.body && document.body.matches('[data-theme="dark"], [class*="v-dark"]')) isNight = true;
        if (!isNight && btn.title === "日间模式") isNight = true;

        const want = isNight ? LIGHT_MODE_SVG : DARK_MODE_SVG; // 夜间→太阳, 日间→月亮
        const key = isNight ? "night" : "day";
        if (btn.dataset.iconApplied === key) return;
        const svg = btn.querySelector('svg');
        if (!svg) return;
        btn.innerHTML = want;
        btn.dataset.iconApplied = key;
    }

    // 顶部导航图标替换 (首页/推荐/视频/消息/用户头像)
    // 思路: 尽量不动微博原始元素结构, 只改写内容——
    //   - 4 个 tab 是 <svg>: 保留原 svg 元素, 仅改写 viewBox/fill/stroke 和内部 path;
    //   - 头像模块是 <img>: 替换为内联 <svg>(NAV_USER_SVG, stroke=currentColor),
    //     使其颜色与其余图标一致(继承 color: var(--weibo-top-nav-icon-color))。
    // 用户头像用 img[class*="_avatar_"] 定位, 不依赖具体用户名/title/href, 所有用户通用。
    // 4 个 tab 保留原 svg 元素, React 虚拟 DOM 认为元素还在, 不会重建, 避免选中态错乱。
    // 防重复: svg 用 data-mwca-nav 标记、头像用 src 前缀判断; React 若重渲染还原,
    // 观察器(SPA 重渲染)与下方 setInterval 会再次注入(幂等, 重复调用安全)。
    function injectNavSvg(svg, svgString, key) {
        const tmp = document.createElement('div');
        tmp.innerHTML = svgString;
        const srcSvg = tmp.querySelector('svg');
        if (!srcSvg) return;
        svg.setAttribute('viewBox', srcSvg.getAttribute('viewBox'));
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.innerHTML = srcSvg.innerHTML;
        svg.dataset.mwcaNav = key;
    }

    // 顶部导航图标替换 (首页/推荐/视频/消息/用户头像)
    // 微博首页等路由的导航类是 _alink_xxx; 而 /tv/home(视频)页用的是另一套组件:
    //   链接类 Ctrls_alink_1L3hP, 图标是 <svg><use xlink:href="#woo_svg_nav_xxx"></use></svg>,
    //   title 属性在内层 item div 上而非 <a> 上。
    // 两种导航的 tab 链接都位于 .woo-tab-nav 内, 故用 .woo-tab-nav a 精确选择。
    // 替换方式: 保留原 svg 元素, 只改写 viewBox/fill/stroke 和内部 path(use 精灵图标也会被覆盖)。
    // 防重复用内容比对而非 data 标记: React 重渲染可能原位改写 path 的 d 属性(属性级变更,
    // 观察器不监听 d), data 标记会残留导致误判跳过, 内容比对才能兜住。
    const NAV_ICON_SRCS = { home: NAV_HOME_SVG, hot: NAV_HOT_SVG, video: NAV_VIDEO_SVG, msg: NAV_MSG_SVG, user: NAV_USER_SVG };
    const NAV_ICON_INNER = {};
    Object.keys(NAV_ICON_SRCS).forEach(k => {
        const d = document.createElement('div');
        d.innerHTML = NAV_ICON_SRCS[k];
        NAV_ICON_INNER[k] = d.querySelector('svg').innerHTML;
    });

    function syncNavIcons() {
        document.querySelectorAll('.woo-tab-nav a').forEach(a => {
            const avatarImg = a.querySelector('img[class*="_avatar_"]');
            const isAvatar = !!a.querySelector('[class*="avatarItem"]');
            if (isAvatar || avatarImg) {
                // 头像: 首页形态是 <img>(整体替换为我们的 svg); 视频页形态是 use 图标 svg(原地换内容)
                if (avatarImg) {
                    const userSvg = a.querySelector('svg[data-mwca-nav="user"]');
                    if (userSvg) avatarImg.remove();
                    else {
                        // 保留原 img 的尺寸类(如首页 _icon_1z046_35 / 视频页 Ctrls_icon_2mxB4),
                        // 避免头像 svg 因缺尺寸类而在 /tv/home 渲染过小过细, 看起来发白。
                        // 但过滤掉含 avatar 的类(如 _avatar_1z046_57 / Ctrls_avatarItem_3LrJN),
                        // 它们会给图标额外加一圈圆形边框/描边环。
                        const holder = document.createElement('div');
                        holder.innerHTML = NAV_USER_SVG;
                        const ns = holder.querySelector('svg');
                        const origCls = avatarImg.getAttribute('class') || '';
                        const keepCls = origCls.split(/\s+/).filter(c => !/avatar/i.test(c)).join(' ').trim();
                        if (keepCls) ns.setAttribute('class', keepCls);
                        avatarImg.replaceWith(ns);
                    }
                } else {
                    const svg = a.querySelector('svg');
                    if (svg && svg.innerHTML !== NAV_ICON_INNER.user) injectNavSvg(svg, NAV_USER_SVG, 'user');
                }
                // 强制内联 color 且带 !important: 微博对头像 svg 用 color:#fff !important,
                // 而 !important 声明的优先级高于普通内联样式, 所以必须用 setProperty 加 important
                // 才能压过它(无 important 的内联会被微博的 !important 覆盖, 见本地实测)。
                // 未选中用导航灰, 选中(当前 tab 项带 woo-tab-active)用高亮色。
                const userSvg2 = a.querySelector('svg[data-mwca-nav="user"]');
                if (userSvg2) {
                    const isActive = !!a.querySelector('.woo-tab-active');
                    const color = isActive ? 'var(--weibo-top-nav-icon-active-color, #E6162D)' : 'var(--weibo-top-nav-icon-color, #8b98a5)';
                    if (userSvg2.style.getPropertyValue('color') !== color) userSvg2.style.setProperty('color', color, 'important');
                }
                return;
            }
            // title 可能在 <a> 上(首页), 也可能在内层 item div 上(视频页)
            const titleEl = a.getAttribute('title') ? a : a.querySelector('[title]');
            const title = titleEl ? titleEl.getAttribute('title') : null;
            let key = null;
            if (title === "首页") key = "home";
            else if (title === "推荐") key = "hot";
            else if (title === "视频") key = "video";
            else if (title === "消息") key = "msg";
            if (!key) return;
            const svg = a.querySelector('svg');
            if (!svg || svg.innerHTML === NAV_ICON_INNER[key]) return;
            injectNavSvg(svg, NAV_ICON_SRCS[key], key);
        });
    }

    // 移除 /tv/home 顶部 Banner 卡片 (Banner_card_1TG2d)
    // 幂等: data 标记防重复; React 重渲染会重新插入, 由观察器与定时器再次移除。
    function removeTvBanner() {
        if (!location.pathname.startsWith('/tv/')) return;
        document.querySelectorAll('[class*="Banner_card_"]').forEach(el => {
            if (el.dataset.mwcaBannerRemoved) return;
            el.dataset.mwcaBannerRemoved = '1';
            el.remove();
        });
    }

    // 移除 /tv/home "推荐视频" 标题 (Tit_tit_1Accn) 与微博原生"返回顶部"按钮
    // (BackTop_main_3m3aB App_backTop_ouwUT), 只保留本脚本的 #mwca-custom-backtop。
    // 幂等: data 标记防重复; React 重渲染会重新插入, 由观察器与定时器再次移除。
    function removeDuplicateExtras() {
        document.querySelectorAll('[class*="Tit_tit_"]').forEach(el => {
            if ((el.textContent || '').trim() !== '推荐视频') return;
            if (el.dataset.mwcaTitleRemoved) return;
            el.dataset.mwcaTitleRemoved = '1';
            el.remove();
        });
        document.querySelectorAll('[class*="BackTop_main_"], [class*="App_backTop_"]').forEach(el => {
            if (el.dataset.mwcaBacktopRemoved) return;
            el.dataset.mwcaBacktopRemoved = '1';
            el.remove();
        });
    }

    // 移除用户页面的筛选/排序工具条 (woo-box-flex woo-box-justifyBetween _bar_137iq_54)。
    // 仅在 /u/ 用户页触发。幂等: data 标记防重复; React 重渲染会重新插入, 由观察器与定时器再次移除。
    function removeUserPageBar() {
        if (!location.pathname.startsWith('/u/')) return;
        document.querySelectorAll('[class*="_bar_137iq_"]').forEach(el => {
            if (el.dataset.mwcaBarRemoved) return;
            el.dataset.mwcaBarRemoved = '1';
            el.remove();
        });
    }

    function fixEverything() {
        const logo = document.querySelector('a[aria-label="Weibo"]');
        if (logo) {
            // 锤子 logo 开关: 开启时用 PNG, 关闭时用默认 SVG
            const wantHammer = useHammerLogo;
            const isHammerNow = logo.dataset.hammerLogo === "true";
            const hasSvgLogo = logo.querySelectorAll('svg').length > 0;
            // 需要切换: (想用锤子但当前不是) 或 (不想用锤子但当前是锤子) 或 (默认 SVG 没替换过)
            if ((wantHammer && !isHammerNow) || (!wantHammer && (isHammerNow || (!logo.dataset.done || logo.querySelectorAll('path').length < 5)))) {
                if (wantHammer) {
                    logo.innerHTML = LOGO_HAMMER_IMG;
                    logo.dataset.hammerLogo = "true";
                } else {
                    logo.innerHTML = LOGO_SVG;
                    logo.dataset.hammerLogo = "false";
                }
                logo.dataset.done = "true";
            }
        }
        document.querySelectorAll('.woo-input-main').forEach(input => { if (input.placeholder) input.placeholder = ''; });
        // 设置按钮图标替换
        // 不能再用宽泛的 [class*="_wrap_pn2mr_"] 兜底选择器: 主题切换按钮也含该 class
        // (如 _wrap_pn2mr_34) 且 DOM 中常排在设置按钮前面, querySelector 会误命中它,
        // 导致齿轮图标被替换到主题按钮上、设置按钮反而保持原样。
        // 兜底选择器必须排除 夜间模式/日间模式 两个标题。
        const setBtn = document.querySelector('button[title="设置"], button[aria-label="设置"]') ||
            document.querySelector('button[class*="_wrap_pn2mr_"]:not([title="夜间模式"]):not([title="日间模式"]):not([class*="_aria_"])');
        // 用 viewBox 判断当前图标是否已是本脚本的替换件(14x14), 而非一次性 dataset.done:
        // React 重渲染可能把按钮图标恢复成原始 16x16, 一次性标志会阻止再次替换
        if (setBtn && !setBtn.querySelector('svg[viewBox="0 0 14 14"]')) {
            setBtn.innerHTML = SETTING_SVG;
        }

        // 替换主题切换按钮图标 (夜间模式→太阳, 日间模式→月亮, 见 syncThemeToggleIcon)
        syncThemeToggleIcon();

        // 顶部导航图标替换 (首页/推荐/视频/消息/用户头像, 见 syncNavIcons)
        syncNavIcons();
        document.querySelectorAll('img[src*="sinaimg.cn"]').forEach(img => {
            if (img.src.includes('/face/') || img.dataset.processed) return;
            const pattern = /\/(mw690|mw1024|mw2000|orj360|orj480|thumbnail)\//;
            if (pattern.test(img.src)) { img.src = img.src.replace(pattern, '/large/'); img.dataset.processed = "true"; }
        });
// 替换评论图标为新SVG（修正坐标+适配尺寸）
document.querySelectorAll('.woo-font.woo-font--comment._commentIcon_198pe_122').forEach(iconEl => {
    if (iconEl.dataset.svgReplaced) return; // 避免重复替换

    // 创建新SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.fill = 'currentColor'; // 继承原有颜色
    svg.style.flex = 'none';

    // 修正SVG路径（原坐标translate(-100,-255)，还原为0-32视口）
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M16,26 C14.832,26 13.704,25.864 12.62,25.633 L7.912,28.463 L7.975,23.824 C4.366,21.654 2,18.066 2,14 C2,7.373 8.268,2 16,2 C23.732,2 30,7.373 30,14 C30,20.628 23.732,26 16,26 L16,26 Z M16,0 C7.164,0 0,6.269 0,14 C0,18.419 2.345,22.354 6,24.919 L6,32 L13.009,27.747 C13.979,27.907 14.977,28 16,28 C24.836,28 32,21.732 32,14 C32,6.269 24.836,0 16,0 L16,0 Z');
    path.style.fill = 'currentColor';
    svg.appendChild(path);

    // 替换图标内容
    iconEl.innerHTML = '';
    iconEl.appendChild(svg);
    iconEl.dataset.svgReplaced = 'true';
});
        injectNewBackTop();
        removeTvBanner();
        removeDuplicateExtras();
        removeUserPageBar();
    }

    // ======= 5. 信息流默认展示全部微博 (不再自动切到"最新微博") =======
    // 需求: 去掉"切到显示所有微博"开关, 直接默认展示所有微博, 不再自动切换信息流。

    const observer = new MutationObserver(fixEverything);
    // 必须同时监听 title / data-theme 属性变化: 微博切换主题时可能只改属性(如按钮 title、
    // html 的 data-theme), 若只监听 childList, 切换后 fixEverything 不重跑,
    // 图标会停留在上一次的状态, 表现为"按钮一直卡在太阳/月亮"
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['title', 'data-theme'] });
    // 兜底: 若微博用纯 class 切换暗色模式(观察器无法低成本覆盖), 定时同步保证图标最终正确
    setInterval(syncThemeToggleIcon, 1000);
    // 兜底: SPA 路由切换(如 首页 -> /tv/home -> /u/{uid})会重渲染导航, 观察器可能错过时机,
    // 定时重扫保证导航图标最终正确 (syncNavIcons 幂等, 重复调用安全)
    setInterval(syncNavIcons, 1000);
    setInterval(removeTvBanner, 1000);
    setInterval(removeDuplicateExtras, 1000);
    setInterval(removeUserPageBar, 1000);
    window.addEventListener('DOMContentLoaded', fixEverything);

    // ======= 4. 一次性布局诊断（定位 _full_1l406_ 居中失败根因）=======
    // 在 DevTools Console 查看 [MWCA] 开头的日志，定位父级链中宽度不对的层级
    let _mwcaDiagDone = false;
    function diagnoseLayout() {
        if (_mwcaDiagDone) return;
        const content = document.querySelector('[class*="_full_1l406_"]');
        if (!content) return;
        // 等内容流里有真实可见的卡片再诊断，避免误测空白骨架
        if (content.offsetHeight < 100) return;
        _mwcaDiagDone = true;

        const cr = content.getBoundingClientRect();
        console.log('%c=== [MWCA] 布局诊断 ===', 'color:#E6162D;font-weight:bold;font-size:14px');
        console.log('[MWCA] viewport width =', window.innerWidth);
        console.log('[MWCA] content rect =', {
            left: cr.left.toFixed(1), top: cr.top.toFixed(1),
            width: cr.width.toFixed(1), height: cr.height.toFixed(1),
            expected_left_if_centered: ((window.innerWidth - cr.width) / 2).toFixed(1),
            offset_from_true_center: (cr.left - (window.innerWidth - cr.width) / 2).toFixed(1)
        });

        console.log('%c--- 父级链 (从 content.parentElement 起, 最多 10 层) ---', 'color:#0066cc');
        let el = content.parentElement;
        let depth = 0;
        while (el && depth < 10 && el !== document.documentElement) {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            console.log(
                `%c[${depth}]%c ${el.tagName} .${(el.className || '').toString().substring(0, 120)}`,
                'color:#999', 'color:#333',
                `w=${r.width.toFixed(0)} h=${r.height.toFixed(0)} left=${r.left.toFixed(0)} top=${r.top.toFixed(0)}`,
                `| display=${cs.display} pos=${cs.position} justify=${cs.justifyContent} flexDir=${cs.flexDirection}`,
                `padding=${cs.padding} margin=${cs.margin} width=${cs.width}`
            );
            el = el.parentElement;
            depth++;
        }

        console.log('%c--- content 的兄弟节点 (同一父级下的所有 children) ---', 'color:#0066cc');
        const parent = content.parentElement;
        if (parent) {
            Array.from(parent.children).forEach((sib, i) => {
                const r = sib.getBoundingClientRect();
                const cs = getComputedStyle(sib);
                console.log(
                    `  [${i}] ${sib.tagName}.${(sib.className || '').toString().substring(0, 80)}`,
                    `w=${r.width.toFixed(0)} h=${r.height.toFixed(0)} left=${r.left.toFixed(0)}`,
                    `| display=${cs.display} visibility=${cs.visibility} opacity=${cs.opacity} flexBasis=${cs.flexBasis}`
                );
            });
        }
        console.log('%c=== [MWCA] 诊断结束 ===', 'color:#E6162D;font-weight:bold');
    }
    // 多次尝试，确保能等到内容流渲染完成
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(diagnoseLayout, 1500);
        setTimeout(diagnoseLayout, 3000);
        setTimeout(diagnoseLayout, 6000);
    });

    // ======= 6. sidebar 极简诊断 (定位真实父级链) =======
    function diagnoseSidebar() {
        try {
            const sb = document.querySelector('[class*="_side_1ubn9_"]');
            if (!sb || sb.offsetHeight < 50) return;
            console.log('=== MWCA sidebar diag ===');
            console.log('sidebar width:', sb.getBoundingClientRect().width);
            let el = sb.parentElement;
            let depth = 0;
            while (el && depth < 8 && el !== document.documentElement) {
                const r = el.getBoundingClientRect();
                const cs = getComputedStyle(el);
                console.log(depth, el.tagName + ' .' + (el.className || '').toString().substring(0, 60), 'w=' + Math.round(r.width), 'display=' + cs.display, 'justify=' + cs.justifyContent, 'flexDir=' + cs.flexDirection);
                el = el.parentElement;
                depth++;
            }
            console.log('=== MWCA sidebar diag end ===');
        } catch(e) { console.error('[MWCA] sidebar diag error:', e); }
    }
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(diagnoseSidebar, 2000);
        setTimeout(diagnoseSidebar, 4000);
    });
})();
