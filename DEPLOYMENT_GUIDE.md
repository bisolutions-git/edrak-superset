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
docker-compose -f docker-compose.dev.yml logs -f superset
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

2. **Configure Firewall**:
   ```bash
   # Allow port 8088 through firewall
   sudo ufw allow 8088/tcp
   sudo ufw reload
   ```

3. **Set up Reverse Proxy (Optional)**:
   ```bash
   # Install Nginx
   sudo apt install -y nginx

   # Create Nginx configuration
   sudo nano /etc/nginx/sites-available/edrak-analytics
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # Replace with your domain

       location / {
           proxy_pass http://localhost:8088;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/edrak-analytics /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## ⚙️ Configuration

### Environment Variables

Edit `docker/.env.edrak` to customize:

```bash
# Database Configuration
DATABASE_DB=edrak_analytics
DATABASE_PASSWORD=your_secure_password

# Security
SECRET_KEY=your_generated_secret_key

# Superset Configuration
SUPERSET_LOAD_EXAMPLES=no  # Set to 'yes' for demo data
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
   docker logs edrak_analytics_db
   
   # Restart database
   docker compose -f docker-compose.edrak.yml restart db
   ```

3. **Frontend Build Issues**:
   ```bash
   # Rebuild with no cache
   docker compose -f docker-compose.edrak.yml build --no-cache superset
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
docker compose -f docker-compose.edrak.yml logs superset
docker compose -f docker-compose.edrak.yml logs db

# Follow logs in real-time
docker compose -f docker-compose.edrak.yml logs -f
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
docker exec edrak_analytics_db pg_dump -U superset edrak_analytics > backup_$(date +%Y%m%d).sql

# Restore from backup
docker exec -i edrak_analytics_db psql -U superset edrak_analytics < backup_20250815.sql
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
- **Production (server)**: http://your-server-ip:8088
- **With Nginx**: http://your-domain.com

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
