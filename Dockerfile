# ベースイメージ
# FROM node:22.6.0
FROM mcr.microsoft.com/playwright:v1.52.0-jammy

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

# xvfb をインストール
RUN apt-get update && apt-get install -y xvfb

# pwuserのホームディレクトリにdownloadsフォルダを作成
RUN mkdir -p /home/pwuser/downloads && chown -R pwuser:pwuser /home/pwuser/downloads

# pwuserに所有権を変更
RUN chown -R pwuser:pwuser /app

# pwuserで実行
USER pwuser

# 依存関係をインストール
RUN npm install

# アプリケーションコードをコピー
COPY . .

# ポートを公開
EXPOSE ${PORT}

# デフォルトコマンド
CMD ["xvfb-run", "--server-args=-screen 0 1920x1080x24", "npm", "run", "start:dev"]
