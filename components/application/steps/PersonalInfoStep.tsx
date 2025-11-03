'use client'

interface PersonalInfoStepProps {
  formData: any
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onNext: () => void
}

export default function PersonalInfoStep({ formData, errors, onInputChange, onNext }: PersonalInfoStepProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Surname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.surname ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Middle Name</label>
          <input
            type="text"
            name="middle_name"
            value={formData.middle_name}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.gender ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Place of Birth</label>
          <input
            type="text"
            name="place_of_birth"
            value={formData.place_of_birth}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="City, Country"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Country of Citizenship</label>
          <input
            type="text"
            name="country_of_citizenship"
            value={formData.country_of_citizenship}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Country of Residence</label>
          <input
            type="text"
            name="country_of_residence"
            value={formData.country_of_residence}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ID/Passport Number</label>
          <input
            type="text"
            name="id_passport_number"
            value={formData.id_passport_number}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Marital Status</label>
          <select
            name="marital_status"
            value={formData.marital_status}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.phone_number ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Present Mailing Address</label>
          <textarea
            name="postal_address"
            value={formData.postal_address}
            onChange={onInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Current mailing address"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Mailing Address</label>
          <textarea
            name="physical_address"
            value={formData.physical_address}
            onChange={onInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Permanent home address"
          />
        </div>

        {/* Family Information */}
        <div className="md:col-span-2 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Are you coming with family?</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="coming_with_family"
                  value="false"
                  checked={!formData.coming_with_family}
                  onChange={(e) => onInputChange({ target: { name: 'coming_with_family', value: false } } as any)}
                  className="w-4 h-4"
                />
                <span>No</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="coming_with_family"
                  value="true"
                  checked={formData.coming_with_family}
                  onChange={(e) => onInputChange({ target: { name: 'coming_with_family', value: true } } as any)}
                  className="w-4 h-4"
                />
                <span>Yes</span>
              </label>
            </div>
          </div>

          {formData.coming_with_family && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Children</label>
              <input
                type="number"
                name="number_of_children"
                value={formData.number_of_children}
                onChange={onInputChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>

        {/* Visa Information for Non-Kenyans */}
        {formData.country_of_residence !== 'Kenya' && formData.country_of_citizenship !== 'Kenyan' && (
          <div className="md:col-span-2 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visa Information</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Visa</label>
              <div className="flex gap-6 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="visa_type"
                    value="Student Visa"
                    checked={formData.visa_type === 'Student Visa'}
                    onChange={(e) => onInputChange({ target: { name: 'visa_type', value: 'Student Visa' } } as any)}
                    className="w-4 h-4"
                  />
                  <span>Student Visa</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="visa_type"
                    value="Other"
                    checked={formData.visa_type === 'Other'}
                    onChange={(e) => onInputChange({ target: { name: 'visa_type', value: 'Other' } } as any)}
                    className="w-4 h-4"
                  />
                  <span>Other</span>
                </label>
              </div>
              {formData.visa_type === 'Other' && (
                <input
                  type="text"
                  name="visa_type"
                  value={formData.visa_type}
                  onChange={onInputChange}
                  placeholder="Specify visa type"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year of Entry to Kenya</label>
              <input
                type="number"
                name="year_of_entry_to_kenya"
                value={formData.year_of_entry_to_kenya}
                onChange={onInputChange}
                min="1950"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        {/* Religious Information */}
        <div className="md:col-span-2 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Religious Information</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Religious Affiliation</label>
            <div className="flex gap-6 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="religious_affiliation"
                  value="SDA"
                  checked={formData.religious_affiliation === 'SDA'}
                  onChange={(e) => onInputChange({ target: { name: 'religious_affiliation', value: 'SDA' } } as any)}
                  className="w-4 h-4"
                />
                <span>SDA</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="religious_affiliation"
                  value="Other"
                  checked={formData.religious_affiliation === 'Other'}
                  onChange={(e) => onInputChange({ target: { name: 'religious_affiliation', value: 'Other' } } as any)}
                  className="w-4 h-4"
                />
                <span>Other</span>
              </label>
            </div>
            {formData.religious_affiliation === 'Other' && (
              <input
                type="text"
                name="religious_affiliation"
                value={formData.religious_affiliation}
                onChange={onInputChange}
                placeholder="Specify religious affiliation"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Church Name</label>
              <input
                type="text"
                name="church_name"
                value={formData.church_name}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Name of church"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Church Address</label>
              <textarea
                name="church_address"
                value={formData.church_address}
                onChange={onInputChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Church location"
              />
            </div>
          </div>
        </div>

        {/* Physical Handicap Information */}
        <div className="md:col-span-2 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Information</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Do you have any physical handicaps?</label>
            <div className="flex gap-6 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="has_physical_handicap"
                  value="false"
                  checked={!formData.has_physical_handicap}
                  onChange={(e) => onInputChange({ target: { name: 'has_physical_handicap', value: false } } as any)}
                  className="w-4 h-4"
                />
                <span>No</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="has_physical_handicap"
                  value="true"
                  checked={formData.has_physical_handicap}
                  onChange={(e) => onInputChange({ target: { name: 'has_physical_handicap', value: true } } as any)}
                  className="w-4 h-4"
                />
                <span>Yes</span>
              </label>
            </div>
            {formData.has_physical_handicap && (
              <textarea
                name="physical_handicap_details"
                value={formData.physical_handicap_details}
                onChange={onInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Please explain"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={onNext}
          className="btn-primary"
        >
          Next: Program Information
        </button>
      </div>
    </div>
  )
}

