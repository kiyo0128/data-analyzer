// 可視化機能モジュール
// 作成日: 2025-01-12

// 散布図作成
function createScatterPlot(xValues, yValues, xLabel, yLabel, correlation) {
    return {
        data: [{
            x: xValues,
            y: yValues,
            mode: 'markers',
            type: 'scatter',
            name: 'データ点',
            marker: {
                color: 'blue',
                size: 8,
                opacity: 0.7
            }
        }],
        layout: {
            title: `${xLabel} vs ${yLabel} (相関係数: ${correlation.toFixed(3)})`,
            xaxis: { title: xLabel },
            yaxis: { title: yLabel },
            showlegend: true
        }
    };
}

// 回帰分析用散布図（回帰線付き）
function createRegressionPlot(xValues, yValues, xLabel, yLabel, regression) {
    // 回帰線用のデータポイント
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const regressionX = [minX, maxX];
    const regressionY = regressionX.map(x => regression.m * x + regression.b);
    
    return {
        data: [
            {
                x: xValues,
                y: yValues,
                mode: 'markers',
                type: 'scatter',
                name: 'データ点',
                marker: {
                    color: 'blue',
                    size: 8,
                    opacity: 0.7
                }
            },
            {
                x: regressionX,
                y: regressionY,
                mode: 'lines',
                type: 'scatter',
                name: `回帰線 (y = ${regression.m.toFixed(3)}x + ${regression.b.toFixed(3)})`,
                line: {
                    color: 'red',
                    width: 2
                }
            }
        ],
        layout: {
            title: `${xLabel} vs ${yLabel} - 回帰分析`,
            xaxis: { title: xLabel },
            yaxis: { title: yLabel },
            showlegend: true
        }
    };
}

// 箱ひげ図作成
function createBoxPlot(values, label) {
    return {
        data: [{
            y: values,
            type: 'box',
            name: label,
            boxpoints: 'outliers',
            marker: {
                color: 'lightblue'
            }
        }],
        layout: {
            title: `${label} の箱ひげ図`,
            yaxis: { title: label }
        }
    };
}

