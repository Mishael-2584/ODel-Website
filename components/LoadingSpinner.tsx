'use client'

import { FaSpinner, FaGraduationCap, FaBook, FaLaptop } from 'react-icons/fa'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  fullScreen?: boolean
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
}

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  fullScreen = false,
  variant = 'spinner'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-white dark:bg-gray-900'
    : 'flex items-center justify-center'

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )
      case 'pulse':
        return (
          <div className="flex space-x-4">
            <FaGraduationCap className={`${sizeClasses[size]} text-primary-600 animate-pulse`} />
            <FaBook className={`${sizeClasses[size]} text-gold-500 animate-pulse`} style={{ animationDelay: '0.2s' }} />
            <FaLaptop className={`${sizeClasses[size]} text-accent-cyan animate-pulse`} style={{ animationDelay: '0.4s' }} />
          </div>
        )
      case 'skeleton':
        return (
          <div className="space-y-4 w-full max-w-md">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6"></div>
          </div>
        )
      default:
        return (
          <FaSpinner className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
        )
    }
  }

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {renderSpinner()}
        {message && (
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium animate-fade-in">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

// Card skeleton loader
export function CardSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
          <div className="mt-6 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  )
}

// Course card skeleton
export function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
