# Admin Panel User Guide - UEAB ODeL

## 🎯 Overview
The admin panel allows you to manage News and Events for the UEAB ODeL platform. All content created here appears on the public website.

---

## 📅 Events Management

### How to Edit Events

#### Step 1: Access the Admin Panel
1. Navigate to `/admin/login`
2. Log in with your admin credentials
3. Click on **"Events Calendar"** tab

#### Step 2: Find the Event to Edit
- Scroll through the list of events
- Each event shows:
  - Title
  - Start date
  - Location
  - Event type badge
  - Featured image (if available)

#### Step 3: Click Edit Button
- Each event has two buttons on the right:
  - **Blue Edit Button** (pencil icon) - Click to edit
  - **Red Delete Button** (trash icon) - Click to delete

#### Step 4: Update Event Details
When you click the Edit button, the form opens with:
- **Event Title** - The name of the event
- **Start Date/Time** - When the event begins
- **End Date/Time** - When the event ends (optional)
- **Event Type** - Choose from:
  - Webinar
  - Workshop
  - Lecture
  - Conference
  - Deadline
  - Holiday
  - Other
- **Location** - Where the event takes place
- **Description** - Short summary (required)
- **Full Content** - Detailed information (optional)
- **Max Attendees** - Capacity limit (optional)
- **Event Banner** - Upload an image for the event
- **Publish** - Check to make the event visible on the website

#### Step 5: Save Changes
- Review all fields
- Click **"Update Event"** button
- The form will save and close
- You'll see the event list refresh with updated details

---

## 📰 News Management

Similar to events, you can:
1. Click on the **"News Management"** tab
2. Click **"New Article"** to create news
3. Click the **Edit button** (pencil icon) on any article
4. Click the **Delete button** (trash icon) to remove an article

### News Fields
- **Title** - Article headline
- **Slug** - URL-friendly identifier (auto-generated)
- **Description** - Short summary
- **Content** - Full article text
- **Featured Image** - Header image
- **Author** - Who wrote it
- **Publish** - Make visible on website

---

## ✅ Tips & Best Practices

### For Events
1. **Always set a start date** - Events without dates won't appear
2. **Use clear titles** - "Annual Graduation Ceremony 2025" is better than "Event"
3. **Add an image** - Events with images look better on the calendar
4. **Set correct event type** - Helps users filter by category
5. **Provide location** - Students need to know where events happen
6. **Publish when ready** - Uncheck "Publish" to keep drafts

### For News
1. **Write engaging summaries** - The description shows in listings
2. **Add featured images** - Makes articles stand out
3. **Use proper formatting** - Break up long text into paragraphs
4. **Publish important news** - Unchecked items don't appear publicly

---

## 🔍 Where Your Content Appears

### Events
- **Homepage** → "Upcoming Events" section (latest 4 events)
- **Dedicated Page** → `/events` calendar view (all events)
- **Admin Dashboard** → Events List (for management)

### News
- **Homepage** → "Latest News & Updates" section
- **Dedicated Page** → `/news` news listing page
- **Admin Dashboard** → News List (for management)

---

## ⚠️ Important Notes

### Event Visibility
- Events must have `is_published: true` to appear
- Events show if `start_date >= today (00:00:00)`
- Past events don't appear in the public calendar
- Draft events (unpublished) are hidden from public view

### Date/Time Formats
- Use the date picker for consistent formatting
- Dates are stored as ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
- Times are in 24-hour format

### Images
- Recommended size: 1200x600px (16:9 aspect ratio)
- Max file size: No limit (but keep under 10MB for performance)
- Formats: JPG, PNG, WebP

### Deletions
- **Cannot be undone** - Deleted events are permanent
- Always confirm deletion
- Check the article before deleting

---

## 🚀 Quick Start

### Creating an Event (30 seconds)
1. Go to `/admin/dashboard`
2. Click **"Events Calendar"** tab
3. Click **"New Event"** button
4. Fill in:
   - Title
   - Date/Time
   - Location
   - Event Type
   - Description
5. Check "Publish immediately"
6. Click **"Create Event"**
7. ✅ Event appears on the website!

### Editing an Event (15 seconds)
1. Find the event in the list
2. Click the **Edit** (pencil) button
3. Make your changes
4. Click **"Update Event"**
5. ✅ Done!

---

## 📞 Support

If you encounter any issues:
1. Check that all required fields are filled
2. Ensure you're logged in as admin
3. Verify the event date is set correctly
4. Clear your browser cache and refresh
5. Try a different browser if problems persist

---

## ✨ Features Summary

### Available Actions
- ✅ Create new events
- ✅ Edit existing events
- ✅ Delete events
- ✅ Upload event images
- ✅ Set event details (date, location, type)
- ✅ Publish/unpublish events
- ✅ Same features for news articles

### What's Automated
- ✅ Image optimization
- ✅ URL slug generation
- ✅ Timestamps (created/updated)
- ✅ Published date tracking
- ✅ Row-level security

---

**Built with ❤️ for UEAB ODeL**
