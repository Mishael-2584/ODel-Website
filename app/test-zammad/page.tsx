'use client'

import { useState } from 'react'
import { FaRobot, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'

export default function ZammadTestPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/test-zammad')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to connect to test endpoint',
        message: 'Network error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <FaRobot className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Zammad Integration Test
            </h1>
            <p className="text-gray-600">
              Test your Zammad helpdesk integration with the UEAB ODeL chatbot
            </p>
          </div>

          <div className="text-center mb-8">
            <button
              onClick={runTest}
              disabled={isLoading}
              className="btn-primary inline-flex items-center px-6 py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Testing Integration...
                </>
              ) : (
                <>
                  <FaRobot className="mr-2" />
                  Test Zammad Integration
                </>
              )}
            </button>
          </div>

          {testResult && (
            <div className={`rounded-xl p-6 border-2 ${
              testResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  testResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {testResult.success ? (
                    <FaCheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <FaTimesCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-2 ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.success ? '✅ Integration Successful!' : '❌ Integration Failed'}
                  </h3>
                  
                  <p className={`mb-4 ${
                    testResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {testResult.message}
                  </p>

                  {testResult.success && testResult.testTicketId && (
                    <div className="bg-green-100 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-green-800 mb-2">Test Ticket Created:</h4>
                      <p className="text-green-700">Ticket ID: <code className="bg-green-200 px-2 py-1 rounded">{testResult.testTicketId}</code></p>
                      <p className="text-sm text-green-600 mt-2">
                        You can check this ticket in your Zammad admin panel
                      </p>
                    </div>
                  )}

                  {testResult.error && (
                    <div className="bg-red-100 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">Error Details:</h4>
                      <p className="text-red-700">{testResult.error}</p>
                    </div>
                  )}

                  <div className="bg-gray-100 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Configuration Status:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Base URL:</span>
                        <p className="text-gray-600">{testResult.config?.baseUrl || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="font-medium">API Token:</span>
                        <p className="text-gray-600">{testResult.config?.hasApiToken ? '✅ Set' : '❌ Missing'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Group ID:</span>
                        <p className="text-gray-600">{testResult.config?.groupId || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Priority ID:</span>
                        <p className="text-gray-600">{testResult.config?.priorityId || 'Not set'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Test completed at: {new Date(testResult.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Next Steps:</h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">1.</span>
                <span>If the test is successful, your chatbot is ready to create tickets in Zammad</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">2.</span>
                <span>Visit your website and test the chatbot by asking questions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">3.</span>
                <span>Check your Zammad admin panel to see tickets created by the chatbot</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">4.</span>
                <span>Customize chatbot responses in the Chatbot component</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
