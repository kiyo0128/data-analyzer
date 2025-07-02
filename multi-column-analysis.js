// 複数カラム分析JavaScript
// 作成日: 2025-01-12

// グローバル変数
let analysisData = null;
let selectedColumns = [];
let correlationMatrix = null;
let currentTab = 'heatmap';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadAnalysisData();
    initializeEventListeners();
});

// 分析データの読み込み
function loadAnalysisData() {
    console.log('分析データの読み込み開始');
    
    const dataStr = localStorage.getItem('multiColumnAnalysisData');
    
    if (!dataStr) {
        console.error('分析データが見つかりません');
        alert('分析データが見つかりません。分析ページに戻ります。');
        window.location.href = 'analyzer.html';
        return;
    }
    
    try {
        analysisData = JSON.parse(dataStr);
        console.log('分析データ読み込み成功:', analysisData);
        
        if (!analysisData.data || !Array.isArray(analysisData.data) || analysisData.data.length === 0) {
            throw new Error('無効なデータ形式です');
        }
        
        // データセット情報を表示
        const datasetInfo = document.getElementById('datasetInfo');
        if (datasetInfo) {
            datasetInfo.textContent = `データセット: ${analysisData.fileName} (${analysisData.data.length.toLocaleString()} 行)`;
        }
        
        // カラム選択UIを初期化
        initializeColumnSelection();
        
        console.log('初期化完了');
        
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        alert(`データの読み込みに失敗しました: ${error.message}`);
        window.location.href = 'analyzer.html';
    }
}

// イベントリスナーの初期化
function initializeEventListeners() {
    // チェックボックスの変更イベント（動的に追加されるため、delegateを使用）
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('column-checkbox')) {
            updateSelectedColumns();
        }
    });
}

// カラム選択UIの初期化
function initializeColumnSelection() {
    console.log('カラム選択UI初期化開始');
    
    if (!analysisData || !analysisData.data || analysisData.data.length === 0) {
        console.error('分析データが無効です');
        return;
    }
    
    const columns = Object.keys(analysisData.data[0]);
    console.log('全カラム:', columns);
    
    // 数値カラムの検出を改善
    const numericColumns = columns.filter(col => {
        // サンプルデータで数値かどうかチェック
        const sampleSize = Math.min(10, analysisData.data.length);
        let numericCount = 0;
        
        for (let i = 0; i < sampleSize; i++) {
            const value = analysisData.data[i][col];
            if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
                numericCount++;
            }
        }
        
        // サンプルの70%以上が数値なら数値カラムとみなす
        return numericCount / sampleSize >= 0.7;
    });
    
    console.log('数値カラム:', numericColumns);
    
    if (numericColumns.length < 2) {
        alert('複数カラム分析には最低2つの数値カラムが必要です。');
        window.location.href = 'analyzer.html';
        return;
    }
    
    const columnSelection = document.getElementById('columnSelection');
    if (!columnSelection) {
        console.error('columnSelection要素が見つかりません');
        return;
    }
    
    columnSelection.innerHTML = '';
    
    numericColumns.forEach((column, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `col_${column}`;
        checkbox.value = column;
        checkbox.className = 'column-checkbox h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded';
        
        // デフォルトで最初の3-4個のカラムを選択
        if (index < Math.min(4, numericColumns.length)) {
            checkbox.checked = true;
        }
        
        const label = document.createElement('label');
        label.htmlFor = `col_${column}`;
        label.className = 'column-label ml-3 p-3 rounded-lg cursor-pointer transition-all flex-1 border border-gray-200 hover:border-purple-300';
        
        // データサンプルの統計を表示
        const values = analysisData.data.map(row => Number(row[column])).filter(v => !isNaN(v));
        const min = Math.min(...values);
        const max = Math.max(...values);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        
        label.innerHTML = `
            <div class="font-medium text-gray-800">${column}</div>
            <div class="text-sm text-gray-500">
                範囲: ${min.toFixed(2)} - ${max.toFixed(2)}, 平均: ${mean.toFixed(2)}
            </div>
        `;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        columnSelection.appendChild(div);
    });
    
    updateSelectedColumns();
    console.log('カラム選択UI初期化完了');
}

