# CAT-OBSERVES

## ＊ 本 README は追ってメンテナンスする

### メモ

### TODO

- [ ] アカウント毎に実行 Promise.all に変更
- [ ] エンドポイントは nestjs のパイプ機能でチェックする

---

## GKEへのデプロイ手順

### 0. 前提条件

- `gcloud` CLI がインストールされ、認証済みであること
  ```bash
  gcloud config set project cat-observes
  ```
- `kubectl` がインストール済みであること
- `docker` がインストール済みであること
- GCPサービスアカウントキー（例: `gcp-key.json`）が準備されていること

### 1. GCPの事前準備

アプリケーションを動作させるためのGCPリソースを準備します。

- **GKEクラスタの作成**: アプリケーションが動作するKubernetesクラスタを作成します
  ```bash
  gcloud container clusters create cat-observes-cluster \
    # --zone asia-northeast1-a # 東京リージョンは高いので止める \
    --zone us-central1-a \
    --num-nodes 1 \
    --machine-type e2-small \
    # Spot VM 利用 \
    --spot
  ```
- **Artifact Registryの有効化**: Dockerイメージを保存および管理するためのリポジトリを設定します
  ```bash
  gcloud services enable artifactregistry.googleapis.com
  ```

### 2. Dockerイメージの準備とアップロード

アプリケーションをGKEで利用可能なDockerイメージ形式に変換し、GCPにアップロードします。

- **Dockerfileの最適化**: 本番環境向けにマルチステージビルドを活用し、イメージサイズを小さくします
- **Dockerイメージのビルド**: ローカルでDockerイメージをビルドします
  ```bash
  # 未指定の場合、プラットフォームが arm64（mac 向け） になる
  # docker build -t gcr.io/cat-observes/cat-observes:latest .
  docker build --platform linux/amd64 -t gcr.io/cat-observes/cat-observes:latest .
  ```
- **Artifact Registryへのプッシュ**: ビルドしたイメージにタグを付け、Artifact Registryへプッシュします
  ```bash
  gcloud auth configure-docker asia-northeast1-docker.pkg.dev
  docker push gcr.io/cat-observes/cat-observes:latest
  ```

### 3. Kubernetesマニフェストファイルの作成

`docker-compose.yml`の内容を参考に、Kubernetesが理解できるマニフェストファイル（YAML形式）を作成します。

#### Secret（機密情報）

- `.env.dev.secret`（SlackトークンやGCPキーなど）
- `gcp-key.json`

##### Secretの作成手順（kubectlコマンド利用）

```bash
kubectl create secret generic gcp-key --from-file=/Users/kanegadai/.ssh/gcp/cat-observes-+-+-+-+-+-+.json
kubectl create secret generic app-secret --from-env-file=.env.dev.secret
```

##### Secretの内容をYAMLで管理する場合

`secret_gcp-key.yaml` の例:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gcp-key
type: Opaque
data:
  gcp-key.json: <base64エンコードした内容>
```

`secret_app-secret.yaml` の例:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  GCP_KEY_FILE: <base64エンコードした内容>
  SLACK_BOT_TOKEN: <base64エンコードした内容>
```

YAMLから作成する場合:

```bash
kubectl apply -f secret-gcp-key.yaml
kubectl apply -f secret-app-secret.yaml
```

##### Secretの利用例（deployment.yaml）

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cat-observes
spec:
  template:
    spec:
      containers:
        - name: app
          image: gcr.io/cat-observes/cat-observes:latest
          envFrom:
            - secretRef:
                name: app-secret
          env:
            - name: GCP_KEY_FILE
              value: /app/secret/gcp-key.json
          volumeMounts:
            - name: gcp-key-volume
              mountPath: /app/secret/gcp-key.json
              subPath: gcp-key.json
      volumes:
        - name: gcp-key-volume
          secret:
            secretName: gcp-key
