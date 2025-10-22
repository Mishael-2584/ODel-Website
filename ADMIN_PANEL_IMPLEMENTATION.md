# Admin Panel Implementation - News & Events Management

## Overview
A complete admin panel system for managing website content (News and Events) with a beautiful, modern UI and full CRUD functionality. Admins can create, read, update, and delete news articles and events, with images stored in Supabase Storage.

---

## Architecture

### Database Schema (Supabase)

#### `news` Table
```sql
- id (UUID): Primary key
- title (VARCHAR 255): Article title
- slug (VARCHAR 255): URL-friendly identifier
- description (TEXT): Short summary
- content (TEXT): Full article content
- featured_image_url (VARCHAR 500): Public image URL
- image_bucket_path (VARCHAR 500): Storage path for cleanup
- author_id (UUID): Admin user who created it
- created_at (TIMESTAMP): Creation timestamp
- updated_at (TIMESTAMP): Last update timestamp
- published_at (TIMESTAMP): When published
- is_published (BOOLEAN): Publication status
- status (VARCHAR 50): 'draft', 'published', or 'archived'
- view_count (INTEGER): View tracking
```

#### `events` Table
```sql
- id (UUID): Primary key
- title (VARCHAR 255): Event title
- slug (VARCHAR 255): URL-friendly identifier
- description (TEXT): Short summary
- content (TEXT): Full event description
- featured_image_url (VARCHAR 500): Banner image URL
- image_bucket_path (VARCHAR 500): Storage path
- start_date (TIMESTAMP): Event start time
- end_date (TIMESTAMP): Event end time
- location (VARCHAR 255): Event location
- event_type (VARCHAR 50): webinar, workshop, lecture, conference, deadline, holiday, other
- organizer_id (UUID): Admin user who created it
- created_at (TIMESTAMP): Creation timestamp
- updated_at (TIMESTAMP): Last update timestamp
- published_at (TIMESTAMP): When published
- is_published (BOOLEAN): Publication status
- status (VARCHAR 50): 'draft', 'published', 'archived', 'completed'
- max_attendees (INTEGER): Attendance capacity
- attendee_count (INTEGER): Current attendance
```

#### `admin_users` Table
```sql
- id (UUID): User ID reference
- email (VARCHAR 255): Admin email
- full_name (VARCHAR 255): Admin name
- role (VARCHAR 50): 'admin', 'editor', or 'viewer'
- is_active (BOOLEAN): Account status
- created_at (TIMESTAMP): Account creation
- updated_at (TIMESTAMP): Last update
```

#### `admin_activity_log` Table
```sql
- id (UUID): Log entry ID
- admin_user_id (UUID): Admin who performed action
- action (VARCHAR 100): Type of action
- entity_type (VARCHAR 50): 'news' or 'events'
- entity_id (UUID): Resource ID
- changes (JSONB): Changed fields
- created_at (TIMESTAMP): When action occurred
```

### Row Level Security (RLS)

**Public Access:**
- Users can view published news and events

**Admin Access:**
- Admins and editors can CRUD all content
- Viewers can only read content

---

## API Routes

### News API: `/api/admin/news`

#### GET
- **Query**: `?id={id}` - Get single news by ID
- **Query**: `?published=true` - Get all published news
- **Response**: Array of news objects or single object

#### POST
- **Auth**: `x-admin-id` header required
- **Body**: FormData with:
  - `title` (string, required)
  - `description` (string, required)
  - `content` (string)
  - `image` (file, optional)
  - `isPublished` (boolean)
- **Response**: Created news object

#### PUT
- **Auth**: `x-admin-id` header required
- **Body**: FormData with:
  - `id` (string, required)
  - `title`, `description`, `content` (updatable)
  - `image` (file, optional)
  - `isPublished` (boolean)
- **Response**: Updated news object

#### DELETE
- **Auth**: `x-admin-id` header required
- **Query**: `?id={id}` (required)
- **Response**: Success message

---

### Events API: `/api/admin/events`

#### GET
- **Query**: `?id={id}` - Get single event
- **Query**: `?published=true` - Get published events
- **Query**: `?upcoming=true` - Get future events only
- **Response**: Array or single event object

