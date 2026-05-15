"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Mail, FileText, Send, ChevronDown, ChevronUp } from "lucide-react";

const FAQS = [
  { question: "How do I book fuel?", answer: "You can book fuel by navigating to the 'Book Fuel' section, selecting a nearby station, entering your vehicle and fuel details, and generating a QR code for payment at the station." },
  { question: "Can I cancel a booking?", answer: "Yes, you can cancel a pending or confirmed booking from the 'Bookings' page before you visit the station. The amount will not be deducted." },
  { question: "How do I use my reward points?", answer: "Reward points can be redeemed during the booking process or converted to wallet balance on the 'Rewards' page." },
  { question: "What happens if the QR code expires?", answer: "QR codes typically do not expire immediately, but if a booking slot is missed, the booking may be automatically cancelled. You can easily rebook from your dashboard." },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to backend
    alert("Support ticket submitted successfully! Our team will get back to you soon.");
    setTicketSubject("");
    setTicketMessage("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
        <p className="text-gray-500 text-sm">We're here to help you with any issues or queries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Options */}
        <div className="space-y-6 lg:col-span-1">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Call Us 24/7</p>
                  <p className="font-bold text-gray-900">+91 1800-FUEL-FLUX</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Email Support</p>
                  <p className="font-bold text-gray-900">support@fuelflux.in</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Live Chat</p>
                  <button className="text-orange-500 font-bold hover:underline text-left">Start a conversation</button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ticket Form */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Raise a Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="input-base" 
                  placeholder="E.g., Payment failed" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                <textarea 
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="input-base min-h-[120px] resize-none" 
                  placeholder="Describe your issue..." 
                />
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Submit Ticket
              </button>
            </form>
          </motion.div>
        </div>

        {/* FAQs */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 h-full">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <FileText className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h3>
            </div>
            
            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    {openFaq === idx ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 bg-white border-t border-gray-200 text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 bg-orange-50 rounded-xl p-6 text-center border border-orange-100">
              <h4 className="font-bold text-gray-900 mb-2">Still need help?</h4>
              <p className="text-sm text-gray-600 mb-4">Our support team is available around the clock to assist you.</p>
              <button className="btn-primary">Visit Help Center</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
