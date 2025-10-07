from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from decouple import config


class Command(BaseCommand):
    help = 'Set up social authentication providers with credentials from environment variables'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--update',
            action='store_true',
            help='Update existing social apps if they already exist',
        )
    
    def handle(self, *args, **options):
        # Ensure the site exists
        site, created = Site.objects.get_or_create(
            pk=settings.SITE_ID,
            defaults={
                'domain': 'localhost:8080',
                'name': 'MishMob Development'
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created site: {site.domain}')
            )
        
        # Social provider configurations
        providers = [
            {
                'provider': 'google',
                'name': 'Google',
                'client_id': config('GOOGLE_OAUTH2_CLIENT_ID', default=''),
                'secret': config('GOOGLE_OAUTH2_CLIENT_SECRET', default=''),
            },
            {
                'provider': 'facebook',
                'name': 'Facebook',
                'client_id': config('FACEBOOK_APP_ID', default=''),
                'secret': config('FACEBOOK_APP_SECRET', default=''),
            },
            {
                'provider': 'apple',
                'name': 'Apple',
                'client_id': config('APPLE_CLIENT_ID', default=''),
                'secret': config('APPLE_PRIVATE_KEY', default=''),
                'key': config('APPLE_KEY_ID', default=''),
                'team': config('APPLE_TEAM_ID', default=''),
            },
            {
                'provider': 'linkedin_oauth2',
                'name': 'LinkedIn',
                'client_id': config('LINKEDIN_OAUTH2_CLIENT_ID', default=''),
                'secret': config('LINKEDIN_OAUTH2_CLIENT_SECRET', default=''),
            },
        ]
        
        for provider_config in providers:
            provider = provider_config['provider']
            client_id = provider_config['client_id']
            secret = provider_config['secret']
            
            if not client_id or not secret:
                self.stdout.write(
                    self.style.WARNING(
                        f'Skipping {provider}: Missing credentials in environment variables'
                    )
                )
                continue
            
            # Check if social app already exists
            try:
                social_app = SocialApp.objects.get(provider=provider)
                if options['update']:
                    social_app.name = provider_config['name']
                    social_app.client_id = client_id
                    social_app.secret = secret
                    
                    # Handle Apple-specific settings
                    if provider == 'apple':
                        social_app.key = provider_config.get('key', '')
                        # For Apple, we might need to store additional settings in settings field
                        apple_settings = {
                            'team': provider_config.get('team', ''),
                        }
                        social_app.settings = apple_settings
                    
                    social_app.save()
                    social_app.sites.set([site])
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'Updated {provider} social app')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'{provider} social app already exists. Use --update to update it.'
                        )
                    )
                    
            except SocialApp.DoesNotExist:
                # Create new social app
                social_app_data = {
                    'provider': provider,
                    'name': provider_config['name'],
                    'client_id': client_id,
                    'secret': secret,
                }
                
                # Handle Apple-specific settings
                if provider == 'apple':
                    social_app_data['key'] = provider_config.get('key', '')
                    social_app_data['settings'] = {
                        'team': provider_config.get('team', ''),
                    }
                
                social_app = SocialApp.objects.create(**social_app_data)
                social_app.sites.set([site])
                
                self.stdout.write(
                    self.style.SUCCESS(f'Created {provider} social app')
                )
        
        self.stdout.write(
            self.style.SUCCESS('Social provider setup complete!')
        )
        
        # Display configuration instructions
        self.stdout.write('\n' + '='*50)
        self.stdout.write('CONFIGURATION INSTRUCTIONS:')
        self.stdout.write('='*50)
        
        self.stdout.write('\n1. Google OAuth2:')
        self.stdout.write('   - Go to https://console.developers.google.com/')
        self.stdout.write('   - Create a project and enable Google+ API')
        self.stdout.write('   - Add authorized redirect URIs:')
        self.stdout.write('     * http://localhost:8080/accounts/google/login/callback/')
        self.stdout.write('     * https://yourdomain.com/accounts/google/login/callback/')
        
        self.stdout.write('\n2. Facebook App:')
        self.stdout.write('   - Go to https://developers.facebook.com/')
        self.stdout.write('   - Create an app and add Facebook Login product')
        self.stdout.write('   - Add valid OAuth redirect URIs:')
        self.stdout.write('     * http://localhost:8080/accounts/facebook/login/callback/')
        self.stdout.write('     * https://yourdomain.com/accounts/facebook/login/callback/')
        
        self.stdout.write('\n3. Apple Sign In:')
        self.stdout.write('   - Go to https://developer.apple.com/')
        self.stdout.write('   - Create a Service ID and configure Sign in with Apple')
        self.stdout.write('   - Add return URLs:')
        self.stdout.write('     * http://localhost:8080/accounts/apple/login/callback/')
        self.stdout.write('     * https://yourdomain.com/accounts/apple/login/callback/')
        
        self.stdout.write('\n4. LinkedIn OAuth2:')
        self.stdout.write('   - Go to https://developer.linkedin.com/')
        self.stdout.write('   - Create an app and request Sign In with LinkedIn')
        self.stdout.write('   - Add authorized redirect URLs:')
        self.stdout.write('     * http://localhost:8080/accounts/linkedin_oauth2/login/callback/')
        self.stdout.write('     * https://yourdomain.com/accounts/linkedin_oauth2/login/callback/')
        
        self.stdout.write('\n5. Update your .env file with the credentials:')
        for provider_config in providers:
            provider = provider_config['provider']
            if provider == 'google':
                self.stdout.write('   GOOGLE_OAUTH2_CLIENT_ID=your-google-client-id')
                self.stdout.write('   GOOGLE_OAUTH2_CLIENT_SECRET=your-google-client-secret')
            elif provider == 'facebook':
                self.stdout.write('   FACEBOOK_APP_ID=your-facebook-app-id')
                self.stdout.write('   FACEBOOK_APP_SECRET=your-facebook-app-secret')
            elif provider == 'apple':
                self.stdout.write('   APPLE_CLIENT_ID=your.apple.service.identifier')
                self.stdout.write('   APPLE_PRIVATE_KEY=your-apple-private-key')
                self.stdout.write('   APPLE_KEY_ID=your-apple-key-id')
                self.stdout.write('   APPLE_TEAM_ID=your-apple-team-id')
            elif provider == 'linkedin_oauth2':
                self.stdout.write('   LINKEDIN_OAUTH2_CLIENT_ID=your-linkedin-client-id')
                self.stdout.write('   LINKEDIN_OAUTH2_CLIENT_SECRET=your-linkedin-client-secret')
        
        self.stdout.write('\n' + '='*50)