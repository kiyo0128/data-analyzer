// 詳細分析JavaScript
// 作成日: 2025-01-12

// グローバル変数
let analysisData = null;
let selectedXColumn = null;
let selectedYColumn = null;
let correlationMatrix = null;
let regressionResults = null;
let currentTab = 'scatter';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadAnalysisData();
    initializeEventListeners();
});

// 分析データの読み込み
function loadAnalysisData() {
    const dataStr = localStorage.getItem('detailedAnalysisData');
    
    if (!dataStr) {
        alert('分析データが見つかりません。複数カラム分析ページに戻ります。');
        window.location.href = 'multi-column-analysis.html';
        return;
    }
    
    try {
        analysisData = JSON.parse(dataStr);
        correlationMatrix = analysisData.correlationMatrix;
        
        // データセット情報を表示
        const datasetInfo = document.getElementById('datasetInfo');
        datasetInfo.textContent = `データセット: ${analysisData.fileName} (${analysisData.data.length.toLocaleString()} 行)`;
        
        // カラム選択UIを初期化
        initializeColumnSelection();
        
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        alert('データの読み込みに失敗しました。');
        window.location.href = 'multi-column-analysis.html';
    }
}

// イベントリスナーの初期化
function initializeEventListeners() {
    // カラム選択の変更イベント
    document.getElementById('xColumnSelect').addEventListener('change', updateColumnSelection);
    document.getElementById('yColumnSelect').addEventListener('change', updateColumnSelection);
}

// カラム選択UIの初期化
function initializeColumnSelection() {
    if (!analysisData || !analysisData.selectedColumns) {
        return;
    }
    
    const xSelect = document.getElementById('xColumnSelect');
    const ySelect = document.getElementById('yColumnSelect');
    
    // 既存のオプションをクリア
    xSelect.innerHTML = '<option value="">カラムを選択してください</option>';
    ySelect.innerHTML = '<option value="">カラムを選択してください</option>';
    
    // 選択されたカラムを追加
    analysisData.selectedColumns.forEach(column => {
        const optionX = document.createElement('option');
        const optionY = document.createElement('option');
        
        optionX.value = column;
        optionX.textContent = column;
        optionY.value = column;
        optionY.textContent = column;
        
        xSelect.appendChild(optionX);
        ySelect.appendChild(optionY);
    });
}

// カラム選択の更新
function updateColumnSelection() {
    const xColumn = document.getElementById('xColumnSelect').value;
    const yColumn = document.getElementById('yColumnSelect').value;
    
    selectedXColumn = xColumn;
    selectedYColumn = yColumn;
    
    const analyzeButton = document.getElementById('analyzeButton');
    const correlationInfo = document.getElementById('correlationInfo');
    const correlationValue = document.getElementById('correlationValue');
    
    if (xColumn && yColumn && xColumn !== yColumn) {
        // 相関係数を表示
        if (correlationMatrix && correlationMatrix[xColumn] && correlationMatrix[xColumn][yColumn] !== undefined) {
            const correlation = correlationMatrix[xColumn][yColumn];
            correlationValue.textContent = correlation.toFixed(4);
            correlationInfo.classList.remove('hidden');
        }
        
        // 分析ボタンを有効化
        analyzeButton.disabled = false;
    } else {
        // 分析ボタンを無効化
        analyzeButton.disabled = true;
        correlationInfo.classList.add('hidden');
    }
}

// 詳細分析の実行
async function runDetailedAnalysis() {
    if (!selectedXColumn || !selectedYColumn) {
        alert('X軸とY軸の両方を選択してください。');
        return;
    }
    
    if (selectedXColumn === selectedYColumn) {
        alert('異なるカラムを選択してください。');
        return;
    }
    
    // ローディング表示
    showLoading(true);
    
    try {
        // データの前処理
        const processedData = preprocessData();
        
        // 回帰分析の実行
        regressionResults = performRegressionAnalysis(processedData);
        
        // 結果の表示
        await displayDetailedResults(processedData);
        
        // 解釈の生成
        generateInterpretation();
        
        // 追加分析オプションを表示
        document.getElementById('analysisOptionsSection').classList.remove('hidden');
        
    } catch (error) {
        console.error('分析エラー:', error);
        alert('分析処理中にエラーが発生しました。');
    } finally {
        showLoading(false);
    }
}

