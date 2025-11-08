NUM_NODES     := 1 # nodes の最大数（現在はコストへの配慮のため 1）
NODE_POOL     := default-pool
ZONE          := us-central1-a
PROJECT_ID    := cat-observes
CLUSTER_NAME  := cat-observes-cluster

# ノード数を 1 にする
# オートスケーリングを on にする
wakeup:
	gcloud container node-pools update $(NODE_POOL) \
		--cluster=$(CLUSTER_NAME) \
		--zone=$(ZONE) \
		--enable-autoscaling
	gcloud container clusters resize $(CLUSTER_NAME) \
		--num-nodes=$(NUM_NODES) \
		--node-pool=$(NODE_POOL) \
		--zone=$(ZONE) \
		--project=$(PROJECT_ID) \
		--quiet

# ノード数を 0 にする
# オートスケーリングを off にする
tuckin:
	gcloud container node-pools update $(NODE_POOL) \
		--cluster=$(CLUSTER_NAME) \
		--zone=$(ZONE) \
		--no-enable-autoscaling
	gcloud container clusters resize $(CLUSTER_NAME) \
		--num-nodes=0 \
		--node-pool=$(NODE_POOL) \
		--zone=$(ZONE) \
		--project=$(PROJECT_ID) \
		--quiet

# linux/amd64 イメージをビルドして GCR に push し、Kubernetes をデプロイする
getready:
	docker build --platform linux/amd64 -t gcr.io/cat-observes/cat-observes:latest .
	docker push gcr.io/cat-observes/cat-observes:latest
	kubectl replace --force -f k8s/deploy_cat-observes.yaml
