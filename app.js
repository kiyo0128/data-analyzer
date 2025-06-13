// データ分析サイト メインJavaScript
// 作成日: 2025-01-12

// グローバル変数
let uploadedData = {};
let currentDataKey = null;
let currentData = null;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
    initializeEventListeners();
});

// ファイルアップロード機能の初期化
function initializeFileUpload() {
    const fileDropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');

    // ドラッグ&ドロップイベント
    fileDropZone.addEventListener('click', () => fileInput.click());
    fileDropZone.addEventListener('dragover', handleDragOver);
    fileDropZone.addEventListener('dragleave', handleDragLeave);
    fileDropZone.addEventListener('drop', handleFileDrop);
    
    // ファイル選択イベント
    fileInput.addEventListener('change', handleFileSelect);
}

// イベントリスナーの初期化
function initializeEventListeners() {
    const fileSelector = document.getElementById('fileSelector');
    const xColumnSelect = document.getElementById('xColumnSelect');
    const yColumnSelect = document.getElementById('yColumnSelect');
    
    fileSelector.addEventListener('change', handleFileSelection);
    xColumnSelect.addEventListener('change', updateAnalysisOptions);
    yColumnSelect.addEventListener('change', updateAnalysisOptions);
}

// ドラッグオーバー処理
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

// ドラッグリーブ処理
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

// ファイルドロップ処理
function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    processFiles(files);
}

// ファイル選択処理
function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

// ファイル処理
async function processFiles(files) {
    const fileList = document.getElementById('fileList');
    const uploadedFiles = document.getElementById('uploadedFiles');
    const fileSelector = document.getElementById('fileSelector');
    
    // ファイルサイズチェック（最大50MB）
    const maxSize = 50 * 1024 * 1024;
    
    for (let file of files) {
        if (file.size > maxSize) {
            alert(`ファイル "${file.name}" のサイズが50MBを超えています。`);
            continue;
        }
        
        try {
            const data = await readFile(file);
            const fileKey = `${file.name}_${Date.now()}`;
            
            uploadedData[fileKey] = {
                name: file.name,
                data: data,
                type: getFileType(file.name),
                uploadDate: new Date().toLocaleString('ja-JP')
            };
            
            // UIに追加
            addFileToList(fileKey, uploadedFiles);
            addFileToSelector(fileKey, fileSelector);
            
        } catch (error) {
            console.error('ファイル読み込みエラー:', error);
            alert(`ファイル "${file.name}" の読み込みに失敗しました。`);
        }
    }
    
    // ファイルリストを表示
    if (Object.keys(uploadedData).length > 0) {
        fileList.classList.remove('hidden');
        document.getElementById('dataPreviewSection').classList.remove('hidden');
    }
}

// ファイル読み込み
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                const fileType = getFileType(file.name);
                let data;
                
                switch (fileType) {
                    case 'csv':
                    case 'tsv':
                        data = parseCSV(content, fileType === 'tsv' ? '\t' : ',');
                        break;
                    case 'xlsx':
                        data = parseExcel(content);
                        break;
                    case 'json':
                        data = JSON.parse(content);
                        break;
                    default:
                        throw new Error('サポートされていないファイル形式です');
                }
                
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('ファイル読み込みエラー'));
        
        // ファイルタイプに応じて読み込み方法を変更
        if (getFileType(file.name) === 'xlsx') {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    });
}

// ファイルタイプ判定
function getFileType(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    return extension;
}

// CSV/TSV解析
function parseCSV(content, delimiter = ',') {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
        const row = {};
        
        headers.forEach((header, index) => {
            const value = values[index] || '';
            // 数値変換を試行
            const numValue = parseFloat(value);
            row[header] = isNaN(numValue) ? value : numValue;
        });
        
        data.push(row);
    }
    
    return data;
}

// Excel解析
function parseExcel(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    return XLSX.utils.sheet_to_json(worksheet);
}

// ファイルリストに追加
function addFileToList(fileKey, container) {
    const fileInfo = uploadedData[fileKey];
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center p-3 bg-gray-50 rounded';
    
    li.innerHTML = `
        <div>
            <span class="font-medium">${fileInfo.name}</span>
            <span class="text-sm text-gray-500 ml-2">(${fileInfo.data.length} 行)</span>
        </div>
        <div class="text-sm text-gray-500">
            ${fileInfo.uploadDate}
        </div>
    `;
    
    container.appendChild(li);
}

// ファイルセレクターに追加
function addFileToSelector(fileKey, selector) {
    const fileInfo = uploadedData[fileKey];
    const option = document.createElement('option');
    option.value = fileKey;
    option.textContent = `${fileInfo.name} (${fileInfo.data.length} 行)`;
    
    selector.appendChild(option);
}

// ファイル選択処理
function handleFileSelection(e) {
    const fileKey = e.target.value;
    if (fileKey && uploadedData[fileKey]) {
        currentDataKey = fileKey;
        currentData = uploadedData[fileKey].data;
        
        // データ情報のみ表示（プレビューは表示しない）
        displayDataInfo(currentData);
        populateColumnSelectors(currentData);
        
        // データプレビューコントロールを表示
        document.getElementById('dataPreviewControls').classList.remove('hidden');
        document.getElementById('columnSelectionSection').classList.remove('hidden');
        
        // データプレビューは非表示状態にリセット
        hideDataPreview();
    }
}

