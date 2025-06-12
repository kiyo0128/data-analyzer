// 分析機能モジュール
// 作成日: 2025-01-12

// 分析実行
async function runAnalysis(analysisType) {
    if (!currentData) {
        alert('まずデータを選択してください。');
        return;
    }
    
    const xColumn = document.getElementById('xColumnSelect').value;
    const yColumn = document.getElementById('yColumnSelect').value;
    
    // 分析タイプに応じた前処理とバリデーション
    let processedData;
    
    try {
        switch (analysisType) {
            case 'correlation':
            case 'regression':
                if (!xColumn || !yColumn) {
                    alert('X軸とY軸の両方を選択してください。');
                    return;
                }
                processedData = preprocessData(currentData, [xColumn, yColumn]);
                break;
                
            case 'descriptive':
            case 'histogram':
                if (!xColumn && !yColumn) {
                    alert('分析する列を選択してください。');
                    return;
                }
                const targetColumn = xColumn || yColumn;
                processedData = preprocessData(currentData, [targetColumn]);
                break;
                
            case 'processCapability':
                document.getElementById('processCapabilitySection').classList.remove('hidden');
                return;
                
            case 'controlChart':
                if (!xColumn && !yColumn) {
                    alert('分析する列を選択してください。');
                    return;
                }
                const controlColumn = xColumn || yColumn;
                processedData = preprocessData(currentData, [controlColumn]);
                break;
                
            default:
                alert('サポートされていない分析です。');
                return;
        }
        
        // 分析実行
        const results = await performAnalysis(analysisType, processedData, { xColumn, yColumn });
        
        // 結果表示
        displayResults(analysisType, results);
        
    } catch (error) {
        console.error('分析エラー:', error);
        alert('分析中にエラーが発生しました: ' + error.message);
    }
}

// データ前処理
function preprocessData(data, columns) {
    const missingValueOption = document.querySelector('input[name="missingValue"]:checked').value;
    
    // 指定された列のみを抽出
    let filtered = data.map(row => {
        const newRow = {};
        columns.forEach(col => {
            newRow[col] = row[col];
        });
        return newRow;
    });
    
    // 欠損値処理
    switch (missingValueOption) {
        case 'remove':
            filtered = filtered.filter(row => 
                columns.every(col => row[col] !== null && row[col] !== undefined && row[col] !== '')
            );
            break;
            
        case 'mean':
            columns.forEach(col => {
                const values = filtered.map(row => row[col]).filter(val => 
                    val !== null && val !== undefined && val !== '' && !isNaN(val)
                );
                const mean = ss.mean(values);
                
                filtered.forEach(row => {
                    if (row[col] === null || row[col] === undefined || row[col] === '' || isNaN(row[col])) {
                        row[col] = mean;
                    }
                });
            });
            break;
            
        case 'linear':
            // 簡単な線形補完（実装は簡略化）
            columns.forEach(col => {
                for (let i = 1; i < filtered.length - 1; i++) {
                    if (filtered[i][col] === null || filtered[i][col] === undefined || filtered[i][col] === '') {
                        const prev = filtered[i-1][col];
                        const next = filtered[i+1][col];
                        if (!isNaN(prev) && !isNaN(next)) {
                            filtered[i][col] = (prev + next) / 2;
                        }
                    }
                }
            });
            break;
    }
    
    return filtered;
}

// 分析実行
async function performAnalysis(type, data, options) {
    const { xColumn, yColumn } = options;
    
    switch (type) {
        case 'correlation':
            return calculateCorrelation(data, xColumn, yColumn);
            
        case 'regression':
            return calculateRegression(data, xColumn, yColumn);
            
        case 'descriptive':
            const targetCol = xColumn || yColumn;
            return calculateDescriptiveStats(data, targetCol);
            
        case 'histogram':
            const histCol = xColumn || yColumn;
            return createHistogram(data, histCol);
            
        case 'controlChart':
            const controlCol = xColumn || yColumn;
            return createControlChart(data, controlCol);
            
        default:
            throw new Error('サポートされていない分析タイプです');
    }
}

