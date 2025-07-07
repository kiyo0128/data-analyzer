// Gemini API統合モジュール
// 作成日: 2025-01-07

class GeminiAnalysisService {
    constructor(apiKey = null) {
        // config.js からAPIキーを取得、引数で上書き可能
        this.apiKey = apiKey || (typeof CONFIG !== 'undefined' ? CONFIG.GEMINI.API_KEY : null);
        this.baseURL = typeof CONFIG !== 'undefined' ? CONFIG.GEMINI.BASE_URL : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.isEnabled = !!this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY_HERE';
        this.requestCount = 0;
        this.maxRequestsPerMinute = typeof CONFIG !== 'undefined' ? CONFIG.GEMINI.MAX_REQUESTS_PER_MINUTE : 60;
        
        // 設定をログ出力
        if (this.isEnabled) {
            console.log('🤖 Gemini AI service initialized with config API key');
        } else {
            console.log('ℹ️ Gemini AI service not available (API key not configured)');
        }
    }

    // API設定の確認
    isConfigured() {
        return this.isEnabled && this.apiKey;
    }

    // レート制限チェック
    checkRateLimit() {
        return this.requestCount < this.maxRequestsPerMinute;
    }

    // 基本的なAPI呼び出し
    async callGeminiAPI(prompt, retries = 3) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API key is not configured');
        }

        if (!this.checkRateLimit()) {
            throw new Error('Rate limit exceeded. Please wait a moment.');
        }

        const modelConfig = typeof CONFIG !== 'undefined' ? CONFIG.GEMINI.MODEL_CONFIG : {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 2048
        };
        
        const safetySettings = typeof CONFIG !== 'undefined' ? CONFIG.GEMINI.SAFETY_SETTINGS : [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ];

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                ...modelConfig,
                stopSequences: []
            },
            safetySettings: safetySettings
        };

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                this.requestCount++;
                
                const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
                }

                const data = await response.json();
                
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Invalid response format from Gemini API');
                }

            } catch (error) {
                console.error(`Gemini API attempt ${attempt + 1} failed:`, error);
                
                if (attempt === retries - 1) {
                    throw error;
                }
                
                // 指数バックオフで再試行
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    // 相関分析の AI 解釈
    async enhanceCorrelationInterpretation(correlationResult, xColumn, yColumn, context = {}) {
        const { industry = '製造業', dataType = '品質データ', sampleSize = 0 } = context;
        
        const prompt = `
あなたは統計分析の専門家です。以下の相関分析結果について、${industry}の${dataType}という観点から詳細な解釈と実践的な洞察を提供してください。

## 分析結果
- 変数1: ${xColumn}
- 変数2: ${yColumn}
- Pearson相関係数: ${correlationResult.pearsonR.toFixed(4)}
- Spearman相関係数: ${correlationResult.spearmanR.toFixed(4)}
- サンプル数: ${sampleSize}

## 回答要求
以下の観点から日本語で詳細に分析してください：

1. **ビジネス的な意味**: この相関関係が示す実務上の意味
2. **要因分析**: なぜこのような関係が生じるのかの考察
3. **実践的な活用法**: この関係をどのように業務改善に活用できるか
4. **注意点**: 因果関係との区別、他の要因の可能性
5. **次のステップ**: さらなる分析や調査の提案

回答は具体的で実行可能なアクションを含むようにしてください。`;

        try {
            const response = await this.callGeminiAPI(prompt);
            return this.formatAIResponse(response, 'correlation');
        } catch (error) {
            console.error('Gemini correlation interpretation failed:', error);
            return this.getFallbackMessage('相関分析');
        }
    }

    // 回帰分析の AI 解釈
    async enhanceRegressionInterpretation(regressionResult, xColumn, yColumn, context = {}) {
        const { industry = '製造業', dataType = '品質データ', sampleSize = 0 } = context;
        
        const prompt = `
あなたは統計分析の専門家です。以下の回帰分析結果について、${industry}の${dataType}という観点から詳細な解釈と実践的な洞察を提供してください。

## 分析結果
- 説明変数: ${xColumn}
- 目的変数: ${yColumn}
- 回帰式: y = ${regressionResult.slope.toFixed(4)}x + ${regressionResult.intercept.toFixed(4)}
- 決定係数: R² = ${regressionResult.rSquared.toFixed(4)}
- サンプル数: ${sampleSize}

## 回答要求
以下の観点から日本語で詳細に分析してください：

1. **予測モデルの評価**: このモデルの予測精度と信頼性
2. **傾きの解釈**: ${xColumn}の変化が${yColumn}に与える影響の実務的意味
3. **切片の意味**: 実際の業務における切片の解釈
4. **予測の活用法**: このモデルをどのように業務に活用できるか
5. **改善提案**: モデルの精度向上や追加で考慮すべき要因
6. **リスク評価**: 予測を使用する際の注意点

回答は具体的で実行可能なアクションを含むようにしてください。`;

        try {
            const response = await this.callGeminiAPI(prompt);
            return this.formatAIResponse(response, 'regression');
        } catch (error) {
            console.error('Gemini regression interpretation failed:', error);
            return this.getFallbackMessage('回帰分析');
        }
    }

    // 記述統計の AI 解釈
    async enhanceDescriptiveStatsInterpretation(stats, column, rawData, context = {}) {
        const { industry = '製造業', dataType = '品質データ' } = context;
        
        const dataRange = `${stats['最小値'].toFixed(2)}〜${stats['最大値'].toFixed(2)}`;
        const cv = ((stats['標準偏差'] / Math.abs(stats['平均'])) * 100).toFixed(1);
        
        const prompt = `
あなたは統計分析の専門家です。以下の記述統計結果について、${industry}の${dataType}という観点から詳細な解釈と実践的な洞察を提供してください。

## 分析対象
- 変数名: ${column}
- データ数: ${stats['データ数']}
- データ範囲: ${dataRange}

## 統計値
- 平均: ${stats['平均'].toFixed(4)}
- 中央値: ${stats['中央値'].toFixed(4)}
- 標準偏差: ${stats['標準偏差'].toFixed(4)}
- 変動係数: ${cv}%
- 歪度: ${stats['歪度'].toFixed(4)}
- 尖度: ${stats['尖度'].toFixed(4)}

## 回答要求
以下の観点から日本語で詳細に分析してください：

1. **データの特性評価**: この分布が示すプロセスの状態
2. **品質管理の観点**: 変動係数や分布形状から見る品質レベル
3. **管理基準の提案**: 具体的な管理限界や目標値の設定
4. **プロセス改善**: ばらつき削減や中心化のための具体策
5. **監視ポイント**: 継続的に監視すべき指標とその理由
6. **リスク分析**: 現在の分布から予想される品質リスク

回答は具体的で実行可能なアクションを含むようにしてください。`;

        try {
            const response = await this.callGeminiAPI(prompt);
            return this.formatAIResponse(response, 'descriptive');
        } catch (error) {
            console.error('Gemini descriptive stats interpretation failed:', error);
            return this.getFallbackMessage('記述統計');
        }
    }

    // 工程能力分析の AI 解釈
    async enhanceProcessCapabilityInterpretation(cp, cpk, context = {}) {
        const { industry = '製造業', processName = '製造工程', usl, lsl } = context;
        
        const prompt = `
あなたは品質管理の専門家です。以下の工程能力分析結果について、${industry}の${processName}という観点から詳細な解釈と実践的な改善策を提供してください。

## 工程能力分析結果
- Cp値: ${cp !== null ? cp.toFixed(4) : 'N/A'}
- Cpk値: ${cpk !== null ? cpk.toFixed(4) : 'N/A'}
- 上限規格値(USL): ${usl || 'N/A'}
- 下限規格値(LSL): ${lsl || 'N/A'}

## 回答要求
以下の観点から日本語で詳細に分析してください：

1. **工程評価**: 現在の工程能力の総合評価と業界基準との比較
2. **不良率予測**: 現在の能力指数から予想される不良率と品質コスト
3. **根本原因分析**: Cp・Cpkの値から読み取れる問題の所在
4. **具体的改善策**: 
   - 短期的な対策（中心調整、作業標準化など）
   - 中期的な改善（設備改良、教育訓練など）
   - 長期的な戦略（プロセス再設計など）
5. **優先順位**: 改善活動の実施順序と期待効果
6. **監視計画**: 継続的な工程能力監視の具体的方法

回答は実行可能で測定可能な改善計画を含むようにしてください。`;

        try {
            const response = await this.callGeminiAPI(prompt);
            return this.formatAIResponse(response, 'process_capability');
        } catch (error) {
            console.error('Gemini process capability interpretation failed:', error);
            return this.getFallbackMessage('工程能力分析');
        }
    }

    // 異常値検出の AI 解釈
    async enhanceOutlierInterpretation(outlierCount, totalCount, outlierData, context = {}) {
        const { industry = '製造業', processName = '製造工程', column = 'データ' } = context;
        const outlierRate = (outlierCount / totalCount * 100).toFixed(1);
        
        const prompt = `
あなたは品質管理とデータ分析の専門家です。以下の異常値検出結果について、${industry}の${processName}という観点から詳細な解釈と対策を提供してください。

## 異常値検出結果
- 対象変数: ${column}
- 総データ数: ${totalCount}
- 検出異常値数: ${outlierCount}
- 異常値率: ${outlierRate}%

## 回答要求
以下の観点から日本語で詳細に分析してください：

1. **異常値の評価**: この異常値率が示すプロセスの状態評価
2. **根本原因分析**: 異常値が発生する可能性のある要因（4M分析：人・機械・材料・方法）
3. **影響度評価**: 異常値が製品品質や工程に与える影響の程度
4. **緊急対策**: 即座に実施すべき対応策
5. **予防策**: 異常値発生を防ぐための仕組み作り
6. **監視体制**: 継続的な異常値監視の具体的方法
7. **改善優先度**: 対策の緊急度と重要度に基づく優先順位

回答は具体的で実行可能な対策を含み、製造現場で即座に活用できる内容としてください。`;

        try {
            const response = await this.callGeminiAPI(prompt);
            return this.formatAIResponse(response, 'outlier');
        } catch (error) {
            console.error('Gemini outlier interpretation failed:', error);
            return this.getFallbackMessage('異常値検出');
        }
    }

    // AI応答のフォーマット
    formatAIResponse(response, analysisType) {
        const formattedResponse = response
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^\d+\.\s/gm, '<br>$&')
            .replace(/^-\s/gm, '<br>• ');

        return `
            <div class="ai-interpretation bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-6 rounded-lg">
                <div class="flex items-center mb-4">
                    <div class="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-robot text-white text-sm"></i>
                    </div>
                    <h4 class="text-lg font-bold text-gray-800">🤖 AI詳細解釈</h4>
                    <span class="ml-auto text-xs text-gray-500">Powered by Gemini</span>
                </div>
                <div class="text-gray-700 leading-relaxed">
                    ${formattedResponse}
                </div>
                <div class="mt-4 pt-4 border-t border-purple-200">
                    <p class="text-xs text-gray-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        この解釈はAIによって生成されています。重要な判断を行う際は、専門家による確認を推奨します。
                    </p>
                </div>
            </div>
        `;
    }

    // フォールバック メッセージ
    getFallbackMessage(analysisType) {
        return `
            <div class="ai-interpretation-error bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                    <span class="text-yellow-800">AI詳細解釈は現在利用できません</span>
                </div>
                <p class="text-sm text-yellow-700 mt-2">
                    ${analysisType}の基本的な解釈は上記の通りです。AI機能が復旧次第、より詳細な解釈を提供いたします。
                </p>
            </div>
        `;
    }

    // 設定管理
    updateApiKey(newApiKey) {
        this.apiKey = newApiKey;
        this.isEnabled = !!newApiKey;
    }

    // 使用状況のリセット（1分ごとに呼び出し）
    resetRateLimit() {
        this.requestCount = 0;
    }

    // データコンテキストの生成
    generateContext(fileName, selectedColumns, dataSize, industry = '製造業') {
        return {
            fileName,
            selectedColumns,
            dataSize,
            industry,
            timestamp: new Date().toISOString()
        };
    }
}

