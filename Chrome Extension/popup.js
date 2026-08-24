'use strict';

const DEFAULTS = {
  mwca_show_sidebar: false,
  mwca_show_publish_card: true,
  mwca_use_hammer_logo: true
};

function reloadWeibo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) return;
    // 内容脚本仅在微博页注入, 收到消息后自行刷新; 无需 tabs 权限, 也无需读取 tab.url
    chrome.tabs.sendMessage(tab.id, { action: 'mwca_reload' }, () => {
      void chrome.runtime.lastError;
    });
  });
}

function load() {
  chrome.storage.local.get(DEFAULTS).then((stored) => {
    // 隐藏左侧栏开关: 开 = 隐藏 (showSidebar=false)
    document.getElementById('hideSidebar').checked = !stored.mwca_show_sidebar;
    // 隐藏发微博模块开关: 开 = 隐藏 (showPublishCard=false)
    document.getElementById('hidePublishCard').checked = !stored.mwca_show_publish_card;
    // 使用锤子系统微博图标开关: 开 = 锤子 (useHammerLogo=true)
    document.getElementById('useHammerLogo').checked = !!stored.mwca_use_hammer_logo;
  });
}

document.getElementById('hideSidebar').addEventListener('change', (e) => {
  chrome.storage.local.set({ mwca_show_sidebar: !e.target.checked }, reloadWeibo);
});
document.getElementById('hidePublishCard').addEventListener('change', (e) => {
  chrome.storage.local.set({ mwca_show_publish_card: !e.target.checked }, reloadWeibo);
});
document.getElementById('useHammerLogo').addEventListener('change', (e) => {
  chrome.storage.local.set({ mwca_use_hammer_logo: e.target.checked }, reloadWeibo);
});

load();
