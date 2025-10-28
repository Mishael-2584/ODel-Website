'use client'

import { FaBlenderPhone, FaSync, FaUsers, FaBook, FaVideo, FaComments } from 'react-icons/fa'

export default function BlendedLearningSection() {
  const features = [
    {
      icon: FaVideo,
      title: 'Online & Offline Mix',
      description: 'Combine flexible online learning with in-person campus sessions for optimal engagement.'
    },
    {
      icon: FaSync,
      title: 'Seamless Integration',
      description: 'Synchronized content across digital platforms and physical classrooms for continuity.'
    },
    {
      icon: FaUsers,
      title: 'Peer Collaboration',
      description: 'Connect with classmates both virtually and in-person for richer learning experiences.'
    },
    {
      icon: FaBook,
      title: 'Self-Paced Progress',
      description: 'Learn at your own speed with 24/7 access to course materials and recorded sessions.'
    },
    {
      icon: FaComments,
      title: 'Instructor Support',
      description: 'Get guidance from faculty through live sessions, forums, and one-on-one consultations.'
    },
    {
      icon: FaBlenderPhone,
      title: 'Flexible Scheduling',
      description: 'Attend campus sessions on your schedule or participate remotely for maximum flexibility.'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-primary-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4">
            <span className="text-sm font-semibold">🎓 Blended Learning</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Best of Both Worlds
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our blended learning approach combines the flexibility of online education with the personal touch of traditional classroom instruction. Learn whenever, wherever, and however works best for you.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 hover:border-primary-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <p className="text-gray-600 font-medium">Online Access</p>
              <p className="text-sm text-gray-500 mt-1">24/7 availability to course content</p>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <div className="text-4xl font-bold text-primary-600 mb-2">In-Person</div>
              <p className="text-gray-600 font-medium">Campus Sessions</p>
              <p className="text-sm text-gray-500 mt-1">Regular face-to-face interactions</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">Your Way</div>
              <p className="text-gray-600 font-medium">Choose Your Path</p>
              <p className="text-sm text-gray-500 mt-1">Customize your learning experience</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Ready to experience education that adapts to your lifestyle? Join thousands of students already learning with UEAB ODeL's innovative blended learning model.
          </p>
          <button className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
            Explore Our Programs
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
