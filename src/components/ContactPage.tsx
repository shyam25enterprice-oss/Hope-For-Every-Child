import {CheckCircle2, Mail, MapPin} from 'lucide-react';
import {type FormEvent, useState} from 'react';
import type {SiteContent} from '../types';

interface ContactPageProps {
  siteContent: SiteContent;
}

export function ContactPage({siteContent}: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim() || 'General Inquiry',
          message: message.trim(),
        }),
      });
      const json = (await res.json()) as {ok?: boolean; error?: string};
      if (!res.ok) {
        throw new Error(json.error || 'Failed to send message.');
      }
      setSent(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold text-sky-700 mb-2">Contact Us</p>
              <h1
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900"
                style={{textWrap: 'balance'}}
              >
                Reach out to our care &amp; donor support team
              </h1>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Have questions about a donation receipt, in-kind supplies, institutional
                partnerships, or volunteering? Write to us directly.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Email</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{siteContent.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Office Address</p>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">
                    {siteContent.officeAddress}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-900 mb-2.5">Official Social Channels</p>
                <div className="flex flex-wrap gap-3 text-xs font-semibold text-sky-700">
                  <a
                    href={siteContent.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    Instagram
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={siteContent.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    Facebook
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={siteContent.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    X / Twitter
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={siteContent.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            {sent ? (
              <div className="py-8 space-y-4">
                <div className="inline-flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Message Sent</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  We have received your message
                </h2>
                <p className="text-sm text-slate-600">
                  Our team will review your inquiry and reply to {email}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setName('');
                    setEmail('');
                    setPhone('');
                    setSubject('');
                    setMessage('');
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-display text-xl font-bold text-slate-900">Send a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ct-name" className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      id="ct-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="ct-email" className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="ct-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ct-subject" className="block text-xs font-medium text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    id="ct-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Receipt query, Partnership, etc."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label htmlFor="ct-msg" className="block text-xs font-medium text-slate-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="ct-msg"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
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
                  className="w-full py-3 px-6 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
                >
                  {submitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
