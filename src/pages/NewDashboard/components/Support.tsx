import React from "react";
import { MessageSquare, Phone, Mail, HelpCircle } from "lucide-react";

const Support: React.FC = () => {
  const handleWhatsAppSupport = () => {
    // In a real app, this would open WhatsApp with a prefilled message
    alert("Opening WhatsApp with support message");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-gray-600 mt-1">Get help with your orders and parts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Support Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">WhatsApp Support</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Chat with your dedicated account manager for immediate assistance with your orders.
          </p>
          <button
            onClick={handleWhatsAppSupport}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Contact via WhatsApp
          </button>
        </div>

        {/* Call Support Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Call Support</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Speak directly with our customer service team during business hours.
          </p>
          <a
            href="tel:+97142555555"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center"
          >
            <Phone className="h-5 w-5 mr-2" />
            +971 4 255 5555
          </a>
        </div>

        {/* Email Support Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold">Email Support</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Send us an email for non-urgent inquiries. We typically respond within 24 hours.
          </p>
          <a
            href="mailto:easycarpartsteam@gmail.com"
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md flex items-center justify-center"
          >
            <Mail className="h-5 w-5 mr-2" />
        easycarpartsteam@gmail.com

          </a>
        </div>

        {/* FAQ Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <HelpCircle className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Find quick answers to common questions about orders, delivery, and returns.
          </p>
          <button
            onClick={() => alert("Opening FAQ section")}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md flex items-center justify-center"
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            View FAQ
          </button>
        </div>
      </div>

      {/* Business Hours */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Customer Support</h3>
            <p className="text-gray-600">Sunday - Thursday: 9:00 AM - 6:00 PM</p>
            <p className="text-gray-600">Friday: 9:00 AM - 12:00 PM</p>
            <p className="text-gray-600">Saturday: Closed</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Delivery Hours</h3>
            <p className="text-gray-600">Sunday - Thursday: 10:00 AM - 8:00 PM</p>
            <p className="text-gray-600">Friday: 10:00 AM - 2:00 PM</p>
            <p className="text-gray-600">Saturday: Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support; 