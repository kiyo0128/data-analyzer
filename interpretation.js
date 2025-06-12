// 分析結果解釈機能モジュール
// 作成日: 2025-01-12

// 相関係数の解釈
function interpretCorrelation(r) {
    const abs_r = Math.abs(r);
    let strength = '';
    let direction = r >= 0 ? '正の' : '負の';
    
    if (abs_r >= 0.8) {
        strength = '非常に強い';
    } else if (abs_r >= 0.6) {
        strength = '強い';
    } else if (abs_r >= 0.4) {
        strength = '中程度の';
    } else if (abs_r >= 0.2) {
        strength = '弱い';
    } else {
        strength = 'ほとんどない';
    }
    
    return `
        <p>相関係数は<strong>${r.toFixed(3)}</strong>で、これは<strong>${strength}${direction}相関</strong>を示しています。</p>
        <p>この値は以下を意味します：</p>
        <ul class="list-disc list-inside mt-2">
            <li>相関の強さ: ${strength}（|r| = ${abs_r.toFixed(3)}）</li>
            <li>相関の方向: ${direction}（${r >= 0 ? '一方が増加すると他方も増加' : '一方が増加すると他方は減少'}）</li>
            <li>${abs_r >= 0.7 ? '実用的に意味のある関係があります' : abs_r >= 0.3 ? '統計的に意味のある関係がある可能性があります' : '明確な線形関係は見られません'}</li>
        </ul>
    `;
}

// 回帰分析の解釈
function interpretRegression(regression, rSquared) {
    const direction = regression.m >= 0 ? '正の' : '負の';
    const fit = rSquared >= 0.8 ? '非常に良い' : rSquared >= 0.6 ? '良い' : rSquared >= 0.4 ? '普通' : '悪い';
    
    return `
        <p>回帰分析の結果：</p>
        <ul class="list-disc list-inside mt-2">
            <li><strong>回帰式</strong>: y = ${regression.m.toFixed(4)}x + ${regression.b.toFixed(4)}</li>
            <li><strong>傾き</strong>: ${regression.m.toFixed(4)} （${direction}の関係）</li>
            <li><strong>切片</strong>: ${regression.b.toFixed(4)} （x=0のときのy値）</li>
            <li><strong>決定係数 (R²)</strong>: ${rSquared.toFixed(4)} （${(rSquared * 100).toFixed(1)}%の変動を説明）</li>
            <li><strong>モデルの適合度</strong>: ${fit}（R² = ${rSquared.toFixed(3)}）</li>
        </ul>
        <p class="mt-2">
            ${rSquared >= 0.7 ? 'このモデルは実用的な予測に使用できます。' : 
              rSquared >= 0.4 ? 'このモデルは参考程度に使用できますが、他の要因も考慮が必要です。' : 
              'このモデルの予測能力は限定的です。他の手法や変数の検討を推奨します。'}
        </p>
    `;
}

// 記述統計の解釈
function interpretDescriptiveStats(stats) {
    const cv = (stats.standardDeviation / stats.mean) * 100; // 変動係数
    const variability = cv <= 10 ? '低い' : cv <= 20 ? '中程度' : '高い';
    
    return `
        <p>データの特徴：</p>
        <ul class="list-disc list-inside mt-2">
            <li><strong>中心傾向</strong>: 平均値 ${stats.mean.toFixed(3)}, 中央値 ${stats.median.toFixed(3)}</li>
            <li><strong>ばらつき</strong>: 標準偏差 ${stats.standardDeviation.toFixed(3)}, 変動係数 ${cv.toFixed(1)}% （${variability}）</li>
            <li><strong>範囲</strong>: ${stats.min.toFixed(3)} ～ ${stats.max.toFixed(3)} （範囲: ${stats.range.toFixed(3)}）</li>
            <li><strong>四分位範囲</strong>: Q1=${stats.q1.toFixed(3)}, Q3=${stats.q3.toFixed(3)}, IQR=${stats.iqr.toFixed(3)}</li>
        </ul>
        <p class="mt-2">
            ${cv <= 10 ? 'データの変動は安定しており、工程管理が良好です。' : 
              cv <= 20 ? 'データの変動は一般的な範囲内ですが、改善の余地があります。' : 
              'データの変動が大きく、工程の安定化が必要です。'}
        </p>
    `;
}

// ヒストグラムの解釈
function interpretHistogram(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100;
    
    // 正規性の簡易チェック（経験則）
    const withinOneSigma = values.filter(v => Math.abs(v - mean) <= stdDev).length / values.length;
    const withinTwoSigma = values.filter(v => Math.abs(v - mean) <= 2 * stdDev).length / values.length;
    
    const normalityCheck = withinOneSigma >= 0.6 && withinTwoSigma >= 0.9;
    
    return `
        <p>分布の特徴：</p>
        <ul class="list-disc list-inside mt-2">
            <li><strong>データ数</strong>: ${values.length} 個</li>
            <li><strong>中心値</strong>: ${mean.toFixed(3)}</li>
            <li><strong>ばらつき</strong>: 標準偏差 ${stdDev.toFixed(3)}, 変動係数 ${cv.toFixed(1)}%</li>
            <li><strong>正規性</strong>: ${normalityCheck ? '正規分布に近い' : '正規分布から乖離している可能性'}</li>
        </ul>
        <p class="mt-2">
            ${normalityCheck ? 
              '分布は正規分布に近く、統計的分析に適しています。' : 
              '分布が正規分布から乖離している可能性があります。外れ値の確認や非パラメトリック手法の検討を推奨します。'}
        </p>
    `;
}

// 管理図の解釈
function interpretControlChart(outlierCount, totalCount) {
    const outlierRate = (outlierCount / totalCount) * 100;
    const processStatus = outlierCount === 0 ? '管理状態' : outlierCount <= totalCount * 0.05 ? '要注意状態' : '異常状態';
    
    return `
        <p>工程管理状況：</p>
        <ul class="list-disc list-inside mt-2">
            <li><strong>総データ数</strong>: ${totalCount} 個</li>
            <li><strong>異常点数</strong>: ${outlierCount} 個 （${outlierRate.toFixed(1)}%）</li>
            <li><strong>工程状態</strong>: ${processStatus}</li>
        </ul>
        <p class="mt-2">
            ${outlierCount === 0 ? 
              '工程は安定した管理状態にあります。現在の管理方法を継続してください。' :
              '異常点が検出されています。工程の見直しが必要です。'}
        </p>
    `;
}

// 工程能力の解釈
function interpretProcessCapability(cp, cpk) {
    const cpLevel = cp >= 1.67 ? '優秀' : cp >= 1.33 ? '良好' : cp >= 1.0 ? '最低限' : '不適切';
    const cpkLevel = cpk >= 1.67 ? '優秀' : cpk >= 1.33 ? '良好' : cpk >= 1.0 ? '最低限' : '不適切';
    
    return `
        <p>工程能力評価：</p>
        <ul class="list-disc list-inside mt-2">
            <li><strong>Cp</strong>: ${cp.toFixed(3)} - ${cpLevel}</li>
            <li><strong>Cpk</strong>: ${cpk.toFixed(3)} - ${cpkLevel}</li>
        </ul>
        <p class="mt-2">
            ${cpk >= 1.33 ? 
              '工程能力は良好で、安定した品質が期待できます。' :
              cpk >= 1.0 ? 
              '工程能力は最低限の水準です。改善を検討してください。' :
              '工程能力が不足しています。工程の改善が必要です。'}
        </p>
    `;
} 