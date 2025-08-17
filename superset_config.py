# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import os
from datetime import timedelta

# Superset specific config
ROW_LIMIT = 5000

# Flask App Builder configuration
# Your App secret key - KEEP THIS CONSISTENT ONCE SET!
SECRET_KEY = '58bQh4VjsudDEIyICyNhA75+WGm793RD/B1jBRNO/FtATs329XR1CuiL'

# The SQLAlchemy connection string to your database backend
# PostgreSQL configuration - Docker container connection
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
    'postgresql://superset:Edrak_Superset2025@edrak_db:5432/edrak_analytics'

# Flask-WTF flag for CSRF
WTF_CSRF_ENABLED = True

# Add additional SECRET_KEY for WTF-CSRF
WTF_CSRF_TIME_LIMIT = None

# Set this API key to enable Mapbox visualizations
MAPBOX_API_KEY = os.environ.get('MAPBOX_API_KEY', '')

# Cache configuration - Redis cache for production
CACHE_CONFIG = {
    'CACHE_TYPE': 'RedisCache',
    'CACHE_DEFAULT_TIMEOUT': 300,
    'CACHE_KEY_PREFIX': 'superset_',
    'CACHE_REDIS_HOST': 'edrak_redis',
    'CACHE_REDIS_PORT': 6379,
    'CACHE_REDIS_DB': 1,
    'CACHE_REDIS_URL': 'redis://edrak_redis:6379/1'
}

# Async query configuration
RESULTS_BACKEND = CACHE_CONFIG

# Celery configuration for async queries
class CeleryConfig:
    broker_url = 'redis://edrak_redis:6379/0'
    imports = ('superset.sql_lab', )
    result_backend = 'redis://edrak_redis:6379/0'
    worker_prefetch_multiplier = 10
    task_acks_late = True

CELERY_CONFIG = CeleryConfig

# Enable feature flags for development
FEATURE_FLAGS = {
    'ALERT_REPORTS': True,
    'DASHBOARD_NATIVE_FILTERS': True,
    'DASHBOARD_CROSS_FILTERS': True,
    'DASHBOARD_RBAC': True,
    'ENABLE_TEMPLATE_PROCESSING': True,
    'EMBEDDED_SUPERSET': True,
    'ESCAPE_MARKDOWN_HTML': True,
    'ESTIMATE_QUERY_COST': False,
    'GENERIC_CHART_AXES': True,
    'LISTVIEWS_DEFAULT_CARD_VIEW': True,
    'SQLLAB_BACKEND_PERSISTENCE': True,
    'SSH_TUNNELING': True,
    'THUMBNAILS': True,
    'DRILL_TO_DETAIL': True,
    'DRILL_BY': True,
}

# Email configuration (optional)
SMTP_HOST = 'localhost'
SMTP_STARTTLS = True
SMTP_SSL = False
SMTP_USER = 'superset'
SMTP_PORT = 25
SMTP_PASSWORD = 'superset'
SMTP_MAIL_FROM = 'superset@superset.com'

# WebDriver configuration for thumbnails and alerts
WEBDRIVER_BASEURL = "http://superset:8088/"
WEBDRIVER_BASEURL_USER_FRIENDLY = WEBDRIVER_BASEURL

# Custom branding (for your styling customization)
APP_NAME = "Edrak Analytics"
APP_ICON = "/static/assets/images/edrak-logo.png"
APP_ICON_WIDTH = 150

# Additional branding configuration
LOGO_TARGET_PATH = None
LOGO_TOOLTIP = "Edrak Analytics - Business Intelligence Platform"
LOGO_RIGHT_TEXT = ""

# Security configuration
TALISMAN_ENABLED = True
TALISMAN_CONFIG = {
    "content_security_policy": {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "worker-src": ["'self'", "blob:"],
        "connect-src": [
            "'self'",
            "https://api.mapbox.com",
            "https://events.mapbox.com",
        ],
        "object-src": "'none'",
    }
}

# Custom CSS for your styling needs
CUSTOM_CSS = """
/* Add your custom CSS here for frontend styling */
"""

# Enable SQL Lab
SQLLAB_ASYNC_TIME_LIMIT_SEC = 60 * 60 * 6
SQLLAB_TIMEOUT = 300
SUPERSET_WEBSERVER_TIMEOUT = 300
