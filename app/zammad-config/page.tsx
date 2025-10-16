'use client'

import { useState, useEffect } from 'react'
import { FaCog, FaCheckCircle, FaTimesCircle, FaSpinner, FaCopy } from 'react-icons/fa'

interface ZammadConfig {
  groups: Array<{ id: number; name: string; active: boolean; email: string }>
  priorities: Array<{ id: number; name: string; active: boolean }>
  states: Array<{ id: number; name: string; active: boolean }>
  recommendations: {
    suggestedGroupId: number
    suggestedPriorityId: number
    suggestedStateId: number
  }
}

export default function ZammadConfigPage() {
  const [config, setConfig] = useState<ZammadConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/zammad-config')
      const result = await response.json()

      if (result.success) {
        setConfig(result)
      } else {
        setError(result.message || 'Failed to fetch configuration')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FaCog className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Zammad Configuration Checker
            </h1>
            <p className="text-gray-600">
              Find the correct Group ID, Priority ID, and State ID for your Zammad instance
            </p>
          </div>

          <div className="text-center mb-8">
            <button
              onClick={fetchConfig}
              disabled={isLoading}
              className="btn-primary inline-flex items-center px-6 py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Fetching Configuration...
                </>
              ) : (
                <>
                  <FaCog className="mr-2" />
                  Refresh Configuration
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <FaTimesCircle className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {config && (
            <div className="space-y-8">
              {/* Recommendations */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-green-800 mb-4">📋 Recommended Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Group ID</h3>
                    <div className="flex items-center space-x-2">
                      <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {config.recommendations.suggestedGroupId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(config.recommendations.suggestedGroupId.toString())}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaCopy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Priority ID</h3>
                    <div className="flex items-center space-x-2">
                      <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {config.recommendations.suggestedPriorityId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(config.recommendations.suggestedPriorityId.toString())}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaCopy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">State ID</h3>
                    <div className="flex items-center space-x-2">
                      <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {config.recommendations.suggestedStateId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(config.recommendations.suggestedStateId.toString())}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaCopy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Update your .env file:</h3>
                  <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                    <div>ZAMMAD_GROUP_ID={config.recommendations.suggestedGroupId}</div>
                    <div>ZAMMAD_PRIORITY_ID={config.recommendations.suggestedPriorityId}</div>
                  </div>
                </div>
              </div>

              {/* Groups */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">📁 Available Groups</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.groups.map((group) => (
                      <div key={group.id} className={`p-3 rounded-lg border ${
                        group.active ? 'bg-white border-green-200' : 'bg-gray-100 border-gray-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800">{group.name}</h3>
                            <p className="text-sm text-gray-600">ID: {group.id}</p>
                            {group.email && (
                              <p className="text-xs text-gray-500">{group.email}</p>
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            group.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {group.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Priorities */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">⚡ Available Priorities</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.priorities.map((priority) => (
                      <div key={priority.id} className={`p-3 rounded-lg border ${
                        priority.active ? 'bg-white border-green-200' : 'bg-gray-100 border-gray-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800">{priority.name}</h3>
                            <p className="text-sm text-gray-600">ID: {priority.id}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            priority.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {priority.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* States */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Available States</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.states.map((state) => (
                      <div key={state.id} className={`p-3 rounded-lg border ${
                        state.active ? 'bg-white border-green-200' : 'bg-gray-100 border-gray-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800">{state.name}</h3>
                            <p className="text-sm text-gray-600">ID: {state.id}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            state.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {state.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