#### POST
- **Auth**: `x-admin-id` header required
- **Body**: FormData with:
  - `title` (string, required)
  - `description` (string, required)
  - `content` (string)
  - `startDate` (datetime, required)
  - `endDate` (datetime, optional)
  - `location` (string)
  - `eventType` (enum: webinar|workshop|lecture|conference|deadline|holiday|other)
  - `maxAttendees` (number, optional)
  - `image` (file, optional)
  - `isPublished` (boolean)
- **Response**: Created event object

#### PUT
- **Auth**: `x-admin-id` header required
- **Body**: FormData with event ID and any updatable fields
- **Response**: Updated event object

#### DELETE
- **Auth**: `x-admin-id` header required
- **Query**: `?id={id}` (required)
- **Response**: Success message

---

## Components

### Admin Dashboard: `/app/admin/dashboard/page.tsx`

**Features:**
- Sidebar navigation (collapsible)
- Tabbed interface for News and Events
- Admin info display and logout
- Authentication check on load
- Responsive design

**Styling:**
- Dark gradient theme (slate/900)
- Gold and blue accents
- Smooth transitions and hover effects

---

### NewsManager: `/components/admin/NewsManager.tsx`

**Features:**
- Display all news articles
- Create new news with form
- Edit existing articles
- Delete articles (with confirmation)
- Image upload with preview
- Publish/draft toggle
- Status indicator (eye icon for published)

**Form Fields:**
- Title (required)
- Description (required)
- Content
- Featured image (optional)
- Publish immediately (checkbox)

---

### EventsManager: `/components/admin/EventsManager.tsx`

**Features:**
- Display all events
- Create new events with form
- Edit existing events
- Delete events (with confirmation)
- Date/time picker for start and end
- Location input
- Event type selector
- Max attendees tracking
- Image upload with preview
- Publish/draft toggle

**Form Fields:**
- Title (required)
- Start date/time (required)
- End date/time (optional)
- Event type (dropdown)
- Location
- Description (required)
- Content
- Max attendees (optional)
- Featured image (optional)
- Publish immediately (checkbox)

---

## Display Components

### NewsSection: `/components/NewsSection.tsx`

**Features:**
- Displays up to 3 latest published news articles
- Beautiful card layout with images
- Shows publication date
- "Read More" links
- Auto-hides if no news published
- Loading state with spinner
- Gradient styling

**Styling:**
- Dark background (slate-900 to slate-800)
- Hover animations (scale image, color change)
- Blue accent colors

---

### EventsSection: `/components/EventsSection.tsx`

**Features:**
- Displays up to 4 upcoming published events
- Color-coded by event type
- Shows date, time, and location
- Event type badge
- Beautiful event cards with images
- Auto-hides if no events published
- Loading state with spinner

**Event Type Colors:**
- Webinar: Blue
- Workshop: Purple
- Lecture: Cyan
- Conference: Pink
- Deadline: Red
- Holiday: Green
- Other: Gray

---

## Integration with Home Page

**Location**: `/app/page.tsx`

**Placement**: Between programs section and CTA section

**Components Added**:
```jsx
<NewsSection />
<EventsSection />
```

**Behavior**:
- Automatically fetches published content
- Displays gracefully with loading states
- Hides if no content available
- Links to individual article/event pages (ready for future implementation)

---

## File Structure

```
project-root/
├── app/
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx          # Admin dashboard
│   ├── api/
│   │   └── admin/
│   │       ├── news/
│   │       │   └── route.ts      # News CRUD API
│   │       └── events/
│   │           └── route.ts      # Events CRUD API
│   └── page.tsx                  # Home page (updated)
├── components/
│   ├── admin/
│   │   ├── NewsManager.tsx       # News admin component
│   │   └── EventsManager.tsx     # Events admin component
│   ├── NewsSection.tsx           # News display component
│   ├── EventsSection.tsx         # Events display component
│   └── ...existing components
├── supabase/
│   └── migrations/
│       └── 20251022080004_admin_content_management.sql
└── ...
```

---

## Setup Instructions

### 1. Database Setup
```bash
# Run migration
npx supabase db push
```

### 2. Create Supabase Storage Buckets
```
1. Create bucket: "news-images"
   - Set public access
   - Allow uploads by authenticated users

2. Create bucket: "events-images"
   - Set public access
   - Allow uploads by authenticated users
```

