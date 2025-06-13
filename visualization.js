// 可視化機能モジュール
// 作成日: 2025-01-12

// 安全な数値フォーマット関数
function safeToFixed(value, digits = 4) {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
        return 'N/A';
    }
    return Number(value).toFixed(digits);
}

// 散布図作成
function createScatterPlot(xValues, yValues, xColumn, yColumn, correlation) {
    return {
        data: [{
            x: xValues,
            y: yValues,
            mode: 'markers',
            type: 'scatter',
            name: 'データポイント',
            marker: {
                size: 8,
                color: 'rgba(102, 126, 234, 0.7)',
                line: {
                    color: 'rgba(102, 126, 234, 1)',
                    width: 1
                }
            }
        }],
        layout: {
            title: {
                text: `${xColumn} vs ${yColumn} の散布図<br><sub>相関係数: ${correlation.toFixed(4)}</sub>`,
                font: { size: 16 }
            },
            xaxis: { 
                title: xColumn,
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            yaxis: { 
                title: yColumn,
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { family: 'Inter, sans-serif' }
        }
    };
}

// 回帰直線付き散布図
function createRegressionPlot(xValues, yValues, xColumn, yColumn, regression) {
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const regressionLine = {
        x: [minX, maxX],
        y: [regression.m * minX + regression.b, regression.m * maxX + regression.b]
    };
    
    return {
        data: [
            {
                x: xValues,
                y: yValues,
                mode: 'markers',
                type: 'scatter',
                name: 'データポイント',
                marker: {
                    size: 8,
                    color: 'rgba(102, 126, 234, 0.7)',
                    line: {
                        color: 'rgba(102, 126, 234, 1)',
                        width: 1
                    }
                }
            },
            {
                x: regressionLine.x,
                y: regressionLine.y,
                mode: 'lines',
                type: 'scatter',
                name: '回帰直線',
                line: {
                    color: 'rgba(239, 68, 68, 1)',
                    width: 3
                }
            }
        ],
        layout: {
            title: {
                text: `${xColumn} vs ${yColumn} の回帰分析<br><sub>y = ${regression.m.toFixed(4)}x + ${regression.b.toFixed(4)}</sub>`,
                font: { size: 16 }
            },
            xaxis: { 
                title: xColumn,
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            yaxis: { 
                title: yColumn,
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { family: 'Inter, sans-serif' }
        }
    };
}

// ボックスプロット
function createBoxPlot(values, column) {
    return {
        data: [{
            y: values,
            type: 'box',
            name: column,
            boxpoints: 'outliers',
            marker: {
                color: 'rgba(16, 185, 129, 0.7)',
                outliercolor: 'rgba(239, 68, 68, 0.8)',
                line: {
                    outliercolor: 'rgba(239, 68, 68, 1)',
                    outlierwidth: 2
                }
            },
            line: {
                color: 'rgba(16, 185, 129, 1)'
            }
        }],
        layout: {
            title: {
                text: `${column} のボックスプロット`,
                font: { size: 16 }
            },
            yaxis: { 
                title: column,
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { family: 'Inter, sans-serif' }
        }
    };
}

// ヒストグラム
function createHistogramPlot(values, column) {
    const binCount = Math.min(30, Math.ceil(Math.sqrt(values.length)));
    
    return {
        data: [{
            x: values,
            type: 'histogram',
            name: column,
            nbinsx: binCount,
            marker: {
                color: 'rgba(147, 51, 234, 0.7)',
                line: {
                    color: 'rgba(147, 51, 234, 1)',
                    width: 1
                }
            }
        }],
        layout: {
            title: {
                text: `${column} のヒストグラム`,
                font: { size: 16 }
            },
            xaxis: { 
                title: column,
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            yaxis: { 
                title: '度数',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            bargap: 0.1,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { family: 'Inter, sans-serif' }
        }
    };
}

// 工程能力分析プロット
function createProcessCapabilityPlot(values, column, usl, lsl, mean, stdDev) {
    const binCount = Math.min(30, Math.ceil(Math.sqrt(values.length)));
    
    const traces = [{
        x: values,
        type: 'histogram',
        name: 'データ分布',
        nbinsx: binCount,
        marker: {
            color: 'rgba(59, 130, 246, 0.7)',
            line: {
                color: 'rgba(59, 130, 246, 1)',
                width: 1
            }
        }
    }];
    
    // 平均線
    traces.push({
        x: [mean, mean],
        y: [0, Math.max(...values) * 0.1],
        mode: 'lines',
        type: 'scatter',
        name: '平均',
        line: {
            color: 'green',
            width: 3,
            dash: 'dash'
        }
    });
    
    // 規格限界線
    if (!isNaN(usl)) {
        traces.push({
            x: [usl, usl],
            y: [0, Math.max(...values) * 0.1],
            mode: 'lines',
            type: 'scatter',
            name: 'USL',
            line: {
                color: 'red',
                width: 3,
                dash: 'dash'
            }
        });
    }
    
    if (!isNaN(lsl)) {
        traces.push({
            x: [lsl, lsl],
            y: [0, Math.max(...values) * 0.1],
            mode: 'lines',
            type: 'scatter',
            name: 'LSL',
            line: {
                color: 'red',
                width: 3,
                dash: 'dash'
            }
        });
    }
    
    return {
        data: traces,
        layout: {
            title: {
                text: `${column} の工程能力分析`,
                font: { size: 16 }
            },
            xaxis: { 
                title: column,
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            yaxis: { 
                title: '度数',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            bargap: 0.1,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { family: 'Inter, sans-serif' }
        }
    };
}

// 管理図
function createControlChartPlot(values, column, mean, ucl, lcl) {
    const indices = values.map((_, i) => i + 1);
    
    // 異常点の特定
    const normalPoints = [];
    const outlierPoints = [];
    const outlierIndices = [];
    
    values.forEach((value, index) => {
        if (value > ucl || value < lcl) {
            outlierPoints.push(value);
            outlierIndices.push(index + 1);
        } else {
            normalPoints.push(value);
        }
    });
    
    const traces = [
        {
            x: indices,
            y: values,
            mode: 'lines+markers',
            type: 'scatter',
            name: 'データ',
            line: { color: 'rgba(59, 130, 246, 1)' },
            marker: { 
                color: values.map(v => (v > ucl || v < lcl) ? 'red' : 'rgba(59, 130, 246, 1)'),
                size: 6
            }
        },
        {
            x: [1, values.length],
            y: [mean, mean],
            mode: 'lines',
            type: 'scatter',
            name: '中心線 (CL)',
            line: { color: 'green', width: 2, dash: 'dash' }
        },
        {
            x: [1, values.length],
            y: [ucl, ucl],
            mode: 'lines',
            type: 'scatter',
            name: 'UCL (+3σ)',
            line: { color: 'red', width: 2, dash: 'dash' }
        },
        {
            x: [1, values.length],
            y: [lcl, lcl],
            mode: 'lines',
            type: 'scatter',
            name: 'LCL (-3σ)',
            line: { color: 'red', width: 2, dash: 'dash' }
        }
    ];
    
    return {
        data: traces,
        layout: {
            title: {
                text: `${column} の管理図`,
                font: { size: 16 }
            },
            xaxis: { 
                title: 'サンプル番号',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            yaxis: { 
                title: column,
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { family: 'Inter, sans-serif' }
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
    
    // 新しい統計結果構造に対応
    if (results.statistics) {
        resultsHTML = '<div class="grid gap-4">';
        
        Object.entries(results.statistics).forEach(([key, value]) => {
            const displayValue = typeof value === 'number' ? safeToFixed(value) : value;
            resultsHTML += `
                <div class="bg-white p-4 rounded-lg shadow-sm border">
                    <div class="flex justify-between items-center">
                        <span class="font-semibold text-gray-700">${key}</span>
                        <span class="text-lg font-bold text-purple-600">${displayValue}</span>
                    </div>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
    } else {
        // 旧形式の結果に対応（後方互換性）
        switch (analysisType) {
            case 'correlation':
                resultsHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-blue-800 mb-2">Pearson相関係数</h4>
                            <p class="text-2xl font-bold text-blue-600">${safeToFixed(results.pearsonR)}</p>
                        </div>
                        <div class="bg-green-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-green-800 mb-2">Spearman相関係数</h4>
                            <p class="text-2xl font-bold text-green-600">${safeToFixed(results.spearmanR)}</p>
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

// マハラノビス距離の可視化
function createMahalanobisPlot(distances, xColumn, yColumn, meanX, meanY, threshold) {
    const normalPoints = distances.filter(d => !d.isOutlier);
    const outlierPoints = distances.filter(d => d.isOutlier);
    
    const data = [
        {
            x: normalPoints.map(d => d.x),
            y: normalPoints.map(d => d.y),
            mode: 'markers',
            type: 'scatter',
            name: '正常値',
            marker: {
                color: '#3B82F6',
                size: 8,
                opacity: 0.7
            },
            text: normalPoints.map(d => `サンプル ${d.index}<br>距離: ${d.distance.toFixed(3)}`),
            hovertemplate: '%{text}<br>%{xaxis.title.text}: %{x}<br>%{yaxis.title.text}: %{y}<extra></extra>'
        },
        {
            x: outlierPoints.map(d => d.x),
            y: outlierPoints.map(d => d.y),
            mode: 'markers',
            type: 'scatter',
            name: '異常値',
            marker: {
                color: '#EF4444',
                size: 12,
                symbol: 'diamond',
                line: {
                    color: '#DC2626',
                    width: 2
                }
            },
            text: outlierPoints.map(d => `サンプル ${d.index}<br>距離: ${d.distance.toFixed(3)}`),
            hovertemplate: '%{text}<br>%{xaxis.title.text}: %{x}<br>%{yaxis.title.text}: %{y}<extra></extra>'
        },
        {
            x: [meanX],
            y: [meanY],
            mode: 'markers',
            type: 'scatter',
            name: '重心',
            marker: {
                color: '#10B981',
                size: 15,
                symbol: 'cross',
                line: {
                    color: '#059669',
                    width: 3
                }
            },
            hovertemplate: '重心<br>%{xaxis.title.text}: %{x}<br>%{yaxis.title.text}: %{y}<extra></extra>'
        }
    ];
    
    // 信頼楕円の追加（簡略化）
    const ellipsePoints = generateEllipse(meanX, meanY, Math.sqrt(threshold), 50);
    data.push({
        x: ellipsePoints.x,
        y: ellipsePoints.y,
        mode: 'lines',
        type: 'scatter',
        name: '95%信頼楕円',
        line: {
            color: '#F59E0B',
            width: 2,
            dash: 'dash'
        },
        hoverinfo: 'skip'
    });
    
    return {
        data: data,
        layout: {
            title: {
                text: `マハラノビス距離による異常値検出<br><sub>${xColumn} vs ${yColumn}</sub>`,
                font: { size: 16, family: 'Inter, sans-serif' }
            },
            xaxis: {
                title: xColumn,
                gridcolor: 'rgba(0,0,0,0.1)',
                zeroline: false
            },
            yaxis: {
                title: yColumn,
                gridcolor: 'rgba(0,0,0,0.1)',
                zeroline: false
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { family: 'Inter, sans-serif' },
            legend: {
                x: 1.02,
                y: 1,
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: 'rgba(0,0,0,0.2)',
                borderwidth: 1
            }
        }
    };
}

// 楕円生成関数（簡略化）
function generateEllipse(centerX, centerY, radius, numPoints) {
    const x = [];
    const y = [];
    
    for (let i = 0; i <= numPoints; i++) {
        const angle = (2 * Math.PI * i) / numPoints;
        x.push(centerX + radius * Math.cos(angle));
        y.push(centerY + radius * Math.sin(angle));
    }
    
    return { x, y };
}

// 異常値検出の可視化
function createOutlierPlot(analysisResults, column, stats) {
    const normalPoints = analysisResults.filter(d => !d.isAnyOutlier);
    const iqrOutliers = analysisResults.filter(d => d.isIQROutlier);
    const zOutliers = analysisResults.filter(d => d.isZOutlier && !d.isIQROutlier);
    const modifiedZOutliers = analysisResults.filter(d => d.isModifiedZOutlier && !d.isIQROutlier && !d.isZOutlier);
    
    const data = [
        // ボックスプロット
        {
            y: analysisResults.map(d => d.value),
            type: 'box',
            name: 'ボックスプロット',
            boxpoints: false,
            line: { color: '#6366F1' },
            fillcolor: 'rgba(99, 102, 241, 0.3)',
            marker: { color: '#6366F1' }
        },
        // 正常値
        {
            x: normalPoints.map(d => 1),
            y: normalPoints.map(d => d.value),
            mode: 'markers',
            type: 'scatter',
            name: '正常値',
            marker: {
                color: '#10B981',
                size: 8,
                opacity: 0.7
            },
            text: normalPoints.map(d => `サンプル ${d.index}<br>値: ${d.value.toFixed(3)}<br>Z-score: ${d.zScore.toFixed(3)}`),
            hovertemplate: '%{text}<extra></extra>',
            xaxis: 'x2'
        },
        // IQR法異常値
        {
            x: iqrOutliers.map(d => 1),
            y: iqrOutliers.map(d => d.value),
            mode: 'markers',
            type: 'scatter',
            name: 'IQR法異常値',
            marker: {
                color: '#EF4444',
                size: 10,
                symbol: 'diamond'
            },
            text: iqrOutliers.map(d => `サンプル ${d.index}<br>値: ${d.value.toFixed(3)}<br>IQR異常値`),
            hovertemplate: '%{text}<extra></extra>',
            xaxis: 'x2'
        },
        // Z-score法異常値
        {
            x: zOutliers.map(d => 1),
            y: zOutliers.map(d => d.value),
            mode: 'markers',
            type: 'scatter',
            name: 'Z-score法異常値',
            marker: {
                color: '#F59E0B',
                size: 10,
                symbol: 'triangle-up'
            },
            text: zOutliers.map(d => `サンプル ${d.index}<br>値: ${d.value.toFixed(3)}<br>Z-score: ${d.zScore.toFixed(3)}`),
            hovertemplate: '%{text}<extra></extra>',
            xaxis: 'x2'
        },
        // 修正Z-score法異常値
        {
            x: modifiedZOutliers.map(d => 1),
            y: modifiedZOutliers.map(d => d.value),
            mode: 'markers',
            type: 'scatter',
            name: '修正Z-score法異常値',
            marker: {
                color: '#8B5CF6',
                size: 10,
                symbol: 'square'
            },
            text: modifiedZOutliers.map(d => `サンプル ${d.index}<br>値: ${d.value.toFixed(3)}<br>修正Z-score: ${d.modifiedZScore.toFixed(3)}`),
            hovertemplate: '%{text}<extra></extra>',
            xaxis: 'x2'
        }
    ];
    
    return {
        data: data,
        layout: {
            title: {
                text: `異常値検出分析<br><sub>${column}</sub>`,
                font: { size: 16, family: 'Inter, sans-serif' }
            },
            xaxis: {
                domain: [0, 0.45],
                title: '',
                showticklabels: false,
                showgrid: false,
                zeroline: false
            },
            xaxis2: {
                domain: [0.55, 1],
                title: '',
                showticklabels: false,
                showgrid: false,
                zeroline: false,
                range: [0.5, 1.5]
            },
            yaxis: {
                title: column,
                gridcolor: 'rgba(0,0,0,0.1)',
                zeroline: false
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { family: 'Inter, sans-serif' },
            legend: {
                x: 1.02,
                y: 1,
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: 'rgba(0,0,0,0.2)',
                borderwidth: 1
            },
            shapes: [
                // 平均線
                {
                    type: 'line',
                    x0: 0, x1: 1,
                    y0: stats.mean, y1: stats.mean,
                    line: { color: '#10B981', width: 2, dash: 'solid' },
                    name: '平均'
                },
                // 中央値線
                {
                    type: 'line',
                    x0: 0, x1: 1,
                    y0: stats.median, y1: stats.median,
                    line: { color: '#6366F1', width: 2, dash: 'dot' },
                    name: '中央値'
                },
                // ±3σ線
                {
                    type: 'line',
                    x0: 0, x1: 1,
                    y0: stats.mean + 3 * stats.stdDev, y1: stats.mean + 3 * stats.stdDev,
                    line: { color: '#EF4444', width: 1, dash: 'dash' }
                },
                {
                    type: 'line',
                    x0: 0, x1: 1,
                    y0: stats.mean - 3 * stats.stdDev, y1: stats.mean - 3 * stats.stdDev,
                    line: { color: '#EF4444', width: 1, dash: 'dash' }
                }
            ],
            annotations: [
                {
                    x: 0.02, y: stats.mean,
                    text: '平均',
                    showarrow: false,
                    font: { color: '#10B981', size: 10 }
                },
                {
                    x: 0.02, y: stats.median,
                    text: '中央値',
                    showarrow: false,
                    font: { color: '#6366F1', size: 10 }
                },
                {
                    x: 0.02, y: stats.mean + 3 * stats.stdDev,
                    text: '+3σ',
                    showarrow: false,
                    font: { color: '#EF4444', size: 10 }
                },
                {
                    x: 0.02, y: stats.mean - 3 * stats.stdDev,
                    text: '-3σ',
                    showarrow: false,
                    font: { color: '#EF4444', size: 10 }
                }
            ]
        }
    };
} 