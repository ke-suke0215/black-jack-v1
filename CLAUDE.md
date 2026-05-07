# CLAUDE.md

## コマンド

```bash
pnpm dev          # 実行
pnpm build        # ビルド (tsc)
pnpm lint         # Biome lint
pnpm format       # Biome フォーマット
pnpm check        # Biome lint + format
pnpm test         # テスト実行
pnpm test:watch   # テスト watch モード
```

## 技術スタック

- TypeScript / Node.js
- Biome (lint / format)
- pnpm

## タスクの進め方

1. **Plan** - 実装方針を整理し、変更箇所を明確にする
2. **コード修正** - Plan に沿って実装する
3. **テスト** - `pnpm test` を実行し、全テストがパスすることを確認する
4. **Biome チェック** - `pnpm check` を実行し、エラーがなければ完了
5. **planファイルを更新** - docs/overall-plan.md を更新し、進捗を反映して更新する