### 3. Create Admin User
```sql
-- Create Supabase Auth user first, then add to admin_users table
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'USER_UUID_HERE',
  'admin@ueab.ac.ke',
  'Admin Name',
  'admin',
  true
);
```

### 4. Environment Variables
No additional env vars needed - uses existing Supabase credentials

---

## Usage Guide

### For Admins

#### Creating News
1. Navigate to `/admin/dashboard`
2. Click "New News" button
3. Fill in form:
   - Title, description, content
   - Upload featured image
   - Choose publish immediately or save as draft
4. Click "Create"

#### Creating Events
1. Navigate to `/admin/dashboard`
2. Click "Events Calendar" tab
3. Click "New Event" button
4. Fill in form:
   - Title, description, dates, location
   - Select event type
   - Upload banner image
   - Choose publish immediately or save as draft
5. Click "Create Event"

#### Managing Content
- **Edit**: Click edit button on card
- **Delete**: Click delete button (requires confirmation)
- **Publish**: Save with "Publish immediately" checked
- **Draft**: Save without publishing, edit later

### For Users

News and events automatically appear on the home page when published:
- News section shows 3 latest articles
- Events section shows 4 upcoming events

---

## Security Features

✅ **Row Level Security (RLS)**
- Public users can only view published content
- Admins/Editors can manage all content
- Viewers can only read

✅ **Image Storage**
- Images stored in Supabase Storage
- Old images deleted when updated
- Public URLs generated for display

✅ **Activity Logging**
- All admin actions tracked
- Who, what, and when recorded
- Ready for audit trail display

✅ **Authentication**
- Admin dashboard checks user role
- Header-based admin ID verification
- Protected routes (ready for middleware)

---

## Future Enhancements

**Planned Features:**
- [ ] Detailed news/events pages
- [ ] Comment system for news
- [ ] Event registration/RSVP
- [ ] Email notifications for new content
- [ ] Advanced search and filtering
- [ ] Content scheduling (publish later)
- [ ] Media gallery manager
- [ ] SEO optimization per article
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Content approval workflow
- [ ] Rich text editor (currently plaintext)

---

## Troubleshooting

### "Module not found: lucide-react"
```bash
npm install lucide-react
```

### "Module not found: uuid"
```bash
npm install uuid
```

### Images not uploading
1. Check Supabase Storage bucket permissions
2. Verify bucket names: "news-images", "events-images"
3. Check CORS settings in Supabase

### Admin dashboard not loading
1. Check authentication
2. Verify user has admin role in `admin_users` table
3. Check browser console for errors

---

## Performance Considerations

**Optimizations Implemented:**
- ✅ Lazy loading of components
- ✅ Graceful loading states with spinners
- ✅ Image optimization with preview
- ✅ Auto-hide sections when no content
- ✅ Efficient API queries with filters

**Recommendations:**
- Add pagination for large datasets
- Implement caching for frequently accessed content
- Use image optimization service for resizing
- Consider CDN for image delivery

---

## Testing

### Test News Creation
1. Go to `/admin/dashboard`
2. Create news with title, description
3. Verify it appears in news list
4. Publish and check home page

### Test Events Creation
1. Go to `/admin/dashboard`
2. Click "Events Calendar" tab
3. Create event with future date
4. Verify it appears in events list
5. Publish and check home page

### Test Image Upload
1. Upload image when creating news/event
2. Verify preview displays correctly
3. Verify image appears on home page when published

---

## Support & Maintenance

**Admin Resources:**
- Admin dashboard: `/admin/dashboard`
- Database explorer: Supabase Dashboard
- API testing: Postman/Insomnia

**Maintenance Tasks:**
- Regular backup of database
- Monitor image storage usage
- Review activity logs periodically
- Update content regularly
- Test new features in staging

---

## Version History

- **v1.0** (2025-10-22)
  - Initial release
  - News management (CRUD)
  - Events management (CRUD)
  - Admin dashboard
  - Home page integration
  - Image upload support
  - RLS security

---

## License & Credits

Developed for UEAB ODeL Platform
Built with Next.js, Supabase, and Tailwind CSS
