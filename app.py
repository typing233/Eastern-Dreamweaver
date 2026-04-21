from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from config import Config
from data.elements import ELEMENTS
from services.story_generator import StoryGenerator

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')
CORS(app)

story_generator = StoryGenerator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/elements', methods=['GET'])
def get_elements():
    return jsonify({
        "success": True,
        "data": ELEMENTS
    })

@app.route('/api/generate', methods=['POST'])
def generate_story():
    data = request.get_json()
    
    if not data or 'elements' not in data:
        return jsonify({
            "success": False,
            "error": "请提供元素列表"
        }), 400
    
    selected_elements = data.get('elements', [])
    style = data.get('style', 'fairy_tale')
    
    if len(selected_elements) < Config.MIN_ELEMENTS or len(selected_elements) > Config.MAX_ELEMENTS:
        return jsonify({
            "success": False,
            "error": f"请选择{Config.MIN_ELEMENTS}-{Config.MAX_ELEMENTS}个元素"
        }), 400
    
    all_items = []
    for category in ELEMENTS.values():
        all_items.extend(category['items'])
    
    elements_map = {item['id']: item for item in all_items}
    
    selected_items = []
    for elem_id in selected_elements:
        if elem_id in elements_map:
            selected_items.append(elements_map[elem_id])
    
    result = story_generator.generate_story(selected_items, style)
    
    return jsonify(result)

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify({
        "success": True,
        "data": {
            "min_elements": Config.MIN_ELEMENTS,
            "max_elements": Config.MAX_ELEMENTS,
            "api_configured": bool(Config.DEEPSEEK_API_KEY)
        }
    })

if __name__ == '__main__':
    print(f"🚀 国风造梦平台启动中...")
    print(f"📚 元素数量: {sum(len(cat['items']) for cat in ELEMENTS.values())} 个")
    print(f"🎯 选择范围: {Config.MIN_ELEMENTS}-{Config.MAX_ELEMENTS} 个元素")
    print(f"🔑 API状态: {'已配置' if Config.DEEPSEEK_API_KEY else '未配置'}")
    print(f"🌐 访问地址: http://localhost:{Config.PORT}")
    print("="*50)
    
    app.run(
        host='0.0.0.0',
        port=Config.PORT,
        debug=True
    )
