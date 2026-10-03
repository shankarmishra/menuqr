import {  useState  } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      setStatus('Message sent successfully!');
    } catch {
      setStatus('Failed to send message.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <input name="name" type="text" placeholder="Name" required className="w-full bg-[#151c19] border border-white/10 rounded-lg p-3 text-white focus:border-[#e8783c] outline-none" />
      <input name="email" type="email" placeholder="Email" required className="w-full bg-[#151c19] border border-white/10 rounded-lg p-3 text-white focus:border-[#e8783c] outline-none" />
      <textarea name="message" placeholder="Message" required rows={4} className="w-full bg-[#151c19] border border-white/10 rounded-lg p-3 text-white focus:border-[#e8783c] outline-none"></textarea>
      <button type="submit" className="w-full bg-[#e8783c] text-white py-3 rounded-lg font-medium hover:bg-[#ffc928] hover:text-[#151c19] transition-colors">Send Message</button>
      {status && <div className="text-[#34b56a] text-center mt-4">{status}</div>}
    </form>
  );
}