# Quick Start: Testing Module 1 - Smart Program Discovery

## 🚀 Getting Started (2 minutes)

### Prerequisites
- Node.js running (`npm run dev` should be active)
- Next.js development server running on `localhost:3000`
- Moodle API configured (already done)

---

## ✅ Testing Steps

### Step 1: Navigate to Courses Page
1. Open browser and go to `http://localhost:3000/courses`
2. You should see the new **"Real-Time Program Overview"** section
3. Located after the hero section and before the search bar

### Step 2: Wait for Data to Load
1. Look for a **loading spinner** with "Loading programs..." message
2. Give it 1-2 seconds to fetch data from Moodle
3. Should see program cards appear in a grid

### Step 3: Verify Display
✅ Check these elements appear:
- [ ] Section heading: "UEAB ODeL Programs"
- [ ] Subtitle: "Explore our X academic programs across all schools"
- [ ] Grid of program cards (1 col on mobile, 2 on tablet, 3 on desktop)
- [ ] Each card shows:
  - [ ] Category name
  - [ ] Number of programs (📚 icon)
  - [ ] Number of students (👥 icon)
  - [ ] "Explore Programs →" button
- [ ] CTA section at bottom: "Ready to Start Your Journey?"

### Step 4: Test Responsiveness
✅ Test on different screen sizes:
- [ ] **Mobile** (< 640px): 1 column grid
- [ ] **Tablet** (640px - 1024px): 2 column grid
- [ ] **Desktop** (> 1024px): 3 column grid

### Step 5: Test Hover Effects
✅ Hover over a program card:
- [ ] Card shadow increases
- [ ] Card scales up slightly
- [ ] Title text color changes to primary blue
- [ ] Button color deepens

### Step 6: Check Browser Console
✅ Open DevTools (F12):
- [ ] **Console tab**: No red errors
- [ ] Should see fetch calls starting
- [ ] No warnings about missing props

### Step 7: Test Error Handling (Optional)
To test error state:
1. Open DevTools Network tab
2. Set to "Offline" mode
3. Refresh the page
4. Should see error message: "Failed to load programs. Please try again later."
5. "Try Again" button should be clickable
6. Click it to restore data (turn network back on first)

---

## 📊 Expected Output

### Desktop View (3 columns)
```
┌────────────────────────────────────────────────────┐
│ ✨ Live Program Listings                           │
│ Real-Time Program Overview                         │
│ Browse all available programs...                   │
├────────────────────────────────────────────────────┤
│
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ │ Business     │  │ Health       │  │ Education    │
│ │ 📚 24        │  │ 📚 18        │  │ 📚 16        │
│ │ 👥 3,456     │  │ 👥 2,890     │  │ 👥 2,145     │
│ │ [Explore →]  │  │ [Explore →]  │  │ [Explore →]  │
│ └──────────────┘  └──────────────┘  └──────────────┘
│
└────────────────────────────────────────────────────┘
```

### Expected Data
Program cards should show real data from your Moodle:
- Business programs with enrollment numbers
- Science & Technology programs
- Education & Humanities programs
- Health Sciences programs
- Agriculture programs
- (Any other categories in your Moodle)

---

## 🐛 Troubleshooting

### Issue: "Loading programs..." spinner never disappears

**Solution:**
1. Open DevTools → Network tab
2. Check if requests to `/api/moodle?action=categories` and `/api/moodle?action=courses` complete
3. Check for errors in responses
4. If getting 500 errors, the Next.js dev server may need restart

**Action:**
```bash
# Stop the server (Ctrl+C)
# Restart it
npm run dev
```

### Issue: Shows error message: "Failed to load programs"

**Solution:**
1. Check if Moodle is accessible: `https://ielearning.ueab.ac.ke/`
2. Check if `.env` variables are set correctly:
   - `NEXT_PUBLIC_MOODLE_URL=https://ielearning.ueab.ac.ke/`
   - `MOODLE_API_TOKEN=b81f3639eb484fda3d4679960c91fbfa`
3. Click "Try Again" button to retry

### Issue: Cards are displayed but no enrollment numbers

**Solution:**
1. This might mean courses don't have `enrolledusercount` set
2. Check the browser console for any warnings
3. This is normal if courses have no enrollments yet

### Issue: Only showing 1-2 categories instead of all

**Solution:**
1. This is normal - only categories with courses are shown
2. Empty categories are filtered out automatically
3. Verify in Moodle that categories have courses assigned

---

## ✨ Expected Performance

| Metric | Target | Status |
|--------|--------|--------|
| First Load | < 3 seconds | ⏱️ Check |
| Re-render | < 500ms | ⏱️ Check |
| Mobile Responsive | Pass all sizes | ✅ Check |
| No Console Errors | 0 errors | ✅ Check |

---

## 🎯 Quick Validation Checklist

Before considering Module 1 complete, verify:

```
[ ] Programs display in grid format
[ ] Data loads from Moodle API
[ ] Categories show enrollment numbers
[ ] Responsive on mobile/tablet/desktop
[ ] Hover effects work
[ ] No console errors
[ ] Error handling works (test offline)
[ ] Matches expected appearance
[ ] Performance acceptable (< 2 seconds)
[ ] All cards visible and readable
```

---

## 📝 Logging/Debugging

To see detailed logs, check browser console for:

```javascript
// Successful flow:
"Fetching program data from Moodle..."
"Successfully loaded X categories"
"Successfully loaded Y courses"
"Processed Z programs"

// Error flow:
"Error fetching program data: [error message]"
```

---

## 🎉 Success!

If all checks pass, Module 1 is working correctly! 

### Next Actions:
1. Deploy to production (optional)
2. Start Module 2: Student Dashboard
3. Or test more thoroughly in different browsers

---

## 📞 Need Help?

If something doesn't work:
1. Check the browser console (F12)
2. Check the terminal running `npm run dev`
3. Verify `.env` file has correct Moodle credentials
4. Try restarting the development server
5. Clear browser cache (Ctrl+Shift+Delete)

**All tests passing?** Ready to move on! 🚀
