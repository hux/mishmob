# Skills Assessment Wizard - Quick Start Guide

## 🚀 Getting Started

The skills assessment wizard is now fully implemented and ready to test!

## Backend Setup

### 1. Start the Backend Server

```bash
cd backend
python manage.py runserver 8080
```

The wizard API will be available at `http://localhost:8080/api/skills-assessment/`

### 2. Verify API Endpoints

Test the endpoints:

```bash
# Get interest areas
curl http://localhost:8080/api/skills-assessment/interest-areas

# Get common skills
curl http://localhost:8080/api/skills-assessment/common-skills

# Get skill suggestions (requires interests)
curl -X POST http://localhost:8080/api/skills-assessment/suggest-skills \
  -H "Content-Type: application/json" \
  -d '{"interest_ids": ["education", "technology"]}'
```

## Frontend Setup

### 1. Install Dependencies

Framer Motion has already been installed:

```bash
cd frontend
# Dependencies are already installed
npm run dev
```

### 2. Access the Wizard

Navigate to: **http://localhost:8081/skills-assessment**

(You must be logged in to access this protected route)

## Testing the Flow

### Complete Flow Test (< 2 minutes)

1. **Step 1: Welcome** (15s)
   - Select one or more motivations
   - Click "Continue"

2. **Step 2: Interests** (20s)
   - Tap 2-3 interest area cards
   - Watch related skills preview
   - Click "Continue"

3. **Step 3: Quick Wins** (25s)
   - Tap common skills to select/deselect
   - Try searching for custom skills
   - Add 3-5 skills
   - Click "Continue"

4. **Step 4: Experience** (30s)
   - For each suggested skill, tap an emoji proficiency level:
     - 🌱 Learning
     - 💪 Can Do
     - ⭐ Strong
     - 🏆 Expert
   - Navigate between categories
   - Click "Continue"

5. **Step 5: Review** (10s)
   - Review all added skills
   - Edit proficiency levels if needed
   - Remove any unwanted skills
   - Add additional skills via search
   - Click "Complete Profile"

### Expected Behavior

After completion:
- Success toast notification: "🎉 Profile Complete!"
- Automatic redirect to dashboard
- Skills visible in profile
- Match scores updated on opportunities

## Integration Examples

### 1. Add to Registration Flow

In `frontend/src/pages/Register.tsx`:

```tsx
const handleRegister = async (data) => {
  // ... registration logic ...

  if (response.ok) {
    // Redirect to skills assessment
    navigate('/skills-assessment?source=onboarding');
  }
};
```

### 2. Dashboard Prompt

In `frontend/src/pages/Dashboard.tsx`:

```tsx
import { useQuery } from '@tanstack/react-query';
import { skillsApi } from '@/services/api';

function Dashboard() {
  const { data: mySkills } = useQuery({
    queryKey: ['mySkills'],
    queryFn: () => skillsApi.getMySkills(),
  });

  return (
    <>
      {mySkills && mySkills.length < 5 && (
        <Alert>
          <AlertTitle>Complete Your Profile</AlertTitle>
          <AlertDescription>
            Add more skills to get better opportunity matches.
            <Link to="/skills-assessment" className="underline ml-2">
              Take 2-minute assessment →
            </Link>
          </AlertDescription>
        </Alert>
      )}
      {/* rest of dashboard */}
    </>
  );
}
```

### 3. Navigation Link

In `frontend/src/components/Navigation.tsx`:

```tsx
<NavigationMenuItem>
  <Link to="/skills-assessment">
    <NavigationMenuLink>
      <Sparkles className="mr-2 h-4 w-4" />
      Skills Assessment
    </NavigationMenuLink>
  </Link>
</NavigationMenuItem>
```

## Customization

### Adjust Time Estimates

In `frontend/src/components/SkillsAssessmentWizard.tsx`:

```tsx
const STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Welcome',
    estimatedSeconds: 15,  // Adjust here
    // ...
  },
  // ...
];
```

### Modify Interest Areas

In `backend/api/routers/skills_assessment.py`:

```python
INTEREST_AREAS = {
    'your_new_area': {
        'id': 'your_new_area',
        'name': 'Your New Area',
        'icon': '🎯',
        'description': 'Description here',
        'related_skills': ['Skill 1', 'Skill 2']
    },
    # ...
}
```

### Change Proficiency Levels

In both:
- `backend/users/models.py` (UserSkill.PROFICIENCY_CHOICES)
- `frontend/src/components/wizard-steps/ExperienceStep.tsx` (PROFICIENCY_LEVELS)

## Troubleshooting

### Issue: API endpoints return 404

**Solution**: Make sure the skills_assessment router is registered in `backend/api/urls.py`:

```python
from api.routers import skills_assessment

def setup_api_routes(api: NinjaAPI):
    # ...
    api.add_router("/skills-assessment", skills_assessment.router)
```

### Issue: Framer Motion animations not working

**Solution**: Check that framer-motion is installed:

```bash
cd frontend
npm list framer-motion
# Should show: framer-motion@12.x.x
```

### Issue: Interest areas not loading

**Solution**: Check backend logs for errors. Run migrations if needed:

```bash
cd backend
python manage.py migrate
```

### Issue: Skills not saving

**Solution**: Verify JWT authentication is working. Check browser console for 401 errors.

## Next Steps

1. **Test on Mobile**: Open `http://localhost:8081/skills-assessment` on mobile device
2. **Add Analytics**: Track completion rates and common drop-off points
3. **A/B Test**: Try different copy/emoji to optimize engagement
4. **Integrate Resume Parser**: Connect LinkedIn/resume parsing to pre-fill skills
5. **Add Skill Verification**: Let organizations verify volunteer skills

## API Documentation

Full interactive API docs available at:
**http://localhost:8080/api/docs**

Look for the "Skills Assessment" section.

## Feature Flags (Future)

To enable/disable the wizard:

```python
# backend/mishmob/settings.py
FEATURES = {
    'skills_assessment_wizard': True,  # Toggle here
}
```

```tsx
// frontend/src/config.ts
export const FEATURES = {
  skillsAssessmentWizard: true,  // Toggle here
};
```

## Performance Benchmarks

Target metrics:
- **Load Time**: < 500ms
- **Step Transition**: < 300ms
- **API Response**: < 200ms
- **Complete Flow**: < 120 seconds
- **Mobile Score**: > 90 (Lighthouse)

## Feedback & Iteration

After testing, consider:
1. Are users completing all 5 steps?
2. Where do they drop off?
3. How many skills do they add on average?
4. Do match scores improve after completion?
5. Are users satisfied with suggestions?

## Support

- **Documentation**: `/docs/SKILLS_ASSESSMENT_WIZARD.md`
- **Backend Code**: `/backend/api/routers/skills_assessment.py`
- **Frontend Code**: `/frontend/src/components/SkillsAssessmentWizard.tsx`
- **Step Components**: `/frontend/src/components/wizard-steps/`

---

**Ready to launch!** 🚀

Access the wizard at: http://localhost:8081/skills-assessment