// 結果表示
function displayResults(analysisType, results) {
    const resultsSection = document.getElementById('resultsSection');
    const visualizationSection = document.getElementById('visualizationSection');
    const analysisResults = document.getElementById('analysisResults');
    const interpretationResults = document.getElementById('interpretationResults');
    const interpretationText = document.getElementById('interpretationText');
    const plotContainer = document.getElementById('plotContainer');
    
    // セクションを表示
    resultsSection.classList.remove('hidden');
    visualizationSection.classList.remove('hidden');
    
    // グラフ表示
    if (results.plot) {
        Plotly.newPlot(plotContainer, results.plot.data, results.plot.layout, {responsive: true});
    }
    
    // 結果表示
    let resultsHTML = '';
    
    switch (analysisType) {
        case 'correlation':
            resultsHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-blue-800 mb-2">Pearson相関係数</h4>
                        <p class="text-2xl font-bold text-blue-600">${results.pearsonR.toFixed(4)}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-green-800 mb-2">Spearman相関係数</h4>
                        <p class="text-2xl font-bold text-green-600">${results.spearmanR.toFixed(4)}</p>
                    </div>
                </div>
            `;
            break;
            
        case 'regression':
            resultsHTML = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-blue-800 mb-2">傾き (a)</h4>
                        <p class="text-2xl font-bold text-blue-600">${results.slope.toFixed(4)}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-green-800 mb-2">切片 (b)</h4>
                        <p class="text-2xl font-bold text-green-600">${results.intercept.toFixed(4)}</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-purple-800 mb-2">決定係数 (R²)</h4>
                        <p class="text-2xl font-bold text-purple-600">${results.rSquared.toFixed(4)}</p>
                    </div>
                </div>
                <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-2">回帰式</h4>
                    <p class="text-lg font-mono">y = ${results.slope.toFixed(4)}x + ${results.intercept.toFixed(4)}</p>
                </div>
            `;
            break;
            
        case 'descriptive':
            resultsHTML = `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-blue-800 mb-2">データ数</h4>
                        <p class="text-2xl font-bold text-blue-600">${results.stats.count}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-green-800 mb-2">平均</h4>
                        <p class="text-2xl font-bold text-green-600">${results.stats.mean.toFixed(4)}</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-purple-800 mb-2">中央値</h4>
                        <p class="text-2xl font-bold text-purple-600">${results.stats.median.toFixed(4)}</p>
                    </div>
                    <div class="bg-orange-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-orange-800 mb-2">標準偏差</h4>
                        <p class="text-2xl font-bold text-orange-600">${results.stats.standardDeviation.toFixed(4)}</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-red-800 mb-2">最小値</h4>
                        <p class="text-2xl font-bold text-red-600">${results.stats.min.toFixed(4)}</p>
                    </div>
                    <div class="bg-indigo-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-indigo-800 mb-2">最大値</h4>
                        <p class="text-2xl font-bold text-indigo-600">${results.stats.max.toFixed(4)}</p>
                    </div>
                    <div class="bg-pink-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-pink-800 mb-2">第1四分位数</h4>
                        <p class="text-2xl font-bold text-pink-600">${results.stats.q1.toFixed(4)}</p>
                    </div>
                    <div class="bg-teal-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-teal-800 mb-2">第3四分位数</h4>
                        <p class="text-2xl font-bold text-teal-600">${results.stats.q3.toFixed(4)}</p>
                    </div>
                </div>
            `;
            break;
            
        case 'controlChart':
            resultsHTML = `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-green-800 mb-2">中心線 (平均)</h4>
                        <p class="text-2xl font-bold text-green-600">${results.mean.toFixed(4)}</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-red-800 mb-2">UCL (+3σ)</h4>
                        <p class="text-2xl font-bold text-red-600">${results.ucl.toFixed(4)}</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-red-800 mb-2">LCL (-3σ)</h4>
                        <p class="text-2xl font-bold text-red-600">${results.lcl.toFixed(4)}</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-yellow-800 mb-2">異常点</h4>
                        <p class="text-2xl font-bold text-yellow-600">${results.outliers.length} 個</p>
                    </div>
                </div>
                ${results.outliers.length > 0 ? `
                    <div class="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                        <h4 class="font-semibold text-yellow-800 mb-2">異常点の詳細</h4>
                        <ul class="list-disc list-inside text-yellow-700">
                            ${results.outliers.map(outlier => 
                                `<li>サンプル ${outlier.index + 1}: ${outlier.value.toFixed(4)}</li>`
                            ).join('')}
                        </ul>
                    </div>
                ` : ''}
            `;
            break;
            
        case 'processCapability':
            resultsHTML = `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-blue-800 mb-2">Cp</h4>
                        <p class="text-2xl font-bold text-blue-600">${results.cp.toFixed(4)}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-green-800 mb-2">Cpk</h4>
                        <p class="text-2xl font-bold text-green-600">${results.cpk.toFixed(4)}</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-purple-800 mb-2">プロセス平均</h4>
                        <p class="text-2xl font-bold text-purple-600">${results.mean.toFixed(4)}</p>
                    </div>
                    <div class="bg-orange-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-orange-800 mb-2">標準偏差</h4>
                        <p class="text-2xl font-bold text-orange-600">${results.stdDev.toFixed(4)}</p>
                    </div>
                </div>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-2">規格限界</h4>
                        <p><strong>上限規格値 (USL):</strong> ${results.usl}</p>
                        <p><strong>下限規格値 (LSL):</strong> ${results.lsl}</p>
                        <p><strong>規格幅:</strong> ${(results.usl - results.lsl).toFixed(4)}</p>
                    </div>
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-2">工程能力評価</h4>
                        <p><strong>Cp評価:</strong> ${getCpEvaluation(results.cp)}</p>
                        <p><strong>Cpk評価:</strong> ${getCpkEvaluation(results.cpk)}</p>
                    </div>
                </div>
            `;
            break;
    }
    
    analysisResults.innerHTML = resultsHTML;
    
    // 解釈を表示
    if (results.interpretation) {
        interpretationResults.classList.remove('hidden');
        interpretationText.innerHTML = results.interpretation;
    }
}

// Cp評価
function getCpEvaluation(cp) {
    if (cp >= 1.67) return '優秀 (Cp ≥ 1.67)';
    if (cp >= 1.33) return '良好 (1.33 ≤ Cp < 1.67)';
    if (cp >= 1.0) return '最低限 (1.0 ≤ Cp < 1.33)';
    return '不十分 (Cp < 1.0)';
}

// Cpk評価
function getCpkEvaluation(cpk) {
    if (cpk >= 1.67) return '優秀 (Cpk ≥ 1.67)';
    if (cpk >= 1.33) return '良好 (1.33 ≤ Cpk < 1.67)';
    if (cpk >= 1.0) return '最低限 (1.0 ≤ Cpk < 1.33)';
    return '不十分 (Cpk < 1.0)';
}

// グラフダウンロード
function downloadPlot(format) {
    const plotElement = document.getElementById('plotContainer');
    
    if (format === 'png') {
        Plotly.downloadImage(plotElement, {
            format: 'png',
            width: 1200,
            height: 800,
            filename: `analysis_plot_${new Date().getTime()}`
        });
    } else if (format === 'svg') {
        Plotly.downloadImage(plotElement, {
            format: 'svg',
            width: 1200,
            height: 800,
            filename: `analysis_plot_${new Date().getTime()}`
        });
    }
} 