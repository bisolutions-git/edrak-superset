#!/usr/bin/env python3
"""
Environment check script for Edrak Analytics
Validates required environment variables are set
"""

import os
import sys

def check_env():
    """Check if required environment variables are set"""
    required_vars = [
        'DATABASE_DB',
        'DATABASE_USER', 
        'DATABASE_PASSWORD',
        'SECRET_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"ERROR: Missing required environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file configuration")
        sys.exit(1)
    
    print("✓ All required environment variables are set")
    return True

if __name__ == "__main__":
    check_env()
