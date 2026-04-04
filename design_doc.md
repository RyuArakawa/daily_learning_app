# Website Design Document: Trend Radar (Minimalist MVP+)

## 1. コンセプト (Concept)
- **タイトル:** Trend Radar (トレンド・レーダー)
- **キーワード:** インサイト、アクション、ビジュアライズ、スピード
- **提供価値:** 毎日10分のチェックで、世界中のトレンドをインサイトへ、そして今日のアクションへと昇華させる。視覚的な直感性も重視。

## 2. 主要機能 (Enhanced MVP)
### a. 3-Stage AI Workflow
1. **リサーチAI (Researcher):** グローバル・SNSトレンドの多角的リサーチ。
2. **教授AI (Professor):** 内容解説と出典URLの提示。
3. **トレーナーAI (Trainer):** 「今日できる具体的アクション」への変換。

### b. 時短・効率化機能 (Time-Saving)
- **次なる波 (Next Keywords):** AIが深掘りすべき関連キーワードを提案。
- **一括コピー:** 生成内容をMarkdown形式でサクッとコピー。
- **世界の温度感:** トレンドの「熱量」を一言で要約。

### c. 視覚的エッセンス (Visual Insights)
- **トレンド強度ゲージ:** CSS/SVGによるシンプルなゲージで「盛り上がり」を可視化。
- **ビジュアル・アクションカード:** アクション項目をアイコン付きのカード形式で表示。
- **カラーガイド:** 
    - 急上昇 = サンセット・オレンジ (#CB4B16)
    - 安定トレンド = ラーク・ブルー (#268BD2)
    - 要注目 = アクア (#2AA198)

## 3. サイトマップ (1-Page Dashboard)
- **Header:** サービス名 + 検索窓
- **Main Area:** 
    - **AI Models:** Gemini 1.5 Flash (Free tier available), Tavily Search API
    - 現在のキーワードのトレンド強度（ゲージ表示）
    - AIによる3段階アウトプット（リサーチ・教授・トレーナー）
- **Footer:** クリップボードコピー, 次のキーワード提案, セキュリティ情報

## 4. セキュリティ & 開発方針 (Security First)
- **APIキー管理:** `.env` 使用、サーバーサイド実行、GitHub非公開設定。
- **技術スタック:** HTML, Vanilla CSS, Vanilla JavaScript + Vercel Functions。

---
*インサイトを「見て」「理解し」「動く」。最高に効率的で美しいツールを、ここから生み出そうぜ！*
