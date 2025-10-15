# ビルドステージ
FROM mcr.microsoft.com/playwright:v1.52.0-jammy AS builder

# タイムゾーンを設定
ENV TZ=Asia/Tokyo

# ビルド引数を定義
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# 作業ディレクトリを設定
WORKDIR /build

# パッケージファイルをコピー
COPY package*.json ./

# 開発依存関係を含めてインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# -+-+-+-+-+-+-+-+-+-+

# 実行ステージ
FROM mcr.microsoft.com/playwright:v1.52.0-jammy AS runner

# タイムゾーンを設定
ENV TZ=Asia/Tokyo

# 環境変数を設定
ARG PORT=3000
ENV PORT=${PORT}
ENV NODE_ENV=production

# xvfb をインストール
RUN apt-get update && apt-get install -y xvfb && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# pwuserのホームディレクトリにdownloadsフォルダを作成
RUN mkdir -p /home/pwuser/downloads && \
  chown -R pwuser:pwuser /home/pwuser/downloads

# 作業ディレクトリを設定
WORKDIR /app

# 本番環境の依存関係のみをインストール
COPY package*.json ./
RUN npm ci --only=production

# ビルド成果物をコピー
COPY --from=builder /build/dist ./dist

# pwuserに所有権を変更
RUN chown -R pwuser:pwuser /app

# pwuserで実行
USER pwuser

# ポートを公開
EXPOSE ${PORT}

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Playwrightで必要な仮想ディスプレイ環境をxvfbで提供
# - 解像度: 1920x1080
# - 色深度: 24bit
CMD ["sh", "-c", "xvfb-run --server-args='-screen 0 1920x1080x24' node dist/main"]
# CMD ["xvfb-run", "--server-args=-screen 0 1920x1080x24", "node", "dist/main"]
