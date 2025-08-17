#!/bin/bash
#
# Frontend Memory Monitoring Script for Edrak Analytics
# Checks available memory and warns if insufficient for frontend build
#

set -e

# Get available memory in MB
AVAILABLE_MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $7}' 2>/dev/null || echo "4096")

# Minimum recommended memory for frontend build (in MB)
MIN_MEMORY=2048

echo "🔍 Checking available memory for frontend build..."
echo "Available memory: ${AVAILABLE_MEMORY}MB"
echo "Minimum required: ${MIN_MEMORY}MB"

if [ "$AVAILABLE_MEMORY" -lt "$MIN_MEMORY" ]; then
    echo "⚠️  WARNING: Low memory detected!"
    echo "   Available: ${AVAILABLE_MEMORY}MB"
    echo "   Recommended: ${MIN_MEMORY}MB or more"
    echo "   Frontend build may be slow or fail with out-of-memory errors."
    echo "   Consider increasing Docker memory allocation."
else
    echo "✅ Memory check passed - sufficient memory available"
fi

echo "Continuing with frontend build..."
