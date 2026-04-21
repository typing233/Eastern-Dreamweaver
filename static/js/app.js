class GuoFengDreamer {
    constructor() {
        this.selectedElements = new Set();
        this.minElements = 3;
        this.maxElements = 5;
        this.currentStory = '';
        this.currentImageDescription = '';
        this.apiKey = '';
        this.baseUrl = '';
        this.backendApiConfigured = false;
        this.init();
    }

    init() {
        this.loadConfig();
        this.loadApiConfig();
        this.loadElements();
        this.bindEvents();
    }

    loadApiConfig() {
        const savedKey = localStorage.getItem('guofeng_api_key');
        const savedUrl = localStorage.getItem('guofeng_base_url');
        
        if (savedKey) {
            this.apiKey = savedKey;
            document.getElementById('apiKeyInput').value = savedKey;
        }
        if (savedUrl) {
            this.baseUrl = savedUrl;
            document.getElementById('baseUrlInput').value = savedUrl;
        }
        
        this.updateApiStatus();
    }

    updateApiStatus() {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (this.apiKey) {
            statusDot.classList.add('configured');
            statusText.classList.add('configured');
            statusText.textContent = 'API密钥已配置（本地）';
        } else if (this.backendApiConfigured) {
            statusDot.classList.add('configured');
            statusText.classList.add('configured');
            statusText.textContent = 'API密钥已配置（服务器）';
        } else {
            statusDot.classList.remove('configured');
            statusText.classList.remove('configured');
            statusText.textContent = '未配置API密钥';
        }
    }

    toggleApiConfig(event) {
        if (event) {
            event.stopPropagation();
        }
        
        const content = document.getElementById('apiConfigContent');
        const toggleBtn = document.getElementById('toggleApiConfig');
        
        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'flex';
            toggleBtn.textContent = '收起配置';
        } else {
            content.style.display = 'none';
            toggleBtn.textContent = '展开配置';
        }
    }

    toggleKeyVisibility() {
        const input = document.getElementById('apiKeyInput');
        const btn = document.getElementById('toggleKeyVisibility');
        
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
        } else {
            input.type = 'password';
            btn.textContent = '👁️';
        }
    }

    saveApiConfig() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        const baseUrl = document.getElementById('baseUrlInput').value.trim();
        
        if (!apiKey) {
            this.showToast('请输入API密钥', 'error');
            return;
        }
        
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        
        localStorage.setItem('guofeng_api_key', apiKey);
        if (baseUrl) {
            localStorage.setItem('guofeng_base_url', baseUrl);
        } else {
            localStorage.removeItem('guofeng_base_url');
        }
        
        this.updateApiStatus();
        this.showToast('✅ API密钥配置已成功保存！', 'success');
    }

    clearApiConfig() {
        this.apiKey = '';
        this.baseUrl = '';
        
        localStorage.removeItem('guofeng_api_key');
        localStorage.removeItem('guofeng_base_url');
        
        document.getElementById('apiKeyInput').value = '';
        document.getElementById('baseUrlInput').value = '';
        
        this.updateApiStatus();
        this.showToast('🗑️ API配置已清除', 'info');
    }

    async loadConfig() {
        try {
            const response = await fetch('/api/config');
            const data = await response.json();
            if (data.success) {
                this.minElements = data.data.min_elements;
                this.maxElements = data.data.max_elements;
                this.backendApiConfigured = data.data.api_configured;
                document.getElementById('maxElements').textContent = this.maxElements;
                
                if (!this.apiKey) {
                    this.updateApiStatus();
                }
            }
        } catch (error) {
            console.error('加载配置失败:', error);
        }
    }

    async loadElements() {
        try {
            const response = await fetch('/api/elements');
            const data = await response.json();
            if (data.success) {
                this.renderElements(data.data);
            }
        } catch (error) {
            console.error('加载元素失败:', error);
            this.showToast('加载元素失败，请刷新页面重试', 'error');
        }
    }

    renderElements(elements) {
        const container = document.getElementById('categoriesContainer');
        container.innerHTML = '';

        Object.entries(elements).forEach(([key, category]) => {
            const section = document.createElement('div');
            section.className = 'category-section';
            section.innerHTML = `
                <div class="category-header">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-name">${category.name}</span>
                </div>
                <div class="category-items" id="category-${key}">
                </div>
            `;
            container.appendChild(section);

            const itemsContainer = document.getElementById(`category-${key}`);
            category.items.forEach(item => {
                const itemCard = document.createElement('div');
                itemCard.className = 'item-card';
                itemCard.dataset.id = item.id;
                itemCard.dataset.name = item.name;
                itemCard.dataset.description = item.description;
                itemCard.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    <div class="item-desc">${item.description}</div>
                `;
                itemCard.addEventListener('click', () => this.toggleElement(itemCard));
                itemsContainer.appendChild(itemCard);
            });
        });
    }

    toggleElement(itemCard) {
        const id = itemCard.dataset.id;
        
        if (this.selectedElements.has(id)) {
            this.selectedElements.delete(id);
            itemCard.classList.remove('selected');
        } else {
            if (this.selectedElements.size >= this.maxElements) {
                this.showToast(`最多只能选择${this.maxElements}个元素`, 'error');
                return;
            }
            this.selectedElements.add(id);
            itemCard.classList.add('selected');
        }

        this.updateSelectionStatus();
    }

    updateSelectionStatus() {
        const count = this.selectedElements.size;
        document.getElementById('selectedCount').textContent = count;
        
        const dreamBtn = document.getElementById('dreamBtn');
        const clearBtn = document.getElementById('clearBtn');
        
        if (count >= this.minElements && count <= this.maxElements) {
            dreamBtn.disabled = false;
        } else {
            dreamBtn.disabled = true;
        }

        clearBtn.style.display = count > 0 ? 'inline-block' : 'none';
    }

    clearSelection() {
        this.selectedElements.clear();
        document.querySelectorAll('.item-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateSelectionStatus();
    }

    async generateStory() {
        if (this.selectedElements.size < this.minElements) {
            this.showToast(`请至少选择${this.minElements}个元素`, 'error');
            return;
        }

        const style = document.getElementById('styleSelect').value;
        
        this.showResultSection();
        this.showLoading();

        try {
            const requestBody = {
                elements: Array.from(this.selectedElements),
                style: style
            };
            
            if (this.apiKey) {
                requestBody.api_key = this.apiKey;
            }
            if (this.baseUrl) {
                requestBody.base_url = this.baseUrl;
            }
            
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.success) {
                this.currentStory = data.story;
                this.currentImageDescription = data.image_description;
                this.renderStory(data.story);
                this.renderIllustration(data.image_description);
                this.hideLoading();
            } else {
                throw new Error(data.error || '生成失败');
            }
        } catch (error) {
            console.error('生成故事失败:', error);
            this.hideLoading();
            this.showError(error.message);
        }
    }

    showResultSection() {
        document.getElementById('selectionSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';
    }

    showSelectionSection() {
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('selectionSection').style.display = 'block';
        this.clearSelection();
    }

    showLoading() {
        document.getElementById('storyLoading').style.display = 'flex';
        document.getElementById('illustrationLoading').style.display = 'flex';
        document.getElementById('storyText').querySelectorAll('p').forEach(p => p.remove());
        document.getElementById('illustrationDisplay').style.display = 'none';
        
        const oldDesc = document.querySelector('.illustration-description');
        if (oldDesc) {
            oldDesc.remove();
        }
    }

    hideLoading() {
        document.getElementById('storyLoading').style.display = 'none';
        document.getElementById('illustrationLoading').style.display = 'none';
    }

    renderStory(story) {
        const storyText = document.getElementById('storyText');
        const paragraphs = story.split('\n').filter(p => p.trim());
        
        paragraphs.forEach(para => {
            const p = document.createElement('p');
            p.textContent = para;
            storyText.appendChild(p);
        });
    }

    renderIllustration(description) {
        const illustrationDisplay = document.getElementById('illustrationDisplay');
        const illustrationArea = document.getElementById('illustrationArea');
        
        illustrationDisplay.innerHTML = '';
        illustrationDisplay.style.display = 'flex';
        
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '400px';
        
        this.drawLineArt(canvas, description);
        
        illustrationDisplay.appendChild(canvas);
        
        const descDiv = document.createElement('div');
        descDiv.className = 'illustration-description';
        descDiv.textContent = `插画描述：${description}`;
        illustrationArea.appendChild(descDiv);
    }

    drawLineArt(canvas, description) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.fillStyle = '#FFF8DC';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = '#2C1810';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        this.drawMountains(ctx, width, height);
        this.drawClouds(ctx, width, height);
        this.drawTrees(ctx, width, height);
        this.drawCentralFigure(ctx, width, height);
        this.drawDecorativePatterns(ctx, width, height);
    }

    drawMountains(ctx, width, height) {
        ctx.beginPath();
        ctx.moveTo(0, height * 0.7);
        
        for (let x = 0; x <= width; x += 50) {
            const y = height * 0.6 + Math.sin(x * 0.01) * 50 + Math.random() * 20;
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawClouds(ctx, width, height) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = 'rgba(44, 24, 16, 0.3)';
        ctx.lineWidth = 1;
        
        const cloudPositions = [
            { x: width * 0.2, y: height * 0.15 },
            { x: width * 0.6, y: height * 0.1 },
            { x: width * 0.85, y: height * 0.2 }
        ];
        
        cloudPositions.forEach(pos => {
            this.drawCloud(ctx, pos.x, pos.y, 80 + Math.random() * 40);
        });
    }

    drawCloud(ctx, x, y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
        ctx.arc(x + size * 0.8, y, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    drawTrees(ctx, width, height) {
        const treePositions = [
            { x: width * 0.1, y: height * 0.65 },
            { x: width * 0.9, y: height * 0.62 },
            { x: width * 0.15, y: height * 0.75 },
            { x: width * 0.85, y: height * 0.78 }
        ];
        
        treePositions.forEach(pos => {
            this.drawPineTree(ctx, pos.x, pos.y, 60 + Math.random() * 40);
        });
    }

    drawPineTree(ctx, x, y, height) {
        ctx.strokeStyle = '#2C1810';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - height * 0.4);
        ctx.stroke();
        
        for (let i = 0; i < 3; i++) {
            const layerY = y - height * 0.3 - i * height * 0.2;
            const layerWidth = height * 0.3 * (1 - i * 0.2);
            
            ctx.beginPath();
            ctx.moveTo(x, layerY - height * 0.15);
            ctx.lineTo(x - layerWidth, layerY);
            ctx.lineTo(x + layerWidth, layerY);
            ctx.closePath();
            ctx.stroke();
        }
    }

    drawCentralFigure(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height * 0.6;
        
        ctx.strokeStyle = '#2C1810';
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY - 60, 25, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 35);
        ctx.lineTo(centerX, centerY + 40);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX - 35, centerY + 20);
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX + 35, centerY + 20);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 40);
        ctx.lineTo(centerX - 25, centerY + 100);
        ctx.moveTo(centerX, centerY + 40);
        ctx.lineTo(centerX + 25, centerY + 100);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY + 20);
        ctx.quadraticCurveTo(centerX - 60, centerY - 20, centerX - 30, centerY - 50);
        ctx.stroke();
    }

    drawDecorativePatterns(ctx, width, height) {
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const x = width * 0.5 + Math.cos(angle) * 150;
            const y = height * 0.3 + Math.sin(angle) * 50;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        const birdPositions = [
            { x: width * 0.3, y: height * 0.12 },
            { x: width * 0.35, y: height * 0.15 },
            { x: width * 0.7, y: height * 0.08 }
        ];
        
        birdPositions.forEach(pos => {
            this.drawBird(ctx, pos.x, pos.y);
        });
    }

    drawBird(ctx, x, y) {
        ctx.strokeStyle = '#2C1810';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.quadraticCurveTo(x, y - 5, x + 10, y);
        ctx.stroke();
    }

    showError(message) {
        const storyText = document.getElementById('storyText');
        storyText.innerHTML = `<p style="color: var(--error-color); text-align: center; text-indent: 0;">
            ❌ ${message}<br><br>
            <small>请检查API密钥配置或网络连接</small>
        </p>`;
        
        const illustrationDisplay = document.getElementById('illustrationDisplay');
        illustrationDisplay.innerHTML = `<p style="color: var(--error-color); text-align: center;">
            插画生成失败
        </p>`;
        illustrationDisplay.style.display = 'flex';
    }

    async copyStory() {
        if (!this.currentStory) {
            this.showToast('没有可复制的内容', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(this.currentStory);
            this.showToast('故事已复制到剪贴板', 'success');
        } catch (error) {
            this.showToast('复制失败，请手动复制', 'error');
        }
    }

    async saveScreenshot() {
        try {
            const storyCard = document.getElementById('storyCard');
            
            const canvas = document.createElement('canvas');
            const rect = storyCard.getBoundingClientRect();
            canvas.width = rect.width * 2;
            canvas.height = rect.height * 2;
            const ctx = canvas.getContext('2d');
            
            ctx.scale(2, 2);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, rect.width, rect.height);
            
            ctx.fillStyle = '#2C1810';
            ctx.font = 'bold 24px "Noto Serif SC", serif';
            ctx.fillText('国风造梦 - 我的专属故事', 20, 40);
            
            ctx.fillStyle = '#6B5344';
            ctx.font = '14px "Noto Serif SC", serif';
            ctx.fillText(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 20, 65);
            
            let y = 100;
            
            if (this.currentStory) {
                ctx.fillStyle = '#2C1810';
                ctx.font = '16px "Noto Serif SC", serif';
                
                const paragraphs = this.currentStory.split('\n').filter(p => p.trim());
                
                paragraphs.forEach(para => {
                    const words = para.split('');
                    let line = '';
                    const maxWidth = rect.width - 40;
                    
                    words.forEach(word => {
                        const testLine = line + word;
                        const metrics = ctx.measureText(testLine);
                        
                        if (metrics.width > maxWidth && line !== '') {
                            ctx.fillText(line, 30, y);
                            line = word;
                            y += 28;
                        } else {
                            line = testLine;
                        }
                    });
                    
                    if (line) {
                        ctx.fillText(line, 30, y);
                        y += 28;
                    }
                    y += 10;
                });
            }
            
            if (this.currentImageDescription) {
                y += 20;
                ctx.fillStyle = '#6B5344';
                ctx.font = 'italic 14px "Noto Serif SC", serif';
                ctx.fillText(`插画意境: ${this.currentImageDescription.substring(0, 80)}...`, 20, y);
            }
            
            const link = document.createElement('a');
            link.download = `国风故事_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            this.showToast('截图已保存', 'success');
        } catch (error) {
            console.error('截图保存失败:', error);
            this.showToast('截图保存失败，请使用系统截图功能', 'error');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    bindEvents() {
        document.getElementById('dreamBtn').addEventListener('click', () => this.generateStory());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearSelection());
        document.getElementById('backBtn').addEventListener('click', () => this.showSelectionSection());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyStory());
        document.getElementById('screenshotBtn').addEventListener('click', () => this.saveScreenshot());
        
        document.getElementById('toggleApiConfig').addEventListener('click', (e) => this.toggleApiConfig(e));
        document.getElementById('apiConfigHeader').addEventListener('click', (e) => {
            if (e.target.id === 'apiConfigHeader' || 
                e.target.classList.contains('config-icon') || 
                e.target.classList.contains('config-title')) {
                this.toggleApiConfig(e);
            }
        });
        document.getElementById('saveApiConfig').addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveApiConfig();
        });
        document.getElementById('clearApiConfig').addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearApiConfig();
        });
        document.getElementById('toggleKeyVisibility').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleKeyVisibility();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GuoFengDreamer();
});
