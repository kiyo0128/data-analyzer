// 分析結果解釈機能モジュール
// 作成日: 2025-01-12

// 相関係数の解釈
function interpretCorrelation(r) {
    const absR = Math.abs(r);
    let strength, direction, interpretation;
    
    // パラメータの意味説明
    interpretation = `<strong>📊 相関係数の意味</strong><br>`;
    interpretation += `相関係数（r）は-1から+1の値を取り、2つの変数の関係の強さと方向を表します。<br>`;
    interpretation += `• +1に近い：強い正の相関（一方が増えると他方も増える）<br>`;
    interpretation += `• 0に近い：相関なし（関係性がない）<br>`;
    interpretation += `• -1に近い：強い負の相関（一方が増えると他方は減る）<br><br>`;
    
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
    interpretation += `<strong>🔍 分析結果の解釈</strong><br>`;
    interpretation += `相関係数 r = ${r.toFixed(4)}<br><br>`;
    
    if (absR < 0.1) {
        interpretation += "変数間にはほとんど関係がありません。";
    } else {
        interpretation += `変数間には${direction}${strength}相関があります。`;
        
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
    
    // 相関の強さの目安
    interpretation += `<br><br><strong>📏 相関の強さの目安</strong><br>`;
    interpretation += `• |r| ≥ 0.8：非常に強い相関<br>`;
    interpretation += `• |r| ≥ 0.6：強い相関<br>`;
    interpretation += `• |r| ≥ 0.4：中程度の相関<br>`;
    interpretation += `• |r| ≥ 0.2：弱い相関<br>`;
    interpretation += `• |r| < 0.2：ほぼ無相関`;
    
    return interpretation;
}

// 回帰分析の解釈
function interpretRegression(regression, rSquared) {
    const slope = regression.m;
    const intercept = regression.b;
    
    // パラメータの意味説明
    let interpretation = `<strong>📊 回帰分析のパラメータ</strong><br>`;
    interpretation += `• <strong>回帰式</strong>：y = ax + b の形で、xからyを予測する式<br>`;
    interpretation += `• <strong>傾き（a）</strong>：xが1単位変化したときのyの変化量<br>`;
    interpretation += `• <strong>切片（b）</strong>：x=0のときのyの値<br>`;
    interpretation += `• <strong>決定係数（R²）</strong>：モデルがデータの変動をどの程度説明できるかの指標（0-1）<br><br>`;
    
    // 分析結果
    interpretation += `<strong>🔍 分析結果</strong><br>`;
    interpretation += `回帰式：y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}<br>`;
    interpretation += `決定係数：R² = ${rSquared.toFixed(4)} (${(rSquared * 100).toFixed(1)}%)<br><br>`;
    
    // 傾きの解釈
    interpretation += `<strong>📈 傾きの解釈</strong><br>`;
    if (slope > 0) {
        interpretation += `傾きが正の値（${slope.toFixed(4)}）なので、Xが1単位増加するとYは約${slope.toFixed(4)}単位増加します。`;
    } else {
        interpretation += `傾きが負の値（${slope.toFixed(4)}）なので、Xが1単位増加するとYは約${Math.abs(slope).toFixed(4)}単位減少します。`;
    }
    
    // 決定係数の解釈
    const rSquaredPercent = (rSquared * 100).toFixed(1);
    interpretation += `<br><br><strong>📋 決定係数の解釈</strong><br>`;
    interpretation += `R² = ${rSquared.toFixed(4)}（${rSquaredPercent}%）<br>`;
    
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
    
    // 決定係数の目安
    interpretation += `<br><br><strong>📏 決定係数の目安</strong><br>`;
    interpretation += `• R² ≥ 0.8：非常に良い適合<br>`;
    interpretation += `• R² ≥ 0.6：良い適合<br>`;
    interpretation += `• R² ≥ 0.4：中程度の適合<br>`;
    interpretation += `• R² ≥ 0.2：低い適合<br>`;
    interpretation += `• R² < 0.2：不適合`;
    
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
    
    // パラメータの意味説明
    let interpretation = `<strong>📊 記述統計のパラメータ</strong><br>`;
    interpretation += `• <strong>平均値</strong>：データの総和をデータ数で割った値（算術平均）<br>`;
    interpretation += `• <strong>中央値</strong>：データを大小順に並べたときの中央の値<br>`;
    interpretation += `• <strong>標準偏差</strong>：データのばらつきの程度を表す指標<br>`;
    interpretation += `• <strong>変動係数</strong>：標準偏差を平均値で割った値（相対的なばらつき）<br>`;
    interpretation += `• <strong>歪度</strong>：分布の非対称性を表す指標（正：右偏、負：左偏）<br>`;
    interpretation += `• <strong>尖度</strong>：分布の尖り具合を表す指標（3：正規分布）<br><br>`;
    
    // 分析結果
    interpretation += `<strong>🔢 基本統計量</strong><br>`;
    interpretation += `平均値：${mean.toFixed(4)}<br>`;
    interpretation += `中央値：${median.toFixed(4)}<br>`;
    interpretation += `標準偏差：${stdDev.toFixed(4)}<br>`;
    interpretation += `最小値：${min.toFixed(4)}<br>`;
    interpretation += `最大値：${max.toFixed(4)}<br>`;
    interpretation += `歪度：${skewness.toFixed(4)}<br>`;
    interpretation += `尖度：${kurtosis.toFixed(4)}<br><br>`;
    
    // 中心傾向の解釈
    interpretation += `<strong>🎯 中心傾向の解釈</strong><br>`;
    const meanMedianDiff = Math.abs(mean - median);
    const relativeDiff = meanMedianDiff / Math.abs(mean) * 100;
    
    if (relativeDiff < 5) {
        interpretation += " 平均値と中央値がほぼ等しいため、データは対称的に分布していると考えられます。";
    } else if (mean > median) {
        interpretation += " 平均値が中央値より大きいため、データは右に偏った分布（正の歪み）を示しています。";
    } else {
        interpretation += " 平均値が中央値より小さいため、データは左に偏った分布（負の歪み）を示しています。";
    }
    
    // ばらつきの解釈
    const cv = (stdDev / Math.abs(mean)) * 100; // 変動係数
    interpretation += `<br><br><strong>📏 ばらつきの解釈</strong><br>`;
    interpretation += `変動係数：${cv.toFixed(1)}%<br>`;
    
    if (cv < 10) {
        interpretation += " データのばらつきは小さく、比較的安定しています。";
    } else if (cv < 20) {
        interpretation += " データのばらつきは中程度です。";
    } else {
        interpretation += " データのばらつきは大きく、変動が激しいです。";
    }
    
    // 歪度の解釈
    interpretation += `<br><br><strong>📐 分布の形状</strong><br>`;
    interpretation += `歪度：${skewness.toFixed(4)} `;
    if (Math.abs(skewness) < 0.5) {
        interpretation += "（ほぼ対称）<br>データはほぼ対称的に分布しています。";
    } else if (skewness > 0.5) {
        interpretation += "（右偏）<br>データは右に偏った分布を示しています（正の歪み）。";
    } else {
        interpretation += "（左偏）<br>データは左に偏った分布を示しています（負の歪み）。";
    }
    
    // 尖度の解釈
    interpretation += `<br><br>尖度：${kurtosis.toFixed(4)} `;
    if (kurtosis > 3) {
        interpretation += "（尖鋭）<br>正規分布より尖った分布（尖鋭な分布）を示しています。";
    } else if (kurtosis < 3) {
        interpretation += "（平坦）<br>正規分布より平坦な分布を示しています。";
    } else {
        interpretation += "（正規的）<br>正規分布に近い尖度を示しています。";
    }
    
    // 判定基準
    interpretation += `<br><br><strong>📋 判定基準</strong><br>`;
    interpretation += `• 変動係数：10%未満（安定）、10-20%（中程度）、20%以上（不安定）<br>`;
    interpretation += `• 歪度：±0.5未満（対称）、±0.5以上（偏り有り）<br>`;
    interpretation += `• 尖度：3付近（正規的）、3より大（尖鋭）、3より小（平坦）`;
    
    return interpretation;
}

// ヒストグラムの解釈
function interpretHistogram(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    
    // 正規性の簡易チェック（歪度と尖度を使用）
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues[Math.floor(sortedValues.length / 2)];
    
    // パラメータの意味説明
    let interpretation = `<strong>📊 ヒストグラムの見方</strong><br>`;
    interpretation += `• <strong>ヒストグラム</strong>：データの分布状況を視覚的に表現したグラフ<br>`;
    interpretation += `• <strong>度数</strong>：各区間に含まれるデータの個数<br>`;
    interpretation += `• <strong>階級</strong>：データを分割する区間（ビン）<br>`;
    interpretation += `• <strong>分布の形状</strong>：対称・右偏・左偏・正規分布など<br>`;
    interpretation += `• <strong>中心傾向</strong>：平均値と中央値の関係から分布の偏りを判定<br><br>`;
    
    // 基本統計量
    const range = Math.max(...values) - Math.min(...values);
    const cv = (stdDev / Math.abs(mean)) * 100;
    
    interpretation += `<strong>📈 基本統計量</strong><br>`;
    interpretation += `平均値：${mean.toFixed(4)}<br>`;
    interpretation += `中央値：${median.toFixed(4)}<br>`;
    interpretation += `標準偏差：${stdDev.toFixed(4)}<br>`;
    interpretation += `データ範囲：${range.toFixed(4)}<br>`;
    interpretation += `変動係数：${cv.toFixed(1)}%<br><br>`;
    
    // 分布の形状解釈
    interpretation += `<strong>📐 分布形状の解釈</strong><br>`;
    const meanMedianDiff = Math.abs(mean - median);
    const relativeDiff = meanMedianDiff / Math.abs(mean) * 100;
    
    if (relativeDiff < 5) {
        interpretation += "データは対称的な分布を示しています。正規分布に近い可能性があります。";
    } else if (mean > median) {
        interpretation += "データは右に偏った分布（右裾が長い）を示しています。";
    } else {
        interpretation += "データは左に偏った分布（左裾が長い）を示しています。";
    }
    
    // ばらつきの評価
    interpretation += `<br><br><strong>📏 データのばらつき評価</strong><br>`;
    
    if (cv < 15) {
        interpretation += " データは比較的集中しており、ばらつきが小さいです。";
    } else if (cv < 30) {
        interpretation += " データは中程度のばらつきを示しています。";
    } else {
        interpretation += " データは大きなばらつきを示しており、変動が激しいです。";
    }
    
    // 品質管理の観点
    interpretation += `<br><br><strong>🏭 品質管理の観点</strong><br>`;
    if (cv < 10) {
        interpretation += " プロセスは安定しており、品質のばらつきが小さいです。";
    } else if (cv < 20) {
        interpretation += " プロセスは比較的安定していますが、改善の余地があります。";
    } else {
        interpretation += " プロセスの変動が大きく、品質改善が必要です。";
    }
    
    // 正規性の評価
    interpretation += `<br><br><strong>📋 正規性の評価</strong><br>`;
    if (relativeDiff < 5) {
        interpretation += "平均値≈中央値のため、正規分布の可能性が高いです。<br>";
        interpretation += "• 統計的検定手法の適用が可能<br>";
        interpretation += "• 管理図の適用に適している";
    } else {
        interpretation += "平均値≠中央値のため、非正規分布の可能性があります。<br>";
        interpretation += "• データ変換の検討が必要<br>";
        interpretation += "• ノンパラメトリック手法の使用を推奨";
    }
    
    // 判定基準
    interpretation += `<br><br><strong>📊 判定基準</strong><br>`;
    interpretation += `• 変動係数：10%未満（安定）、10-20%（中程度）、20%以上（不安定）<br>`;
    interpretation += `• 対称性：平均と中央値の差が5%未満で対称的<br>`;
    interpretation += `• 正規性：対称的な釣鐘型の分布で正規分布に近い`;
    
    return interpretation;
}

// 工程能力分析の解釈
function interpretProcessCapability(cp, cpk) {
    // パラメータの意味説明
    let interpretation = `<strong>🏭 工程能力指数のパラメータ</strong><br>`;
    interpretation += `• <strong>Cp</strong>：工程のばらつきと規格幅の比率（工程の潜在能力）<br>`;
    interpretation += `• <strong>Cpk</strong>：工程の中心のずれを考慮した実際の工程能力<br>`;
    interpretation += `• <strong>USL</strong>：上側規格限界（Upper Specification Limit）<br>`;
    interpretation += `• <strong>LSL</strong>：下側規格限界（Lower Specification Limit）<br>`;
    interpretation += `• <strong>計算式</strong>：Cp = (USL - LSL) / (6σ)、Cpk = min((USL - μ)/(3σ), (μ - LSL)/(3σ))<br><br>`;
    
    // 分析結果
    interpretation += `<strong>📊 工程能力分析結果</strong><br>`;
    
    if (cp !== null) {
        interpretation += `Cp値：${cp.toFixed(4)} `;
        
        if (cp >= 2.0) {
            interpretation += "（非常に優秀）<br>";
        } else if (cp >= 1.67) {
            interpretation += "（優秀）<br>";
        } else if (cp >= 1.33) {
            interpretation += "（十分）<br>";
        } else if (cp >= 1.0) {
            interpretation += "（最低限）<br>";
        } else {
            interpretation += "（不十分）<br>";
        }
    }
    
    if (cpk !== null) {
        interpretation += `Cpk値：${cpk.toFixed(4)} `;
        
        if (cpk >= 2.0) {
            interpretation += "（非常に優秀）<br>";
        } else if (cpk >= 1.67) {
            interpretation += "（優秀）<br>";
        } else if (cpk >= 1.33) {
            interpretation += "（十分）<br>";
        } else if (cpk >= 1.0) {
            interpretation += "（最低限）<br>";
        } else {
            interpretation += "（不十分）<br>";
        }
    }
    
    // CpとCpkの比較解釈
    interpretation += `<br><strong>🎯 工程の状態評価</strong><br>`;
    if (cp !== null && cpk !== null) {
        const centeringRatio = cpk / cp;
        if (Math.abs(cp - cpk) > 0.2) {
            interpretation += `Cp（${cp.toFixed(4)}）とCpk（${cpk.toFixed(4)}）の差が大きいため、工程の中心が規格の中心からずれています。`;
            interpretation += `<br>中心化度：${(centeringRatio * 100).toFixed(1)}% → 工程の調整が必要です。`;
        } else {
            interpretation += `Cp（${cp.toFixed(4)}）とCpk（${cpk.toFixed(4)}）がほぼ等しく、工程は適切に中心化されています。`;
        }
    }
    
    // 品質レベルの説明
    interpretation += `<br><br><strong>📈 品質レベルの目安</strong><br>`;
    if (cpk !== null) {
        if (cpk >= 1.67) {
            interpretation += `現在の工程能力では、不良率は非常に低く（約0.6ppm以下）、6σ品質レベルに近い性能です。`;
        } else if (cpk >= 1.33) {
            interpretation += `現在の工程能力では、不良率は約60ppm以下で、優れた品質を維持できます。`;
        } else if (cpk >= 1.0) {
            interpretation += `現在の工程能力では、不良率は約2700ppm程度で、最低限の品質基準を満たしています。`;
        } else {
            interpretation += `現在の工程能力では、不良率が高く（2700ppm以上）、品質改善が緊急に必要です。`;
        }
    }
    
    // 評価基準表
    interpretation += `<br><br><strong>📋 工程能力指数の評価基準</strong><br>`;
    interpretation += `• ≥2.0：非常に優秀（不良率：0.002ppm）<br>`;
    interpretation += `• ≥1.67：優秀（不良率：0.6ppm）<br>`;
    interpretation += `• ≥1.33：十分（不良率：60ppm）<br>`;
    interpretation += `• ≥1.0：最低限（不良率：2700ppm）<br>`;
    interpretation += `• <1.0：不十分（不良率：2700ppm以上）`;
    
    // 改善提案
    if ((cp !== null && cp < 1.33) || (cpk !== null && cpk < 1.33)) {
        interpretation += `<br><br><strong>🔧 改善提案</strong><br>`;
        interpretation += `• 工程のばらつき削減（5S、標準化、設備改善）<br>`;
        interpretation += `• 工程の中心調整（キャリブレーション、作業手順見直し）<br>`;
        interpretation += `• SPC（統計的工程管理）の導入<br>`;
        interpretation += `• 作業者教育と技能向上<br>`;
        interpretation += `• 定期的な工程能力評価の実施`;
    }
    
    return interpretation;
}

// 管理図の解釈
function interpretControlChart(outlierCount, totalCount) {
    // パラメータの意味説明
    let interpretation = `<strong>📊 管理図のパラメータ</strong><br>`;
    interpretation += `• <strong>管理図</strong>：時系列データの変動を監視するための統計的手法<br>`;
    interpretation += `• <strong>中心線（CL）</strong>：プロセスの平均的な水準を表す線<br>`;
    interpretation += `• <strong>上方管理限界（UCL）</strong>：中心線 + 3σ（99.7%信頼限界）<br>`;
    interpretation += `• <strong>下方管理限界（LCL）</strong>：中心線 - 3σ（99.7%信頼限界）<br>`;
    interpretation += `• <strong>3σ原理</strong>：正規分布では99.7%のデータが±3σ内に収まる<br><br>`;
    
    const outlierRate = (outlierCount / totalCount) * 100;
    
    // 分析結果
    interpretation += `<strong>📈 管理図分析結果</strong><br>`;
    interpretation += `総データ数：${totalCount}点<br>`;
    interpretation += `管理限界外点数：${outlierCount}点<br>`;
    interpretation += `異常率：${outlierRate.toFixed(1)}%<br><br>`;
    
    // 工程状態の判定
    interpretation += `<strong>🎯 工程状態の判定</strong><br>`;
    if (outlierCount === 0) {
        interpretation += "すべてのデータポイントが管理限界内にあります。工程は統計的に管理状態にあると判断できます。";
    } else {
        interpretation += `${outlierCount}個のデータポイント（全体の${outlierRate.toFixed(1)}%）が管理限界を超えています。<br>`;
        
        if (outlierRate > 5) {
            interpretation += "工程に異常が発生している可能性が高く、原因調査と対策が必要です。";
        } else if (outlierRate > 1) {
            interpretation += "工程に何らかの変動要因が存在する可能性があります。注意深く監視する必要があります。";
        } else {
            interpretation += "少数の異常点が見られますが、偶然の変動の範囲内の可能性もあります。";
        }
    }
    
    // 管理図の判定ルール
    interpretation += `<br><br><strong>📋 管理図の判定ルール</strong><br>`;
    interpretation += `<strong>第1種異常</strong>：管理限界外の点<br>`;
    interpretation += `• 1点でも管理限界を超えた場合は工程異常<br>`;
    interpretation += `<strong>第2種異常</strong>：管理限界内でも工程異常を示すパターン<br>`;
    interpretation += `• 連続する7点が中心線の同じ側<br>`;
    interpretation += `• 連続する7点が単調増加または単調減少<br>`;
    interpretation += `• 3点中2点が2σを超える（同じ側）`;
    
    // 統計的解釈
    interpretation += `<br><br><strong>📊 統計的解釈</strong><br>`;
    if (outlierRate <= 0.3) {
        interpretation += `異常率${outlierRate.toFixed(1)}%は統計的に正常範囲内（期待値：0.27%）です。`;
    } else if (outlierRate <= 1) {
        interpretation += `異常率${outlierRate.toFixed(1)}%はやや高めですが、許容範囲内の可能性があります。`;
    } else {
        interpretation += `異常率${outlierRate.toFixed(1)}%は統計的期待値（0.27%）を大幅に超えており、工程に問題があります。`;
    }
    
    // 改善提案
    if (outlierCount > 0) {
        interpretation += `<br><br><strong>🔧 改善提案</strong><br>`;
        interpretation += `• 異常点の発生時刻と作業条件を調査<br>`;
        interpretation += `• 4M（人・機械・材料・方法）の変更点を確認<br>`;
        interpretation += `• 特殊原因の特定と対策の実施<br>`;
        interpretation += `• 継続的な監視と記録の維持<br>`;
        interpretation += `• 管理限界の再計算（工程改善後）`;
    } else {
        interpretation += `<br><br><strong>✅ 現状維持事項</strong><br>`;
        interpretation += `• 現在の管理基準を継続<br>`;
        interpretation += `• 定期的な管理図の更新<br>`;
        interpretation += `• 予防保全の実施<br>`;
        interpretation += `• 作業標準の遵守`;
    }
    
    return interpretation;
}

// マハラノビス距離の解釈
function interpretMahalanobis(outlierCount, totalCount) {
    // パラメータの意味説明
    let interpretation = `<strong>📊 マハラノビス距離のパラメータ</strong><br>`;
    interpretation += `• <strong>マハラノビス距離</strong>：多変量データの中心からの統計的距離<br>`;
    interpretation += `• <strong>共分散行列</strong>：変数間の相関関係を考慮した分散・共分散<br>`;
    interpretation += `• <strong>信頼楕円</strong>：95%のデータが含まれる楕円領域<br>`;
    interpretation += `• <strong>カイ二乗分布</strong>：マハラノビス距離の分布（自由度=変数数）<br>`;
    interpretation += `• <strong>閾値</strong>：χ²(0.05, df=2) = 5.991（2変数の場合）<br><br>`;
    
    const outlierRate = (outlierCount / totalCount) * 100;
    
    // 分析結果
    interpretation += `<strong>📈 マハラノビス距離分析結果</strong><br>`;
    interpretation += `総データ数：${totalCount}点<br>`;
    interpretation += `異常値数：${outlierCount}点<br>`;
    interpretation += `異常値率：${outlierRate.toFixed(1)}%<br>`;
    interpretation += `判定基準：95%信頼楕円外<br><br>`;
    
    // 異常値の評価
    interpretation += `<strong>🎯 異常値の評価</strong><br>`;
    if (outlierCount === 0) {
        interpretation += "すべてのデータポイントが正常範囲内にあります。多変量データに異常値は検出されませんでした。";
    } else {
        interpretation += `${outlierCount}個のデータポイント（全体の${outlierRate.toFixed(1)}%）が異常値として検出されました。<br>`;
        
        if (outlierRate > 10) {
            interpretation += "異常値の割合が高く、データの品質や測定プロセスに問題がある可能性があります。";
        } else if (outlierRate > 5) {
            interpretation += "中程度の異常値が検出されています。原因の調査が推奨されます。";
        } else {
            interpretation += "少数の異常値が検出されています。これらは測定誤差や特殊な条件による可能性があります。";
        }
    }
    
    // 統計的解釈
    interpretation += `<br><br><strong>📊 統計的解釈</strong><br>`;
    if (outlierRate <= 5) {
        interpretation += `異常値率${outlierRate.toFixed(1)}%は統計的期待値（5%）以下で正常範囲内です。`;
    } else if (outlierRate <= 10) {
        interpretation += `異常値率${outlierRate.toFixed(1)}%は期待値（5%）をやや上回っていますが、許容範囲の可能性があります。`;
    } else {
        interpretation += `異常値率${outlierRate.toFixed(1)}%は統計的期待値（5%）を大幅に超えており、データに問題があります。`;
    }
    
    // マハラノビス距離の特徴
    interpretation += `<br><br><strong>📋 マハラノビス距離の特徴</strong><br>`;
    interpretation += `<strong>利点</strong>：<br>`;
    interpretation += `• 多変量データの異常値検出に適している<br>`;
    interpretation += `• 変数間の相関関係を自動的に考慮<br>`;
    interpretation += `• スケールに依存しない（標準化不要）<br>`;
    interpretation += `• 統計的根拠がある閾値設定<br>`;
    interpretation += `<strong>制限</strong>：<br>`;
    interpretation += `• 正規分布を仮定<br>`;
    interpretation += `• 2変数以上が必要<br>`;
    interpretation += `• 外れ値に影響を受けやすい`;
    
    // 対応策
    if (outlierCount > 0) {
        interpretation += `<br><br><strong>🔧 異常値への対応策</strong><br>`;
        interpretation += `<strong>調査項目</strong>：<br>`;
        interpretation += `• 測定条件の確認（環境、機器、手順）<br>`;
        interpretation += `• データ入力の検証（転記ミス、単位間違い）<br>`;
        interpretation += `• 作業条件の変更点調査<br>`;
        interpretation += `• 材料・設備の異常確認<br>`;
        interpretation += `<strong>対応方法</strong>：<br>`;
        interpretation += `• 異常値の再測定・検証<br>`;
        interpretation += `• 原因が特定できない場合は除外を検討<br>`;
        interpretation += `• プロセス改善による根本対策<br>`;
        interpretation += `• 継続的な監視体制の構築`;
    } else {
        interpretation += `<br><br><strong>✅ 良好な状態</strong><br>`;
        interpretation += `• 多変量データの品質が良好<br>`;
        interpretation += `• 測定プロセスが安定<br>`;
        interpretation += `• 現在の管理方法を継続<br>`;
        interpretation += `• 定期的な監視を推奨`;
    }
    
    return interpretation;
}

// IQR法・Z-score法による異常値検出の解釈
function interpretOutliers(outlierCount, totalCount) {
    // パラメータの意味説明
    let interpretation = `<strong>📊 異常値検出手法のパラメータ</strong><br>`;
    interpretation += `• <strong>IQR法</strong>：四分位範囲（Q3-Q1）を用いた手法<br>`;
    interpretation += `• <strong>Z-score法</strong>：標準偏差を基準とした標準化スコア<br>`;
    interpretation += `• <strong>修正Z-score法</strong>：中央絶対偏差（MAD）を用いた頑健な手法<br>`;
    interpretation += `• <strong>Q1</strong>：第1四分位数（25%点）<br>`;
    interpretation += `• <strong>Q3</strong>：第3四分位数（75%点）<br>`;
    interpretation += `• <strong>MAD</strong>：中央絶対偏差 = median(|xi - median(x)|)<br><br>`;
    
    const outlierRate = (outlierCount / totalCount) * 100;
    
    // 分析結果
    interpretation += `<strong>📈 異常値検出分析結果</strong><br>`;
    interpretation += `総データ数：${totalCount}点<br>`;
    interpretation += `異常値数：${outlierCount}点<br>`;
    interpretation += `異常値率：${outlierRate.toFixed(1)}%<br>`;
    interpretation += `使用手法：IQR法、Z-score法、修正Z-score法の統合判定<br><br>`;
    
    // 異常値の評価
    interpretation += `<strong>🎯 異常値の評価</strong><br>`;
    if (outlierCount === 0) {
        interpretation += "IQR法、Z-score法、修正Z-score法のいずれでも異常値は検出されませんでした。データは正常な分布範囲内にあります。";
    } else {
        interpretation += `合計${outlierCount}個のデータポイント（全体の${outlierRate.toFixed(1)}%）が異常値として検出されました。<br>`;
        
        if (outlierRate > 15) {
            interpretation += "異常値の割合が非常に高く、データの分布に問題がある可能性があります。";
        } else if (outlierRate > 10) {
            interpretation += "異常値の割合が高く、データの品質や測定プロセスの見直しが必要です。";
        } else if (outlierRate > 5) {
            interpretation += "中程度の異常値が検出されています。原因の調査が推奨されます。";
        } else {
            interpretation += "少数の異常値が検出されています。これらは自然な変動の範囲内の可能性もあります。";
        }
    }
    
    // 各手法の特徴と判定基準
    interpretation += `<br><br><strong>📋 各手法の特徴と判定基準</strong><br>`;
    interpretation += `<strong>IQR法</strong>：<br>`;
    interpretation += `• 判定基準：Q1 - 1.5×IQR または Q3 + 1.5×IQR を超える値<br>`;
    interpretation += `• 特徴：分布の形状に依存しない、外れ値に頑健<br>`;
    interpretation += `• 適用：非正規分布でも使用可能<br><br>`;
    
    interpretation += `<strong>Z-score法</strong>：<br>`;
    interpretation += `• 判定基準：|Z-score| > 3.0（99.7%点）<br>`;
    interpretation += `• 特徴：正規分布を仮定、計算が簡単<br>`;
    interpretation += `• 適用：正規分布に近いデータに適している<br><br>`;
    
    interpretation += `<strong>修正Z-score法</strong>：<br>`;
    interpretation += `• 判定基準：|修正Z-score| > 3.5<br>`;
    interpretation += `• 特徴：外れ値に頑健、中央値とMADを使用<br>`;
    interpretation += `• 適用：外れ値が多い場合に有効`;
    
    // 統計的解釈
    interpretation += `<br><br><strong>📊 統計的解釈</strong><br>`;
    if (outlierRate <= 2) {
        interpretation += `異常値率${outlierRate.toFixed(1)}%は一般的な範囲内（2%以下）で、データは安定しています。`;
    } else if (outlierRate <= 5) {
        interpretation += `異常値率${outlierRate.toFixed(1)}%はやや高めで、注意が必要です。`;
    } else {
        interpretation += `異常値率${outlierRate.toFixed(1)}%は高く、データの品質に問題がある可能性があります。`;
    }
    
    // 品質管理の観点
    interpretation += `<br><br><strong>🏭 品質管理の観点</strong><br>`;
    if (outlierRate < 2) {
        interpretation += `異常値の割合が低く、プロセスは安定していると考えられます。`;
    } else if (outlierRate < 5) {
        interpretation += `異常値の割合がやや高く、プロセスの監視を強化することを推奨します。`;
    } else {
        interpretation += `異常値の割合が高く、プロセスの改善が必要です。`;
    }
    
    // 対応策
    if (outlierCount > 0) {
        interpretation += `<br><br><strong>🔧 推奨される対応策</strong><br>`;
        interpretation += `<strong>調査項目</strong>：<br>`;
        interpretation += `• 異常値の発生パターン分析（時間、条件等）<br>`;
        interpretation += `• 測定方法や機器の点検・校正<br>`;
        interpretation += `• 作業条件や環境要因の確認<br>`;
        interpretation += `• データ入力・転記の検証<br>`;
        interpretation += `<strong>対応方法</strong>：<br>`;
        interpretation += `• 原因が特定できた異常値の修正・除外<br>`;
        interpretation += `• 異常値を除外した分析の実施<br>`;
        interpretation += `• プロセス改善による根本対策<br>`;
        interpretation += `• 継続的な監視とデータ収集体制の強化`;
    } else {
        interpretation += `<br><br><strong>✅ 良好な状態</strong><br>`;
        interpretation += `• データの品質が良好<br>`;
        interpretation += `• 測定プロセスが安定<br>`;
        interpretation += `• 現在の管理方法を継続<br>`;
        interpretation += `• 定期的なデータ品質確認を推奨`;
    }
    
    return interpretation;
} 