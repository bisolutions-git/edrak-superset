# 🚀 Edrak Analytics - Docker Deployment Guide

Complete deployment instructions for your customized Apache Superset platform on macOS and Ubuntu Server.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [macOS Deployment](#macos-deployment)
- [Ubuntu Server Deployment](#ubuntu-server-deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## 🔧 Prerequisites

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 10GB free space
- **Network**: Internet connection for Docker image downloads

### Required Software
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git (for cloning/updating)

---

## 🍎 macOS Deployment

### Step 1: Install Docker Desktop

1. **Download Docker Desktop**:
   ```bash
   # Visit https://www.docker.com/products/docker-desktop
   # Or install via Homebrew:
   brew install --cask docker
   ```

2. **Start Docker Desktop**:
   - Launch Docker Desktop from Applications
   - Wait for Docker to start (whale icon in menu bar)

3. **Verify Installation**:
   ```bash
   docker --version
   docker-compose --version
   ```

### Step 2: Prepare Edrak Analytics

1. **Navigate to Project Directory**:
   ```bash
   cd /Users/mgamal/src/edrak-superset
   ```

2. **Run Docker Optimization** (if not done already):
   ```bash
   chmod +x optimize_docker.sh
   ./optimize_docker.sh
   ```

### Step 3: Deploy Edrak Analytics

#### Option A: Development Mode (Recommended for customization)
```bash
# Start development environment with live reloading
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f edrak_app
```

#### Option B: Production Mode
```bash
# Build and start production environment
docker-compose -f docker-compose.edrak.yml up --build -d

# Check status
docker-compose -f docker-compose.edrak.yml ps
```

### Step 4: Access Edrak Analytics

1. **Wait for Startup** (2-3 minutes for first run)
2. **Open Browser**: http://localhost:8088
3. **Login Credentials**:
   - Username: `admin`
   - Password: [your admin password]

### Step 5: macOS-Specific Configuration

1. **Firewall Settings**:
   ```bash
   # Allow Docker through firewall if needed
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /Applications/Docker.app/Contents/MacOS/Docker
   ```

2. **Resource Allocation**:
   - Open Docker Desktop → Settings → Resources
   - Allocate at least 4GB RAM and 2 CPUs

---

## 🐧 Ubuntu Server Deployment

### Step 1: Install Docker Engine

1. **Update System**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. **Install Dependencies**:
   ```bash
   sudo apt install -y \
       apt-transport-https \
       ca-certificates \
       curl \
       gnupg \
       lsb-release
   ```

3. **Add Docker Repository**:
   ```bash
   # Add Docker's official GPG key
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

   # Set up stable repository
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

4. **Install Docker**:
   ```bash
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
   ```

5. **Configure Docker**:
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER

   # Enable Docker service
   sudo systemctl enable docker
   sudo systemctl start docker

   # Logout and login again, then verify
   docker --version
   docker compose version
   ```

### Step 2: Deploy Edrak Analytics on Ubuntu

1. **Clone/Transfer Project**:
   ```bash
   # If using Git
   git clone [your-repo-url] edrak-superset
   cd edrak-superset

   # Or transfer files via SCP
   scp -r /Users/mgamal/src/edrak-superset user@server:/home/user/
   cd /home/user/edrak-superset
   ```

2. **Set Permissions**:
   ```bash
   chmod +x optimize_docker.sh
   ./optimize_docker.sh
   ```

3. **Configure Environment**:
   ```bash
   # Edit environment file for server
   nano docker/.env.edrak
   
   # Update these values for production:
   DATABASE_PASSWORD=your_secure_password_here
   SECRET_KEY=your_secret_key_here
   DATABASE_DB=edrak_analytics
   DATABASE_USER=superset
   ```

### Step 3: Production Deployment on Ubuntu

1. **Deploy with Production Configuration**:
   ```bash
   # Build and start services
   docker compose -f docker-compose.edrak.yml up --build -d

   # Check status
   docker compose -f docker-compose.edrak.yml ps

   # View logs
   docker compose -f docker-compose.edrak.yml logs -f
   ```

2. **Initialize Database and Create Admin User**:
   ```bash
   # Initialize database schema
   docker compose -f docker-compose.edrak.yml exec edrak_app superset db upgrade

   # Create admin user
   docker compose -f docker-compose.edrak.yml exec edrak_app superset fab create-admin \
       --username admin \
       --firstname Admin \
       --lastname User \
       --email admin@edrakanalytics.com \
       --password admin

   # Initialize Superset
   docker compose -f docker-compose.edrak.yml exec edrak_app superset init
   ```

3. **Configure Firewall**:
   ```bash
   # Allow HTTP and HTTPS through firewall
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw reload
   ```

4. **Configure Domain Access**:
   
   **DNS Setup:**
   ```bash
   # Point your domain to your server IP
   # demo.edrakanalytics.com → YOUR_SERVER_IP
   ```

   **SSL Certificate Setup (Let's Encrypt):**
   ```bash
   # Install certbot (no nginx needed - we use Docker)
   sudo apt install -y certbot

   # Get SSL certificate using standalone mode
   sudo certbot certonly --standalone -d demo.edrakanalytics.com

   # Create SSL directory and copy certificates
   mkdir -p docker/ssl
   sudo cp /etc/letsencrypt/live/demo.edrakanalytics.com/fullchain.pem docker/ssl/demo.edrakanalytics.com.crt
   sudo cp /etc/letsencrypt/live/demo.edrakanalytics.com/privkey.pem docker/ssl/demo.edrakanalytics.com.key
   sudo chown -R $USER:$USER docker/ssl
   ```

---

## ⚙️ Configuration

### Environment Variables

Edit `docker/.env.edrak` to customize:

```bash
# Database Configuration
DATABASE_DB=edrak_analytics
DATABASE_HOST=db
DATABASE_PASSWORD=your_secure_password
DATABASE_USER=superset
DATABASE_PORT=5432
DATABASE_DIALECT=postgresql

# Security
SECRET_KEY=your_generated_secret_key

# Superset Configuration
SUPERSET_LOAD_EXAMPLES=no  # Set to 'yes' for demo data
SUPERSET_ENV=production
FLASK_ENV=production
SUPERSET_PORT=8088
```

### Custom Branding

Your Edrak Analytics branding is configured in `superset_config.py`:

```python
APP_NAME = "Edrak Analytics"
APP_ICON = "/static/assets/images/edrak-logo.png"
LOGO_TOOLTIP = "Edrak Analytics - Business Intelligence Platform"
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Check what's using port 8088
   sudo lsof -i :8088
   
   # Kill the process or change port in docker-compose file
   ```

2. **Database Connection Issues**:
   ```bash
   # Check database container
   docker compose -f docker-compose.edrak.yml logs db
   
   # Restart database
   docker compose -f docker-compose.edrak.yml restart db
   ```

3. **Frontend Build Issues**:
   ```bash
   # Rebuild with no cache
   docker compose -f docker-compose.edrak.yml build --no-cache edrak_app
   ```

4. **Permission Issues (Ubuntu)**:
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Logs and Debugging

```bash
# View all logs
docker compose -f docker-compose.edrak.yml logs

# View specific service logs
docker compose -f docker-compose.edrak.yml logs edrak_app
docker compose -f docker-compose.edrak.yml logs db

# Follow logs in real-time
docker compose -f docker-compose.edrak.yml logs -f

# Follow specific service logs in real-time
docker compose -f docker-compose.edrak.yml logs -f edrak_app
docker compose -f docker-compose.edrak.yml logs -f db
docker compose -f docker-compose.edrak.yml logs -f nginx
```

---

## 🔐 SSL Certificate Management

### SSL Certificate Renewal

Your SSL certificates need renewal every 90 days. Use your existing renewal script:

```bash
# Run your Let's Encrypt renewal script
./your-renewal-script.sh

# Copy renewed certificates to Docker directory
sudo cp /etc/letsencrypt/live/demo.edrakanalytics.com/fullchain.pem docker/ssl/demo.edrakanalytics.com.crt
sudo cp /etc/letsencrypt/live/demo.edrakanalytics.com/privkey.pem docker/ssl/demo.edrakanalytics.com.key
sudo chown -R $USER:$USER docker/ssl

# Restart nginx container to load new certificates
docker compose -f docker-compose.edrak.yml restart nginx
```

### Automated Renewal (Recommended)

Set up a cron job for automatic renewal:

```bash
# Edit crontab
crontab -e

# Add this line to run renewal script monthly
0 2 1 * * /path/to/your-renewal-script.sh && docker compose -f /path/to/edrak-superset/docker-compose.edrak.yml restart nginx
```

---

## 🔄 Maintenance

### Updating Edrak Analytics

1. **Stop Services**:
   ```bash
   docker compose -f docker-compose.edrak.yml down
   ```

2. **Update Code** (if using Git):
   ```bash
   git pull origin main
   ```

3. **Rebuild and Start**:
   ```bash
   docker compose -f docker-compose.edrak.yml up --build -d
   ```

### Backup Database

```bash
# Create database backup
docker compose -f docker-compose.edrak.yml exec db pg_dump -U superset edrak_analytics > backup_$(date +%Y%m%d).sql

# Restore from backup
docker compose -f docker-compose.edrak.yml exec -T db psql -U superset edrak_analytics < backup_20250815.sql
```

### System Monitoring

```bash
# Check container resource usage
docker stats

# Check disk usage
docker system df

# Clean up unused images/containers
docker system prune -a
```

---

## 🌐 Access URLs

- **Development**: http://localhost:8088
- **Production (local)**: http://localhost:8088
- **Production (server)**: https://demo.edrakanalytics.com
- **HTTP (redirects to HTTPS)**: http://demo.edrakanalytics.com

---

## 📞 Support

### Quick Commands Reference

```bash
# Start services
docker compose -f docker-compose.edrak.yml up -d

# Stop services
docker compose -f docker-compose.edrak.yml down

# Restart services
docker compose -f docker-compose.edrak.yml restart

# View status
docker compose -f docker-compose.edrak.yml ps

# Update and rebuild
docker compose -f docker-compose.edrak.yml up --build -d
```

### Health Checks

1. **Container Status**: All containers should show "Up" status
2. **Database**: Should be accessible on port 5432
3. **Application**: Should respond on port 8088
4. **Logs**: No critical errors in application logs

---

**🎉 Congratulations! Your Edrak Analytics platform is now deployed and ready for use.**

For customization (frontend styling, custom charts, AI analytics), refer to the development workflow in this repository.