// データの前処理
function preprocessData() {
    const data = analysisData.data;
    
    // 有効なデータペアを抽出
    const validData = data
        .map(row => ({
            x: Number(row[selectedXColumn]),
            y: Number(row[selectedYColumn]),
            original: row
        }))
        .filter(pair => 
            !isNaN(pair.x) && 
            !isNaN(pair.y) && 
            isFinite(pair.x) && 
            isFinite(pair.y)
        );
    
    return validData;
}

// 回帰分析の実行
function performRegressionAnalysis(data) {
    const n = data.length;
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    
    // 基本統計量
    const xMean = xValues.reduce((a, b) => a + b, 0) / n;
    const yMean = yValues.reduce((a, b) => a + b, 0) / n;
    
    // 回帰係数の計算
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
        const dx = xValues[i] - xMean;
        const dy = yValues[i] - yMean;
        numerator += dx * dy;
        denominator += dx * dx;
    }
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    // 予測値と残差の計算
    const predicted = xValues.map(x => slope * x + intercept);
    const residuals = yValues.map((y, i) => y - predicted[i]);
    
    // 決定係数 (R²)
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = residuals.reduce((sum, r) => sum + r * r, 0);
    const rSquared = ssTotal === 0 ? 0 : 1 - (ssResidual / ssTotal);
    
    // 相関係数
    const correlation = Math.sqrt(rSquared) * (slope >= 0 ? 1 : -1);
    
    // 標準誤差
    const standardError = Math.sqrt(ssResidual / (n - 2));
    
    // t統計量（回帰係数の有意性検定）
    const slopeStandardError = standardError / Math.sqrt(denominator);
    const tStatistic = slope / slopeStandardError;
    const pValue = 2 * (1 - tDistribution(Math.abs(tStatistic), n - 2));
    
    return {
        n: n,
        slope: slope,
        intercept: intercept,
        rSquared: rSquared,
        correlation: correlation,
        standardError: standardError,
        tStatistic: tStatistic,
        pValue: pValue,
        predicted: predicted,
        residuals: residuals,
        xMean: xMean,
        yMean: yMean,
        xStd: Math.sqrt(xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0) / (n - 1)),
        yStd: Math.sqrt(yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0) / (n - 1))
    };
}

// t分布の累積分布関数（近似）
function tDistribution(t, df) {
    // 簡単な近似式を使用
    const x = t / Math.sqrt(df);
    const a = 1 + x * x / df;
    return 0.5 + Math.atan(x) / Math.PI * Math.pow(a, -df/2);
}

// 結果の表示
async function displayDetailedResults(data) {
    // 散布図の作成
    await createScatterPlot(data);
    
    // 回帰分析結果の表示
    displayRegressionResults();
    
    // 残差プロットの作成
    await createResidualsPlot(data);
    
    // 統計量の表示
    displayStatistics();
    
    // 結果セクションを表示
    document.getElementById('resultsSection').classList.remove('hidden');
}

