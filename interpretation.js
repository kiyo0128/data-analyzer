// 分析結果解釈機能モジュール
// 作成日: 2025-01-12

// 相関係数の解釈
function interpretCorrelation(r) {
    const absR = Math.abs(r);
    let strength, direction, interpretation;
    
    // 相関の強さ
    if (absR >= 0.8) {
        strength = "非常に強い";
    } else if (absR >= 0.6) {
        strength = "強い";
    } else if (absR >= 0.4) {
        strength = "中程度の";
    } else if (absR >= 0.2) {
        strength = "弱い";
    } else {
        strength = "ほとんどない";
    }
    
    // 相関の方向
    direction = r > 0 ? "正の" : "負の";
    
    // 解釈文
    if (absR < 0.1) {
        interpretation = "変数間にはほとんど関係がありません。";
    } else {
        interpretation = `変数間には${direction}${strength}相関があります。`;
        
        if (r > 0) {
            interpretation += " 一方の変数が増加すると、もう一方の変数も増加する傾向があります。";
        } else {
            interpretation += " 一方の変数が増加すると、もう一方の変数は減少する傾向があります。";
        }
    }
    
    // 統計的意義の説明
    if (absR >= 0.3) {
        interpretation += " この相関は実用的に意味があると考えられます。";
    } else if (absR >= 0.1) {
        interpretation += " この相関は弱いですが、何らかの関係性が存在する可能性があります。";
    }
    
    return interpretation;
}

// 回帰分析の解釈
function interpretRegression(regression, rSquared) {
    const slope = regression.m;
    const intercept = regression.b;
    
    let interpretation = `回帰式は y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)} です。<br><br>`;
    
    // 傾きの解釈
    if (slope > 0) {
        interpretation += `傾きが正の値（${slope.toFixed(4)}）なので、Xが1単位増加するとYは約${slope.toFixed(4)}単位増加します。`;
    } else {
        interpretation += `傾きが負の値（${slope.toFixed(4)}）なので、Xが1単位増加するとYは約${Math.abs(slope).toFixed(4)}単位減少します。`;
    }
    
    // 決定係数の解釈
    const rSquaredPercent = (rSquared * 100).toFixed(1);
    interpretation += `<br><br>決定係数（R²）は${rSquared.toFixed(4)}（${rSquaredPercent}%）です。`;
    
    if (rSquared >= 0.8) {
        interpretation += " これは非常に良い適合度を示しており、回帰モデルがデータを非常によく説明しています。";
    } else if (rSquared >= 0.6) {
        interpretation += " これは良い適合度を示しており、回帰モデルがデータをよく説明しています。";
    } else if (rSquared >= 0.4) {
        interpretation += " これは中程度の適合度を示しており、回帰モデルがある程度データを説明しています。";
    } else if (rSquared >= 0.2) {
        interpretation += " これは低い適合度を示しており、回帰モデルの説明力は限定的です。";
    } else {
        interpretation += " これは非常に低い適合度を示しており、回帰モデルはデータをほとんど説明できていません。";
    }
    
    // 予測精度の説明
    interpretation += `<br><br>このモデルを使用してYの値を予測する場合、約${rSquaredPercent}%の変動を説明できます。`;
    
    return interpretation;
}

