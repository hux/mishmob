# Common Tasks Quick Reference

This guide provides quick commands and code snippets for frequent development tasks in the MishMob project.

## 🚀 Starting Development

### Start Everything
```bash
make dev
# Or manually:
docker-compose up -d
```

### Start Specific Services
```bash
# Backend only (API + Database)
make backend-dev

# Frontend only
make frontend-dev

# Mobile app
make mobile-ios    # iOS
make mobile-android # Android
```

### Check Service Status
```bash
make dev-status
# Or
docker-compose ps
```

## 🔧 Backend Tasks

### Database Operations

#### Run Migrations
```bash
make dev-migrate
# Or
docker-compose exec backend python manage.py migrate
```

#### Create a New Migration
```bash
docker-compose exec backend python manage.py makemigrations
```

#### Reset Database
```bash
make dev-clean-db
make dev-migrate
make dev-createsuperuser
```

#### Access Database Shell
```bash
make dev-db-shell
# Or
psql postgresql://postgres:postgres@localhost:5433/mishmob_db
```

### Django Admin

#### Create Superuser
```bash
make dev-createsuperuser
# Username: admin
# Email: admin@mishmob.org
# Password: (your choice)
```

#### Access Admin Panel
```
http://localhost:8080/admin
```

### Django Shell

#### Access Django Shell
```bash
make dev-shell
# Or
docker-compose exec backend python manage.py shell_plus
```

#### Common Shell Commands
```python
# Get all users
from users.models import User
User.objects.all()

# Create a test opportunity
from opportunities.models import Opportunity, OpportunityHost
host = OpportunityHost.objects.first()
opp = Opportunity.objects.create(
    host=host,
    title="Test Opportunity",
    description="Test description",
    location_zip="10001"
)

# Check user skills
user = User.objects.get(email="test@example.com")
user.userskill_set.all()

# Clear cache
from django.core.cache import cache
cache.clear()
```

### API Testing

#### Test API Endpoints
```bash
# List opportunities
curl http://localhost:8080/api/opportunities/

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# With authentication
TOKEN="your-jwt-token"
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Access API Documentation
```
http://localhost:8080/api/docs
```

### Background Tasks

#### Monitor Celery Tasks
```bash
docker-compose logs -f celery
```

#### Manually Run a Task
```python
# In Django shell
from opportunities.tasks import parse_resume
parse_resume.delay(user_id=1, resume_file_path='/path/to/resume.pdf')
```

## 🎨 Frontend Tasks

### Development

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Dev Server (without Docker)
```bash
cd frontend
npm run dev
```

#### Build for Production
```bash
cd frontend
npm run build
```

### Adding Components

#### Install shadcn/ui Component
```bash
cd frontend
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
```

#### Create New Page
```typescript
// 1. Create page component in frontend/src/pages/NewPage.tsx
import { Card } from '@/components/ui/card';

export default function NewPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">New Page</h1>
    </div>
  );
}

// 2. Add route in frontend/src/App.tsx
import NewPage from './pages/NewPage';

// In routes:
<Route path="/new-page" element={<NewPage />} />

// 3. Add navigation link if needed
```

### Styling

#### Add Custom Colors
```css
/* frontend/src/index.css */
@layer base {
  :root {
    --custom-color: 240 10% 3.9%;
  }
}

/* Use in components */
className="bg-[hsl(var(--custom-color))]"
```

#### Add Tailwind Classes
```typescript
// Use Tailwind utilities
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <span className="text-lg font-semibold">Title</span>
  <Button size="sm">Action</Button>
</div>
```

## 📱 Mobile Tasks

### Setup

#### Install Dependencies
```bash
make mobile-setup
# Or manually:
cd mobile
npm install
cd ios && pod install
```

### Development

#### Start Metro Bundler
```bash
cd mobile
npm start
```

#### Run on iOS Simulator
```bash
make mobile-ios
# Or
cd mobile
npm run ios
```

#### Run on Android Emulator
```bash
make mobile-android
# Or
cd mobile
npm run android
```

#### Clean Build
```bash
make mobile-clean
# Or
cd mobile
cd ios && xcodebuild clean
cd ../android && ./gradlew clean
```

### Debugging

#### Access React Native Debugger
- Press `Cmd+D` (iOS) or `Cmd+M` (Android) in simulator
- Select "Debug JS Remotely"

#### View Logs
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

## 🐳 Docker Management

### Container Operations

#### View Logs
```bash
# All services
make dev-logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f web
docker-compose logs -f db
```

#### Restart Service
```bash
docker-compose restart backend
docker-compose restart web
```

#### Execute Commands in Container
```bash
docker-compose exec backend bash
docker-compose exec web sh
```

### Cleanup

#### Stop All Services
```bash
make dev-down
# Or
docker-compose down
```

#### Remove Everything (including data)
```bash
make dev-clean-all
# Or
docker-compose down -v
docker system prune -a
```

## 🧪 Testing

### Run Tests

#### Backend Tests
```bash
make test-backend
# Or
docker-compose exec backend pytest

# Run specific test
docker-compose exec backend pytest tests/test_api/test_auth.py

# With coverage
docker-compose exec backend pytest --cov=.
```

#### Frontend Tests
```bash
make test-frontend
# Or
cd frontend && npm test