// 選択されたカラムの更新
function updateSelectedColumns() {
    const checkboxes = document.querySelectorAll('.column-checkbox:checked');
    selectedColumns = Array.from(checkboxes).map(cb => cb.value);
    
    // 選択数の表示
    const selectedCount = document.getElementById('selectedCount');
    selectedCount.textContent = `選択済み: ${selectedColumns.length}個`;
    
    // 分析オプションセクションの表示/非表示
    const analysisOptionsSection = document.getElementById('analysisOptionsSection');
    if (selectedColumns.length >= 2) {
        analysisOptionsSection.classList.remove('hidden');
    } else {
        analysisOptionsSection.classList.add('hidden');
    }
}

// 全カラム選択
function selectAllColumns() {
    const checkboxes = document.querySelectorAll('.column-checkbox');
    checkboxes.forEach(cb => cb.checked = true);
    updateSelectedColumns();
}

// 全カラム選択解除
function clearAllColumns() {
    const checkboxes = document.querySelectorAll('.column-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    updateSelectedColumns();
}

// 複数カラム分析の実行
async function runMultiColumnAnalysis() {
    console.log('複数カラム分析実行開始', selectedColumns);
    
    if (selectedColumns.length < 2) {
        alert('最低2つのカラムを選択してください。');
        return;
    }
    
    if (selectedColumns.length > 10) {
        const proceed = confirm(`選択されたカラムが多すぎます (${selectedColumns.length}個)。\n処理に時間がかかる可能性がありますが、続行しますか？\n推奨は3-8個です。`);
        if (!proceed) {
            return;
        }
    }
    
    // ローディング表示
    showLoading(true);
    
    try {
        // 相関計算方法と欠損値処理方法を取得
        const correlationMethodElement = document.querySelector('input[name="correlationMethod"]:checked');
        const missingValueMethodElement = document.querySelector('input[name="missingValueMethod"]:checked');
        
        const correlationMethod = correlationMethodElement ? correlationMethodElement.value : 'pearson';
        const missingValueMethod = missingValueMethodElement ? missingValueMethodElement.value : 'pairwise';
        
        console.log('分析パラメータ:', { correlationMethod, missingValueMethod });
        
        // データの前処理
        console.log('データ前処理開始');
        const processedData = preprocessDataForCorrelation(analysisData.data, selectedColumns, missingValueMethod);
        console.log('前処理済みデータ行数:', processedData.length);
        
        if (processedData.length < 2) {
            throw new Error('前処理後のデータが不足しています。欠損値処理設定を変更してください。');
        }
        
        // 相関行列の計算
        console.log('相関行列計算開始');
        correlationMatrix = calculateCorrelationMatrix(processedData, selectedColumns, correlationMethod);
        console.log('相関行列計算完了');
        
        // 結果の表示
        console.log('結果表示開始');
        await displayMultiColumnResults();
        
        // 次のステップセクションを表示
        const nextStepsSection = document.getElementById('nextStepsSection');
        if (nextStepsSection) {
            nextStepsSection.classList.remove('hidden');
        }
        
        console.log('複数カラム分析完了');
        
    } catch (error) {
        console.error('分析エラー:', error);
        alert(`分析処理中にエラーが発生しました: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// データの前処理
function preprocessDataForCorrelation(data, columns, missingValueMethod) {
    let processedData = [...data];
    
    if (missingValueMethod === 'listwise') {
        // リストワイズ削除：いずれかのカラムに欠損値がある行を除外
        processedData = processedData.filter(row => 
            columns.every(col => 
                row[col] !== null && 
                row[col] !== undefined && 
                !isNaN(row[col]) && 
                row[col] !== ''
            )
        );
    }
    
    return processedData;
}

// 相関行列の計算
function calculateCorrelationMatrix(data, columns, method) {
    const matrix = {};
    
    columns.forEach(col1 => {
        matrix[col1] = {};
        columns.forEach(col2 => {
            if (col1 === col2) {
                matrix[col1][col2] = 1.0;
            } else {
                const correlation = calculateCorrelation(data, col1, col2, method);
                matrix[col1][col2] = correlation;
            }
        });
    });
    
    return matrix;
}

// 2つのカラム間の相関係数を計算
function calculateCorrelation(data, col1, col2, method) {
    // 有効なデータペアを抽出
    const pairs = data
        .map(row => [row[col1], row[col2]])
        .filter(pair => 
            pair[0] !== null && 
            pair[0] !== undefined && 
            !isNaN(pair[0]) && 
            pair[0] !== '' &&
            pair[1] !== null && 
            pair[1] !== undefined && 
            !isNaN(pair[1]) && 
            pair[1] !== ''
        )
        .map(pair => [Number(pair[0]), Number(pair[1])]);
    
    if (pairs.length < 2) {
        return 0;
    }
    
    if (method === 'pearson') {
        return calculatePearsonCorrelation(pairs);
    } else if (method === 'spearman') {
        return calculateSpearmanCorrelation(pairs);
    }
    
    return 0;
}

// Pearson相関係数の計算
function calculatePearsonCorrelation(pairs) {
    const n = pairs.length;
    if (n < 2) return 0;
    
    const x = pairs.map(p => p[0]);
    const y = pairs.map(p => p[1]);
    
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let sumXX = 0;
    let sumYY = 0;
    
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        sumXX += dx * dx;
        sumYY += dy * dy;
    }
    
    const denominator = Math.sqrt(sumXX * sumYY);
    return denominator === 0 ? 0 : numerator / denominator;
}

// Spearman相関係数の計算
function calculateSpearmanCorrelation(pairs) {
    // ランクを計算
    const xRanks = getRanks(pairs.map(p => p[0]));
    const yRanks = getRanks(pairs.map(p => p[1]));
    
    // ランクのペアでPearson相関を計算
    const rankPairs = xRanks.map((rank, i) => [rank, yRanks[i]]);
    return calculatePearsonCorrelation(rankPairs);
}

// ランクの計算
function getRanks(values) {
    const sorted = values.map((val, index) => ({ val, index }))
                        .sort((a, b) => a.val - b.val);
    
    const ranks = new Array(values.length);
    
    for (let i = 0; i < sorted.length; i++) {
        ranks[sorted[i].index] = i + 1;
    }
    
    return ranks;
}

// 結果の表示
async function displayMultiColumnResults() {
    // ヒートマップを生成
    await createHeatmap();
    
    // 散布図行列を生成
    await createScatterMatrix();
    
    // 相関係数表を生成
    createCorrelationTable();
    
    // サマリー統計を生成
    createSummaryStatistics();
    
    // 結果セクションを表示
    document.getElementById('resultsSection').classList.remove('hidden');
}

// ヒートマップの作成
async function createHeatmap() {
    const columns = selectedColumns;
    const z = columns.map(col1 => 
        columns.map(col2 => correlationMatrix[col1][col2])
    );
    
    const data = [{
        z: z,
        x: columns,
        y: columns,
        type: 'heatmap',
        colorscale: [
            [0, '#1e3a8a'],      // 強い負の相関 (濃い青)
            [0.25, '#3b82f6'],   // 中程度の負の相関 (青)
            [0.5, '#f8fafc'],    // 無相関 (白)
            [0.75, '#f97316'],   // 中程度の正の相関 (オレンジ)
            [1, '#dc2626']       // 強い正の相関 (赤)
        ],
        zmin: -1,
        zmax: 1,
        showscale: true,
        colorbar: {
            title: '相関係数',
            titleside: 'right',
            tickmode: 'array',
            tickvals: [-1, -0.5, 0, 0.5, 1],
            ticktext: ['-1.0', '-0.5', '0.0', '0.5', '1.0']
        },
        hovertemplate: '%{y} vs %{x}<br>相関係数: %{z:.3f}<extra></extra>'
    }];
    
    // セルに相関係数値を表示
    const annotations = [];
    for (let i = 0; i < columns.length; i++) {
        for (let j = 0; j < columns.length; j++) {
            const value = correlationMatrix[columns[i]][columns[j]];
            annotations.push({
                x: columns[j],
                y: columns[i],
                text: value.toFixed(3),
                showarrow: false,
                font: {
                    color: Math.abs(value) > 0.5 ? 'white' : 'black',
                    size: 12,
                    family: 'Inter, sans-serif'
                }
            });
        }
    }
    
    const layout = {
        title: {
            text: `相関ヒートマップ (${selectedColumns.length} 変数)`,
            font: { size: 18, family: 'Inter, sans-serif' }
        },
        xaxis: {
            title: '',
            tickangle: 45,
            font: { family: 'Inter, sans-serif' }
        },
        yaxis: {
            title: '',
            font: { family: 'Inter, sans-serif' }
        },
        annotations: annotations,
        margin: { l: 100, r: 100, t: 100, b: 150 },
        font: { family: 'Inter, sans-serif' }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    await Plotly.newPlot('heatmapContainer', data, layout, config);
}

// 散布図行列の作成
async function createScatterMatrix() {
    const columns = selectedColumns;
    const data = analysisData.data;
    const numColumns = columns.length;
    
    // 有効なデータのみを抽出
    const validData = data.filter(row => 
        columns.every(col => 
            row[col] !== null && 
            row[col] !== undefined && 
            !isNaN(row[col]) && 
            row[col] !== ''
        )
    );
    
    // マーカーサイズを事前計算
    const markerSize = Math.max(2, Math.min(6, 8 - numColumns * 0.5));
    const markerOpacity = Math.max(0.3, Math.min(0.8, 0.9 - numColumns * 0.05));
    
    const traces = [];
    
    for (let i = 0; i < columns.length; i++) {
        for (let j = 0; j < columns.length; j++) {
            if (i === j) {
                // 対角線上はヒストグラム
                const values = validData.map(row => Number(row[columns[i]]));
                traces.push({
                    x: values,
                    type: 'histogram',
                    name: columns[i],
                    xaxis: `x${i * columns.length + j + 1}`,
                    yaxis: `y${i * columns.length + j + 1}`,
                    marker: { color: '#667eea', opacity: 0.7 },
                    showlegend: false
                });
            } else {
                // 散布図
                const xValues = validData.map(row => Number(row[columns[j]]));
                const yValues = validData.map(row => Number(row[columns[i]]));
                const correlation = correlationMatrix[columns[i]][columns[j]];
                
                traces.push({
                    x: xValues,
                    y: yValues,
                    mode: 'markers',
                    type: 'scatter',
                    name: `${columns[j]} vs ${columns[i]} (r=${correlation.toFixed(3)})`,
                    xaxis: `x${i * columns.length + j + 1}`,
                    yaxis: `y${i * columns.length + j + 1}`,
                    marker: { 
                        color: '#667eea', 
                        size: markerSize,
                        opacity: markerOpacity
                    },
                    showlegend: false,
                    hovertemplate: 
                        `${columns[j]}: %{x}<br>` +
                        `${columns[i]}: %{y}<br>` +
                        `<extra></extra>`
                });
            }
        }
    }
    
    // サイズ計算
    const baseSize = 150;
    const minSize = 100;
    const maxSize = 250;
    
    let plotSize = baseSize;
    if (numColumns <= 3) {
        plotSize = maxSize;
    } else if (numColumns <= 5) {
        plotSize = 200;
    } else if (numColumns <= 8) {
        plotSize = 150;
    } else {
        plotSize = Math.max(minSize, 600 / numColumns);
    }
    
    const totalWidth = plotSize * numColumns;
    const totalHeight = plotSize * numColumns;
    
    // コンテナのサイズを動的調整
    const scatterContainer = document.getElementById('scatterContainer');
    scatterContainer.style.minHeight = `${Math.max(600, totalHeight + 150)}px`;
    
    // マージン計算
    const marginBase = Math.max(60, totalWidth * 0.08);
    const marginTop = Math.max(100, totalHeight * 0.1);
    
    // レイアウト設定
    const layout = {
        title: {
            text: `散布図行列 (${numColumns} 変数)`,
            font: { size: Math.max(16, 24 - numColumns), family: 'Inter, sans-serif' }
        },
        font: { 
            family: 'Inter, sans-serif',
            size: Math.max(10, 14 - numColumns * 0.5)
        },
        margin: { 
            l: marginBase, 
            r: marginBase, 
            t: marginTop, 
            b: marginBase
        },
        width: Math.min(1200, totalWidth + marginBase * 2),
        height: Math.min(1000, totalHeight + marginTop + marginBase)
    };
    
    // サブプロット軸設定
    const titleFontSize = Math.max(8, 14 - numColumns);
    const tickFontSize = Math.max(6, 12 - numColumns);
    const domainPadding = Math.max(0.01, 0.03 - numColumns * 0.002);
    
    for (let i = 0; i < columns.length; i++) {
        for (let j = 0; j < columns.length; j++) {
            const axisNum = i * columns.length + j + 1;
            const xAxisKey = axisNum === 1 ? 'xaxis' : `xaxis${axisNum}`;
            const yAxisKey = axisNum === 1 ? 'yaxis' : `yaxis${axisNum}`;
            
            layout[xAxisKey] = {
                domain: [j / columns.length + domainPadding, (j + 1) / columns.length - domainPadding],
                title: j === columns.length - 1 ? columns[j] : '',
                titlefont: { size: titleFontSize },
                tickfont: { size: tickFontSize },
                showticklabels: numColumns <= 6
            };
            
            layout[yAxisKey] = {
                domain: [(columns.length - i - 1) / columns.length + domainPadding, (columns.length - i) / columns.length - domainPadding],
                title: j === 0 ? columns[i] : '',
                titlefont: { size: titleFontSize },
                tickfont: { size: tickFontSize },
                showticklabels: numColumns <= 6
            };
        }
    }
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    await Plotly.newPlot('scatterContainer', traces, layout, config);
}

// 相関係数表の作成
function createCorrelationTable() {
    const columns = selectedColumns;
    const container = document.getElementById('correlationTableContainer');
    
    let html = '<table class="min-w-full border-collapse border border-gray-300">';
    
    // ヘッダー
    html += '<thead><tr class="bg-gradient-to-r from-purple-100 to-blue-100">';
    html += '<th class="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">変数</th>';
    columns.forEach(col => {
        html += `<th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">${col}</th>`;
    });
    html += '</tr></thead>';
    
    // データ行
    html += '<tbody>';
    columns.forEach((row, rowIndex) => {
        html += `<tr class="${rowIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'} transition-colors">`;
        html += `<td class="border border-gray-300 px-4 py-3 font-semibold text-gray-800">${row}</td>`;
        
        columns.forEach(col => {
            const value = correlationMatrix[row][col];
            const absValue = Math.abs(value);
            let className = 'border border-gray-300 px-4 py-3 text-center text-sm';
            
            if (absValue >= 0.8) {
                className += ' bg-red-100 font-bold';
            } else if (absValue >= 0.6) {
                className += ' bg-orange-100 font-semibold';
            } else if (absValue >= 0.4) {
                className += ' bg-yellow-100';
            }
            
            html += `<td class="${className}">${value.toFixed(3)}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    
    container.innerHTML = html;
}

// サマリー統計の作成
function createSummaryStatistics() {
    const columns = selectedColumns;
    const correlations = [];
    
    // 全ての相関係数を収集（対角線以外）
    for (let i = 0; i < columns.length; i++) {
        for (let j = i + 1; j < columns.length; j++) {
            const value = correlationMatrix[columns[i]][columns[j]];
            correlations.push({
                pair: `${columns[i]} - ${columns[j]}`,
                value: value,
                absValue: Math.abs(value)
            });
        }
    }
    
    // 最強の正の相関
    const positiveCorrs = correlations.filter(c => c.value > 0).sort((a, b) => b.value - a.value);
    const strongestPositive = document.getElementById('strongestPositive');
    if (positiveCorrs.length > 0) {
        const top = positiveCorrs[0];
        strongestPositive.innerHTML = `
            <div class="font-semibold text-blue-600">${top.pair}</div>
            <div class="text-2xl font-bold text-blue-800">${top.value.toFixed(3)}</div>
        `;
    } else {
        strongestPositive.innerHTML = '<div class="text-gray-500">正の相関なし</div>';
    }
    
    // 最強の負の相関
    const negativeCorrs = correlations.filter(c => c.value < 0).sort((a, b) => a.value - b.value);
    const strongestNegative = document.getElementById('strongestNegative');
    if (negativeCorrs.length > 0) {
        const top = negativeCorrs[0];
        strongestNegative.innerHTML = `
            <div class="font-semibold text-red-600">${top.pair}</div>
            <div class="text-2xl font-bold text-red-800">${top.value.toFixed(3)}</div>
        `;
    } else {
        strongestNegative.innerHTML = '<div class="text-gray-500">負の相関なし</div>';
    }
    
    // 統計サマリー
    const summary = document.getElementById('correlationSummary');
    const avgCorr = correlations.reduce((sum, c) => sum + Math.abs(c.value), 0) / correlations.length;
    const strongCorrs = correlations.filter(c => Math.abs(c.value) >= 0.7).length;
    const moderateCorrs = correlations.filter(c => Math.abs(c.value) >= 0.3 && Math.abs(c.value) < 0.7).length;
    
    summary.innerHTML = `
        <div class="space-y-2">
            <div>平均絶対相関: <span class="font-semibold">${avgCorr.toFixed(3)}</span></div>
            <div>強い相関 (|r|≥0.7): <span class="font-semibold">${strongCorrs}組</span></div>
            <div>中程度の相関 (0.3≤|r|<0.7): <span class="font-semibold">${moderateCorrs}組</span></div>
            <div>総ペア数: <span class="font-semibold">${correlations.length}組</span></div>
        </div>
    `;
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
    const containerId = plotType === 'heatmap' ? 'heatmapContainer' : 'scatterContainer';
    const filename = `${plotType}_${selectedColumns.length}variables.${format}`;
    
    Plotly.downloadImage(containerId, {
        format: format,
        width: 1200,
        height: 800,
        filename: filename
    });
}

// 相関係数表のダウンロード
function downloadCorrelationTable() {
    const columns = selectedColumns;
    let csv = '変数,' + columns.join(',') + '\n';
    
    columns.forEach(row => {
        const values = columns.map(col => correlationMatrix[row][col].toFixed(3));
        csv += row + ',' + values.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `correlation_matrix_${columns.length}variables.csv`;
    link.click();
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

function goToDetailedAnalysis() {
    console.log('詳細分析ページへ移動開始');
    
    if (!analysisData || !selectedColumns || selectedColumns.length === 0) {
        alert('まず複数カラム分析を実行してください。');
        return;
    }
    
    try {
        // 選択されたカラムとデータを保存して個別分析ページへ
        const detailedAnalysisData = {
            ...analysisData,
            selectedColumns: selectedColumns,
            correlationMatrix: correlationMatrix,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('detailedAnalysisData', JSON.stringify(detailedAnalysisData));
        console.log('詳細分析データ保存完了');
        
        window.location.href = 'detailed-analysis.html';
        
    } catch (error) {
        console.error('詳細分析ページ移動エラー:', error);
        alert('詳細分析ページへの移動に失敗しました。');
    }
}