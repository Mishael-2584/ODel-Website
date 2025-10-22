// Script to add UEAB calendar events via API
const events = [
  {
    title: 'Faculty and Senior Staff Pre-registration Session',
    startDate: '2025-08-25T08:00',
    description: 'Faculty and Senior Staff Pre-registration Session',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'New Students Report and begin registration',
    startDate: '2025-08-27T08:00',
    description: 'New Students Report and begin registration',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Deadline to apply for Supplementary and Special Exams',
    startDate: '2025-08-28T08:00',
    description: 'Last day to apply for Supplementary and Special Exams',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Continuing Students ONLINE REGISTRATION',
    startDate: '2025-08-21T08:00',
    endDate: '2025-09-02T17:00',
    description: 'Continuing Students can register online',
    eventType: 'webinar',
    isPublished: true
  },
  {
    title: 'New students Orientation',
    startDate: '2025-09-01T08:00',
    endDate: '2025-09-02T17:00',
    description: 'New students Orientation',
    eventType: 'workshop',
    isPublished: true
  },
  {
    title: 'Supplementary and Special Exams',
    startDate: '2025-09-01T08:00',
    endDate: '2025-09-02T17:00',
    description: 'Supplementary and Special Exams',
    eventType: 'other',
    isPublished: true
  },
  {
    title: 'Classes Begin',
    startDate: '2025-09-03T08:00',
    description: 'Classes Begin for 1st Semester',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Last Day to Change from Audit to Credit',
    startDate: '2025-09-08T17:00',
    description: 'Last Day to Change from Audit to Credit',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Last Day to Add or Drop a Course (online)',
    startDate: '2025-09-08T17:00',
    description: 'Last Day to Add or Drop a Course online without Entry on Permanent Academic Record',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Late Registration Fee in Effect',
    startDate: '2025-09-08T08:00',
    endDate: '2025-09-15T17:00',
    description: 'Late Registration Fee is in Effect',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Research Conference',
    startDate: '2025-09-10T08:00',
    endDate: '2025-09-12T17:00',
    description: 'University Research Conference',
    eventType: 'conference',
    isPublished: true
  },
  {
    title: 'Heritage Week',
    startDate: '2025-09-14T08:00',
    endDate: '2025-09-20T17:00',
    description: 'Heritage Week celebrations',
    eventType: 'other',
    isPublished: true
  },
  {
    title: 'Last Day to Enter Class',
    startDate: '2025-09-15T17:00',
    description: 'Last Day to Enter Class',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Vice Chancellor\'s Address',
    startDate: '2025-09-16T10:00',
    description: 'Vice Chancellor\'s Address to the university',
    eventType: 'lecture',
    isPublished: true
  },
  {
    title: 'Innovation & Entrepreneurship Week',
    startDate: '2025-09-28T08:00',
    endDate: '2025-10-03T17:00',
    description: 'Innovation & Entrepreneurship Week',
    eventType: 'workshop',
    isPublished: true
  },
  {
    title: 'Deadline for submitting 2026 Graduation Application',
    startDate: '2025-10-03T17:00',
    description: 'Deadline for submitting 2026 Graduation Application',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Week of Spiritual Emphasis',
    startDate: '2025-10-04T08:00',
    endDate: '2025-10-11T17:00',
    description: 'Week of Spiritual Emphasis',
    eventType: 'other',
    isPublished: true
  },
  {
    title: 'Last day to Submit Exams to the Examination Office',
    startDate: '2025-10-06T17:00',
    description: 'Last day to Submit Exams to the Examination Office',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Huduma Day Holiday',
    startDate: '2025-10-10T08:00',
    endDate: '2025-10-10T17:00',
    description: 'Huduma Day Public Holiday',
    eventType: 'holiday',
    isPublished: true
  },
  {
    title: 'Last Day to Drop a Class with a "W"',
    startDate: '2025-10-17T17:00',
    description: 'Last Day to Drop a Class with a "W"',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Mashujaa Day Holiday',
    startDate: '2025-10-20T08:00',
    endDate: '2025-10-20T17:00',
    description: 'Mashujaa Day Public Holiday',
    eventType: 'holiday',
    isPublished: true
  },
  {
    title: 'Peer Review Evaluations due',
    startDate: '2025-11-07T17:00',
    description: 'Peer Review Evaluations due',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Students\' Evaluations due',
    startDate: '2025-11-14T17:00',
    description: 'Students\' Evaluations due',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'End of Semester Senate',
    startDate: '2025-11-17T10:00',
    description: 'End of Semester Senate meeting',
    eventType: 'other',
    isPublished: true
  },
  {
    title: 'Trimester Exams for Nursing Students',
    startDate: '2025-11-24T08:00',
    endDate: '2025-11-28T17:00',
    description: 'Trimester Exams for Nursing Students',
    eventType: 'other',
    isPublished: true
  },
  {
    title: 'Centralized Marking for Nursing Students',
    startDate: '2025-11-25T08:00',
    endDate: '2025-12-17T17:00',
    description: 'Centralized Marking for Nursing Students',
    eventType: 'other',
    isPublished: true
  },
  {
    title: 'Semester Examinations',
    startDate: '2025-12-01T08:00',
    endDate: '2025-12-11T17:00',
    description: 'Semester Examinations',
    eventType: 'other',
    isPublished: true
  },
  {
    title: 'Centralized Marking',
    startDate: '2025-12-02T08:00',
    endDate: '2025-12-16T17:00',
    description: 'Centralized Marking for Semester Exams',
    eventType: 'other',
    isPublished: true
  },
  {
    title: 'Jamhuri Day',
    startDate: '2025-12-12T08:00',
    endDate: '2025-12-12T17:00',
    description: 'Jamhuri Day Public Holiday',
    eventType: 'holiday',
    isPublished: true
  },
  {
    title: 'Grades Due',
    startDate: '2025-12-18T17:00',
    description: 'Grades Due',
    eventType: 'deadline',
    isPublished: true
  },
  {
    title: 'Senate to approve Grades',
    startDate: '2025-12-22T10:00',
    description: 'Senate to approve Grades',
    eventType: 'other',
    isPublished: true
  },
  {
    title: 'Christmas Break',
    startDate: '2025-12-23T08:00',
    endDate: '2026-01-07T17:00',
    description: 'Christmas Break',
    eventType: 'holiday',
    isPublished: true
  }
];

async function addEvents() {
  console.log(`Adding ${events.length} events...`);
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    try {
      const formData = new FormData();
      formData.append('title', event.title);
      formData.append('description', event.description);
      formData.append('content', event.description);
      formData.append('startDate', event.startDate);
      formData.append('endDate', event.endDate || event.startDate);
      formData.append('location', 'UEAB Eldoret Campus');
      formData.append('eventType', event.eventType);
      formData.append('isPublished', 'true');

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        body: formData,
        headers: {
          'x-admin-id': 'admin-user-id'
        }
      });

      if (response.ok) {
        console.log(`✓ Created event ${i + 1}/${events.length}: ${event.title}`);
      } else {
        const error = await response.json();
        console.error(`✗ Failed event ${i + 1}: ${event.title}`, error);
      }
    } catch (err) {
      console.error(`✗ Error adding event ${i + 1}: ${event.title}`, err);
    }
  }
  
  console.log('Done adding events!');
}

// Run if executed directly
if (typeof window === 'undefined') {
  addEvents();
}