// 記述統計の解釈
function interpretDescriptiveStats(stats) {
    const mean = stats['平均'];
    const median = stats['中央値'];
    const stdDev = stats['標準偏差'];
    const skewness = stats['歪度'];
    const kurtosis = stats['尖度'];
    const min = stats['最小値'];
    const max = stats['最大値'];
    
    let interpretation = `データの基本的な特徴：<br><br>`;
    
    // 中心傾向
    interpretation += `平均値は${mean.toFixed(4)}、中央値は${median.toFixed(4)}です。`;
    
    const meanMedianDiff = Math.abs(mean - median);
    const relativeDiff = meanMedianDiff / Math.abs(mean) * 100;
    
    if (relativeDiff < 5) {
        interpretation += " 平均値と中央値がほぼ等しいため、データは対称的に分布していると考えられます。";
    } else if (mean > median) {
        interpretation += " 平均値が中央値より大きいため、データは右に偏った分布（正の歪み）を示しています。";
    } else {
        interpretation += " 平均値が中央値より小さいため、データは左に偏った分布（負の歪み）を示しています。";
    }
    
    // ばらつき
    const cv = (stdDev / Math.abs(mean)) * 100; // 変動係数
    interpretation += `<br><br>標準偏差は${stdDev.toFixed(4)}で、変動係数は${cv.toFixed(1)}%です。`;
    
    if (cv < 10) {
        interpretation += " データのばらつきは小さく、比較的安定しています。";
    } else if (cv < 20) {
        interpretation += " データのばらつきは中程度です。";
    } else {
        interpretation += " データのばらつきは大きく、変動が激しいです。";
    }
    
    // 歪度の解釈
    interpretation += `<br><br>歪度は${skewness.toFixed(4)}です。`;
    if (Math.abs(skewness) < 0.5) {
        interpretation += " データはほぼ対称的に分布しています。";
    } else if (skewness > 0.5) {
        interpretation += " データは右に偏った分布を示しています（正の歪み）。";
    } else {
        interpretation += " データは左に偏った分布を示しています（負の歪み）。";
    }
    
    // 尖度の解釈
    interpretation += `<br><br>尖度は${kurtosis.toFixed(4)}です。`;
    if (kurtosis > 3) {
        interpretation += " 正規分布より尖った分布（尖鋭な分布）を示しています。";
    } else if (kurtosis < 3) {
        interpretation += " 正規分布より平坦な分布を示しています。";
    } else {
        interpretation += " 正規分布に近い尖度を示しています。";
    }
    
    return interpretation;
}

// ヒストグラムの解釈
function interpretHistogram(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    
    // 正規性の簡易チェック（歪度と尖度を使用）
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues[Math.floor(sortedValues.length / 2)];
    
    let interpretation = `ヒストグラムの分析結果：<br><br>`;
    
    // 分布の形状
    const meanMedianDiff = Math.abs(mean - median);
    const relativeDiff = meanMedianDiff / Math.abs(mean) * 100;
    
    if (relativeDiff < 5) {
        interpretation += "データは対称的な分布を示しています。正規分布に近い可能性があります。";
    } else if (mean > median) {
        interpretation += "データは右に偏った分布（右裾が長い）を示しています。";
    } else {
        interpretation += "データは左に偏った分布（左裾が長い）を示しています。";
    }
    
    // データの範囲
    const range = Math.max(...values) - Math.min(...values);
    const cv = (stdDev / Math.abs(mean)) * 100;
    
    interpretation += `<br><br>データの範囲は${range.toFixed(4)}で、変動係数は${cv.toFixed(1)}%です。`;
    
    if (cv < 15) {
        interpretation += " データは比較的集中しており、ばらつきが小さいです。";
    } else if (cv < 30) {
        interpretation += " データは中程度のばらつきを示しています。";
    } else {
        interpretation += " データは大きなばらつきを示しており、変動が激しいです。";
    }
    
    // 品質管理の観点
    interpretation += `<br><br>品質管理の観点から：`;
    if (cv < 10) {
        interpretation += " プロセスは安定しており、品質のばらつきが小さいです。";
    } else if (cv < 20) {
        interpretation += " プロセスは比較的安定していますが、改善の余地があります。";
    } else {
        interpretation += " プロセスの変動が大きく、品質改善が必要です。";
    }
    
    return interpretation;
}

