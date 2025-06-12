# DataAnalyzer Pro

![DataAnalyzer Pro](https://img.shields.io/badge/Version-0.1-blue) ![License](https://img.shields.io/badge/License-MIT-green)

**製造・品質保証部門向け次世代データ分析プラットフォーム**

プログラミング知識不要で、ドラッグ&ドロップによる直感的な操作で高度な統計分析を実現します。

## 🌟 特徴

- **📊 多彩な分析手法**: 相関分析、回帰分析、記述統計、ヒストグラム、工程能力分析、管理図
- **📁 マルチフォーマット対応**: CSV、Excel (xlsx)、JSON、TSV
- **🎨 美しい可視化**: Plotly.jsによるインタラクティブなグラフ
- **🧠 AI解釈機能**: 分析結果の自動日本語解釈
- **🔒 セキュア**: データはブラウザ内で完全に処理（外部送信なし）
- **⚡ 高速**: リアルタイムでの分析処理
- **📱 レスポンシブ**: デスクトップ・タブレット・モバイル対応

## 🚀 デモ

### ホームページ
![Homepage](docs/homepage-demo.gif)

### 分析環境
![Analyzer](docs/analyzer-demo.gif)

## 📦 インストール

1. リポジトリをクローンまたはダウンロード
```bash
git clone https://github.com/username/data-analyzer.git
cd data-analyzer
```

2. Webサーバーで起動（推奨）
```bash
# Python 3の場合
python -m http.server 8000

# Node.jsのlive-serverの場合
npx live-server

# PHP（XAMPP/MAMP等）
# ファイルをwwwフォルダに配置
```

3. ブラウザで開く
```
http://localhost:8000
```

## 🎯 使用方法

### 1. ホームページでの概要確認
- `index.html`でプラットフォームの概要を確認
- 「今すぐ開始」ボタンで分析環境へ移動

### 2. データアップロード
- ファイルをドラッグ&ドロップまたはクリックで選択
- 対応形式：CSV、Excel、JSON、TSV（最大50MB・10万行）

### 3. データプレビュー
- アップロードしたファイルから分析対象を選択
- データの内容を表で確認

### 4. 列選択・前処理
- X軸（独立変数）・Y軸（従属変数）を選択
- 欠損値の処理方法を選択：
  - 除外
  - 平均値補完
  - 線形補完

### 5. 分析実行
以下の分析手法から選択：

#### 📈 相関分析
- Pearson相関係数
- Spearman相関係数
- 散布図付き

#### 📊 単回帰分析
- 回帰式の算出
- 決定係数（R²）
- 残差プロット

#### 📋 記述統計
- 平均、中央値、分散、標準偏差
- 最大値、最小値、四分位数

#### 📊 ヒストグラム
- 度数分布
- 正規性の確認

#### 🏭 工程能力分析
- Cp指数（工程能力指数）
- Cpk指数（工程能力指数）
- 規格限界との比較

#### 📉 管理図
- 3σ管理限界
- 異常点の検出

### 6. 結果確認
- インタラクティブなグラフ表示
- 詳細な統計情報
- AI による結果の日本語解釈
- PNG・SVG形式でのダウンロード

## 🛠️ 技術仕様

### フロントエンド
- **HTML5** + **CSS3** + **JavaScript (ES6+)**
- **Tailwind CSS**: スタイリング
- **Font Awesome**: アイコン
- **Google Fonts**: Inter フォント

### ライブラリ
- **Plotly.js (2.27.0)**: データ可視化
- **Simple Statistics (7.8.3)**: 統計計算
- **XLSX.js (0.18.5)**: Excel ファイル処理

### 対応ブラウザ
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📁 ファイル構成

```
data-analyzer/
├── index.html              # ホームページ
├── analyzer.html           # 分析環境
├── app.js                  # データ管理・ファイル処理
├── analysis.js             # 分析機能
├── visualization.js        # 可視化機能
├── interpretation.js       # AI解釈機能
├── sample_manufacturing_data.csv  # サンプル製造データ
├── sample_quality_data.csv       # サンプル品質データ
└── README.md              # このファイル
```

## 💡 サンプルデータ

### 製造データ (sample_manufacturing_data.csv)
- 時間、温度、圧力、品質スコア、不良率

### 品質管理データ (sample_quality_data.csv)
- ロット番号、寸法、重量、硬度、表面粗さ

## 🔧 カスタマイズ

### 新しい分析手法の追加
1. `analysis.js`に分析関数を追加
2. `visualization.js`に可視化関数を追加
3. `interpretation.js`に解釈関数を追加
4. `analyzer.html`にUIコンポーネントを追加

### スタイルのカスタマイズ
- Tailwind CSS クラスの変更
- カスタムCSSの追加（`<style>`セクション）

## 🚀 将来の拡張予定

### フェーズ1: 本番アーキテクチャ
- **バックエンド**: Python (FastAPI) + PostgreSQL
- **認証**: JWT + RBAC
- **API**: RESTful API設計
- **デプロイ**: Docker + Kubernetes

### 新機能
- [ ] 多変量解析（主成分分析、因子分析）
- [ ] 時系列分析（ARIMA、季節分解）
- [ ] 機械学習（クラスタリング、分類）
- [ ] ダッシュボード機能
- [ ] チーム共有機能
- [ ] レポート自動生成

## 🤝 コントリビューション

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 ライセンス

このプロジェクトは MIT ライセンスのもとで公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 👥 作成者

**DataAnalyzer Pro Team**
- 企画・開発・設計

## 📞 サポート

質問やバグ報告がございましたら、[Issues](https://github.com/username/data-analyzer/issues) までお気軽にお声かけください。

---

**DataAnalyzer Pro** - 次世代のデータ分析体験をお届けします 🚀 