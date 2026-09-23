import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Youtube } from "lucide-react";
import ContactForm from "@/components/ContactForm";

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavbarWrapper />

      {/* Hero */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-gray-950" />
        <div className="relative max-w-[1400px] mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-4">
            Get In Touch
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6">
            <span className="text-red-500">Contact</span> Us
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Have a news tip, feedback, or inquiry?
            Our team is available to assist you.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Sidebar info */}
          <div className="space-y-6">
            {/* Contact info */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-red-50 dark:bg-red-950/30 rounded-lg flex-shrink-0">
                    <MapPin size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Address</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Kabale, Uganda
                    </p>
                  </div>
                </div>
                {/* Phone display commented out */}
                {/* <div className="flex items-start gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-red-50 dark:bg-red-950/30 rounded-lg flex-shrink-0">
                    <Phone size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Phone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">+256 700 000 000</p>
                  </div>
                </div> */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-red-50 dark:bg-red-950/30 rounded-lg flex-shrink-0">
                    <Mail size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{process.env.NEXT_PUBLIC_EMAIL || 'info@pulseofkigezi.com'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-red-50 dark:bg-red-950/30 rounded-lg flex-shrink-0">
                    <Clock size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Hours</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mon – Fri: 8:00 AM – 6:00 PM
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Breaking news: 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">
                Follow Us
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://www.facebook.com/profile.php?id=61590570837905" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
                  <Facebook size={16} /> Facebook
                </a>
                <a href="https://twitter.com/PulseofKigezi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Twitter
                </a>
                <a href="https://tiktok.com/@pulseofkigezi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <TikTokIcon size={16} /> TikTok
                </a>
                <a href="https://youtube.com/@PulseofKigezi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
                  <Youtube size={16} /> YouTube
                </a>
                <a href={process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL || "https://whatsapp.com/channel/0029VbC5UBvJ3juyNbna6L26"} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 dark:bg-green-950/30 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Channel
                </a>
              </div>
            </div>

            {/* Advertise CTA */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white">
              <h3 className="text-lg font-black mb-2">Advertise With Us</h3>
              <p className="text-sm text-red-100 leading-relaxed mb-4">
                Reach over thousands of monthly readers across..
                Contact our advertising team for rates and packages.
              </p>
              <div className="flex justify-center">
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_ADS_EMAIL || 'ads@pulseofkigezi.com'}`}
                  className="inline-block px-5 py-2.5 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 text-sm font-bold rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  {process.env.NEXT_PUBLIC_ADS_EMAIL || 'ads@pulseofkigezi.com'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterWrapper />
    </div>
  );
}
