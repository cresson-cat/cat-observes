# CAT-OBSERVES

## ＊ 本 README は追ってメンテナンスする

### メモ

### TODO

- [ ] アカウント毎に実行 Promise.all に変更
- [ ] エンドポイントは nestjs のパイプ機能でチェックする

---

## GKEへのデプロイ手順

### 0. 前提条件

- `gcloud` CLI がインストールされ、認証済みであること。
- `kubectl` がインストール済みであること。
- `docker` がインストール済みであること。
- GCPサービスアカウントキー（例: `gcp-key.json`）が準備されていること。

### 1. GCPの事前準備

アプリケーションを動作させるためのGCPリソースを準備します。

- **GKEクラスタの作成**: アプリケーションが動作するKubernetesクラスタを作成します。
  ```bash
  gcloud container clusters create cat-observes-cluster \
    --zone asia-northeast1-a \
    --num-nodes 1 \
    --machine-type e2-small
  ```
- **Artifact Registryの有効化**: Dockerイメージを保存および管理するためのリポジトリを設定します。
  ```bash
  gcloud services enable artifactregistry.googleapis.com
  ```

### 2. Dockerイメージの準備とアップロード

アプリケーションをGKEで利用可能なDockerイメージ形式に変換し、GCPにアップロードします。

- **Dockerfileの最適化**: 本番環境向けにマルチステージビルドを活用し、イメージサイズを小さくします。
- **Dockerイメージのビルド**: ローカルでDockerイメージをビルドします。
  ```bash
  docker build -t gcr.io/YOUR_PROJECT_ID/cat-observes:latest .
  ```
- **Artifact Registryへのプッシュ**: ビルドしたイメージにタグを付け、Artifact Registryへプッシュします。
  ```bash
  gcloud auth configure-docker asia-northeast1-docker.pkg.dev
  docker push gcr.io/YOUR_PROJECT_ID/cat-observes:latest
  ```

### 3. Kubernetesマニフェストファイルの作成

`docker-compose.yml`の内容を参考に、Kubernetesが理解できるマニフェストファイル（YAML形式）を作成します。

- **Secret**: GCPサービスアカウントキーやSlackのトークンなど、秘匿情報を管理します。
  ```bash
  kubectl create secret generic gcp-key --from-file=gcp-key.json
  ```
- **ConfigMap**: ポート番号など、秘匿ではない設定値を管理します。
- **Deployment**: どのDockerイメージを使い、Podをいくつ起動するかなどを定義します。SecretやConfigMapを環境変数やボリュームとしてコンテナに渡す設定もここで行います。
- **Service**: `Deployment`で作成したPod群に対して、外部からアクセスするためのネットワーク（ロードバランサなど）を定義します。
- **(オプション) CronJob**: 定期実行したいバッチ処理（例: `cat-in-ambush`）がある場合に作成します。

### 4. GKEクラスタへのデプロイ

作成したマニフェストファイルを`kubectl`コマンドでGKEクラスタに適用します。

```bash
kubectl apply -f <マニフェストファイルが格納されたディレクトリ>
```

### 5. 動作確認

デプロイしたアプリケーションが正常に動作しているか確認します。

- Podの起動状態を確認: `kubectl get pods`
- Podのログを確認: `kubectl logs <pod-name>`
- Serviceに割り当てられた外部IPアドレスにアクセスし、APIの応答を確認: `kubectl get service`

---