// 散布図の作成
async function createScatterPlot(data) {
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    
    // 回帰直線用のデータ
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const xRange = [xMin, xMax];
    const yRange = xRange.map(x => regressionResults.slope * x + regressionResults.intercept);
    
    const traces = [
        // 散布図
        {
            x: xValues,
            y: yValues,
            mode: 'markers',
            type: 'scatter',
            name: 'データポイント',
            marker: {
                color: '#667eea',
                size: 8,
                opacity: 0.7,
                line: {
                    color: '#4f46e5',
                    width: 1
                }
            },
            hovertemplate: 
                `${selectedXColumn}: %{x}<br>` +
                `${selectedYColumn}: %{y}<br>` +
                '<extra></extra>'
        },
        // 回帰直線
        {
            x: xRange,
            y: yRange,
            mode: 'lines',
            type: 'scatter',
            name: `回帰直線 (R² = ${regressionResults.rSquared.toFixed(4)})`,
            line: {
                color: '#ef4444',
                width: 3
            },
            hovertemplate: 'y = %{y:.2f}<extra></extra>'
        }
    ];
    
    const layout = {
        title: {
            text: `${selectedXColumn} vs ${selectedYColumn}`,
            font: { size: 18, family: 'Inter, sans-serif' }
        },
        xaxis: {
            title: selectedXColumn,
            font: { family: 'Inter, sans-serif' }
        },
        yaxis: {
            title: selectedYColumn,
            font: { family: 'Inter, sans-serif' }
        },
        margin: { l: 60, r: 60, t: 80, b: 60 },
        font: { family: 'Inter, sans-serif' },
        showlegend: true,
        legend: {
            x: 0,
            y: 1,
            bgcolor: 'rgba(255, 255, 255, 0.8)'
        }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    await Plotly.newPlot('scatterContainer', traces, layout, config);
}

// 回帰分析結果の表示
function displayRegressionResults() {
    const container = document.getElementById('regressionContainer');
    
    const equation = `y = ${regressionResults.slope.toFixed(4)}x + ${regressionResults.intercept.toFixed(4)}`;
    const significance = regressionResults.pValue < 0.05 ? '有意' : '非有意';
    const significanceColor = regressionResults.pValue < 0.05 ? 'text-green-600' : 'text-red-600';
    
    container.innerHTML = `
        <div class="grid md:grid-cols-2 gap-8">
            <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-calculator mr-2 text-purple-600"></i>
                    回帰式
                </h4>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-2xl font-mono font-bold text-purple-800 mb-2">${equation}</div>
                    <div class="text-sm text-gray-600">
                        <div>傾き: ${regressionResults.slope.toFixed(6)}</div>
                        <div>切片: ${regressionResults.intercept.toFixed(6)}</div>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-bar mr-2 text-blue-600"></i>
                    適合度指標
                </h4>
                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span class="font-medium">決定係数 (R²)</span>
                        <span class="font-bold text-blue-800">${regressionResults.rSquared.toFixed(4)}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span class="font-medium">相関係数 (r)</span>
                        <span class="font-bold text-green-800">${regressionResults.correlation.toFixed(4)}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span class="font-medium">標準誤差</span>
                        <span class="font-bold text-orange-800">${regressionResults.standardError.toFixed(4)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-8 grid md:grid-cols-2 gap-8">
            <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-vial mr-2 text-red-600"></i>
                    有意性検定
                </h4>
                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium">t統計量</span>
                        <span class="font-bold">${regressionResults.tStatistic.toFixed(4)}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium">p値</span>
                        <span class="font-bold">${regressionResults.pValue.toExponential(4)}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium">結果 (α=0.05)</span>
                        <span class="font-bold ${significanceColor}">${significance}</span>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-info-circle mr-2 text-yellow-600"></i>
                    データサマリー
                </h4>
                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium">サンプル数</span>
                        <span class="font-bold">${regressionResults.n.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium">${selectedXColumn} 平均</span>
                        <span class="font-bold">${regressionResults.xMean.toFixed(4)}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium">${selectedYColumn} 平均</span>
                        <span class="font-bold">${regressionResults.yMean.toFixed(4)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 残差プロットの作成
async function createResidualsPlot(data) {
    const xValues = data.map(d => d.x);
    const residuals = regressionResults.residuals;
    const predicted = regressionResults.predicted;
    
    const traces = [
        // 残差 vs 予測値
        {
            x: predicted,
            y: residuals,
            mode: 'markers',
            type: 'scatter',
            name: '残差',
            marker: {
                color: '#10b981',
                size: 6,
                opacity: 0.7
            },
            hovertemplate: 
                '予測値: %{x:.2f}<br>' +
                '残差: %{y:.2f}<br>' +
                '<extra></extra>'
        },
        // ゼロライン
        {
            x: [Math.min(...predicted), Math.max(...predicted)],
            y: [0, 0],
            mode: 'lines',
            type: 'scatter',
            name: 'ゼロライン',
            line: {
                color: '#ef4444',
                width: 2,
                dash: 'dash'
            },
            showlegend: false
        }
    ];
    
    const layout = {
        title: {
            text: '残差プロット (予測値 vs 残差)',
            font: { size: 18, family: 'Inter, sans-serif' }
        },
        xaxis: {
            title: '予測値',
            font: { family: 'Inter, sans-serif' }
        },
        yaxis: {
            title: '残差',
            font: { family: 'Inter, sans-serif' }
        },
        margin: { l: 60, r: 60, t: 80, b: 60 },
        font: { family: 'Inter, sans-serif' }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    await Plotly.newPlot('residualsContainer', traces, layout, config);
}

// 統計量の表示
function displayStatistics() {
    const container = document.getElementById('statisticsContainer');
    
    // 残差の統計量を計算
    const residuals = regressionResults.residuals;
    const residualMean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const residualStd = Math.sqrt(residuals.reduce((sum, r) => sum + Math.pow(r - residualMean, 2), 0) / (residuals.length - 1));
    const residualMin = Math.min(...residuals);
    const residualMax = Math.max(...residuals);
    
    container.innerHTML = `
        <div class="grid md:grid-cols-2 gap-8">
            <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-line mr-2 text-purple-600"></i>
                    回帰統計
                </h4>
                <div class="overflow-x-auto">
                    <table class="min-w-full border-collapse border border-gray-300">
                        <tbody>
                            <tr class="bg-gray-50">
                                <td class="border border-gray-300 px-4 py-2 font-medium">決定係数 (R²)</td>
                                <td class="border border-gray-300 px-4 py-2">${regressionResults.rSquared.toFixed(6)}</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2 font-medium">調整済み決定係数</td>
                                <td class="border border-gray-300 px-4 py-2">${(1 - (1 - regressionResults.rSquared) * (regressionResults.n - 1) / (regressionResults.n - 2)).toFixed(6)}</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <td class="border border-gray-300 px-4 py-2 font-medium">標準誤差</td>
                                <td class="border border-gray-300 px-4 py-2">${regressionResults.standardError.toFixed(6)}</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2 font-medium">観測数</td>
                                <td class="border border-gray-300 px-4 py-2">${regressionResults.n}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-bar mr-2 text-green-600"></i>
                    残差統計
                </h4>
                <div class="overflow-x-auto">
                    <table class="min-w-full border-collapse border border-gray-300">
                        <tbody>
                            <tr class="bg-gray-50">
                                <td class="border border-gray-300 px-4 py-2 font-medium">平均</td>
                                <td class="border border-gray-300 px-4 py-2">${residualMean.toFixed(6)}</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2 font-medium">標準偏差</td>
                                <td class="border border-gray-300 px-4 py-2">${residualStd.toFixed(6)}</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <td class="border border-gray-300 px-4 py-2 font-medium">最小値</td>
                                <td class="border border-gray-300 px-4 py-2">${residualMin.toFixed(6)}</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2 font-medium">最大値</td>
                                <td class="border border-gray-300 px-4 py-2">${residualMax.toFixed(6)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// 解釈の生成
function generateInterpretation() {
    const container = document.getElementById('interpretationText');
    
    // 相関の強さを判定
    let correlationStrength = '';
    const absCorr = Math.abs(regressionResults.correlation);
    if (absCorr >= 0.8) correlationStrength = '非常に強い';
    else if (absCorr >= 0.6) correlationStrength = '強い';
    else if (absCorr >= 0.4) correlationStrength = '中程度の';
    else if (absCorr >= 0.2) correlationStrength = '弱い';
    else correlationStrength = '非常に弱い';
    
    const correlationDirection = regressionResults.correlation >= 0 ? '正の' : '負の';
    const significance = regressionResults.pValue < 0.05 ? '統計的に有意' : '統計的に非有意';
    const rSquaredPercent = (regressionResults.rSquared * 100).toFixed(1);
    
    container.innerHTML = `
        <div class="space-y-4">
            <h4 class="text-lg font-bold text-purple-800 flex items-center">
                <i class="fas fa-brain mr-2"></i>
                分析結果の解釈
            </h4>
            
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <h5 class="font-semibold text-gray-800 mb-2">📊 相関関係</h5>
                <p class="text-gray-700">
                    ${selectedXColumn}と${selectedYColumn}の間には
                    <strong class="text-purple-600">${correlationStrength}${correlationDirection}相関</strong>
                    (r = ${regressionResults.correlation.toFixed(4)})が見られます。
                </p>
            </div>
            
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <h5 class="font-semibold text-gray-800 mb-2">🎯 回帰分析結果</h5>
                <p class="text-gray-700">
                    線形回帰モデルは${selectedYColumn}の変動の<strong class="text-blue-600">${rSquaredPercent}%</strong>を説明しています。
                    この関係は<strong class="${regressionResults.pValue < 0.05 ? 'text-green-600' : 'text-red-600'}">${significance}</strong>
                    (p = ${regressionResults.pValue.toExponential(3)})です。
                </p>
            </div>
            
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <h5 class="font-semibold text-gray-800 mb-2">📈 実用的含意</h5>
                <p class="text-gray-700">
                    ${selectedXColumn}が1単位増加すると、${selectedYColumn}は平均的に
                    <strong class="text-orange-600">${regressionResults.slope.toFixed(4)}単位${regressionResults.slope >= 0 ? '増加' : '減少'}</strong>
                    することが予想されます。
                </p>
            </div>
            
            ${regressionResults.rSquared < 0.5 ? `
            <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <h5 class="font-semibold text-yellow-800 mb-2">⚠️ 注意事項</h5>
                <p class="text-yellow-700">
                    決定係数が50%未満のため、他の要因も${selectedYColumn}に大きく影響している可能性があります。
                    追加の変数や非線形関係の検討を推奨します。
                </p>
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('interpretationSection').classList.remove('hidden');
}

// タブの切り替え
function showTab(tabName) {
    // タブボタンの状態更新
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeButton = Array.from(tabButtons).find(btn => 
        btn.onclick.toString().includes(tabName)
    );
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // タブコンテンツの表示/非表示
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.add('hidden'));
    
    const targetTab = document.getElementById(`${tabName}Tab`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
    
    currentTab = tabName;
}

// プロットのダウンロード
function downloadPlot(plotType, format) {
    let containerId;
    let filename;
    
    switch (plotType) {
        case 'scatter':
            containerId = 'scatterContainer';
            filename = `scatter_${selectedXColumn}_vs_${selectedYColumn}.${format}`;
            break;
        case 'residuals':
            containerId = 'residualsContainer';
            filename = `residuals_${selectedXColumn}_vs_${selectedYColumn}.${format}`;
            break;
        default:
            return;
    }
    
    Plotly.downloadImage(containerId, {
        format: format,
        width: 1200,
        height: 800,
        filename: filename
    });
}

// 回帰結果のダウンロード
function downloadRegressionResults() {
    const results = {
        variables: {
            x: selectedXColumn,
            y: selectedYColumn
        },
        regression: {
            slope: regressionResults.slope,
            intercept: regressionResults.intercept,
            rSquared: regressionResults.rSquared,
            correlation: regressionResults.correlation,
            standardError: regressionResults.standardError,
            tStatistic: regressionResults.tStatistic,
            pValue: regressionResults.pValue,
            n: regressionResults.n
        },
        equation: `y = ${regressionResults.slope.toFixed(6)}x + ${regressionResults.intercept.toFixed(6)}`
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `regression_results_${selectedXColumn}_vs_${selectedYColumn}.json`;
    link.click();
}

// 統計量のダウンロード
function downloadStatistics() {
    const residuals = regressionResults.residuals;
    const residualMean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const residualStd = Math.sqrt(residuals.reduce((sum, r) => sum + Math.pow(r - residualMean, 2), 0) / (residuals.length - 1));
    
    let csv = '統計量,値\n';
    csv += `決定係数,${regressionResults.rSquared}\n`;
    csv += `調整済み決定係数,${1 - (1 - regressionResults.rSquared) * (regressionResults.n - 1) / (regressionResults.n - 2)}\n`;
    csv += `相関係数,${regressionResults.correlation}\n`;
    csv += `回帰係数,${regressionResults.slope}\n`;
    csv += `切片,${regressionResults.intercept}\n`;
    csv += `標準誤差,${regressionResults.standardError}\n`;
    csv += `t統計量,${regressionResults.tStatistic}\n`;
    csv += `p値,${regressionResults.pValue}\n`;
    csv += `観測数,${regressionResults.n}\n`;
    csv += `残差平均,${residualMean}\n`;
    csv += `残差標準偏差,${residualStd}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistics_${selectedXColumn}_vs_${selectedYColumn}.csv`;
    link.click();
}

// 追加分析オプション（プレースホルダー）
function runOutlierDetection() {
    alert('異常値検出機能は今後実装予定です。');
}

function runNormalityTest() {
    alert('正規性検定機能は今後実装予定です。');
}

function runBootstrapAnalysis() {
    alert('ブートストラップ分析機能は今後実装予定です。');
}

// ローディング表示/非表示
function showLoading(show) {
    const loadingSection = document.getElementById('loadingSection');
    if (show) {
        loadingSection.classList.remove('hidden');
    } else {
        loadingSection.classList.add('hidden');
    }
}

// ナビゲーション関数
function goBack() {
    window.history.back();
}

function goHome() {
    window.location.href = 'index.html';
}