// 工程能力分析の解釈
function interpretProcessCapability(cp, cpk) {
    let interpretation = `工程能力分析の結果：<br><br>`;
    
    if (cp !== null) {
        interpretation += `Cp値は${cp.toFixed(4)}です。`;
        
        if (cp >= 2.0) {
            interpretation += " 非常に優秀な工程能力を示しています。";
        } else if (cp >= 1.67) {
            interpretation += " 優秀な工程能力を示しています。";
        } else if (cp >= 1.33) {
            interpretation += " 十分な工程能力を示しています。";
        } else if (cp >= 1.0) {
            interpretation += " 最低限の工程能力を示していますが、改善が望ましいです。";
        } else {
            interpretation += " 工程能力が不十分です。改善が必要です。";
        }
    }
    
    if (cpk !== null) {
        interpretation += `<br><br>Cpk値は${cpk.toFixed(4)}です。`;
        
        if (cpk >= 2.0) {
            interpretation += " 非常に優秀な工程能力を示しています。";
        } else if (cpk >= 1.67) {
            interpretation += " 優秀な工程能力を示しています。";
        } else if (cpk >= 1.33) {
            interpretation += " 十分な工程能力を示しています。";
        } else if (cpk >= 1.0) {
            interpretation += " 最低限の工程能力を示していますが、改善が望ましいです。";
        } else {
            interpretation += " 工程能力が不十分です。改善が必要です。";
        }
        
        // CpとCpkの比較
        if (cp !== null && Math.abs(cp - cpk) > 0.2) {
            interpretation += `<br><br>CpとCpkの差が大きいため、工程の中心が規格の中心からずれています。工程の調整が必要です。`;
        }
    }
    
    // 一般的な指針
    interpretation += `<br><br>工程能力指数の一般的な指針：<br>`;
    interpretation += `• 2.0以上：非常に優秀<br>`;
    interpretation += `• 1.67以上：優秀<br>`;
    interpretation += `• 1.33以上：十分<br>`;
    interpretation += `• 1.0以上：最低限<br>`;
    interpretation += `• 1.0未満：不十分`;
    
    return interpretation;
}

// 管理図の解釈
function interpretControlChart(outlierCount, totalCount) {
    let interpretation = `管理図の分析結果：<br><br>`;
    
    const outlierRate = (outlierCount / totalCount) * 100;
    
    if (outlierCount === 0) {
        interpretation += "すべてのデータポイントが管理限界内にあります。工程は統計的に管理状態にあると判断できます。";
    } else {
        interpretation += `${outlierCount}個のデータポイント（全体の${outlierRate.toFixed(1)}%）が管理限界を超えています。`;
        
        if (outlierRate > 5) {
            interpretation += " 工程に異常が発生している可能性が高く、原因調査と対策が必要です。";
        } else if (outlierRate > 1) {
            interpretation += " 工程に何らかの変動要因が存在する可能性があります。注意深く監視する必要があります。";
        } else {
            interpretation += " 少数の異常点が見られますが、偶然の変動の範囲内の可能性もあります。";
        }
    }
    
    // 管理図の判定ルール
    interpretation += `<br><br>管理図の判定基準：<br>`;
    interpretation += `• 管理限界外の点：工程異常の可能性<br>`;
    interpretation += `• 連続する点の傾向：工程の変化を示唆<br>`;
    interpretation += `• 中心線からの偏り：工程の偏りを示唆`;
    
    // 改善提案
    if (outlierCount > 0) {
        interpretation += `<br><br>改善提案：<br>`;
        interpretation += `• 異常点の発生時刻と作業条件を調査<br>`;
        interpretation += `• 原因の特定と対策の実施<br>`;
        interpretation += `• 継続的な監視と記録の維持`;
    }
    
    return interpretation;
}

