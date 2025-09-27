from django.contrib.auth import get_user_model
User = get_user_model()

# Delete old user
User.objects.filter(username='mobiletest').delete()

# Create new user
user = User.objects.create_user(
    username='mobiletest',
    email='mobile@test.com', 
    password='mobile123',
    first_name='Mobile',
    last_name='Test',
    user_type='volunteer'
)
print(f"Created user: {user.username}")

# Verify login works
from django.contrib.auth import authenticate
auth_user = authenticate(username='mobiletest', password='mobile123')
print(f"Authentication test: {'Success' if auth_user else 'Failed'}")