// 相関分析
function calculateCorrelation(data, xColumn, yColumn) {
    const xValues = data.map(row => row[xColumn]).filter(val => !isNaN(val));
    const yValues = data.map(row => row[yColumn]).filter(val => !isNaN(val));
    
    if (xValues.length !== yValues.length || xValues.length < 2) {
        throw new Error('有効なデータが不足しています');
    }
    
    const pearsonR = ss.sampleCorrelation(xValues, yValues);
    const spearmanR = calculateSpearmanCorrelation(xValues, yValues);
    
    // 散布図作成
    const scatter = createScatterPlot(xValues, yValues, xColumn, yColumn, pearsonR);
    
    return {
        pearsonR,
        spearmanR,
        plot: scatter,
        interpretation: interpretCorrelation(pearsonR)
    };
}

// Spearman相関係数計算
function calculateSpearmanCorrelation(x, y) {
    const rank = (arr) => {
        const sorted = [...arr].sort((a, b) => a - b);
        return arr.map(val => sorted.indexOf(val) + 1);
    };
    
    const xRanks = rank(x);
    const yRanks = rank(y);
    
    return ss.sampleCorrelation(xRanks, yRanks);
}

// 回帰分析
function calculateRegression(data, xColumn, yColumn) {
    const xValues = data.map(row => row[xColumn]).filter(val => !isNaN(val));
    const yValues = data.map(row => row[yColumn]).filter(val => !isNaN(val));
    
    if (xValues.length !== yValues.length || xValues.length < 2) {
        throw new Error('有効なデータが不足しています');
    }
    
    const regression = ss.linearRegression(xValues.map((x, i) => [x, yValues[i]]));
    const rSquared = ss.rSquared(xValues.map((x, i) => [x, yValues[i]]), regression);
    
    // 残差計算
    const residuals = xValues.map((x, i) => {
        const predicted = regression.m * x + regression.b;
        return yValues[i] - predicted;
    });
    
    // 散布図に回帰線を追加
    const plot = createRegressionPlot(xValues, yValues, xColumn, yColumn, regression);
    
    return {
        slope: regression.m,
        intercept: regression.b,
        rSquared: rSquared,
        residuals: residuals,
        plot: plot,
        interpretation: interpretRegression(regression, rSquared)
    };
}

// 記述統計
function calculateDescriptiveStats(data, column) {
    const values = data.map(row => row[column]).filter(val => !isNaN(val));
    
    if (values.length === 0) {
        throw new Error('有効な数値データがありません');
    }
    
    const stats = {
        count: values.length,
        mean: ss.mean(values),
        median: ss.median(values),
        mode: ss.mode(values),
        standardDeviation: ss.standardDeviation(values),
        variance: ss.variance(values),
        min: ss.min(values),
        max: ss.max(values),
        range: ss.max(values) - ss.min(values),
        q1: ss.quantile(values, 0.25),
        q3: ss.quantile(values, 0.75)
    };
    
    stats.iqr = stats.q3 - stats.q1;
    
    return {
        stats: stats,
        plot: createBoxPlot(values, column),
        interpretation: interpretDescriptiveStats(stats)
    };
}

// ヒストグラム作成
function createHistogram(data, column) {
    const values = data.map(row => row[column]).filter(val => !isNaN(val));
    
    if (values.length === 0) {
        throw new Error('有効な数値データがありません');
    }
    
    const plot = {
        data: [{
            x: values,
            type: 'histogram',
            name: column,
            nbinsx: Math.min(30, Math.ceil(Math.sqrt(values.length))),
            marker: {
                color: 'lightblue',
                line: {
                    color: 'black',
                    width: 1
                }
            }
        }],
        layout: {
            title: `${column} のヒストグラム`,
            xaxis: { title: column },
            yaxis: { title: '度数' },
            bargap: 0.1
        }
    };
    
    return {
        plot: plot,
        interpretation: interpretHistogram(values)
    };
}