```

##### Secretの内容を確認するには

```bash
kubectl get secret gcp-key -o yaml
kubectl get secret app-secret -o yaml
```

#### ConfigMap（非機密情報）

- `.env`
- `.env.dev`

##### ConfigMapの作成手順（kubectlコマンド利用）

```bash
kubectl create configmap app-config --from-env-file=.env --from-env-file=.env.dev
```

##### ConfigMapの内容をYAMLで管理する場合

`configmap-app-config.yaml` の例:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  .env: |
    NODE_ENV=development
    PORT=3000
  .env.dev: |
    # ...（.env.devの内容を貼り付け）
```

YAMLから作成する場合:

```bash
kubectl apply -f configmap-app-config.yaml
```

##### ConfigMapの利用例（deployment.yaml）

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cat-observes
spec:
  template:
    spec:
      containers:
        - name: app
          image: gcr.io/cat-observes/cat-observes:latest
          envFrom:
            - configMapRef:
                name: app-config
```

##### Deployment（開発環境向けのyaml作成ポイント）

- 開発用途では、以下のような設定が推奨されます
  - `replicas: 1`（Pod数は1で十分。複数不要）
  - `imagePullPolicy: Always`（イメージの更新を即時反映）
  - `resources`は最小限（例: requests/limitsを小さく）
  - `restartPolicy: Always`（デフォルトでOK）
  - `image`タグは `latest` など開発用に柔軟に指定
  - `nodeSelector` や `affinity` は基本不要
  - `livenessProbe`/`readinessProbe` は簡易なものでも可

開発用Deploymentの例:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cat-observes-dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cat-observes
  template:
    metadata:
      labels:
        app: cat-observes
    spec:
      containers:
        - name: app
          image: gcr.io/cat-observes/cat-observes:latest
          imagePullPolicy: Always
          resources:
            requests:
              cpu: '100m'
              memory: '128Mi'
            limits:
              cpu: '250m'
              memory: '256Mi'
          # envFrom, env, volumeMounts などは必要に応じて追加
```

##### Production（本番環境向けのyaml作成ポイント）

- 本番用途では、以下のような設定が推奨されます
  - `replicas`は必要な可用性・負荷に応じて2以上（例: 2〜3）
  - `imagePullPolicy: IfNotPresent`（イメージの更新はタグ管理で制御）
  - `resources`は十分な値を設定（requests/limitsを明示）
  - `livenessProbe`/`readinessProbe`をしっかり設定
  - `image`タグはバージョン固定（例: `gcr.io/cat-observes/cat-observes:v1.0.0`）
  - `affinity`や`nodeSelector`で本番ノードを指定する場合も
  - `autoscaling`（HPA）を利用する場合は別途設定

本番用Deploymentの例:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cat-observes
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cat-observes
  template:
    metadata:
      labels:
        app: cat-observes
    spec:
      containers:
        - name: app
          image: gcr.io/cat-observes/cat-observes:v1.0.0
          imagePullPolicy: IfNotPresent
          resources:
            requests:
              cpu: '500m'
              memory: '512Mi'
            limits:
              cpu: '1000m'
              memory: '1024Mi'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          # envFrom, env, volumeMounts などは必要に応じて追加
      # affinity, nodeSelector なども必要に応じて追加
```

本番ではreplica数やリソース制限、イメージタグの固定、probeの厳密な設定などが重要です。

##### Service（外部公開・内部通信のためのリソース）

- ServiceはPod群へのアクセスを抽象化し、ロードバランサやクラスタ内通信を実現します
- 開発環境では `type: ClusterIP`（内部通信のみ）や `type: NodePort`（手軽な外部公開）を利用
- 本番環境では `type: LoadBalancer` を使い、GCPの外部IPを自動割り当て

Serviceの例（本番・LoadBalancer）:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cat-observes-service
spec:
  type: LoadBalancer
  selector:
    app: cat-observes
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

Serviceの例（開発・NodePort）:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cat-observes-dev-service
spec:
  type: NodePort
  selector:
    app: cat-observes
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
      nodePort: 30080
```

---

##### CronJob（定期バッチ処理のためのリソース）

- CronJobは指定したスケジュールでPodを自動起動し、バッチ処理を実行します
- 例えば銀行明細の自動ダウンロードや集計処理などに利用
- `schedule`はcron形式（例: "0 6 \* \* \*" → 毎日6時）
- `successfulJobsHistoryLimit`/`failedJobsHistoryLimit`で履歴管理

