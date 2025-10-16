# 🎓 Moodle API Integration Guide for UEAB ODeL

## 📋 **Overview**

This guide explains how to integrate your Moodle LMS with the UEAB ODeL website to provide real-time course data, intelligent search, and enhanced chatbot capabilities.

## 🔧 **What's Been Implemented**

### ✅ **Moodle Service (`lib/moodle.ts`)**
- Complete Moodle API wrapper
- Course search and filtering
- Category management
- User enrollment tracking
- Course statistics
- Real-time data synchronization

### ✅ **API Endpoints (`app/api/moodle/route.ts`)**
- `GET /api/moodle?action=courses` - Get all courses
- `GET /api/moodle?action=search&search=term` - Search courses
- `GET /api/moodle?action=categories` - Get categories
- `GET /api/moodle?action=statistics` - Get course statistics
- `GET /api/moodle?action=course-details&courseId=123` - Get specific course
- `GET /api/moodle?action=course-enrollments&courseId=123` - Get enrollments

### ✅ **Enhanced Chatbot**
- Intelligent course search
- Real-time Moodle data integration
- Context-aware responses
- Course statistics and recommendations

## 🚀 **Setup Instructions**

### 1. **Moodle Web Service Setup**

#### Enable Web Services in Moodle:
1. Go to **Site Administration > Advanced features**
2. Enable **Web services**
3. Go to **Site Administration > Server > Web services**
4. Enable **REST protocol**

#### Create External Service:
1. Go to **Site Administration > Server > Web services > External services**
2. Click **Add**
3. Name: `UEAB ODeL Integration`
4. Short name: `ueab_odel_integration`
5. Enable the service

#### Add Functions to Service:
Add these functions to your service:
- `core_course_get_courses`
- `core_course_get_categories`
- `core_enrol_get_enrolled_users`
- `core_enrol_get_users_courses`

#### Create API Token:
1. Go to **Site Administration > Server > Web services > Manage tokens**
2. Click **Create token**
3. User: Select admin user
4. Service: Select `UEAB ODeL Integration`
5. Copy the generated token

### 2. **Environment Variables**

Add to your `.env` file:
```env
# Moodle Configuration
NEXT_PUBLIC_MOODLE_URL=https://your-moodle-instance.com
MOODLE_API_TOKEN=your-generated-api-token-here
```

### 3. **Test the Integration**

Test the API endpoints:
```bash
# Get course statistics
curl "http://localhost:3001/api/moodle?action=statistics"

# Search courses
curl "http://localhost:3001/api/moodle?action=search&search=business"

# Get all courses
curl "http://localhost:3001/api/moodle?action=courses"
```

## 🎯 **Enhanced Chatbot Features**

### **Intelligent Course Search**
Users can now ask:
- "Search for business courses"
- "Find nursing programs"
- "Show me agriculture courses"

### **Course Statistics**
Users can ask:
- "How many courses do you have?"
- "Show me course statistics"
- "What programs are available?"

### **Context-Aware Responses**
The chatbot now:
- Recognizes course names and provides details
- Searches Moodle database in real-time
- Provides enrollment numbers and course descriptions
- Offers relevant quick actions

## 📊 **Available Data**

### **Course Information**
- Course name and description
- School/category
- Enrollment numbers
- Course format and duration
- Start/end dates
- Course visibility status

### **Category Information**
- School names and descriptions
- Course counts per school
- Category hierarchy
- Sorting and organization

### **Statistics**
- Total courses available
- Total student enrollments
- Courses per school
- Recent course additions

## 🔍 **Usage Examples**

### **Chatbot Interactions**

**User:** "I'm interested in business programs"
**Bot:** "I found 3 courses matching 'business':
1. **Bachelor of Business Administration**
   School: School of Business and Technology
   Students: 450
   Comprehensive business education with specialization...

2. **Master of Business Administration**
   School: School of Business and Technology
   Students: 180
   Advanced MBA with specializations..."

**User:** "How many courses do you have?"
**Bot:** "📊 **Current Course Statistics:**
📚 Total Courses: 12
👥 Total Enrollments: 2,150

**Schools & Programs:**
• School of Business and Technology: 3 programs
• School of Education, Arts and Humanities: 3 programs
• School of Health Sciences: 2 programs..."

### **API Usage**

```javascript
// Search courses
const response = await fetch('/api/moodle?action=search&search=nursing')
const courses = await response.json()

// Get course details
const courseDetails = await fetch('/api/moodle?action=course-details&courseId=123')
const course = await courseDetails.json()

// Get statistics
const stats = await fetch('/api/moodle?action=statistics')
const statistics = await stats.json()
```

## 🛠 **Customization Options**

### **Course Display Format**
Modify the `searchMoodleCourses` function in `components/Chatbot.tsx` to customize how course information is displayed.

### **Search Filters**
Add additional filters in the Moodle service:
- By enrollment count
- By start date
- By course format
- By visibility status

### **Enhanced Statistics**
Add more detailed statistics:
- Enrollment trends
- Popular courses
- Course completion rates
- Student demographics

## 🔒 **Security Considerations**

1. **API Token Security**
   - Store tokens securely in environment variables
   - Rotate tokens regularly
   - Use read-only tokens when possible

2. **Rate Limiting**
   - Implement rate limiting for API calls
   - Cache frequently accessed data
   - Use pagination for large datasets

3. **Data Privacy**
   - Only expose necessary course information
   - Respect student privacy settings
   - Follow GDPR/Data Protection guidelines

## 📈 **Performance Optimization**

### **Caching Strategy**
```javascript
// Cache course data for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000
const courseCache = new Map()

// Use cached data if available
if (courseCache.has(searchTerm) && 
    Date.now() - courseCache.get(searchTerm).timestamp < CACHE_DURATION) {
  return courseCache.get(searchTerm).data
}
```

### **Pagination**
```javascript
// Implement pagination for large datasets
const courses = await moodleService.getCourses({
  limit: 10,
  offset: page * 10
})
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **API Connection Failed**
   - Check Moodle URL and API token
   - Verify web services are enabled
   - Check firewall settings

2. **No Courses Returned**
   - Verify course visibility settings
   - Check user permissions
   - Ensure courses are published

3. **Slow Response Times**
   - Implement caching
   - Use pagination
   - Optimize database queries

### **Debug Mode**
Enable debug logging:
```javascript
console.log('Moodle API Request:', params)
console.log('Moodle API Response:', result)
```

## 🎉 **Benefits**

### **For Students**
- Real-time course information
- Intelligent search capabilities
- Instant answers to course questions
- Up-to-date enrollment numbers

### **For Administrators**
- Automated course data synchronization
- Reduced support tickets
- Better user engagement
- Real-time analytics

### **For Support Team**
- Enhanced chatbot capabilities
- Context-aware responses
- Reduced manual queries
- Improved user satisfaction

## 📞 **Support**

For technical support with Moodle integration:
- Check the Moodle documentation
- Review API endpoint responses
- Test with curl commands
- Contact the development team

---

**Your Moodle-integrated UEAB ODeL platform is now ready to provide intelligent, real-time course information to your users!** 🚀
