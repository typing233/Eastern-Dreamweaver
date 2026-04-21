import json
from config import Config

class StoryGenerator:
    def __init__(self):
        self.default_client = None
        self._init_default_client()
    
    def _init_default_client(self):
        if Config.DEEPSEEK_API_KEY:
            self.default_client = Config.get_api_client()
    
    def _get_client(self, api_key: str = None, base_url: str = None):
        if api_key:
            return Config.get_api_client(api_key, base_url)
        return self.default_client
    
    def _build_prompt(self, elements: list, style: str = "fairy_tale") -> str:
        element_names = ", ".join([e["name"] for e in elements])
        
        style_prompt = {
            "fairy_tale": "童话风格，充满奇幻色彩，语言优美动人，适合青少年阅读",
            "wuxia": "武侠风格，充满侠肝义胆，快意恩仇，语言潇洒飘逸"
        }
        
        prompt = f"""你是一位才华横溢的国风故事创作者。请基于以下元素创作一个精彩的短故事：

【元素】：{element_names}

【要求】：
1. 故事风格：{style_prompt.get(style, style_prompt["fairy_tale"])}
2. 故事字数：{Config.STORY_MIN_WORDS}-{Config.STORY_MAX_WORDS}字
3. 必须将所有元素自然地融入故事情节中
4. 故事要有完整的开端、发展和结局
5. 语言要优美，富有画面感，适合青少年阅读
6. 不要直接罗列元素，要让元素成为故事的有机组成部分

请直接输出故事内容，不要任何额外的说明或标题。"""
        
        return prompt
    
    def _build_image_prompt(self, story: str, elements: list) -> str:
        element_names = ", ".join([e["name"] for e in elements])
        
        prompt = f"""请根据以下故事内容，创作一幅中国传统线稿风格的插图：

【故事】：{story[:500]}...

【关键元素】：{element_names}

【风格要求】：
1. 中国传统线稿（白描）风格，简洁优雅
2. 线条流畅，具有中国画的韵味
3. 画面要有故事感，能够体现故事的核心场景
4. 黑白线条，不需要上色
5. 适合作为青少年读物的插图

请用中文描述这幅插图的画面内容，描述要详细具体，让AI画师能够准确理解你的意图。"""
        
        return prompt
    
    def generate_story(self, elements: list, style: str = "fairy_tale", 
                       api_key: str = None, base_url: str = None) -> dict:
        client = self._get_client(api_key, base_url)
        
        if not client:
            return {
                "success": False,
                "error": "Deepseek API密钥未配置，请在页面配置API密钥"
            }
        
        if len(elements) < Config.MIN_ELEMENTS or len(elements) > Config.MAX_ELEMENTS:
            return {
                "success": False,
                "error": f"请选择{Config.MIN_ELEMENTS}-{Config.MAX_ELEMENTS}个元素"
            }
        
        try:
            prompt = self._build_prompt(elements, style)
            
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "你是一位才华横溢的国风故事创作者，擅长将中国传统文化元素融入精彩的故事创作中。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=800
            )
            
            story = response.choices[0].message.content.strip()
            
            image_prompt = self._build_image_prompt(story, elements)
            
            image_response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "你是一位专业的中国画师，擅长创作中国传统线稿插图。"},
                    {"role": "user", "content": image_prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            image_description = image_response.choices[0].message.content.strip()
            
            return {
                "success": True,
                "story": story,
                "image_description": image_description,
                "elements": elements,
                "style": style
            }
            
        except Exception as e:
            error_msg = str(e)
            if "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
                return {
                    "success": False,
                    "error": "API密钥无效，请检查您的Deepseek API密钥是否正确"
                }
            return {
                "success": False,
                "error": f"生成故事时发生错误: {error_msg}"
            }