CronJobの例:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cat-in-ambush-job
spec:
  schedule: '0 6 * * *'
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: batch
              image: gcr.io/cat-observes/cat-in-ambush:v1.0.0
              args: ['--download-bank-statement']
          restartPolicy: OnFailure
```

ServiceやCronJobは用途・環境に応じてtypeやschedule等を調整してください。

### 4. GKEクラスタへのデプロイ

#### Google Cloud Consoleでの操作手順

GKEクラスタの作成やリソースの確認は、Google Cloud Console（Web UI）からも可能です。

- 「Kubernetes Engine」→「クラスタ」→「作成」からGUIでクラスタ作成ができます。
- PodやService、Deploymentなどの状態は「Kubernetes Engine」→「ワークロード」「サービス」などからも確認できます。
- ログ閲覧やイベント確認もWeb UIで可能です。

#### kubectl applyのGoogle Cloudへの適用イメージ

`kubectl`コマンドは、ローカルPCやCloud ShellからGKEクラスタに対して直接リソースを適用します。

GKEクラスタへアクセスするには、事前に以下の認証コマンドを実行してください。

```bash
gcloud container clusters get-credentials <クラスタ名> --zone <ゾーン> --project <プロジェクトID>
```

この認証後、`kubectl apply`コマンドでGKEクラスタにマニフェストを適用できます。

#### Cloud Shellの活用

Google Cloud Console右上の「Cloud Shell」ボタンから、Web上で`kubectl`や`gcloud`コマンドを実行できます。

Cloud ShellはGoogle Cloud環境に最適化されており、追加のセットアップ不要でGKE操作が可能です。

作成したマニフェストファイルを`kubectl`コマンドでGKEクラスタに適用します。

```bash
kubectl apply -f <マニフェストファイルが格納されたディレクトリ>
```

作成したマニフェストファイルを、以下の順序で `kubectl` コマンドによりGKEクラスタへ適用します。

1. Namespace（必要な場合）
2. Secret／ConfigMap
3. Deployment
4. Service
5. CronJob（必要な場合）

例：

```bash
# 1. Namespace（任意）
kubectl apply -f namespace.yaml

# 2. Secret／ConfigMap
kubectl apply -f secret-gcp-key.yaml
kubectl apply -f secret-app-secret.yaml
kubectl apply -f configmap-app-config.yaml

# 3. Deployment
kubectl apply -f deployment.yaml

# 4. Service
kubectl apply -f service.yaml

# 5. CronJob（必要な場合）
kubectl apply -f cronjob.yaml
```

#### デプロイ後のリソース確認・監視

- Podの状態確認
  ```bash
  kubectl get pods
  kubectl describe pod <pod-name>
  ```
- Serviceの状態・外部IP確認
  ```bash
  kubectl get service
  kubectl describe service <service-name>
  ```
- Deploymentのロールアウト状況
  ```bash
  kubectl rollout status deployment/<deployment-name>
  ```
- CronJobの実行履歴
  ```bash
  kubectl get cronjob
  kubectl get jobs
  ```
- ログ確認
  ```bash
  kubectl logs <pod-name>
  ```

#### トラブルシュート例

- イメージPull失敗時
  ```bash
  kubectl describe pod <pod-name>
  ```
- PodがCrashLoopBackOffの場合
  ```bash
  kubectl logs <pod-name>
  kubectl describe pod <pod-name>
  ```
- リソース削除
  ```bash
  kubectl delete -f <manifest.yaml>
  ```

---

### 5. 動作確認

デプロイしたアプリケーションが正常に動作しているか確認します。

- Podの起動状態を確認: `kubectl get pods`
- Podのログを確認: `kubectl logs <pod-name>`
- Serviceに割り当てられた外部IPアドレスにアクセスし、APIの応答を確認: `kubectl get service`

---

### 9. 参考情報

[Web UI(Dashboard)](https://kubernetes.io/ja/docs/tasks/access-application-cluster/web-ui-dashboard/)
