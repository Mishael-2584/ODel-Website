import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FaGraduationCap, FaGlobe, FaAward, FaUsers, FaLightbulb, FaHeart } from 'react-icons/fa'

export default function AboutPage() {
  const values = [
    {
      icon: FaLightbulb,
      title: 'Innovation',
      description: 'We embrace cutting-edge technology to deliver world-class online education.'
    },
    {
      icon: FaAward,
      title: 'Excellence',
      description: 'We maintain the highest standards in academic quality and student support.'
    },
    {
      icon: FaHeart,
      title: 'Integrity',
      description: 'We uphold Christian values and ethical practices in all our operations.'
    },
    {
      icon: FaUsers,
      title: 'Community',
      description: 'We foster a supportive learning environment that connects students globally.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About UEAB ODel</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Transforming lives through accessible, quality education powered by innovation and guided by faith
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-500">
              <div className="flex items-center mb-4">
                <div className="bg-primary-500 p-3 rounded-lg mr-4">
                  <FaGraduationCap className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To provide accessible, affordable, and quality education through innovative online learning 
                platforms, empowering students worldwide to achieve their academic and professional goals 
                while upholding Christian values and excellence.
              </p>
            </div>

            <div className="card bg-gradient-to-br from-gold-50 to-gold-100 border-l-4 border-gold-500">
              <div className="flex items-center mb-4">
                <div className="bg-gold-500 p-3 rounded-lg mr-4">
                  <FaGlobe className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To be the leading online learning institution in Africa, recognized globally for academic 
                excellence, innovation in digital education, and producing graduates who are competent, 
                ethical, and committed to serving humanity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card text-center hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Our Story</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  The University of Eastern Africa, Baraton (UEAB) was established in 1978 as a 
                  Seventh-day Adventist institution of higher learning. Located in Eldoret, Kenya, 
                  UEAB has grown to become one of the most respected universities in East Africa.
                </p>
                <p>
                  UEAB ODel (Open Distance and eLearning) was launched to extend the university's 
                  reach beyond physical boundaries, making quality education accessible to students 
                  across Africa and beyond. Our online platform combines cutting-edge technology 
                  with proven pedagogical methods to deliver an exceptional learning experience.
                </p>
                <p>
                  Today, we serve over 10,000 online students from more than 50 countries, offering 
                  programs across business, education, healthcare, science, and technology. Our 
                  commitment to excellence and innovation continues to drive us forward.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="card bg-primary-500 text-white text-center">
                <div className="text-4xl font-bold mb-2">1978</div>
                <div className="text-sm">Founded</div>
              </div>
              <div className="card bg-gold-500 text-white text-center">
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-sm">Students</div>
              </div>
              <div className="card bg-green-500 text-white text-center">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-sm">Courses</div>
              </div>
              <div className="card bg-purple-500 text-white text-center">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-sm">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accreditation */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Accreditation & Recognition</h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            UEAB is fully accredited by the Commission for University Education (CUE) in Kenya 
            and recognized internationally. Our programs meet the highest academic standards.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="font-bold text-gray-900">Commission for University Education (CUE)</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="font-bold text-gray-900">Inter-University Council for East Africa</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="font-bold text-gray-900">Adventist Accrediting Association</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

