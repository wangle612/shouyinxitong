# 超市收银系统 - 需求拆解文档

## 产品概述

- **产品类型**: 超市收银系统（Web应用）
- **场景类型**: prototype - app
- **目标用户**: 超市收银员、超市管理人员
- **核心价值**: 提供简洁高效的网页版收银解决方案，支持手动输入商品编码快速完成结算
- **界面语言**: 中文
- **主题偏好**: light
- **导航模式**: 路径导航
- **导航布局**: Sidebar

---

## 页面结构总览

> **说明**：此表为页面生成的唯一数据源，包含所有页面（一级+二级）

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 收银台 | `CashierPage.tsx` | `/` | 一级 | 导航（默认页） |
| 商品管理 | `ProductsPage.tsx` | `/products` | 一级 | 导航 |
| 订单历史 | `OrdersPage.tsx` | `/orders` | 一级 | 导航 |

> **页面类型说明**：
> - **一级页面**：出现在导航中，用户可直接访问
> - **二级页面**：不在导航中，从一级页面跳转进入（本系统暂无二级页面）

---

## 导航配置

- **导航布局**: Sidebar（左侧固定导航）
- **导航项**（仅一级页面）:

| 导航文字 | 路由 | 图标 |
|---------|------|------|
| 收银台 | `/` | ShoppingCart |
| 商品管理 | `/products` | Package |
| 订单历史 | `/orders` | ClipboardList |

---

## 功能列表

### 收银台页面 (`CashierPage.tsx`)
- **页面目标**: 收银员快速录入商品、计算金额、完成收款结算
- **功能点**:
  - **商品编码录入**: 输入框支持手动输入商品编码，回车/点击添加商品到购物车
  - **商品信息自动填充**: 根据编码自动匹配商品名称、单价
  - **数量调整**: 购物车中商品数量增减（+/-按钮），支持删除商品
  - **实时金额计算**: 自动计算商品小计、合计金额、找零金额
  - **结算操作**: 输入实收金额，自动计算找零，确认收款并生成订单
  - **购物车清空**: 一键清空当前购物车，开始新订单

### 商品管理页面 (`ProductsPage.tsx`)
- **页面目标**: 管理商品基础信息（添加、编辑、删除商品）
- **功能点**:
  - **商品列表展示**: 表格展示所有商品（编码、名称、单价、单位、操作）
  - **新增商品**: 打开表单录入商品信息（编码、名称、单价、单位）
  - **编辑商品**: 修改已有商品信息
  - **删除商品**: 删除指定商品（需二次确认）
  - **商品搜索**: 按编码或名称搜索商品

### 订单历史页面 (`OrdersPage.tsx`)
- **页面目标**: 查看历史交易记录，支持对账和查询
- **功能点**:
  - **订单列表展示**: 表格展示历史订单（订单号、时间、商品数量、总金额）
  - **订单详情查看**: 查看单个订单的商品明细（商品名称、单价、数量、小计）
  - **时间筛选**: 按日期筛选订单
  - **订单搜索**: 按订单号搜索

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__global_cashier_products` | 商品基础信息列表，类型为 `IProduct[]` | 收银台、商品管理 |
| `__global_cashier_orders` | 历史订单列表，类型为 `IOrder[]` | 收银台、订单历史 |

```ts
interface IProduct {
  /** 商品编码（唯一标识） */
  code: string;
  /** 商品名称 */
  name: string;
  /** 单价（元） */
  price: number;
  /** 计量单位（如：个、斤、瓶） */
  unit: string;
}

interface ICartItem extends IProduct {
  /** 购买数量 */
  quantity: number;
  /** 小计金额 */
  subtotal: number;
}

