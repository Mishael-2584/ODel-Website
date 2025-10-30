'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaCookie, FaShieldAlt, FaTimes, FaCog } from 'react-icons/fa'

interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true
    functional: false,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after 1 second
      setTimeout(() => setShowBanner(true), 1000)
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent)
        setPreferences(saved)
      } catch (e) {
        console.error('Error loading cookie preferences:', e)
      }
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setPreferences(prefs)
    setShowBanner(false)
    setShowCustomize(false)
    
    // Apply preferences (you can add actual cookie management logic here)
    if (prefs.analytics) {
      // Enable analytics
      console.log('Analytics enabled')
    }
    if (prefs.marketing) {
      // Enable marketing
      console.log('Marketing enabled')
    }
  }

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true
    }
    setPreferences(allAccepted)
    setShowCustomize(true) // Show what they're accepting - they must click Save to confirm
  }

  const acceptSome = () => {
    const someAccepted = {
      essential: true,
      functional: true,
      analytics: false,
      marketing: false
    }
    setPreferences(someAccepted)
    setShowCustomize(true) // Show what they're accepting - they can modify before saving
  }

  const rejectAll = () => {
    const allRejected = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    }
    setPreferences(allRejected)
    setShowCustomize(true) // Show what they're rejecting - they can modify before saving
  }

  const saveCustom = () => {
    savePreferences(preferences)
  }

  if (!showBanner) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" />

      {/* Main Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
        <div className="bg-white shadow-2xl border-t-4 border-primary-600">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {!showCustomize ? (
              // Simple View
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Icon and Message */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                    <FaCookie className="text-3xl text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <FaShieldAlt className="text-primary-600" />
                      Your data is your property and we support your right to privacy and transparency.
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      To provide you the best experience on our website, we use cookies or similar technologies. 
                      Select a data access level to decide for which purposes we may use and share your data. 
                      You can change your preferences at any time.{' '}
                      <Link href="/privacy-policy" className="text-primary-600 hover:underline font-semibold">
                        Learn more
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={rejectAll}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-semibold text-sm whitespace-nowrap"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={acceptSome}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors font-semibold text-sm whitespace-nowrap"
                  >
                    Accept Some
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-6 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors font-semibold text-sm whitespace-nowrap"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              // Customize View
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaCog className="text-primary-600" />
                    Customize Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
                
                {/* Instruction */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Click on any category</strong> to toggle it on or off. Review your selections below and click "Save my preferences" when ready.
                  </p>
                </div>

                {/* Cookie Categories */}
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {/* Essential */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.essential 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                          Essential Cookies 
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Always Active</span>
                        </h4>
                        <p className="text-sm text-gray-600">
                          Highest level of privacy. Data accessed for necessary basic operations only. 
                          Data shared with 3rd parties to ensure the site is secure and works on your device.
                        </p>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Functional */}
                  <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    preferences.functional 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'bg-white border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setPreferences({ ...preferences, functional: !preferences.functional })}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                          Functional Cookies
                          {preferences.functional && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">✓ Enabled</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Remember your preferences and settings to enhance your experience (e.g., language, theme, login status).
                        </p>
                      </div>
                      <div className="ml-4">
                        <div className={`w-12 h-6 rounded-full flex items-center transition-all ${
                          preferences.functional ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
                        } px-1`}>
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    preferences.analytics 
                      ? 'bg-purple-50 border-purple-500' 
                      : 'bg-white border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                          Analytics Cookies
                          {preferences.analytics && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">✓ Enabled</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Help us understand how visitors use our platform to improve functionality and user experience. 
                          Data is anonymized.
                        </p>
                      </div>
                      <div className="ml-4">
                        <div className={`w-12 h-6 rounded-full flex items-center transition-all ${
                          preferences.analytics ? 'bg-purple-500 justify-end' : 'bg-gray-300 justify-start'
                        } px-1`}>
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marketing */}
                  <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    preferences.marketing 
                      ? 'bg-orange-50 border-orange-500' 
                      : 'bg-white border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                          Marketing Cookies
                          {preferences.marketing && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">✓ Enabled</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Track your activity to deliver relevant advertisements and promotional content. 
                          Used only with your explicit consent.
                        </p>
                      </div>
                      <div className="ml-4">
                        <div className={`w-12 h-6 rounded-full flex items-center transition-all ${
                          preferences.marketing ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'
                        } px-1`}>
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Your Selection Summary:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      ✓ Essential (Required)
                    </span>
                    {preferences.functional && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        ✓ Functional
                      </span>
                    )}
                    {preferences.analytics && (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        ✓ Analytics
                      </span>
                    )}
                    {preferences.marketing && (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                        ✓ Marketing
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    onClick={saveCustom}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors font-semibold"
                  >
                    Save my preferences
                  </button>
                  <Link
                    href="/privacy-policy"
                    className="flex-1 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-full hover:bg-primary-50 transition-colors font-semibold text-center"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            )}

            {/* Customize Link (Simple View Only) */}
            {!showCustomize && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowCustomize(true)}
                  className="text-primary-600 hover:underline text-sm font-semibold flex items-center gap-2 mx-auto"
                >
                  <FaCog /> Customize
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </>
  )
}
