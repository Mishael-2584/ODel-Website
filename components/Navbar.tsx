'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaBars, FaTimes, FaGraduationCap, FaBook, FaUser, FaHome, FaInfoCircle, FaPhone } from 'react-icons/fa'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/courses', label: 'Courses', icon: FaBook },
    { href: '/about', label: 'About', icon: FaInfoCircle },
    { href: '/contact', label: 'Contact', icon: FaPhone },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <FaGraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-600">UEAB ODel</h1>
                <p className="text-xs text-gray-500">eLearning Platform</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors group"
              >
                <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>{link.label}</span>
              </Link>
            ))}
            <Link href="/login" className="btn-outline !py-2 !px-4">
              <FaUser className="inline mr-2" />
              Login
            </Link>
            <Link href="/register" className="btn-primary !py-2 !px-4">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
            <Link
              href="/login"
              className="flex items-center space-x-3 px-3 py-3 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FaUser className="h-5 w-5" />
              <span className="font-medium">Login</span>
            </Link>
            <Link
              href="/register"
              className="block mx-3 mt-2 btn-primary text-center"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

