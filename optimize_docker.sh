#!/bin/bash
# Edrak Analytics Docker Optimization Script
# This script optimizes Docker files for production deployment

echo "🐳 Optimizing Docker setup for Edrak Analytics..."

# Create backup of Docker files
echo "📦 Creating backup of Docker configurations..."
mkdir -p ../edrak-docker-backup
cp -r docker/ ../edrak-docker-backup/ 2>/dev/null || true
cp docker-compose*.yml ../edrak-docker-backup/ 2>/dev/null || true
cp Dockerfile ../edrak-docker-backup/ 2>/dev/null || true

# Remove redundant Docker Compose files
echo "🗑️  Removing redundant Docker Compose files..."
rm -f docker-compose-non-dev.yml
rm -f docker-compose-image-tag.yml
rm -f dockerize.Dockerfile

# Remove development/testing Docker scripts
echo "🧪 Removing development/testing scripts..."
rm -f docker/docker-pytest-entrypoint.sh
rm -f docker/frontend-mem-nag.sh
rm -f docker/tag_latest_release.sh
rm -rf docker/entrypoints/docker-ci.sh

# Rename docker-compose-light.yml to docker-compose.yml for simplicity
echo "📝 Setting up production Docker Compose..."
if [ -f "docker-compose-light.yml" ]; then
    echo "   Using lightweight Docker Compose as main configuration"
    # Keep both for now, you can choose which to use
fi

# Update Docker environment file for Edrak Analytics
echo "⚙️  Updating Docker environment for Edrak Analytics..."
if [ -f "docker/.env" ]; then
    # Create a custom .env for Edrak Analytics
    cp docker/.env docker/.env.backup
    
    # You can customize these values
    cat > docker/.env.edrak << 'EOF'
# Edrak Analytics Docker Environment Configuration

# Database Configuration
DATABASE_DB=edrak_analytics
DATABASE_HOST=db
DATABASE_PASSWORD=edrak_secure_password
DATABASE_USER=superset
DATABASE_PORT=5432
DATABASE_DIALECT=postgresql

# Superset Configuration
SUPERSET_LOAD_EXAMPLES=no
CYPRESS_CONFIG=false
SUPERSET_PORT=8088

# Security
SECRET_KEY=58bQh4VjsudDEIyICyNhA75+WGm793RD/B1jBRNO/FtATs329XR1CuiL

# Redis (if using full docker-compose.yml)
REDIS_HOST=redis
REDIS_PORT=6379

# Development
SUPERSET_ENV=production
FLASK_ENV=production
EOF

    echo "   Created docker/.env.edrak with Edrak Analytics settings"
    echo "   Original .env backed up as docker/.env.backup"
fi

# Create simplified docker-compose for Edrak Analytics
echo "🎯 Creating optimized Docker Compose for Edrak Analytics..."
cat > docker-compose.edrak.yml << 'EOF'
#
# Edrak Analytics - Optimized Docker Compose Configuration
# Lightweight setup for production deployment
#

version: '3.8'

services:
  db:
    env_file: docker/.env.edrak
    image: postgres:15
    container_name: edrak_analytics_db
    restart: unless-stopped
    volumes:
      - db_home:/var/lib/postgresql/data
      - ./docker/docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d
    environment:
      POSTGRES_DB: edrak_analytics
      POSTGRES_USER: superset
      POSTGRES_PASSWORD: edrak_secure_password

  superset:
    env_file: docker/.env.edrak
    build:
      context: .
      target: lean
      args:
        DEV_MODE: "false"
        BUILD_TRANSLATIONS: "false"
    container_name: edrak_analytics_app
    restart: unless-stopped
    ports:
      - "8088:8088"
    depends_on:
      - db
    volumes:
      - ./docker:/app/docker
      - ./superset:/app/superset
      - ./superset_config.py:/app/pythonpath/superset_config.py
      - superset_home:/app/superset_home
    environment:
      SUPERSET_CONFIG_PATH: /app/pythonpath/superset_config.py
    command: ["/app/docker/docker-bootstrap.sh", "app-gunicorn"]

volumes:
  superset_home:
    external: false
  db_home:
    external: false
EOF

echo "✅ Docker optimization complete!"
echo ""
echo "📊 Optimized Docker setup:"
echo "  ✓ Dockerfile (production image)"
echo "  ✓ docker-compose-light.yml (lightweight setup)"
echo "  ✓ docker-compose.edrak.yml (custom Edrak Analytics setup)"
echo "  ✓ docker/.env.edrak (Edrak Analytics environment)"
echo "  ✓ Essential Docker scripts only"
echo ""
echo "🚀 To deploy Edrak Analytics:"
echo "  docker-compose -f docker-compose.edrak.yml up -d"
echo ""
echo "🔧 To use lightweight setup:"
echo "  docker-compose -f docker-compose-light.yml up -d"
echo ""
echo "📝 Your customizations (logo, config) are preserved!"
