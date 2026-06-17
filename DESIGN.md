# WCTV 重構 — 設計方向(P1)

融合 **wctv.com.tw(在地電信信任感)** + **tinp.net.tw(現代、留白、動效)**。

## 配色
| 用途 | 色 |
|---|---|
| 主色 Brand | `#1466E0` |
| 主色深 | `#0B4FB8` |
| 漸層輔(tinp 味) | `#6E8BFF` → `#1466E0` |
| CTA 暖橘 | `#FF7A45` |
| 文字/頁尾 深藏青 | `#0F1B2D` |
| 內文 | `#3A4658` / 次 `#7A8699` |
| 底 / 卡 | `#F5F7FB` / `#FFFFFF` |

## 字型
Inter(拉丁)+ Noto Sans TC(中文)。標題粗、內文細。

## 動效(真的會動,不是靜態)
- Navbar:捲動縮高 + 加陰影
- Hero:自動輪播(淡入切換、圓點、左右鍵、滑入暫停)
- 區塊:捲動淡入上移(IntersectionObserver)
- 數字:進入視窗跳動(count-up)
- 卡片:hover 上浮 + 陰影

## 版型 = 共用模板
navbar / footer / 基底 CSS+JS 全頁共用,只換中間內容(含文章)。P2 抽成 `partials/` + 3 行 JS include;對應 WordPress 的「範本部件 + 主題」。

## 首頁區塊(SEO/吸睛)
Hero 輪播 → 快捷列 → 服務方案(電視/寬頻/電路) → 特色 + 數據 → **最新消息(文章區)** → CTA → 頁尾。

> ponytail:圖片用 picsum 佔位,正式換自家;header/footer 先內嵌,P2 再抽共用片段。