// マハラノビス距離の解釈
function interpretMahalanobis(outlierCount, totalCount) {
    let interpretation = `マハラノビス距離による異常値検出の結果：<br><br>`;
    
    const outlierRate = (outlierCount / totalCount) * 100;
    
    if (outlierCount === 0) {
        interpretation += "すべてのデータポイントが正常範囲内にあります。多変量データに異常値は検出されませんでした。";
    } else {
        interpretation += `${outlierCount}個のデータポイント（全体の${outlierRate.toFixed(1)}%）が異常値として検出されました。`;
        
        if (outlierRate > 10) {
            interpretation += " 異常値の割合が高く、データの品質や測定プロセスに問題がある可能性があります。";
        } else if (outlierRate > 5) {
            interpretation += " 中程度の異常値が検出されています。原因の調査が推奨されます。";
        } else {
            interpretation += " 少数の異常値が検出されています。これらは測定誤差や特殊な条件による可能性があります。";
        }
    }
    
    // マハラノビス距離の特徴
    interpretation += `<br><br>マハラノビス距離の特徴：<br>`;
    interpretation += `• 多変量データの異常値検出に適している<br>`;
    interpretation += `• 変数間の相関関係を考慮した距離計算<br>`;
    interpretation += `• 95%信頼楕円外のデータを異常値として判定<br>`;
    interpretation += `• 2変数の場合、カイ二乗分布（自由度2）を使用`;
    
    // 対応策
    if (outlierCount > 0) {
        interpretation += `<br><br>異常値への対応：<br>`;
        interpretation += `• 異常値の原因調査（測定誤差、特殊条件など）<br>`;
        interpretation += `• データの再測定や検証<br>`;
        interpretation += `• 異常値を除外した分析の実施<br>`;
        interpretation += `• プロセス改善による異常値の削減`;
    }
    
    return interpretation;
}

// IQR法・Z-score法による異常値検出の解釈
function interpretOutliers(outlierCount, totalCount) {
    let interpretation = `異常値検出分析の結果：<br><br>`;
    
    const outlierRate = (outlierCount / totalCount) * 100;
    
    if (outlierCount === 0) {
        interpretation += "IQR法、Z-score法、修正Z-score法のいずれでも異常値は検出されませんでした。データは正常な分布範囲内にあります。";
    } else {
        interpretation += `合計${outlierCount}個のデータポイント（全体の${outlierRate.toFixed(1)}%）が異常値として検出されました。`;
        
        if (outlierRate > 15) {
            interpretation += " 異常値の割合が非常に高く、データの分布に問題がある可能性があります。";
        } else if (outlierRate > 10) {
            interpretation += " 異常値の割合が高く、データの品質や測定プロセスの見直しが必要です。";
        } else if (outlierRate > 5) {
            interpretation += " 中程度の異常値が検出されています。原因の調査が推奨されます。";
        } else {
            interpretation += " 少数の異常値が検出されています。これらは自然な変動の範囲内の可能性もあります。";
        }
    }
    
    // 各手法の特徴
    interpretation += `<br><br>異常値検出手法の特徴：<br>`;
    interpretation += `• <strong>IQR法</strong>：四分位範囲を使用、分布の形状に依存しない<br>`;
    interpretation += `• <strong>Z-score法</strong>：標準偏差を使用、正規分布を仮定<br>`;
    interpretation += `• <strong>修正Z-score法</strong>：中央絶対偏差を使用、外れ値に頑健`;
    
    // 判定基準
    interpretation += `<br><br>判定基準：<br>`;
    interpretation += `• IQR法：Q1 - 1.5×IQR または Q3 + 1.5×IQR を超える値<br>`;
    interpretation += `• Z-score法：|Z-score| > 3.0<br>`;
    interpretation += `• 修正Z-score法：|修正Z-score| > 3.5`;
    
    // 品質管理の観点
    interpretation += `<br><br>品質管理の観点から：<br>`;
    if (outlierRate < 2) {
        interpretation += `異常値の割合が低く、プロセスは安定していると考えられます。`;
    } else if (outlierRate < 5) {
        interpretation += `異常値の割合がやや高く、プロセスの監視を強化することを推奨します。`;
    } else {
        interpretation += `異常値の割合が高く、プロセスの改善が必要です。`;
    }
    
    // 対応策
    if (outlierCount > 0) {
        interpretation += `<br><br>推奨される対応策：<br>`;
        interpretation += `• 異常値の発生原因の調査<br>`;
        interpretation += `• 測定方法や機器の点検<br>`;
        interpretation += `• 作業条件や環境要因の確認<br>`;
        interpretation += `• 異常値を除外した分析の実施<br>`;
        interpretation += `• 継続的な監視とデータ収集`;
    }
    
    return interpretation;
} 