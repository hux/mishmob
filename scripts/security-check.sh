#!/bin/bash

# MishMob Security Check Script
# Checks for vulnerabilities in all project dependencies

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "\n${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

TOTAL_VULNERABILITIES=0

# Function to check npm vulnerabilities
check_npm_vulnerabilities() {
    local dir=$1
    local name=$2
    
    if [ -f "$dir/package.json" ]; then
        print_step "Checking $name for vulnerabilities..."
        cd "$dir"
        
        # Run npm audit and capture the output
        if npm audit --json > audit-report.json 2>/dev/null; then
            VULNS=$(jq '.metadata.vulnerabilities.total' audit-report.json)
            
            if [ "$VULNS" -eq 0 ]; then
                print_success "$name has no vulnerabilities"
            else
                print_warning "$name has $VULNS vulnerabilities"
                TOTAL_VULNERABILITIES=$((TOTAL_VULNERABILITIES + VULNS))
                
                # Show vulnerability breakdown
                echo "  Critical: $(jq '.metadata.vulnerabilities.critical' audit-report.json)"
                echo "  High: $(jq '.metadata.vulnerabilities.high' audit-report.json)"
                echo "  Moderate: $(jq '.metadata.vulnerabilities.moderate' audit-report.json)"
                echo "  Low: $(jq '.metadata.vulnerabilities.low' audit-report.json)"
                
                # Ask if user wants to fix
                read -p "Would you like to run 'npm audit fix' for $name? (y/n) " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    npm audit fix
                    
                    # Check if there are still vulnerabilities requiring force
                    npm audit --json > audit-report-after.json 2>/dev/null
                    VULNS_AFTER=$(jq '.metadata.vulnerabilities.total' audit-report-after.json)
                    
                    if [ "$VULNS_AFTER" -gt 0 ]; then
                        print_warning "Still $VULNS_AFTER vulnerabilities remaining"
                        read -p "Would you like to run 'npm audit fix --force'? This may introduce breaking changes. (y/n) " -n 1 -r
                        echo
                        if [[ $REPLY =~ ^[Yy]$ ]]; then
                            npm audit fix --force
                        fi
                    fi
                    rm -f audit-report-after.json
                fi
            fi
            rm -f audit-report.json
        else
            print_error "Failed to run npm audit for $name"
        fi
        
        cd - > /dev/null
    fi
}

# Function to check Python vulnerabilities
check_python_vulnerabilities() {
    local dir=$1
    local name=$2
    
    if [ -f "$dir/requirements.txt" ]; then
        print_step "Checking $name for vulnerabilities..."
        cd "$dir"
        
        # Check if pip-audit is installed
        if ! command -v pip-audit &> /dev/null; then
            print_warning "pip-audit not installed. Installing..."
            pip install pip-audit
        fi
        
        # Run pip-audit
        if [ -f "venv/bin/activate" ]; then
            source venv/bin/activate
        fi
        
        pip-audit --desc || print_warning "Some Python packages may have vulnerabilities"
        
        if [ -f "venv/bin/activate" ]; then
            deactivate
        fi
        
        cd - > /dev/null
    fi
}

echo -e "${BLUE}MishMob Security Check${NC}"
echo "======================"
echo ""

# Check frontend
check_npm_vulnerabilities "frontend" "Frontend"

# Check mobile
check_npm_vulnerabilities "mobile" "Mobile App"

# Check backend
check_python_vulnerabilities "backend" "Backend"

# Summary
echo ""
echo "======================"
if [ $TOTAL_VULNERABILITIES -eq 0 ]; then
    echo -e "${GREEN}✅ All dependencies are secure!${NC}"
else
    echo -e "${YELLOW}⚠️  Found $TOTAL_VULNERABILITIES total npm vulnerabilities${NC}"
    echo ""
    echo "To fix all vulnerabilities automatically, run:"
    echo "  cd frontend && npm audit fix"
    echo "  cd mobile && npm audit fix"
fi

# Check for outdated packages
echo ""
read -p "Would you like to check for outdated packages? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Checking for outdated packages..."
    
    if [ -f "frontend/package.json" ]; then
        echo -e "\n${BLUE}Frontend outdated packages:${NC}"
        cd frontend && npm outdated || true
        cd ..
    fi
    
    if [ -f "mobile/package.json" ]; then
        echo -e "\n${BLUE}Mobile outdated packages:${NC}"
        cd mobile && npm outdated || true
        cd ..
    fi
    
    if [ -f "backend/requirements.txt" ]; then
        echo -e "\n${BLUE}Backend outdated packages:${NC}"
        cd backend
        if [ -f "venv/bin/activate" ]; then
            source venv/bin/activate
            pip list --outdated || true
            deactivate
        fi
        cd ..
    fi
fi