# With coverage
cd frontend && npm run test:coverage
```

#### Mobile Tests
```bash
cd mobile
npm test
```

### Writing Tests

#### Backend Test Example
```python
# tests/test_api/test_opportunities.py
import pytest
from django.test import Client

@pytest.mark.django_db
def test_create_opportunity(client, host_user):
    client.force_login(host_user)

    response = client.post('/api/opportunities/', {
        'title': 'Test Opportunity',
        'description': 'Test description',
        'location_zip': '10001'
    })

    assert response.status_code == 201
    assert response.json()['title'] == 'Test Opportunity'
```

#### Frontend Test Example
```typescript
// frontend/src/components/__tests__/OpportunityCard.test.tsx
import { render, screen } from '@testing-library/react';
import { OpportunityCard } from '../OpportunityCard';

test('displays opportunity title', () => {
  const opp = { title: 'Test Opportunity', description: 'Test' };
  render(<OpportunityCard opportunity={opp} />);

  expect(screen.getByText('Test Opportunity')).toBeInTheDocument();
});
```

## 🔍 Debugging

### Backend Debugging

#### Enable Debug Mode
```python
# backend/.env
DEBUG=True
```

#### Use Django Debug Toolbar
```python
# Access at http://localhost:8080/__debug__/
```

#### Add Breakpoints
```python
import pdb; pdb.set_trace()
# Or in VS Code, set breakpoints and attach to container
```

### Frontend Debugging

#### Browser DevTools
- React Developer Tools extension
- Redux DevTools (if using Redux)
- Network tab for API calls

#### Console Logging
```typescript
console.log('Debug value:', variable);
console.table(arrayData);
console.group('Component State');
console.log('Props:', props);
console.log('State:', state);
console.groupEnd();
```

## 📦 Dependency Management

### Backend Dependencies

#### Add New Package
```bash
# Add to requirements.txt
echo "package-name==1.0.0" >> backend/requirements.txt

# Install in container
docker-compose exec backend pip install package-name==1.0.0
```

#### Update All Packages
```bash
docker-compose exec backend pip install --upgrade -r requirements.txt
```

### Frontend Dependencies

#### Add New Package
```bash
cd frontend
npm install package-name
# Or for dev dependency
npm install -D package-name
```

#### Update Dependencies
```bash
cd frontend
npm update
# Or specific package
npm update package-name
```

## 🚢 Deployment

### Build for Production

#### Build Docker Images
```bash
make build
# Or
docker build -t mishmob/backend:latest ./backend
docker build -t mishmob/frontend:latest ./frontend
```

#### Deploy to Kubernetes
```bash
make deploy
# Or
kubectl apply -k infra/k8s/overlays/prod
```

### Environment Variables

#### Backend Environment
```bash
# backend/.env.production
DEBUG=False
SECRET_KEY=production-secret-key
DATABASE_URL=postgresql://user:pass@db-host:5432/mishmob
REDIS_URL=redis://redis-host:6379/0
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

#### Frontend Environment
```bash
# frontend/.env.production
VITE_API_URL=https://api.mishmob.org
VITE_APP_NAME=MishMob
```

## 🛠️ Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
```

### Push and Create PR
```bash
git push origin feature/my-feature
# Create PR on GitHub
```

### Sync with Main
```bash
git checkout main
git pull origin main
git checkout feature/my-feature
git rebase main
```

## 📝 Database Schema Updates

### Add New Model
```python
# 1. Create model in appropriate app
# backend/opportunities/models.py
class NewModel(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

# 2. Create migration
docker-compose exec backend python manage.py makemigrations

# 3. Apply migration
docker-compose exec backend python manage.py migrate
```

### Add New Field to Existing Model
```python
# 1. Add field to model
class Opportunity(models.Model):
    # existing fields...
    new_field = models.CharField(max_length=50, null=True)  # Allow null initially

# 2. Create and apply migration
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# 3. Optionally populate data and make non-nullable
```

## 🔐 Authentication & Security

### Generate Secret Key
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Create Test Users
```python
# In Django shell
from users.models import User

# Create volunteer
volunteer = User.objects.create_user(
    username='volunteer1',
    email='volunteer@test.com',
    password='testpass123',
    user_type='volunteer'
)

# Create host
host = User.objects.create_user(
    username='host1',
    email='host@test.com',
    password='testpass123',
    user_type='host'
)
```

## 📊 Monitoring & Logs

### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service with timestamps
docker-compose logs -f --timestamps backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Check Resource Usage
```bash
docker stats
```

### Database Queries
```python
# Enable query logging in Django
LOGGING = {
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        }
    },
    'loggers': {
        'django.db.backends': {
            'level': 'DEBUG',
            'handlers': ['console'],
        }
    }
}
```

## ⚡ Performance

### Profile Django Views
```python
# Use django-silk for profiling
# Access at http://localhost:8080/silk/
```

### Optimize Database Queries
```python
# Use select_related for foreign keys
opportunities = Opportunity.objects.select_related('host')

# Use prefetch_related for many-to-many
opportunities = Opportunity.objects.prefetch_related('skills')

# Use only() for specific fields
opportunities = Opportunity.objects.only('id', 'title')
```

### Frontend Bundle Analysis
```bash
cd frontend
npm run build -- --analyze
```

---

Last updated: October 2024