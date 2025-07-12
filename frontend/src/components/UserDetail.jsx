import React from 'react';

const WHATSAPP_NUMBER = '919999999999'; // Replace with your fixed WhatsApp number
const WHATSAPP_MESSAGE = encodeURIComponent('Hello! I would like to get in touch with CareVego Care for support and guidance.');
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function UserDetail() {
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Welcome to CareVego!</h2>
      <p className="mb-4">We're glad to have you here. Please watch the videos below to learn how to use our service.</p>
      <div className="mb-6">
        <iframe
          width="100%"
          height="315"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="How to Use CareVego"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white px-6 py-3 rounded text-lg font-semibold hover:bg-green-600"
      >
        Contact CareVego on WhatsApp
      </a>
    </div>
  );
} 