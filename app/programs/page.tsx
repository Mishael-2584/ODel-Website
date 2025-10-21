import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProgramsCatalog from '@/components/ProgramsCatalog'

export const metadata = {
  title: 'Programs Catalog | UEAB ODeL',
  description: 'Browse all academic programs offered by the University of Eastern Africa Baraton'
}

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <ProgramsCatalog />
      </main>
      <Footer />
    </div>
  )
}