interface IOrder {
  /** 订单号 */
  id: string;
  /** 订单创建时间戳 */
  timestamp: number;
  /** 订单商品列表 */
  items: ICartItem[];
  /** 商品总数 */
  totalCount: number;
  /** 订单总金额 */
  totalAmount: number;
  /** 实收金额 */
  receivedAmount: number;
  /** 找零金额 */
  changeAmount: number;
}
```

---

## 界面设计要点

- **收银台优先**: 默认进入收银台页面，界面布局以编码输入框和购物车为核心
- **操作便捷**: 收银台界面按钮尺寸适中，适合触屏或鼠标操作
- **实时反馈**: 金额计算实时更新，操作有明确视觉反馈
- **数据持久化**: 商品信息和订单历史使用 localStorage 本地存储

-------

# UI 设计指南

> **场景类型**: `prototype - app`（应用架构设计）
> **子场景类型**: `app`（多页面后台系统）
> **确认检查**: 本指南适用于超市收银系统，包含 Sidebar 导航、三个一级页面（收银台/商品管理/订单历史）。

> ℹ️ Section 1-2 为设计意图与决策上下文。Code agent 实现时以 Section 3 及之后的具体参数为准。

## 1. Design Archetype (设计原型)

### 1.1 内容理解
- **目标用户**: 超市收银员（一线操作人员，需快速直观操作）、超市管理人员（数据查看、商品维护）
- **使用场景**: 超市收银台环境，长时间站立操作，可能使用触屏或鼠标，光线环境多变
- **核心目的**: 高效完成收银结算、商品信息管理、订单历史查询
- **期望情绪**: 专业、高效、可靠、清晰可控
- **需避免的感受**: 混乱、廉价感、操作复杂、视觉疲劳

### 1.2 设计语言
- **Aesthetic Direction**: 专业高效的工具美学，高信息密度但层次分明，强调操作即时反馈
- **Visual Signature**: 
  1. 清晰的色彩分区与状态反馈（成功/警告/错误明确区分）
  2. 大按钮与触控友好设计（适合快速点击）
  3. 实时金额高亮显示（核心视觉锚点）
  4. 紧凑的数据列表布局（高信息密度）
  5. 网格对齐系统（数据清晰易扫描）
- **Emotional Tone**: 专业、高效、可信
- **Design Style**: **Grid 网格**（主）+ **Rounded 圆润几何**（辅）— 收银系统需秩序感与数据对齐，圆润元素降低工具冰冷感、增加操作亲和力
- **Application Type**: SaaS/Tool（后台工具类）

## 2. Design Principles (设计理念)
1. **效率优先**：减少操作步骤，高频功能（商品录入）一键可达，输入框自动聚焦
2. **清晰反馈**：金额变化实时高亮，操作结果即时视觉确认（添加成功、结算完成）
3. **容错设计**：删除操作需二次确认，金额计算防错机制，编码不存在时明确提示
4. **信息密度与呼吸感平衡**：列表紧凑展示数据，关键操作区保留充足留白
5. **跨输入设备适配**：按钮尺寸适合触屏（≥44px），同时优化鼠标操作体验

## 3. Color System (色彩系统)

> **App 场景配色规则**：基于产品定位自主设计完整配色体系，从品牌语义（专业、可信、高效）推导。

**配色设计理由**：选择青绿色系传递专业、冷静、高效的工具感，深青作为主色建立信任，明亮青绿作为强调色提供清晰的操作反馈，背景使用极浅灰保证长时间使用不疲劳。

### 3.1 主题颜色

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|-----|---------|----------------|--------|---------|
| bg | `--background` | `bg-background` | `hsl(180 20% 98%)` | 极浅青灰，长时间使用不疲劳 |
| surface | `--card` | `bg-card` | `hsl(0 0% 100%)` | 纯白卡片，内容区分明 |
| text | `--foreground` | `text-foreground` | `hsl(180 25% 15%)` | 深青近黑，高可读性 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | `hsl(180 10% 45%)` | 中灰青，次级信息 |
| primary | `--primary` | `bg-primary` | `hsl(175 60% 35%)` | 深青绿，主操作/品牌色 |
| primary-foreground | `--primary-foreground` | `text-primary-foreground` | `hsl(0 0% 100%)` | 纯白，主按钮文字 |
| accent | `--accent` | `bg-accent` | `hsl(175 65% 95%)` | 极浅青绿，hover/focus状态背景 |
| accent-foreground | `--accent-foreground` | `text-accent-foreground` | `hsl(175 60% 25%)` | 深青，accent区域文字 |
| border | `--border` | `border-border` | `hsl(180 15% 90%)` | 浅灰青，边框分隔 |
| muted | `--muted` | `bg-muted` | `hsl(180 15% 95%)` | 禁用态/次级背景 |

### 3.2 Sidebar 颜色（Sidebar 导航专用）

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|-----|---------|----------------|--------|---------|
| sidebar | `--sidebar` | `bg-sidebar` | `hsl(180 25% 12%)` | 深色青灰，导航基底 |
| sidebar-foreground | `--sidebar-foreground` | `text-sidebar-foreground` | `hsl(0 0% 95%)` | 近白文字，对比度充足 |
| sidebar-primary | `--sidebar-primary` | `bg-sidebar-primary` | `hsl(175 60% 40%)` | 激活态，明亮青绿 |
| sidebar-primary-foreground | `--sidebar-primary-foreground` | `text-sidebar-primary-foreground` | `hsl(0 0% 100%)` | 激活态文字 |
| sidebar-accent | `--sidebar-accent` | `bg-sidebar-accent` | `hsl(180 20% 20%)` | hover态，比背景稍亮 |
| sidebar-accent-foreground | `--sidebar-accent-foreground` | `text-sidebar-accent-foreground` | `hsl(0 0% 95%)` | hover态文字 |
| sidebar-border | `--sidebar-border` | `border-sidebar-border` | `hsl(180 20% 22%)` | 微妙边框，不突兀 |
| sidebar-ring | `--sidebar-ring` | `ring-sidebar-ring` | `hsl(175 60% 50%)` | 聚焦环，明亮青绿 |

### 3.3 语义颜色（状态反馈）

| 用途 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|-----|---------|----------------|--------|---------|
| success | `--success` | `text-success` / `bg-success` | `hsl(142 71% 45%)` | 成功/收款完成，翠绿 |
| success-foreground | `--success-foreground` | `text-success-foreground` | `hsl(0 0% 100%)` | 成功色上文字 |
| warning | `--warning` | `text-warning` / `bg-warning` | `hsl(38 92% 50%)` | 警告/注意，琥珀橙 |
| warning-foreground | `--warning-foreground` | `text-warning-foreground` | `hsl(0 0% 100%)` | 警告色上文字 |
| destructive | `--destructive` | `text-destructive` / `bg-destructive` | `hsl(0 72% 51%)` | 删除/错误，警示红 |
| destructive-foreground | `--destructive-foreground` | `text-destructive-foreground` | `hsl(0 0% 100%)` | 错误色上文字 |

## 4. Typography (字体排版)

- **Heading**: Inter / 思源黑体 / system-ui, -apple-system, sans-serif
- **Body**: Inter / 思源黑体 / system-ui, -apple-system, sans-serif
- **数字专用**: "SF Mono", "Monaco", "Inconsolata", monospace（金额对齐）
- **字体导入**: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

## 5. Global Layout Structure (全局布局结构)

### 5.1 Navigation Strategy (导航策略)
- **导航类型**: Sidebar（左侧固定，200-240px 宽度）
- **导航项**: 收银台（默认页 `/`）、商品管理（`/products`）、订单历史（`/orders`）
- **Sidebar 行为**: 始终可见（非折叠式），移动端可折叠或隐藏

### 5.2 Page Content Zones (页面区块配置)

**Standard Content Zone（全页面统一）**:
- **Maximum Width**: `max-w-[1400px]`（收银台需较宽空间展示购物车与结算区）
- **Padding**: `px-6 py-6`（桌面端），`px-4 py-4`（移动端）
- **Alignment**: `mx-auto`（内容区居中，但受限于 max-w）
- **Vertical Spacing**: `gap-6`（区块间距），`space-y-4`（内部元素间距）

**页面布局模式**:

| 页面 | 布局策略 | 说明 |
|-----|---------|-----|
| **收银台** | 左右分栏（桌面）/ 上下堆叠（移动） | 左侧 2/3：商品录入+购物车；右侧 1/3：金额汇总+结算 |
| **商品管理** | 全宽表格 + 顶部操作栏 | 搜索框 + 新增按钮置顶，下方表格展示 |
| **订单历史** | 全宽表格 + 顶部筛选 | 日期筛选 + 搜索，表格展示，可展开行查看详情 |

## 6. Visual Effects & Motion (视觉效果与动效)

- **圆角**: 
  - 卡片: `rounded-lg` (8px)
  - 按钮: `rounded-md` (6px)
  - Pill/标签: `rounded-full`
  - 输入框: `rounded-md` (6px)
- **阴影**: 
  - 卡片: `shadow-sm`
  - 悬浮/模态: `shadow-md` / `shadow-lg`
  - Sidebar: `shadow-none`（依靠颜色区分）
- **缓动函数**: `cubic-bezier(0.4, 0, 0.2, 1)`（标准 ease）
- **关键动效**:
  1. **商品添加**: 购物车列表项 `slideIn` 0.2s 入场
  2. **金额更新**: 数字变化时 `pulse` 微闪烁 0.3s 高亮
  3. **按钮交互**: Hover 时 `scale(1.02)` + 背景色过渡 0.15s
  4. **页面切换**: 内容区 `fadeIn` 0.2s（无布局偏移）

## 7. Components (组件指南)

### Sidebar 导航
- **背景**: `bg-sidebar` (hsl 180 25% 12%)
- **宽度**: `w-60` (240px)
- **导航项**: 
  - 默认: `text-sidebar-foreground` + `hover:bg-sidebar-accent`
  - 激活: `bg-sidebar-primary` + `text-sidebar-primary-foreground` + 左侧 3px 白色竖线（`border-l-4 border-white`）
- **图标**: 20px，与文字 `gap-3`
- **内边距**: `px-4 py-3`

### Buttons
- **Primary（结算/确认）**: `bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2.5 font-medium`
- **Secondary（添加/编辑）**: `bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2`
- **Ghost（取消）**: `bg-transparent text-foreground hover:bg-accent rounded-md px-4 py-2`
- **Destructive（删除）**: `bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md px-4 py-2`
- **尺寸**: 最小高度 40px（触屏友好），重要操作按钮 44-48px

### Form Elements
- **输入框**: `bg-card border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary`
- **商品编码输入框（特殊）**: 更大字号 `text-lg`，自动聚焦，placeholder 使用 `text-muted-foreground`
- **Placeholder**: `text-muted-foreground`

### Cards
- **容器卡片**: `bg-card rounded-lg border border-border shadow-sm p-6`
- **列表项卡片**: `bg-card rounded-md border border-border p-4 hover:shadow-sm transition-shadow`

### Tables
- **表头**: `bg-muted font-medium text-foreground text-sm`
- **单元格**: `text-sm py-3 px-4`
- **行**: `border-b border-border last:border-0 hover:bg-accent/50`
- **操作列**: 图标按钮组，紧凑排列

### Data Display（收银台专用）
- **金额大数字**: `text-4xl font-bold text-foreground font-mono`（等宽字体对齐）
- **金额标签**: `text-sm text-muted-foreground uppercase tracking-wide`
- **购物车项**: 左右布局，左侧商品信息（名称+单价），右侧数量控制+小计+删除

### Dialog / Modal
- **遮罩**: `bg-black/50 backdrop-blur-sm`
- **容器**: `bg-card rounded-lg shadow-lg max-w-md`
- **头部**: `border-b border-border pb-4`
- **底部操作**: `flex justify-end gap-3 pt-4`

### Skeleton（加载态）
- **背景**: `bg-muted animate-pulse rounded-md`

## 8. Flexibility Note (灵活性说明)

> **一致性优先原则**：三个页面必须使用相同的最大宽度、容器边距、圆角、阴影风格，确保设计语言统一。
>
> **允许的微调范围**（code agent 可自行判断）：
> - 响应式断点适配（移动端边距减小、布局堆叠）
> - 页面内部局部间距（如表格行高、卡片内边距）
> - 特定组件独立样式（如 Dialog 的 max-width）
>
> **禁止的随意变更**：
> - ❌ 不同页面使用不同的最大宽度
> - ❌ 不同页面使用不同的圆角/阴影风格
> - ❌ 不同页面使用不同的主色调或 Sidebar 样式

## 9. Signature & Constraints (设计签名与禁区)

### DO (视觉签名)
1. **Sidebar 激活态高对比**：`bg-primary` 背景 + 白色文字 + 左侧白色竖线指示
2. **金额数字等宽字体**：使用 monospace 确保金额位数变化时布局不抖动
3. **购物车实时高亮**：商品添加时绿色 `success` 色微闪烁反馈
4. **大按钮设计**：结算按钮高度 48px，字体加粗，确保远距离/触屏可操作
5. **网格对齐系统**：所有数据列表使用表格或 Grid 严格对齐，符合 Grid DNA

### DON'T (禁止做法)
- ❌ 使用紫色/粉色等休闲色调（需专业工具感）
- ❌ 收银台金额使用非等宽字体（导致数字跳动）
- ❌ 按钮高度小于 36px（不适合触屏/快速操作）
- ❌ 购物车商品项使用复杂卡片（应简洁列表行）
- ❌ 不同页面使用不同的导航样式或颜色方案

---

**通用约束**（所有场景共享）:
- ❌ 使用 Tailwind 预设色板（如 `bg-blue-500`）替代设计系统颜色
- ❌ 使用 `w-full` 让内容在大屏幕上无限延伸（使用 `max-w-[1400px]` 约束）
- ❌ 混用深浅背景（Sidebar 深色，内容区浅色，明确分区）
- ❌ 页面看起来不完整（每个页面必须有 Sidebar + 内容区结构）