// 管理図作成
function createControlChart(data, column) {
    const values = data.map(row => row[column]).filter(val => !isNaN(val));
    
    if (values.length === 0) {
        throw new Error('有効な数値データがありません');
    }
    
    const mean = ss.mean(values);
    const stdDev = ss.standardDeviation(values);
    const ucl = mean + 3 * stdDev;
    const lcl = mean - 3 * stdDev;
    
    // 異常点検出
    const outliers = values.map((val, index) => ({
        index: index,
        value: val,
        isOutlier: val > ucl || val < lcl
    }));
    
    const plot = {
        data: [
            {
                x: values.map((_, i) => i + 1),
                y: values,
                type: 'scatter',
                mode: 'lines+markers',
                name: column,
                line: { color: 'blue' },
                marker: { color: 'blue' }
            },
            {
                x: [1, values.length],
                y: [mean, mean],
                type: 'scatter',
                mode: 'lines',
                name: '中心線 (平均)',
                line: { color: 'green', dash: 'dash' }
            },
            {
                x: [1, values.length],
                y: [ucl, ucl],
                type: 'scatter',
                mode: 'lines',
                name: 'UCL (+3σ)',
                line: { color: 'red', dash: 'dash' }
            },
            {
                x: [1, values.length],
                y: [lcl, lcl],
                type: 'scatter',
                mode: 'lines',
                name: 'LCL (-3σ)',
                line: { color: 'red', dash: 'dash' }
            }
        ],
        layout: {
            title: `${column} の管理図`,
            xaxis: { title: 'サンプル番号' },
            yaxis: { title: column }
        }
    };
    
    return {
        mean: mean,
        stdDev: stdDev,
        ucl: ucl,
        lcl: lcl,
        outliers: outliers.filter(o => o.isOutlier),
        plot: plot,
        interpretation: interpretControlChart(outliers.filter(o => o.isOutlier).length, values.length)
    };
}

// 工程能力分析計算
function calculateProcessCapability() {
    if (!currentData) {
        alert('まずデータを選択してください。');
        return;
    }
    
    const xColumn = document.getElementById('xColumnSelect').value;
    const yColumn = document.getElementById('yColumnSelect').value;
    const targetColumn = xColumn || yColumn;
    
    if (!targetColumn) {
        alert('分析する列を選択してください。');
        return;
    }
    
    const usl = parseFloat(document.getElementById('uslInput').value);
    const lsl = parseFloat(document.getElementById('lslInput').value);
    
    if (isNaN(usl) || isNaN(lsl)) {
        alert('上限規格値（USL）と下限規格値（LSL）を入力してください。');
        return;
    }
    
    if (usl <= lsl) {
        alert('上限規格値は下限規格値より大きくしてください。');
        return;
    }
    
    const processedData = preprocessData(currentData, [targetColumn]);
    const values = processedData.map(row => row[targetColumn]).filter(val => !isNaN(val));
    
    if (values.length === 0) {
        alert('有効な数値データがありません。');
        return;
    }
    
    const mean = ss.mean(values);
    const stdDev = ss.standardDeviation(values);
    
    // Cp, Cpk計算
    const cp = (usl - lsl) / (6 * stdDev);
    const cpkUpper = (usl - mean) / (3 * stdDev);
    const cpkLower = (mean - lsl) / (3 * stdDev);
    const cpk = Math.min(cpkUpper, cpkLower);
    
    // ヒストグラムと規格限界
    const plot = {
        data: [
            {
                x: values,
                type: 'histogram',
                name: targetColumn,
                opacity: 0.7,
                marker: { color: 'lightblue' }
            }
        ],
        layout: {
            title: `${targetColumn} の工程能力分析`,
            xaxis: { title: targetColumn },
            yaxis: { title: '度数' },
            shapes: [
                {
                    type: 'line',
                    x0: lsl, x1: lsl,
                    y0: 0, y1: 1,
                    yref: 'paper',
                    line: { color: 'red', width: 2, dash: 'dash' }
                },
                {
                    type: 'line',
                    x0: usl, x1: usl,
                    y0: 0, y1: 1,
                    yref: 'paper',
                    line: { color: 'red', width: 2, dash: 'dash' }
                }
            ],
            annotations: [
                {
                    x: lsl,
                    y: 0.9,
                    yref: 'paper',
                    text: `LSL: ${lsl}`,
                    showarrow: false,
                    font: { color: 'red' }
                },
                {
                    x: usl,
                    y: 0.9,
                    yref: 'paper',
                    text: `USL: ${usl}`,
                    showarrow: false,
                    font: { color: 'red' }
                }
            ]
        }
    };
    
    const results = {
        cp: cp,
        cpk: cpk,
        mean: mean,
        stdDev: stdDev,
        usl: usl,
        lsl: lsl,
        plot: plot,
        interpretation: interpretProcessCapability(cp, cpk)
    };
    
    displayResults('processCapability', results);
    document.getElementById('processCapabilitySection').classList.add('hidden');
} 