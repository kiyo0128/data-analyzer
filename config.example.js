// 設定ファイルのテンプレート
// 作成日: 2025-01-07
// このファイルをconfig.jsにコピーして、APIキーを設定してください

const CONFIG = {
    // Gemini API設定
    GEMINI: {
        // ⚠️ ここにあなたのGemini APIキーを入力してください
        // Google AI Studio (https://aistudio.google.com/) で取得
        API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
        
        // API設定（通常は変更不要）
        BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        MAX_REQUESTS_PER_MINUTE: 60,
        TIMEOUT_MS: 30000,
        
        // モデル設定
        MODEL_CONFIG: {
            temperature: 0.1,        // 創造性（0.0-2.0）低いほど一貫性重視
            topK: 1,                 // 候補数制限
            topP: 0.8,               // 累積確率制限
            maxOutputTokens: 2048    // 最大出力トークン数
        },
        
        // セーフティ設定
        SAFETY_SETTINGS: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
    },
    
    // アプリケーション設定
    APP: {
        NAME: 'DataAnalyzer Pro',
        VERSION: '1.2.0',
        
        // デフォルト設定
        DEFAULT_INDUSTRY: '製造業',
        DEFAULT_DATA_TYPE: '品質データ',
        
        // UI設定
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 3000
    },
    
    // 分析設定
    ANALYSIS: {
        // サンプルサイズ制限
        MAX_SAMPLE_SIZE: 100000,
        MIN_SAMPLE_SIZE: 3,
        
        // 相関分析の閾値
        CORRELATION_THRESHOLDS: {
            VERY_STRONG: 0.8,
            STRONG: 0.6,
            MODERATE: 0.4,
            WEAK: 0.2
        },
        
        // 工程能力分析の閾値
        PROCESS_CAPABILITY_THRESHOLDS: {
            EXCELLENT: 2.0,
            GOOD: 1.67,
            ADEQUATE: 1.33,
            MINIMUM: 1.0
        },
        
        // 異常値検出の設定
        OUTLIER_DETECTION: {
            IQR_MULTIPLIER: 1.5,
            Z_SCORE_THRESHOLD: 3.0,
            MODIFIED_Z_SCORE_THRESHOLD: 3.5,
            MAHALANOBIS_CONFIDENCE: 0.95
        }
    }
};

// 設定値の検証
function validateConfig() {
    if (!CONFIG.GEMINI.API_KEY || CONFIG.GEMINI.API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn('⚠️ Gemini APIキーが設定されていません。AI機能は無効になります。');
        return false;
    }
    
    if (!CONFIG.GEMINI.API_KEY.startsWith('AIza')) {
        console.warn('⚠️ Gemini APIキーの形式が正しくありません。');
        return false;
    }
    
    return true;
}

// 設定の初期化
function initializeConfig() {
    console.log(`🚀 ${CONFIG.APP.NAME} v${CONFIG.APP.VERSION} を初期化中...`);
    
    const isValid = validateConfig();
    
    if (isValid) {
        console.log('✅ 設定が正常に読み込まれました');
        console.log('🤖 AI機能が有効です');
    } else {
        console.log('ℹ️ 基本機能のみ利用可能です');
        console.log('💡 AI機能を使用するには config.js でAPIキーを設定してください');
    }
    
    return isValid;
}

// エクスポート
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.validateConfig = validateConfig;
    window.initializeConfig = initializeConfig;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, validateConfig, initializeConfig };
}