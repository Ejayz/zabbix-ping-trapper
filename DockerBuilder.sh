#!/usr/bin/env bash
set -e

# --------------------------
# Parameters
# --------------------------
DOCKER_USER="$1"      # Docker Hub username
IMAGE_NAME="$2"       # Image name
BUILD_DIR="$3"        # Directory with Dockerfile
IMAGE_TAG="$4"        # Tag (e.g., v1.0.0)
# --------------------------

# --------------------------
# Validation
# --------------------------
if [[ -z "$DOCKER_USER" || -z "$IMAGE_NAME" || -z "$BUILD_DIR" || -z "$IMAGE_TAG" ]]; then
  echo "Usage: $0 <docker_user> <image_name> <build_dir> <tag>"
  echo "Example: $0 jude315 zabbix-ping-trapper ./zabbix-ping-trapper v1.0.0"
  exit 1
fi

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "❌ Build directory does not exist: $BUILD_DIR"
  exit 1
fi

# --------------------------
# Check if Docker needs sudo
# --------------------------
DOCKER_CMD="docker"
if ! docker info >/dev/null 2>&1; then
  if command -v sudo >/dev/null 2>&1; then
    DOCKER_CMD="sudo docker"
    echo "⚠️  Docker requires sudo — using sudo"
  else
    echo "❌ Docker not accessible and sudo not found"
    exit 1
  fi
fi

# --------------------------
# Image names
# --------------------------
TEMP_IMAGE="tmp-build-image"
FINAL_IMAGE="$DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG"

echo "================================================="
echo "🚀 Docker Build → Tag → Push"
echo "Build dir : $BUILD_DIR"
echo "Temp image: $TEMP_IMAGE"
echo "Final tag : $FINAL_IMAGE"
echo "Docker cmd: $DOCKER_CMD"
echo "================================================="
echo

# --------------------------
# Step 0: Update
# -------------------------
echo "Step 0: Updating git repositories"


cd $BUILD_DIR
git pull
cd ..

# --------------------------
# Step 1: Build
# --------------------------
echo "🛠 Step 1: Building Docker image..."
$DOCKER_CMD build -t "$TEMP_IMAGE" "$BUILD_DIR"
echo "✅ Build complete"
echo

# --------------------------
# Step 2: Tag
# --------------------------
echo "🏷 Step 2: Tagging image..."
$DOCKER_CMD tag "$TEMP_IMAGE" "$FINAL_IMAGE"
echo "✅ Image tagged: $FINAL_IMAGE"
echo

# --------------------------
# Step 3: Login
# --------------------------
echo "🔐 Step 3: Logging into Docker Hub (if required)..."
$DOCKER_CMD login || true
echo "✅ Login done"
echo

# --------------------------
# Step 4: Push
# --------------------------
echo "📤 Step 4: Pushing image..."
$DOCKER_CMD push "$FINAL_IMAGE"
echo "✅ Image pushed: $FINAL_IMAGE"
echo "================================================="
