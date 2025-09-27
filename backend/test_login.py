from django.contrib.auth.models import User
from django.contrib.auth import authenticate

# Delete existing test users
User.objects.filter(username__in=['simpletest', 'mobiletest']).delete()

# Create a simple test user
user = User.objects.create_user(
    username='simpletest',
    password='simple123',
    email='simple@test.com'
)
print(f"Created user: {user.username} (id: {user.id})")

# Test authentication
auth_result = authenticate(username='simpletest', password='simple123')
print(f"Authentication test: {'Success' if auth_result else 'Failed'}")

if auth_result:
    print(f"Authenticated user id: {auth_result.id}, username: {auth_result.username}")