// レート制限管理用のタイマー
let rateLimitTimer;

// Gemini サービスのグローバルインスタンス
let geminiService = null;

// 初期化関数
function initializeGeminiService(apiKey = null) {
    // config.js から自動初期化を試行
    geminiService = new GeminiAnalysisService(apiKey);
    
    if (geminiService.isConfigured()) {
        // レート制限リセットタイマー
        if (rateLimitTimer) {
            clearInterval(rateLimitTimer);
        }
        rateLimitTimer = setInterval(() => {
            if (geminiService) {
                geminiService.resetRateLimit();
            }
        }, 60000); // 1分ごと
        
        console.log('✅ Gemini AI service initialized successfully');
        return true;
    } else {
        console.log('ℹ️ Gemini AI service not available (configure API key in config.js)');
        return false;
    }
}

// 設定画面での API キー更新
function updateGeminiApiKey(apiKey) {
    if (geminiService) {
        geminiService.updateApiKey(apiKey);
    } else if (apiKey) {
        initializeGeminiService(apiKey);
    }
    
    // ローカルストレージに保存（セキュリティ注意：本番環境では適切な暗号化を）
    if (apiKey) {
        localStorage.setItem('gemini_api_key', btoa(apiKey)); // 簡易エンコード
    } else {
        localStorage.removeItem('gemini_api_key');
    }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // 設定を初期化
    if (typeof initializeConfig === 'function') {
        const configValid = initializeConfig();
        if (configValid) {
            // config.js からの自動初期化
            initializeGeminiService();
        }
    }
    
    // フォールバック: 保存されたAPIキーからの読み込み
    if (!geminiService || !geminiService.isConfigured()) {
        const savedApiKey = localStorage.getItem('gemini_api_key');
        if (savedApiKey) {
            try {
                const apiKey = atob(savedApiKey); // 簡易デコード
                initializeGeminiService(apiKey);
            } catch (error) {
                console.error('Failed to load saved API key:', error);
                localStorage.removeItem('gemini_api_key');
            }
        }
    }
});

// エクスポート（モジュール形式で使用する場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GeminiAnalysisService, initializeGeminiService, updateGeminiApiKey };
}