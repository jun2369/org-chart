# 组织架构图应用 (Organization Chart)

一个动态、可编辑、可扩展的组织架构图应用，使用 React + TypeScript 开发。

## 功能特性

- ✅ **动态组织架构图** - 数据驱动，实时更新
- ✅ **节点编辑** - 支持编辑姓名、职位、部门、备注等信息
- ✅ **添加节点** - 支持添加同级节点（Sibling）和子节点（Child）
- ✅ **删除节点** - 支持删除节点（带确认提示）
- ✅ **数据持久化** - 使用 localStorage 自动保存数据
- ✅ **美观的UI** - 现代化的界面设计，清晰的层级展示

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 构建生产版本

```bash
npm run build
```

### 部署到 Vercel

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 [Vercel](https://vercel.com) 导入项目
3. Vercel 会自动检测 Vite 项目并使用 `vercel.json` 配置
4. 部署完成后即可访问

或者使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

## 使用说明

1. **查看组织架构** - 页面加载后会自动显示组织架构图
2. **选中节点** - 点击任意节点即可选中
3. **添加同级节点** - 选中节点后，点击 "+" 按钮
4. **添加子节点** - 选中节点后，点击 "⬇" 按钮
5. **编辑节点** - 选中节点后，点击 "✎" 按钮
6. **删除节点** - 选中节点后，点击 "×" 按钮（会弹出确认提示）
7. **展开/折叠** - 点击节点下方的展开/折叠按钮

## 技术栈

- React 18
- TypeScript
- Vite
- CSS3

## 项目结构

```
src/
├── components/          # React 组件
│   ├── OrgChart.tsx    # 主组织架构图组件
│   ├── OrgNodeComponent.tsx  # 节点组件
│   └── NodeEditForm.tsx      # 编辑表单组件
├── types.ts            # TypeScript 类型定义
├── utils/              # 工具函数
│   └── storage.ts      # 数据存储和操作函数
├── data/               # 初始数据
│   └── initialData.ts  # 初始组织架构数据
└── App.tsx             # 主应用组件
```

## 数据格式

组织架构数据使用树形结构存储：

```typescript
interface OrgNode {
  id: string;
  name: string;
  position: string;
  department?: string;
  notes?: string;
  children?: OrgNode[];
}
```

数据会自动保存到浏览器的 localStorage 中。

