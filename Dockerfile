# ベースイメージ
# FROM node:22.6.0
FROM mcr.microsoft.com/playwright:v1.48.2-jammy

ENV TZ=Asia/Tokyo

# ビルド引数を定義
ARG NODE_ENV
ARG PORT=3000 # デフォルト値を設定

# 環境変数を設定
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

# 作業ディレクトリを設定
WORKDIR /app

# パッケージをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# xvfb をインストール
RUN apt-get update && apt-get install -y xvfb

# アプリケーションコードをコピー
COPY . .

# ポートを公開
EXPOSE ${PORT}

# デフォルトコマンド
CMD ["xvfb-run", "--server-args=-screen 0 1920x1080x24", "npm", "run", "start:dev"]
