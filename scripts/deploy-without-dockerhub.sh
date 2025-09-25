#!/bin/bash
set -e

# Deploy without needing Docker Hub access
NAMESPACE="mishmob"

echo "Deploying MishMob without Docker Hub dependencies..."
echo ""

# Create namespace
echo "Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# First, let's check if we have the images in ECR already
echo "Checking ECR for required images..."
aws ecr describe-repositories --region us-east-1 | grep repositoryName || true

echo ""
echo "If the postgres, redis, meilisearch repositories don't exist in ECR,"
echo "you'll need to either:"
echo "1. Pull them on a machine with Docker Hub access and push to ECR"
echo "2. Use AWS public ECR gallery images"
echo "3. Build minimal versions yourself"
echo ""

# Deploy only the services that we have images for
echo "Deploying web services (which we built)..."

# Apply the web services only
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: mishmob
---
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
  namespace: mishmob
type: Opaque
stringData:
  secret-key: "temporary-development-key-change-in-production"
---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secrets
  namespace: mishmob
type: Opaque
stringData:
  username: "postgres"
  password: "temporary-password-change-in-production"
---
apiVersion: v1
kind: Secret
metadata:
  name: meilisearch-secrets
  namespace: mishmob
type: Opaque
stringData:
  master-key: "temporary-meilisearch-key-change-in-production"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-backend
  namespace: mishmob
  labels:
    app: mishmob
    component: web-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mishmob
      component: web-backend
  template:
    metadata:
      labels:
        app: mishmob
        component: web-backend
    spec:
      containers:
      - name: web-backend
        image: 787643543720.dkr.ecr.us-east-1.amazonaws.com/mishmob/backend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: DEBUG
          value: "True"
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: backend-secrets
              key: secret-key
        - name: DATABASE_NAME
          value: "mishmob_db"
        - name: DATABASE_HOST
          value: "postgres-placeholder"
        - name: DATABASE_PORT
          value: "5432"
        - name: REDIS_URL
          value: "redis://redis-placeholder:6379/0"
        - name: MEILISEARCH_HOST
          value: "http://meilisearch-placeholder:7700"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: web-backend
  namespace: mishmob
  labels:
    app: mishmob
    component: web-backend
spec:
  selector:
    app: mishmob
    component: web-backend
  ports:
  - port: 8000
    targetPort: 8000
    protocol: TCP
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-ui
  namespace: mishmob
  labels:
    app: mishmob
    component: web-ui
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mishmob
      component: web-ui
  template:
    metadata:
      labels:
        app: mishmob
        component: web-ui
    spec:
      containers:
      - name: web-ui
        image: 787643543720.dkr.ecr.us-east-1.amazonaws.com/mishmob/frontend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
          name: http
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: web-ui
  namespace: mishmob
  labels:
    app: mishmob
    component: web-ui
spec:
  selector:
    app: mishmob
    component: web-ui
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mishmob-ingress
  namespace: mishmob
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  rules:
  - host: mishmob.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-ui
            port:
              number: 80
  - host: api.mishmob.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-backend
            port:
              number: 8000
EOF

echo ""
echo "Basic web services deployed!"
echo ""
kubectl get pods -n mishmob
echo ""
echo "Note: Database services (postgres, redis, meilisearch) are NOT deployed."
echo "The web services will fail health checks until databases are available."
echo ""
echo "To complete the deployment, you need to get the database images into ECR."