# 国风造梦 - AI国风共创平台

专为青少年设计的AI国风共创平台，只需简单点击选择传统文化元素，即可在5分钟内零门槛生成专属的国风故事与连环画。

## ✨ 项目特点

- **零门槛操作**：无需登录，打开即用，即用即走
- **丰富元素**：神话人物、传统物件、场景、神兽、意境五大分类
- **AI智能创作**：集成Deepseek大模型，智能生成连贯故事
- **双风格选择**：支持童话奇幻和武侠江湖两种故事风格
- **一键分享**：支持一键复制文本和截图保存功能
- **国风设计**：采用中国传统配色和字体，沉浸式体验

## 🎯 核心功能

1. **元素选择**：点击卡片勾选3-5个感兴趣的元素
2. **风格切换**：选择童话奇幻或武侠江湖风格
3. **一键造梦**：点击"造梦"按钮，AI自动生成故事和插图
4. **故事阅读**：查看生成的300字左右的精彩故事
5. **作品保存**：一键复制文本或截图保存分享

## 📁 项目结构

```
Eastern-Dreamweaver/
├── app.py                    # Flask主应用入口
├── config.py                 # 配置管理
├── requirements.txt          # Python依赖包
├── .env.example              # 环境变量示例
├── README.md                 # 项目说明文档
├── data/
│   └── elements.py           # 传统文化元素数据
├── services/
│   └── story_generator.py    # 故事生成服务
├── templates/
│   └── index.html            # 前端页面模板
└── static/
    ├── css/
    │   └── style.css         # 样式文件
    └── js/
        └── app.js            # 前端交互逻辑
```

## 🚀 快速开始

### 环境要求

- Python 3.8+
- pip 包管理器

### 安装步骤

1. **克隆项目**
```bash
cd Eastern-Dreamweaver
```

2. **创建虚拟环境（可选但推荐）**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows
```

3. **安装依赖**
```bash
pip install -r requirements.txt
```

4. **配置API密钥（两种方式）**

### 方式一：在前端页面配置（推荐）
启动应用后，在页面上点击"API密钥配置"区域展开配置面板，输入您的Deepseek API密钥并保存。密钥会保存在您的浏览器本地存储中，不会上传到服务器。

### 方式二：在环境变量中配置
复制环境变量示例文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的Deepseek API密钥：
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
PORT=8787
```

> 💡 获取API密钥：访问 [Deepseek开放平台](https://platform.deepseek.com/) 注册并获取API密钥
> 
> 🔒 安全提示：前端配置的密钥仅保存在本地浏览器，环境变量配置的密钥保存在服务器端，请根据您的使用场景选择合适的配置方式

5. **启动应用**
```bash
python app.py
```

6. **访问应用**

打开浏览器访问：`http://localhost:8787`

## 🎮 使用指南

1. **配置API密钥**（首次使用）：
   - 点击页面上的"API密钥配置"区域展开配置面板
   - 输入您的Deepseek API密钥
   - （可选）输入自定义API接口地址
   - 点击"保存配置"按钮，密钥会保存在浏览器本地存储中

2. **选择元素**：在页面上点击你感兴趣的文化元素卡片（需要选择3-5个）
3. **选择风格**：在下拉框中选择"童话奇幻"或"武侠江湖"
4. **开始创作**：点击"✨ 造梦 ✨"按钮
5. **等待生成**：AI会在约10秒内生成故事和插图
6. **保存分享**：使用"复制文本"或"保存截图"按钮保存你的作品

## 🔧 配置说明

### 环境变量配置（服务器端）
| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| DEEPSEEK_API_KEY | Deepseek API密钥（可选，也可在前端配置） | 空 |
| DEEPSEEK_BASE_URL | API接口地址 | https://api.deepseek.com |
| PORT | 服务端口 | 8787 |
| MIN_ELEMENTS | 最少选择元素数 | 3 |
| MAX_ELEMENTS | 最多选择元素数 | 5 |

### 前端配置（推荐）
在页面上直接配置，密钥保存在浏览器本地存储：
- **API密钥**：您的Deepseek API密钥
- **接口地址**：（可选）自定义API接口地址，默认使用官方地址

## 📝 API接口

### 获取元素列表
```
GET /api/elements
```

返回所有可用的文化元素分类和项目。

### 生成故事
```
POST /api/generate
Content-Type: application/json

{
    "elements": ["mulan", "shadow_puppet", "great_wall"],
    "style": "fairy_tale",
    "api_key": "your_api_key_here",
    "base_url": "https://api.deepseek.com"
}
```

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| elements | array | 是 | 选中的元素ID列表（3-5个） |
| style | string | 否 | 故事风格：fairy_tale（童话）或 wuxia（武侠） |
| api_key | string | 否 | Deepseek API密钥（如果未在环境变量配置则必需） |
| base_url | string | 否 | 自定义API接口地址 |

### 获取配置
```
GET /api/config
```

返回应用配置信息。

## 🎨 技术栈

- **后端**：Python Flask
- **AI模型**：Deepseek API
- **前端**：原生 HTML/CSS/JavaScript
- **样式**：中国传统配色 + Google Fonts (Noto Serif SC, Ma Shan Zheng)

## 📋 开发说明

### 端口冲突处理

应用默认使用 `8787` 端口，如果端口被占用，可以通过以下方式修改：

1. 修改 `.env` 文件中的 `PORT` 配置
2. 或直接修改 `config.py` 中的默认端口值

### 添加新元素

在 `data/elements.py` 文件中添加新的文化元素：

```python
"category_key": {
    "name": "分类名称",
    "icon": "图标emoji",
    "items": [
        {"id": "唯一标识", "name": "元素名称", "description": "元素描述"},
    ]
}
```

## ⚠️ 注意事项

1. **API密钥安全**：
   - 前端配置的密钥仅保存在浏览器本地存储，关闭浏览器后仍会保留
   - 请勿将包含真实API密钥的 `.env` 文件提交到代码仓库
   - 使用公共设备时，使用后建议清除配置

2. **网络连接**：需要稳定的网络连接才能调用AI服务

3. **使用限制**：请遵守Deepseek API的使用条款和速率限制

4. **内容审核**：AI生成内容可能需要人工审核，确保适合青少年阅读

5. **优先级说明**：前端配置的API密钥优先级高于环境变量配置

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

本项目仅供学习和非商业用途使用。

## 📧 联系方式

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至项目维护者

---

🌟 让传统文化在AI时代焕发新光彩！