// データ情報のみ表示（軽量版）
function displayDataInfo(data) {
    const dataInfo = document.getElementById('dataInfo');
    
    if (!data || data.length === 0) {
        dataInfo.innerHTML = '<span class="text-gray-500">データがありません</span>';
        return;
    }
    
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => 
        data.some(row => typeof row[col] === 'number')
    ).length;
    
    dataInfo.innerHTML = `
        <strong>📊 ${data.length.toLocaleString()} 行</strong> × 
        <strong>${columns.length} 列</strong>
        <span class="text-gray-500 ml-2">(数値列: ${numericColumns})</span>
    `;
}

// データプレビュー表示（オンデマンド）
function displayDataPreview(data) {
    const previewContainer = document.getElementById('dataPreview');
    
    if (!data || data.length === 0) {
        previewContainer.innerHTML = '<p class="text-gray-500 p-4">データがありません</p>';
        return;
    }
    
    // パフォーマンス向上のため最初の1000行のみ表示
    const previewData = data.slice(0, 1000);
    const columns = Object.keys(data[0]);
    
    // ローディング表示
    previewContainer.innerHTML = `
        <div class="flex items-center justify-center p-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
            <span class="text-gray-600">データを読み込み中...</span>
        </div>
    `;
    
    // 少し遅延させてUIの応答性を保つ
    setTimeout(() => {
        // テーブル作成
        let html = '<div class="overflow-x-auto"><table class="min-w-full border-collapse border border-gray-300">';
        
        // ヘッダー
        html += '<thead><tr class="bg-gradient-to-r from-purple-100 to-blue-100">';
        columns.forEach(col => {
            html += `<th class="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 sticky top-0 bg-gray-100">${col}</th>`;
        });
        html += '</tr></thead>';
        
        // データ行
        html += '<tbody>';
        previewData.forEach((row, index) => {
            html += `<tr class="${index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'} transition-colors">`;
            columns.forEach(col => {
                const value = row[col] !== undefined ? row[col] : '';
                const displayValue = typeof value === 'number' ? 
                    value.toLocaleString() : 
                    String(value).length > 50 ? String(value).substring(0, 50) + '...' : value;
                html += `<td class="border border-gray-300 px-4 py-2 text-sm">${displayValue}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        
        previewContainer.innerHTML = html;
    }, 100);
}

// データプレビューの表示/非表示切り替え
function toggleDataPreview() {
    const container = document.getElementById('dataPreviewContainer');
    const showBtn = document.getElementById('showDataBtn');
    const hideBtn = document.getElementById('hideDataBtn');
    
    if (container.classList.contains('hidden')) {
        // データを表示
        container.classList.remove('hidden');
        showBtn.classList.add('hidden');
        hideBtn.classList.remove('hidden');
        
        // データが未表示の場合は読み込み
        if (currentData && document.getElementById('dataPreview').innerHTML === '') {
            displayDataPreview(currentData);
        }
    } else {
        // データを非表示
        hideDataPreview();
    }
}

// データプレビューを非表示にする
function hideDataPreview() {
    const container = document.getElementById('dataPreviewContainer');
    const showBtn = document.getElementById('showDataBtn');
    const hideBtn = document.getElementById('hideDataBtn');
    
    container.classList.add('hidden');
    showBtn.classList.remove('hidden');
    hideBtn.classList.add('hidden');
    
    // メモリ節約のためプレビューをクリア
    document.getElementById('dataPreview').innerHTML = '';
}

// 列セレクター更新
function populateColumnSelectors(data) {
    if (!data || data.length === 0) return;
    
    const columns = Object.keys(data[0]);
    const xSelect = document.getElementById('xColumnSelect');
    const ySelect = document.getElementById('yColumnSelect');
    
    // 既存のオプションをクリア（最初のオプションは残す）
    xSelect.innerHTML = '<option value="">列を選択してください</option>';
    ySelect.innerHTML = '<option value="">列を選択してください</option>';
    
    // 数値列のみを選択肢に追加
    columns.forEach(col => {
        const isNumeric = data.some(row => typeof row[col] === 'number');
        if (isNumeric) {
            const optionX = document.createElement('option');
            const optionY = document.createElement('option');
            
            optionX.value = col;
            optionX.textContent = col;
            optionY.value = col;
            optionY.textContent = col;
            
            xSelect.appendChild(optionX);
            ySelect.appendChild(optionY);
        }
    });
    
    // イベントリスナーを追加（重複を避けるため一度削除）
    xSelect.removeEventListener('change', updateAnalysisOptions);
    ySelect.removeEventListener('change', updateAnalysisOptions);
    xSelect.addEventListener('change', updateAnalysisOptions);
    ySelect.addEventListener('change', updateAnalysisOptions);
}

// 分析オプション更新
function updateAnalysisOptions() {
    const xColumn = document.getElementById('xColumnSelect').value;
    const yColumn = document.getElementById('yColumnSelect').value;
    
    // 列が選択されたら分析セクションを表示
    if (xColumn || yColumn) {
        document.getElementById('analysisSelectionSection').classList.remove('hidden');
        
        // スムーズにスクロール
        setTimeout(() => {
            document.getElementById('analysisSelectionSection').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    } else {
        document.getElementById('analysisSelectionSection').classList.add('hidden');
    }
}

// 分析ページへ移動
function startAnalysis() {
    const selectedFile = document.getElementById('fileSelector').value;
    const xColumn = document.getElementById('xColumnSelect').value;
    const yColumn = document.getElementById('yColumnSelect').value;
    const missingValueMethod = document.querySelector('input[name="missingValue"]:checked').value;
    
    if (!selectedFile || (!xColumn && !yColumn)) {
        alert('ファイルと分析対象の列を選択してください。');
        return;
    }
    
    // 分析用データをlocalStorageに保存
    const analysisData = {
        selectedFile: selectedFile,
        fileName: uploadedData[selectedFile].name,
        xColumn: xColumn,
        yColumn: yColumn,
        missingValueMethod: missingValueMethod,
        data: currentData,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('analysisData', JSON.stringify(analysisData));
    
    // 分析ページに移動
    window.location.href = 'analyzer.html';
}

// 分析実行
async function runAnalysis(analysisType) {
    console.log('分析開始:', analysisType);
    
    if (!currentData) {
        showNotification('まずデータを選択してください。', 'warning');
        return;
    }
    
    const xColumn = document.getElementById('xColumnSelect').value;
    const yColumn = document.getElementById('yColumnSelect').value;
    
    // ローディング表示
    showLoading(true);
    
    try {
        // 分析タイプに応じた前処理とバリデーション
        let processedData;
        let targetColumn;
        
        switch (analysisType) {
            case 'correlation':
            case 'regression':
                if (!xColumn || !yColumn) {
                    showNotification('X軸とY軸の両方を選択してください。', 'warning');
                    return;
                }
                processedData = await preprocessDataAsync(currentData, [xColumn, yColumn]);
                break;
                
            case 'descriptive':
            case 'histogram':
                if (!xColumn && !yColumn) {
                    showNotification('分析する列を選択してください。', 'warning');
                    return;
                }
                targetColumn = xColumn || yColumn;
                processedData = await preprocessDataAsync(currentData, [targetColumn]);
                break;
                
            case 'processCapability':
                showProcessCapabilityForm();
                return;
                
            case 'controlChart':
                if (!xColumn && !yColumn) {
                    showNotification('分析する列を選択してください。', 'warning');
                    return;
                }
                targetColumn = xColumn || yColumn;
                processedData = await preprocessDataAsync(currentData, [targetColumn]);
                break;
                
            default:
                showNotification('サポートされていない分析です。', 'error');
                return;
        }
        
        // データサイズチェック
        if (processedData.length > 50000) {
            const proceed = confirm(`データサイズが大きいです (${processedData.length.toLocaleString()} 行)。\n処理に時間がかかる可能性がありますが、続行しますか？`);
            if (!proceed) {
                return;
            }
        }
        
        // 分析実行
        const results = await performAnalysis(analysisType, processedData, { 
            xColumn, 
            yColumn, 
            targetColumn: targetColumn || xColumn 
        });
        
        // 結果表示
        await displayResults(analysisType, results);
        
        showNotification('分析が完了しました！', 'success');
        
    } catch (error) {
        console.error('分析エラー:', error);
        showNotification(`分析中にエラーが発生しました: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// 通知表示
function showNotification(message, type = 'info') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    const icons = {
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
    };
    
    notification.className += ` ${colors[type]}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="${icons[type]} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // アニメーション
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // 自動削除
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ローディング表示制御
function showLoading(show) {
    const loadingSection = document.getElementById('loadingSection');
    if (show) {
        loadingSection.classList.remove('hidden');
        loadingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        loadingSection.classList.add('hidden');
    }
}

// 工程能力分析フォーム表示
function showProcessCapabilityForm() {
    document.getElementById('processCapabilityForm').classList.remove('hidden');
    document.getElementById('processCapabilityForm').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// 工程能力分析フォーム非表示
function hideProcessCapabilityForm() {
    document.getElementById('processCapabilityForm').classList.add('hidden');
}

// 非同期データ前処理（パフォーマンス改善）
async function preprocessDataAsync(data, columns) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const result = preprocessData(data, columns);
            resolve(result);
        }, 10); // UIをブロックしないよう少し遅延
    });
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

// 結果表示
async function displayResults(analysisType, results) {
    // 可視化セクションを表示
    document.getElementById('visualizationSection').classList.remove('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');
    
    // 結果をスクロール表示
    setTimeout(() => {
        document.getElementById('visualizationSection').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 300);
    
    // 結果の詳細表示は既存の関数を使用
    console.log('分析結果:', results);
}

// ホームに戻る
function goHome() {
    window.location.href = 'index.html';
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