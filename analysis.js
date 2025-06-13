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
                
            case 'mahalanobis':
                if (!xColumn || !yColumn) {
                    alert('マハラノビス距離分析にはX軸とY軸の両方を選択してください。');
                    return;
                }
                processedData = preprocessData(currentData, [xColumn, yColumn]);
                break;
                
            case 'outlier':
                if (!xColumn && !yColumn) {
                    alert('分析する列を選択してください。');
                    return;
                }
                const outlierColumn = xColumn || yColumn;
                processedData = preprocessData(currentData, [outlierColumn]);
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
    // デフォルトの欠損値処理オプション
    let missingValueOption = 'remove';
    
    // 欠損値処理オプションが選択されている場合は取得
    const missingValueElement = document.querySelector('input[name="missingValue"]:checked');
    if (missingValueElement) {
        missingValueOption = missingValueElement.value;
    }
    
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
                columns.every(col => {
                    const value = row[col];
                    return value !== null && value !== undefined && value !== '' && !isNaN(parseFloat(value));
                })
            );
            break;
            
        case 'mean':
            columns.forEach(col => {
                const values = filtered.map(row => parseFloat(row[col])).filter(val => 
                    !isNaN(val) && isFinite(val)
                );
                
                if (values.length > 0) {
                    const mean = ss.mean(values);
                    
                    filtered.forEach(row => {
                        const value = parseFloat(row[col]);
                        if (isNaN(value) || !isFinite(value)) {
                            row[col] = mean;
                        }
                    });
                }
            });
            break;
            
        case 'linear':
            // 簡単な線形補完（実装は簡略化）
            columns.forEach(col => {
                for (let i = 1; i < filtered.length - 1; i++) {
                    const current = parseFloat(filtered[i][col]);
                    if (isNaN(current) || !isFinite(current)) {
                        const prev = parseFloat(filtered[i-1][col]);
                        const next = parseFloat(filtered[i+1][col]);
                        if (!isNaN(prev) && !isNaN(next) && isFinite(prev) && isFinite(next)) {
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
    console.log('分析実行:', type, options);
    
    switch (type) {
        case 'correlation':
            return await performCorrelationAnalysis(data, options);
        case 'regression':
            return await performRegressionAnalysis(data, options);
        case 'descriptive':
            return await performDescriptiveAnalysis(data, options);
        case 'histogram':
            return await performHistogramAnalysis(data, options);
        case 'processCapability':
            return await performProcessCapabilityAnalysis(data, options);
        case 'controlChart':
            return await performControlChartAnalysis(data, options);
        case 'mahalanobis':
            return await performMahalanobisAnalysis(data, options);
        case 'outlier':
            return await performOutlierAnalysis(data, options);
        default:
            throw new Error(`サポートされていない分析タイプ: ${type}`);
    }
}

// 相関分析
async function performCorrelationAnalysis(data, options) {
    const { xColumn, yColumn } = options;
    
    const xValues = data.map(row => parseFloat(row[xColumn])).filter(val => !isNaN(val));
    const yValues = data.map(row => parseFloat(row[yColumn])).filter(val => !isNaN(val));
    
    if (xValues.length !== yValues.length || xValues.length === 0) {
        throw new Error('有効なデータが不足しています');
    }
    
    // Pearson相関係数
    const pearsonR = ss.sampleCorrelation(xValues, yValues);
    
    // Spearman相関係数
    const spearmanR = calculateSpearmanCorrelation(xValues, yValues);
    
    // 散布図データ
    const plotData = createScatterPlot(xValues, yValues, xColumn, yColumn, pearsonR);
    
    return {
        statistics: {
            'Pearson相関係数': pearsonR,
            'Spearman相関係数': spearmanR,
            'サンプル数': xValues.length,
            '決定係数 (R²)': pearsonR * pearsonR
        },
        plot: plotData,
        interpretation: interpretCorrelation(pearsonR)
    };
}

// 回帰分析
async function performRegressionAnalysis(data, options) {
    const { xColumn, yColumn } = options;
    
    const xValues = data.map(row => parseFloat(row[xColumn])).filter(val => !isNaN(val));
    const yValues = data.map(row => parseFloat(row[yColumn])).filter(val => !isNaN(val));
    
    if (xValues.length !== yValues.length || xValues.length < 2) {
        throw new Error('回帰分析には最低2つのデータポイントが必要です');
    }
    
    // 線形回帰
    const regression = ss.linearRegression(xValues.map((x, i) => [x, yValues[i]]));
    const rSquared = ss.rSquared(xValues.map((x, i) => [x, yValues[i]]), ss.linearRegressionLine(regression));
    
    // 回帰直線付き散布図
    const plotData = createRegressionPlot(xValues, yValues, xColumn, yColumn, regression);
    
    return {
        statistics: {
            '切片 (a)': regression.b,
            '傾き (b)': regression.m,
            '決定係数 (R²)': rSquared,
            '相関係数 (r)': Math.sqrt(rSquared) * (regression.m > 0 ? 1 : -1),
            'サンプル数': xValues.length
        },
        plot: plotData,
        regression: regression,
        interpretation: interpretRegression(regression, rSquared)
    };
}

// 記述統計
async function performDescriptiveAnalysis(data, options) {
    const { targetColumn, xColumn, yColumn } = options;
    const columnToAnalyze = targetColumn || xColumn || yColumn;
    
    if (!columnToAnalyze) {
        throw new Error('分析する列が指定されていません');
    }
    
    const values = data.map(row => parseFloat(row[columnToAnalyze])).filter(val => !isNaN(val) && isFinite(val));
    
    if (values.length === 0) {
        throw new Error('有効なデータが見つかりません');
    }
    
    const stats = {
        'サンプル数': values.length,
        '平均': ss.mean(values),
        '中央値': ss.median(values),
        '最小値': ss.min(values),
        '最大値': ss.max(values),
        '標準偏差': ss.standardDeviation(values),
        '分散': ss.variance(values),
        '歪度': ss.sampleSkewness(values),
        '尖度': ss.sampleKurtosis(values)
    };
    
    // ボックスプロット
    const plotData = createBoxPlot(values, columnToAnalyze);
    
    return {
        statistics: stats,
        plot: plotData,
        interpretation: interpretDescriptiveStats(stats)
    };
}

// ヒストグラム分析
async function performHistogramAnalysis(data, options) {
    const { targetColumn, xColumn, yColumn } = options;
    const columnToAnalyze = targetColumn || xColumn || yColumn;
    
    if (!columnToAnalyze) {
        throw new Error('分析する列が指定されていません');
    }
    
    const values = data.map(row => parseFloat(row[columnToAnalyze])).filter(val => !isNaN(val) && isFinite(val));
    
    if (values.length === 0) {
        throw new Error('有効なデータが見つかりません');
    }
    
    // ヒストグラムデータ
    const plotData = createHistogramPlot(values, columnToAnalyze);
    
    const stats = {
        'サンプル数': values.length,
        '平均': ss.mean(values),
        '標準偏差': ss.standardDeviation(values),
        '最小値': ss.min(values),
        '最大値': ss.max(values)
    };
    
    return {
        statistics: stats,
        plot: plotData,
        interpretation: interpretHistogram(values)
    };
}

// 工程能力分析
async function performProcessCapabilityAnalysis(data, options) {
    const { targetColumn, xColumn, yColumn, usl, lsl } = options;
    const columnToAnalyze = targetColumn || xColumn || yColumn;
    
    if (!columnToAnalyze) {
        throw new Error('分析する列が指定されていません');
    }
    
    const values = data.map(row => parseFloat(row[columnToAnalyze])).filter(val => !isNaN(val) && isFinite(val));
    
    if (values.length === 0) {
        throw new Error('有効なデータが見つかりません');
    }
    
    const mean = ss.mean(values);
    const stdDev = ss.standardDeviation(values);
    
    let cp = null, cpk = null, cpu = null, cpl = null;
    
    if (!isNaN(usl) && !isNaN(lsl)) {
        cp = (usl - lsl) / (6 * stdDev);
        cpu = (usl - mean) / (3 * stdDev);
        cpl = (mean - lsl) / (3 * stdDev);
        cpk = Math.min(cpu, cpl);
    } else if (!isNaN(usl)) {
        cpu = (usl - mean) / (3 * stdDev);
        cpk = cpu;
    } else if (!isNaN(lsl)) {
        cpl = (mean - lsl) / (3 * stdDev);
        cpk = cpl;
    }
    
    // ヒストグラムと規格限界
    const plotData = createProcessCapabilityPlot(values, columnToAnalyze, usl, lsl, mean, stdDev);
    
    const stats = {
        '平均': mean,
        '標準偏差': stdDev,
        'Cp': cp,
        'Cpk': cpk,
        'Cpu': cpu,
        'Cpl': cpl
    };
    
    return {
        statistics: stats,
        plot: plotData,
        interpretation: interpretProcessCapability(cp, cpk)
    };
}

// 管理図分析
async function performControlChartAnalysis(data, options) {
    const { targetColumn, xColumn, yColumn } = options;
    const columnToAnalyze = targetColumn || xColumn || yColumn;
    
    if (!columnToAnalyze) {
        throw new Error('分析する列が指定されていません');
    }
    
    const values = data.map(row => parseFloat(row[columnToAnalyze])).filter(val => !isNaN(val) && isFinite(val));
    
    if (values.length === 0) {
        throw new Error('有効なデータが見つかりません');
    }
    
    const mean = ss.mean(values);
    const stdDev = ss.standardDeviation(values);
    
    const ucl = mean + 3 * stdDev;  // 上方管理限界
    const lcl = mean - 3 * stdDev;  // 下方管理限界
    
    // 異常点の検出
    const outliers = values.map((value, index) => ({
        index: index + 1,
        value: value,
        isOutlier: value > ucl || value < lcl
    }));
    
    const outlierCount = outliers.filter(point => point.isOutlier).length;
    
    // 管理図
    const plotData = createControlChartPlot(values, columnToAnalyze, mean, ucl, lcl);
    
    const stats = {
        '中心線 (CL)': mean,
        '上方管理限界 (UCL)': ucl,
        '下方管理限界 (LCL)': lcl,
        '標準偏差': stdDev,
        '異常点数': outlierCount,
        '管理状態': outlierCount === 0 ? '良好' : '要注意'
    };
    
    return {
        statistics: stats,
        plot: plotData,
        outliers: outliers,
        interpretation: interpretControlChart(outlierCount, values.length)
    };
}

// Spearman相関係数の計算
function calculateSpearmanCorrelation(x, y) {
    const rank = (arr) => {
        const sorted = [...arr].sort((a, b) => a - b);
        return arr.map(val => sorted.indexOf(val) + 1);
    };
    
    const xRanks = rank(x);
    const yRanks = rank(y);
    
    return ss.sampleCorrelation(xRanks, yRanks);
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

// マハラノビス距離による異常値検出
async function performMahalanobisAnalysis(data, options) {
    const { xColumn, yColumn } = options;
    
    if (!xColumn || !yColumn) {
        throw new Error('マハラノビス距離分析には2つの変数が必要です');
    }
    
    const xValues = data.map(row => parseFloat(row[xColumn])).filter(val => !isNaN(val) && isFinite(val));
    const yValues = data.map(row => parseFloat(row[yColumn])).filter(val => !isNaN(val) && isFinite(val));
    
    if (xValues.length !== yValues.length || xValues.length < 3) {
        throw new Error('マハラノビス距離分析には最低3つのデータポイントが必要です');
    }
    
    // 平均値の計算
    const meanX = ss.mean(xValues);
    const meanY = ss.mean(yValues);
    
    // 共分散行列の計算
    const covXX = ss.variance(xValues);
    const covYY = ss.variance(yValues);
    const covXY = ss.sampleCovariance(xValues, yValues);
    
    // 共分散行列の逆行列の計算
    const det = covXX * covYY - covXY * covXY;
    if (Math.abs(det) < 1e-10) {
        throw new Error('共分散行列が特異行列です。変数が線形従属の可能性があります。');
    }
    
    const invCovXX = covYY / det;
    const invCovYY = covXX / det;
    const invCovXY = -covXY / det;
    
    // マハラノビス距離の計算
    const mahalanobisDistances = [];
    const threshold = 5.991; // 自由度2、α=0.05のカイ二乗分布の臨界値
    
    for (let i = 0; i < xValues.length; i++) {
        const dx = xValues[i] - meanX;
        const dy = yValues[i] - meanY;
        
        const distance = Math.sqrt(
            dx * dx * invCovXX + 
            dy * dy * invCovYY + 
            2 * dx * dy * invCovXY
        );
        
        mahalanobisDistances.push({
            index: i + 1,
            x: xValues[i],
            y: yValues[i],
            distance: distance,
            isOutlier: distance > Math.sqrt(threshold)
        });
    }
    
    // 異常値の統計
    const outliers = mahalanobisDistances.filter(point => point.isOutlier);
    const outlierRate = (outliers.length / mahalanobisDistances.length) * 100;
    
    // 可視化データ
    const plotData = createMahalanobisPlot(mahalanobisDistances, xColumn, yColumn, meanX, meanY, threshold);
    
    const stats = {
        'サンプル数': mahalanobisDistances.length,
        '異常値数': outliers.length,
        '異常値率': outlierRate,
        '閾値 (√χ²0.05)': Math.sqrt(threshold),
        '最大距離': Math.max(...mahalanobisDistances.map(p => p.distance)),
        '平均距離': ss.mean(mahalanobisDistances.map(p => p.distance))
    };
    
    return {
        statistics: stats,
        plot: plotData,
        outliers: outliers,
        distances: mahalanobisDistances,
        interpretation: interpretMahalanobis(outliers.length, mahalanobisDistances.length)
    };
}

// IQR法・Z-score法による異常値検出
async function performOutlierAnalysis(data, options) {
    const { targetColumn, xColumn, yColumn } = options;
    const columnToAnalyze = targetColumn || xColumn || yColumn;
    
    if (!columnToAnalyze) {
        throw new Error('分析する列が指定されていません');
    }
    
    const values = data.map(row => parseFloat(row[columnToAnalyze])).filter(val => !isNaN(val) && isFinite(val));
    
    if (values.length < 4) {
        throw new Error('異常値検出には最低4つのデータポイントが必要です');
    }
    
    // 基本統計量
    const mean = ss.mean(values);
    const median = ss.median(values);
    const stdDev = ss.standardDeviation(values);
    const mad = calculateMAD(values); // 中央絶対偏差
    
    // IQR法による異常値検出
    const sortedValues = [...values].sort((a, b) => a - b);
    const q1 = ss.quantile(sortedValues, 0.25);
    const q3 = ss.quantile(sortedValues, 0.75);
    const iqr = q3 - q1;
    const iqrLowerBound = q1 - 1.5 * iqr;
    const iqrUpperBound = q3 + 1.5 * iqr;
    
    // Z-score法による異常値検出
    const zThreshold = 3.0;
    
    // 修正Z-score法による異常値検出
    const modifiedZThreshold = 3.5;
    
    // 各データポイントの分析
    const analysisResults = values.map((value, index) => {
        const zScore = Math.abs((value - mean) / stdDev);
        const modifiedZScore = Math.abs(0.6745 * (value - median) / mad);
        
        return {
            index: index + 1,
            value: value,
            zScore: zScore,
            modifiedZScore: modifiedZScore,
            isIQROutlier: value < iqrLowerBound || value > iqrUpperBound,
            isZOutlier: zScore > zThreshold,
            isModifiedZOutlier: modifiedZScore > modifiedZThreshold,
            isAnyOutlier: (value < iqrLowerBound || value > iqrUpperBound) || 
                         zScore > zThreshold || 
                         modifiedZScore > modifiedZThreshold
        };
    });
    
    // 異常値の統計
    const iqrOutliers = analysisResults.filter(point => point.isIQROutlier);
    const zOutliers = analysisResults.filter(point => point.isZOutlier);
    const modifiedZOutliers = analysisResults.filter(point => point.isModifiedZOutlier);
    const anyOutliers = analysisResults.filter(point => point.isAnyOutlier);
    
    // 可視化データ
    const plotData = createOutlierPlot(analysisResults, columnToAnalyze, {
        mean, median, stdDev, q1, q3, iqr,
        iqrLowerBound, iqrUpperBound, zThreshold, modifiedZThreshold
    });
    
    const stats = {
        'サンプル数': values.length,
        '平均': mean,
        '中央値': median,
        '標準偏差': stdDev,
        'Q1 (25%)': q1,
        'Q3 (75%)': q3,
        'IQR': iqr,
        'IQR法異常値数': iqrOutliers.length,
        'Z-score法異常値数': zOutliers.length,
        '修正Z-score法異常値数': modifiedZOutliers.length,
        '総異常値数': anyOutliers.length,
        '異常値率': (anyOutliers.length / values.length * 100)
    };
    
    return {
        statistics: stats,
        plot: plotData,
        outliers: {
            iqr: iqrOutliers,
            zScore: zOutliers,
            modifiedZ: modifiedZOutliers,
            any: anyOutliers
        },
        analysisResults: analysisResults,
        interpretation: interpretOutliers(anyOutliers.length, values.length)
    };
}

// 中央絶対偏差（MAD）の計算
function calculateMAD(values) {
    const median = ss.median(values);
    const deviations = values.map(value => Math.abs(value - median));
    return ss.median(deviations);
}