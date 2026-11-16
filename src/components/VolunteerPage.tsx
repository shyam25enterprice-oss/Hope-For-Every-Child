import {CheckCircle2, Users} from 'lucide-react';
import {type FormEvent, useState} from 'react';
import type {VolunteerRecord} from '../types';

export function VolunteerPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [interestArea, setInterestArea] = useState('Teaching & Homework Mentorship');
  const [availability, setAvailability] = useState('Weekends');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registered, setRegistered] = useState<VolunteerRecord | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          interestArea,
          availability,
          message: message.trim(),
        }),
      });
      const json = (await res.json()) as {volunteer?: VolunteerRecord; error?: string};
      if (!res.ok || !json.volunteer) {
        throw new Error(json.error || 'Could not submit volunteer registration.');
      }
      setRegistered(json.volunteer);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold text-sky-700 mb-2">Join Our Volunteer Community</p>
              <h1
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900"
                style={{textWrap: 'balance'}}
              >
                Give your time, skills, and encouragement
              </h1>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Volunteers help tutor children, organize book &amp; meal drives, coordinate health
                camps, and strengthen transparent community outreach.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-sky-700 font-display text-sm font-bold">
                <Users className="w-5 h-5" />
                <span>How Volunteers Help</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <strong className="text-slate-900">01. Teaching &amp; Mentorship:</strong> Help
                  children with reading, mathematics, science, and art activities.
                </li>
                <li>
                  <strong className="text-slate-900">02. Nutrition &amp; Supply Drives:</strong>{' '}
                  Coordinate clean meal distribution, uniform kits, and winter clothing.
                </li>
                <li>
                  <strong className="text-slate-900">03. Medical &amp; Wellness Camps:</strong>{' '}
                  Support pediatric checkups, hygiene workshops, and vision screenings.
                </li>
              </ul>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                All in-person volunteers complete identity verification and agree to our Child
                Safeguarding Policy prior to center visits.
              </p>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            {registered ? (
              <div className="py-6 space-y-4">
                <div className="inline-flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Volunteer Application Received</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  Thank you for stepping forward, {registered.name}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your application has been recorded for our volunteer coordinator to review. Please
                  save your reference code below.
                </p>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm space-y-1.5">
                  <p>
                    Reference Code:{' '}
                    <span className="font-mono font-semibold text-slate-900">
                      {registered.referenceCode}
                    </span>
                  </p>
                  <p className="text-slate-600">
                    City: {registered.city} · Area: {registered.interestArea}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRegistered(null);
                    setName('');
                    setEmail('');
                    setPhone('');
                    setCity('');
                    setMessage('');
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl cursor-pointer"
                >
                  Register Another Volunteer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    Volunteer Registration Form
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    All fields marked * are required.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vol-name" className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      id="vol-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="vol-city" className="block text-xs font-medium text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      id="vol-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Jaipur, Pune, Delhi"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vol-email" className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="vol-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="vol-phone" className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="vol-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vol-area" className="block text-xs font-medium text-slate-700 mb-1">
                      Preferred Area of Support
                    </label>
                    <select
                      id="vol-area"
                      value={interestArea}
                      onChange={(e) => setInterestArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                    >
                      <option>Teaching &amp; Homework Mentorship</option>
                      <option>Meal &amp; Nutrition Distribution</option>
                      <option>Medical Camp Assistance</option>
                      <option>Clothing &amp; Supply Drives</option>
                      <option>Community Outreach</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vol-avail" className="block text-xs font-medium text-slate-700 mb-1">
                      Availability
                    </label>
                    <select
                      id="vol-avail"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                    >
                      <option>Weekends</option>
                      <option>Weekdays</option>
                      <option>Flexible / Monthly Drives</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="vol-msg" className="block text-xs font-medium text-slate-700 mb-1">
                    Brief Note (Optional)
                  </label>
                  <textarea
                    id="vol-msg"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share any relevant skills, languages, or experience..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                {errorMsg && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
                >
                  {submitting ? 'Submitting Registration...' : 'Submit Volunteer Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
