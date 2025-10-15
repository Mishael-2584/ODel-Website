import Link from 'next/link'
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gold-500 p-2 rounded-lg">
                <FaGraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">UEAB ODeL</h3>
                <p className="text-xs text-gray-300">eLearning Platform</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              University of Eastern Africa, Baraton's premier online learning platform. 
              Empowering students with quality education accessible anywhere, anytime.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="bg-primary-700 hover:bg-gold-500 p-2 rounded-full transition-colors">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="bg-primary-700 hover:bg-gold-500 p-2 rounded-full transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                 className="bg-primary-700 hover:bg-gold-500 p-2 rounded-full transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="bg-primary-700 hover:bg-gold-500 p-2 rounded-full transition-colors">
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gold-400">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/courses" className="text-gray-300 hover:text-gold-400 transition-colors">Browse Courses</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-gold-400 transition-colors">About Us</Link></li>
              <li><Link href="/admissions" className="text-gray-300 hover:text-gold-400 transition-colors">Admissions</Link></li>
              <li><Link href="/scholarships" className="text-gray-300 hover:text-gold-400 transition-colors">Scholarships</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-gold-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Schools */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gold-400">Schools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/schools/business" className="text-gray-300 hover:text-gold-400 transition-colors">School of Business</Link></li>
              <li><Link href="/schools/education" className="text-gray-300 hover:text-gold-400 transition-colors">School of Education</Link></li>
              <li><Link href="/schools/nursing" className="text-gray-300 hover:text-gold-400 transition-colors">School of Nursing</Link></li>
              <li><Link href="/schools/science" className="text-gray-300 hover:text-gold-400 transition-colors">School of Science & Technology</Link></li>
              <li><Link href="/schools/graduate" className="text-gray-300 hover:text-gold-400 transition-colors">Graduate Studies</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gold-400">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="h-5 w-5 text-gold-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">P.O. Box 2500, 30100<br />Eldoret, Kenya</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="h-5 w-5 text-gold-400 flex-shrink-0" />
                <div className="text-gray-300">
                  <div>+254 714 333 111</div>
                  <div>+254 781 333 777</div>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="h-5 w-5 text-gold-400 flex-shrink-0" />
                <a href="mailto:info@ueab.ac.ke" className="text-gray-300 hover:text-gold-400 transition-colors">
                  info@ueab.ac.ke
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            © {currentYear} University of Eastern Africa, Baraton. All Rights Reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <Link href="/privacy" className="text-gray-300 hover:text-gold-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-300 hover:text-gold-400 transition-colors">Terms of Service</Link>
            <Link href="/accessibility" className="text-gray-300 hover:text-gold-400 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

