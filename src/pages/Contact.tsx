import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Gift, Briefcase, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { submitContactForm } from '@/services/api'; 
import { toast } from 'sonner';

import heroImage from '@/assets/hero-living-room.jpg'; 

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: '',
    quantity: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setFormData({ ...formData, type: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Send data to the Django Backend
      await submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        issue_type: formData.type || 'Bulk Inquiry',
        message: `Est. Quantity: ${formData.quantity || 'N/A'}\n\nMessage: ${formData.message}`
      });

      // 2. Success Feedback
      toast.success("Thank you! Your inquiry has been sent to our team.");

      // 3. Reset form
      setFormData({ name: '', phone: '', email: '', type: '', quantity: '', message: '' });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("We couldn't send your request. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="flex flex-col lg:flex-row min-h-[850px]">
        
        {/* Left Side: Visual & Context */}
        <div className="w-full lg:w-5/12 relative bg-primary overflow-hidden order-1 lg:order-1">
          <img 
            src={heroImage} 
            alt="Gifting" 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent-earth/90 mix-blend-multiply" />
          
          <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-16 text-white">
            <div>
                <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight">
                  Gifting, <br/>
                  <span className="text-accent-gold">Reimagined.</span>
                </h1>
                <p className="text-lg text-white/90 mb-8 leading-relaxed">
                  Whether it's for your innovative team or a heartfelt wedding celebration, give the gift of growth.
                </p>

                <div className="grid grid-cols-1 gap-6 mt-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                            <Briefcase className="h-6 w-6 text-accent-gold" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Corporate</h3>
                            <p className="text-xs text-white/70">Employee Kits, Client Gifts & Desk Plants</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                            <Gift className="h-6 w-6 text-accent-gold" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Events & Weddings</h3>
                            <p className="text-xs text-white/70">Return Gifts, Favors & Decor</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                            <Users className="h-6 w-6 text-accent-gold" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Bulk Orders</h3>
                            <p className="text-xs text-white/70">Wholesale & Large Scale Projects</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-12 border-t border-white/20 mt-12">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-accent-gold" />
                <span>+91 99154 73575</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-accent-gold" />
                <span>info.rastlina@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-accent-gold" />
                <span>Lake View Towers, Hyderabad</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="w-full lg:w-7/12 bg-white flex items-center justify-center p-8 lg:p-20 order-2 lg:order-2">
          <div className="w-full max-w-xl">
            <div className="mb-10">
                <span className="text-primary font-bold tracking-wider uppercase text-xs mb-2 block">Bulk & Corporate</span>
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900">Let's grow together</h2>
                <p className="text-gray-500 mt-2 text-sm">Tell us about your requirements, and we'll curate the perfect green solution for you.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border-b-2 border-gray-200 py-2 px-1 focus:outline-none focus:border-primary transition-colors bg-transparent placeholder-gray-300"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Phone Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="phone" 
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border-b-2 border-gray-200 py-2 px-1 focus:outline-none focus:border-primary transition-colors bg-transparent placeholder-gray-300"
                      placeholder="+91 98765 43210"
                    />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email Address <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      name="email" 
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border-b-2 border-gray-200 py-2 px-1 focus:outline-none focus:border-primary transition-colors bg-transparent placeholder-gray-300"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Est. Quantity</label>
                    <input 
                      type="text" 
                      name="quantity" 
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full border-b-2 border-gray-200 py-2 px-1 focus:outline-none focus:border-primary transition-colors bg-transparent placeholder-gray-300"
                      placeholder="e.g. 50 pcs"
                    />
                  </div>
              </div>

              <div className="group relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">What are you looking for? <span className="text-red-500">*</span></label>
                <Select onValueChange={handleTypeChange} required>
                  <SelectTrigger className="w-full border-b-2 border-gray-200 rounded-none border-x-0 border-t-0 px-1 py-2 h-auto focus:ring-0 focus:border-primary text-base text-left font-normal bg-transparent">
                    <SelectValue placeholder="Select Inquiry Type" />
                  </SelectTrigger>
                  
                  <SelectContent className="bg-white border border-gray-200 shadow-xl z-50">
                    <SelectItem value="Corporate Gifting" className="cursor-pointer hover:bg-gray-50 py-2">
                        Corporate Gifting (Employees/Clients)
                    </SelectItem>
                    <SelectItem value="Wedding/Event" className="cursor-pointer hover:bg-gray-50 py-2">
                        Wedding / Event Return Gifts
                    </SelectItem>
                    <SelectItem value="Bulk/Wholesale" className="cursor-pointer hover:bg-gray-50 py-2">
                        Bulk / Wholesale Purchase
                    </SelectItem>
                    <SelectItem value="Other" className="cursor-pointer hover:bg-gray-50 py-2">
                        Other / General Inquiry
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Message / Customization Needs</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border-b-2 border-gray-200 py-2 px-1 focus:outline-none focus:border-primary transition-colors bg-transparent placeholder-gray-300 resize-none"
                  placeholder="Tell us more about your event, preferred plants, or branding requirements..."
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white h-12 px-8 text-base font-bold tracking-wide rounded-lg shadow-lg mt-4 flex items-center justify-center transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Inquiry...
                  </>
                ) : (
                  <>
                    Submit Inquiry <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-[10px] text-gray-400 mt-4 text-center md:text-left">
                We respect your privacy. Your details are safe with us.
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}