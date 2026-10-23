export interface GeoFaqItem {
  question: string;
  answer: string;
}

export const DEFAULT_GEO_FAQS: GeoFaqItem[] = [
  {
    question: "What is MenusQR?",
    answer: "MenusQR is a digital QR menu and table ordering platform for restaurants, cafés, hotels, and food businesses. It allows restaurant owners to create mobile-optimized menus accessible instantly via table QR codes."
  },
  {
    question: "How does a QR menu work?",
    answer: "Restaurant guests scan a physical QR code stand on their table using their smartphone camera. The camera immediately opens the restaurant's live digital menu without requiring any app download or user sign-up."
  },
  {
    question: "Does the QR code change after menu edits?",
    answer: "No. MenusQR uses permanent table QR codes. When you edit dishes, update prices, or change menu items in your dashboard, the changes update immediately on the existing table QR code."
  },
  {
    question: "Can restaurant owners update prices?",
    answer: "Yes. Restaurant owners can log into their MenusQR dashboard at any time to update item prices, toggle dish availability, add seasonal specials, or adjust item descriptions instantly."
  },
  {
    question: "What happens when a subscription expires?",
    answer: "When a subscription expires, menu management and online ordering features pause until renewal. Your account data remains preserved so service resumes seamlessly upon renewal."
  },
  {
    question: "Which plan supports ordering?",
    answer: "Direct customer table ordering is included in the Premium plan (₹1,119/month or ₹6,799/year). It enables customers to add items to a cart, submit orders directly from their table, and notify the restaurant reception instantly."
  },
  {
    question: "Can customers order from the QR menu?",
    answer: "Yes, on restaurants using the MenusQR Premium plan, customers can select dishes, specify item customizations, and place orders directly from their phone screen."
  },
  {
    question: "How does restaurant reception receive orders?",
    answer: "Orders placed by table guests arrive immediately in the restaurant's MenusQR live order dashboard with audible alerts and table identification for kitchen preparation and billing."
  },
  {
    question: "How many menu changes are included?",
    answer: "Unlimited menu changes are included in all MenusQR plans. You can update your menu as many times as you like without incurring additional fees or reprinting QR codes."
  },
  {
    question: "Does the restaurant need to reprint the QR?",
    answer: "No. You print your table QR codes once. Because MenusQR maps the physical QR code to your dynamic digital menu, you never need to reprint table stickers or acrylic stands when changing items or prices."
  },
  {
    question: "Can restaurants show Half and Full prices or different portion sizes?",
    answer: "Yes. MenusQR fully supports explicit Half and Full pricing as well as custom portion tags (e.g. Half: 6 pcs / Full: 10 pcs). Guests see separate, transparent prices for each size across all 15 menu templates."
  },
  {
    question: "Is Google Reviews integration available?",
    answer: "Yes. An optional Google Reviews add-on (₹499/year) allows you to display a direct 'Write a Google Review' link button on your live QR menu. (Direct link button CTA; does not sync live star ratings or reviews)."
  }
];

interface GeoFaqSectionProps {
  faqs?: GeoFaqItem[];
  title?: string;
}

export default function GeoFaqSection({ faqs = DEFAULT_GEO_FAQS, title = "Frequently Asked Questions & Essential Knowledge" }: GeoFaqSectionProps) {
  return (
    <section className="my-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#151c19] mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-[#FAF9F5] p-5 rounded-2xl border border-gray-200/60">
            <h3 className="text-base font-bold text-[#151c19] mb-2">{faq.question}</h3>
            <p className="text-sm text-[#53615a] leading-relaxed font-medium">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
