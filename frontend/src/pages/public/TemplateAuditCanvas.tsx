import { useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import PremiumIPhoneMockup from '../../components/marketing/PremiumIPhoneMockup';
import { menuTemplates, DEMO_RESTAURANT, isTemplateDark } from '../../data/menuTemplates';
import { DeterministicDesignEngine, type DesignCompositionStrategy } from '../../components/menu-builder/design-engine';
import { AIDesignStudio } from '../app/AIDesignStudio';
import type { DesignSpecification } from '../../components/menu-builder/design-engine/types';

export default function TemplateAuditCanvas() {
  const { templateId } = useParams<{ templateId: string }>();
  const [searchParams] = useSearchParams();

  const isCompact = searchParams.get('compact') === 'true';
  const edgeCase = searchParams.get('edge') || 'none';
  const hideNav = searchParams.get('hideNav') === 'true';
  const showStudio = searchParams.get('studio') === 'true';
  const composition = searchParams.get('composition') as DesignCompositionStrategy | null;
  const [interactiveSpec, setInteractiveSpec] = useState<DesignSpecification | null>(null);

  const currentTemplate = useMemo(() => {
    return menuTemplates.find(
      (t) => t.id === templateId || t.name.toLowerCase().replace(/\s+/g, '-') === templateId
    ) || menuTemplates[0];
  }, [templateId]);

  const customSpec = useMemo(() => {
    if (!composition) return null;
    const engine = new DeterministicDesignEngine();
    const spec = engine.generateDesignSync({
      businessName: DEMO_RESTAURANT.name,
      cuisine: 'Contemporary Cuisine',
      positioning: composition === 'editorial' ? 'fine-dining' : composition === 'image-showcase' ? 'contemporary' : 'casual',
      mood: composition === 'editorial' ? 'royal-heritage' : composition === 'image-showcase' ? 'clean-editorial' : 'warm-bistro',
      hasPhotography: true,
      menuDensity: 'balanced',
      logoUrl: DEMO_RESTAURANT.logo,
      tagline: DEMO_RESTAURANT.tagline,
    });
    spec.composition = composition;
    if (composition === 'heritage-artboard') {
      spec.themeId = 'pdf-bespoke-theme';
      spec.colors = {
        bg: '#FFFDF9',
        surface: '#FFFFFF',
        surfaceAlt: '#FFF9F0',
        text: '#1F2923',
        textMuted: '#55635C',
        heading: '#CE182C',
        accent: '#FAB700',
        border: 'rgba(250, 183, 0, 0.5)',
        badgeBg: '#CE182C',
        badgeText: '#FFFFFF',
      };
      spec.typography = {
        headingFont: 'Playfair Display, Georgia, serif',
        bodyFont: 'Plus Jakarta Sans, system-ui, sans-serif',
        style: 'serif',
        headingWeight: 'bold',
      };
      spec.decorations = {
        texture: 'subtle-grain',
        borderRadius: 'xl',
        borderStyle: 'solid',
        shadow: 'subtle',
      };
    }
    return spec;
  }, [composition]);

  const testData = useMemo(() => {
    if (edgeCase === 'long-names') {
      return {
        restaurant: {
          name: 'The Royal Sovereign Imperial Dining Hall & Heritage Garden',
          tagline: 'Authentic 19th-Century Royal Palace Recipes Handcrafted with Fresh Spices & Saffron',
          cuisine: 'Mughal • Awadhi • Royal Rajasthani Imperial Banquet',
          address: 'Heritage Palace Arcade, 4th Floor, Indiranagar High Street, Bengaluru, Karnataka',
          logo: DEMO_RESTAURANT.logo,
        },
        categories: [
          { id: 'cat-1', name: 'SIGNATURE IMPERIAL TANDOORI STARTERS & KEBABS', order: 0 },
          { id: 'cat-2', name: 'ROYAL MAIN COURSES & SLOW-SIMMERED SPECIALTIES', order: 1 },
          { id: 'cat-3', name: 'HAND-STRETCHED ARTISANAL TANDOORI BREADS & BASMATI', order: 2 },
          { id: 'cat-4', name: 'SWEET DELICACIES, COLD DESSERTS & BOTANICAL INFUSIONS', order: 3 },
        ],
        items: [
          {
            id: 'long-1',
            name: 'Charcoal Smoked Himalayan Paneer Tikka Royale with Mint & Pomegranate Caviar Reduction',
            description: 'Organic high-altitude malai cottage cheese, slow charcoal fire-smoked, spiced Greek hung curd, dried pomegranate reduction, served with baby radish carpaccio and house mint chutney.',
            price: 495,
            halfPrice: 280,
            fullPrice: 495,
            category: 'cat-1',
            dietType: 'veg' as const,
            available: true,
            isBestseller: true,
            image: DEMO_RESTAURANT.items[0].image,
          },
          {
            id: 'long-2',
            name: 'Awadhi Nizami Slow-Roasted Cardamom Chicken Seekh with Charred Bell Pepper Fondant',
            description: 'Minced chicken thigh meat infused with royal Awadhi garam masala, cardamom pearls, enveloped in flame-charred bell pepper puree with paper-thin roomali wrap.',
            price: 540,
            category: 'cat-1',
            dietType: 'non-veg' as const,
            available: true,
            image: DEMO_RESTAURANT.items[1].image,
          },
          {
            id: 'long-3',
            name: 'Twenty-Four Hour Velvety Dal Makhani Simmered Over Smoldering Charcoal Embers',
            description: 'Slow-simmered whole black urad lentils infused with white churned butter, organic tomato reduction, and roasted kasoori methi dust.',
            price: 395,
            category: 'cat-2',
            dietType: 'veg' as const,
            available: true,
            isBestseller: true,
            image: DEMO_RESTAURANT.items[4].image,
          },
          {
            id: 'long-4',
            name: 'Kashmiri Imperial Baby Lamb Shank Rogan Josh with Saffron-Infused Mawa Gravy',
            description: 'Tender free-range baby lamb shank braised for 8 hours with Kashmiri ratanjot bark, ground shallots, and fragrant hand-picked saffron threads.',
            price: 680,
            category: 'cat-2',
            dietType: 'non-veg' as const,
            available: true,
            image: DEMO_RESTAURANT.items[5]?.image,
          },
        ],
      };
    }

    if (edgeCase === 'missing-fields') {
      return {
        restaurant: {
          name: 'CAFE MINIMAL',
          tagline: undefined,
          cuisine: undefined,
          phone: undefined,
          address: undefined,
          logo: undefined,
        },
        categories: [
          { id: 'cat-1', name: 'MORNING', order: 0 },
          { id: 'cat-2', name: 'AFTERNOON', order: 1 },
        ],
        items: [
          {
            id: 'miss-1',
            name: 'Double Shot Espresso',
            description: undefined,
            price: 180,
            category: 'cat-1',
            dietType: 'veg' as const,
            available: true,
          },
          {
            id: 'miss-2',
            name: 'Butter Croissant',
            description: undefined,
            price: 140,
            category: 'cat-1',
            dietType: 'veg' as const,
            available: true,
          },
          {
            id: 'miss-3',
            name: 'Avocado Tartine',
            description: undefined,
            price: 320,
            category: 'cat-2',
            dietType: 'vegan' as const,
            available: true,
          },
          {
            id: 'miss-4',
            name: 'Smoked Salmon Toast',
            description: undefined,
            price: 380,
            category: 'cat-2',
            dietType: 'non-veg' as const,
            available: true,
          },
        ],
      };
    }

    if (edgeCase === 'multilingual-hindi') {
      return {
        restaurant: {
          name: 'राज महल पैलेस & हेरिटेज रेस्तरां',
          tagline: 'पारंपरिक भारतीय व्यंजन एवं शाही स्वाद - Authentic Heritage Dining Since 1984',
          cuisine: 'शाही मुग़लई • राजस्थानी थाली • उत्तर भारतीय',
          phone: '+91 98290 12345',
          address: 'हवा महल मार्ग, पुराना शहर, जयपुर, राजस्थान 302002',
          logo: DEMO_RESTAURANT.logo,
        },
        categories: [
          { id: 'cat-hi-1', name: 'शुरुआती व्यंजन (STARTERS)', order: 0 },
          { id: 'cat-hi-2', name: 'शाही मुख्य व्यंजन (MAIN COURSE)', order: 1 },
          { id: 'cat-hi-3', name: 'तंदूरी रोटियां एवं बासमती (BREADS & RICE)', order: 2 },
          { id: 'cat-hi-4', name: 'पारंपरिक मिठाइयां (DESSERTS)', order: 3 },
        ],
        items: [
          {
            id: 'hi-1',
            name: 'शाही पनीर मखनी (Shahi Paneer Makhani)',
            description: 'ताज़ा मलाई पनीर, काजू एवं मगज की रेशमी ग्रेवी, असली मक्खन और केसरिया छौंक।',
            price: 320,
            halfPrice: 180,
            fullPrice: 320,
            category: 'cat-hi-2',
            dietType: 'veg' as const,
            available: true,
            isBestseller: true,
            image: DEMO_RESTAURANT.items[0].image,
          },
          {
            id: 'hi-2',
            name: 'अवाधी मुर्ग बिरयानी (Awadhi Murgh Biryani)',
            description: 'धीमी आंच पर दम किया हुआ रसीला चिकन, लंबा बासमती चावल, केसर और खुशबूदार खड़ा मसाला।',
            price: 440,
            halfPrice: 240,
            fullPrice: 440,
            category: 'cat-hi-3',
            dietType: 'non-veg' as const,
            available: true,
            isBestseller: true,
            image: DEMO_RESTAURANT.items[2].image,
          },
          {
            id: 'hi-3',
            name: 'अमृतसरी तंदूरी कुल्चा (Amritsari Tandoori Kulcha)',
            description: 'मसालेदार आलू और प्याज़ से भरा खस्ता कुल्चा, ऊपर से देसी मक्खन और अनारदाना।',
            price: 110,
            category: 'cat-hi-3',
            dietType: 'veg' as const,
            available: true,
          },
          {
            id: 'hi-4',
            name: 'केसर पिस्ता कुल्फी फालूदा (Kesar Pista Kulfi Falooda)',
            description: 'पारंपरिक मटका कुल्फी, गुलाब शरबत, चिया बीज और रेशमी फालूदा सेव।',
            price: 160,
            category: 'cat-hi-4',
            dietType: 'veg' as const,
            available: true,
            isBestseller: true,
          },
        ],
      };
    }

    if (edgeCase === 'large-menu') {
      const generatedCategories = [
        { id: 'lcat-1', name: 'APPETIZERS & CHARCUTERIE', order: 0 },
        { id: 'lcat-2', name: 'SOスープ & SALADS', order: 1 },
        { id: 'lcat-3', name: 'WOOD-FIRED PIZZAS & PASTAS', order: 2 },
        { id: 'lcat-4', name: 'PRIME ROASTS & ENTREES', order: 3 },
        { id: 'lcat-5', name: 'ARTISANAL DESSERTS & DIGESTIFS', order: 4 },
      ];

      const generatedItems = [];
      let itemCounter = 1;
      for (const cat of generatedCategories) {
        for (let i = 1; i <= 8; i++) {
          generatedItems.push({
            id: `large-item-${itemCounter}`,
            name: `${cat.name.split(' ')[0]} Specialty Dish #${i} with Fresh Herbs & Spices`,
            description: `Carefully crafted dish featuring seasonal organic ingredients, pan-seared aromatics, and reduction glaze (${cat.name}).`,
            price: 150 + itemCounter * 15,
            halfPrice: (i % 2 === 0) ? 100 + itemCounter * 10 : undefined,
            fullPrice: (i % 2 === 0) ? 180 + itemCounter * 20 : undefined,
            category: cat.id,
            dietType: (itemCounter % 3 === 0 ? 'non-veg' : itemCounter % 3 === 1 ? 'veg' : 'vegan') as 'veg' | 'non-veg' | 'vegan',
            available: itemCounter !== 13,
            isBestseller: i === 1 || i === 4,
            image: (itemCounter % 2 === 0) ? DEMO_RESTAURANT.items[0]?.image : undefined,
          });
          itemCounter++;
        }
      }

      return {
        restaurant: {
          name: 'Grand Brasserie & Multi-Floor Culinary Hall',
          tagline: 'Expansive 5-Course Artisanal All-Day Dining',
          cuisine: 'Continental • Italian • Bistro Classics',
          phone: '+91 80 2345 6789',
          address: 'Concourse Level 2, Global Galleria Mall, Bengaluru',
          logo: DEMO_RESTAURANT.logo,
        },
        categories: generatedCategories,
        items: generatedItems,
      };
    }

    if (edgeCase === 'mannat') {
      const mannatCategories = [
        { id: 'cat-chaap', name: 'Chaap Specialities', order: 0 },
        { id: 'cat-paneer', name: 'Paneer Feast', order: 1 },
        { id: 'cat-kebabs', name: 'Veg Kebabs & Appetizers', order: 2 },
        { id: 'cat-platters', name: 'Signature Platters', order: 3 },
        { id: 'cat-rolls', name: 'Chaap Rolls With Gravy', order: 4 },
        { id: 'cat-crunch', name: 'MTJ Crunch House', order: 5 },
        { id: 'cat-soups', name: 'Soup Station', order: 6 },
        { id: 'cat-salads', name: 'Fresh Salads', order: 7 },
        { id: 'cat-khazana', name: 'Paneer Ka Khazana', order: 8 },
        { id: 'cat-dal', name: 'Dal Specialities', order: 9 },
        { id: 'cat-rice', name: 'Rice & Biryani', order: 10 },
        { id: 'cat-soya-gravy', name: 'MTJ Pure Soya Gravies', order: 11 },
        { id: 'cat-breads', name: 'Tandoori Breads', order: 12 },
        { id: 'cat-thalis', name: 'MTJ Thalis', order: 13 },
        { id: 'cat-street', name: 'Mtj Street Specials', order: 14 },
        { id: 'cat-momos', name: 'MTJ Momo Junction', order: 15 },
        { id: 'cat-noodles', name: 'Noodles Bowls', order: 16 },
        { id: 'cat-chinese', name: 'Mtj Chinese Bowls', order: 17 },
        { id: 'cat-fries', name: 'Fries & Nachos', order: 18 },
        { id: 'cat-lebanese', name: 'Lebanese Delights', order: 19 },
        { id: 'cat-mexican', name: 'Mexican Fiesta', order: 20 },
        { id: 'cat-pizzas', name: 'Stone Baked Pizzas', order: 21 },
        { id: 'cat-pastas', name: 'Pasta Selections', order: 22 },
        { id: 'cat-burgers', name: 'Burgers & Sandwiches', order: 23 },
        { id: 'cat-garlic-bread', name: 'Garlic Breads', order: 24 },
        { id: 'cat-coffee', name: 'Hot Coffee', order: 25 },
        { id: 'cat-cold-brew', name: 'Cold Brew', order: 26 },
        { id: 'cat-shakes', name: 'Thick Shakes', order: 27 },
        { id: 'cat-coolers', name: 'Coolers', order: 28 },
        { id: 'cat-desserts', name: 'Desserts', order: 29 },
      ];

      const mannatItems = [
        // Chaap Specialities
        { id: 'mn-1', name: 'Malai Chaap', description: 'Tender soya chaap marinated in rich cashew cream and fresh herbs', price: 239, halfPrice: 149, fullPrice: 239, category: 'cat-chaap', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'mn-2', name: 'Afghani Chaap', description: 'Charcoal grilled chaap infused with black pepper and mild creamy spices', price: 239, halfPrice: 149, fullPrice: 239, category: 'cat-chaap', dietType: 'veg' as const, available: true },
        { id: 'mn-3', name: 'Tandoori Chaap', description: 'Classic spicy marinated tandoori chaap roasted over clay oven', price: 219, halfPrice: 139, fullPrice: 219, category: 'cat-chaap', dietType: 'veg' as const, available: true },
        { id: 'mn-4', name: 'Achari Chaap', description: 'Tangy pickle spiced chaap roasted on tandoor skewers', price: 229, halfPrice: 139, fullPrice: 229, category: 'cat-chaap', dietType: 'veg' as const, available: true },
        // Paneer Feast
        { id: 'mn-5', name: 'Paneer Tikka', description: 'Charcoal charred cottage cheese cubes with bell peppers and onions', price: 259, halfPrice: 169, fullPrice: 259, category: 'cat-paneer', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'mn-6', name: 'Malai Paneer Tikka', description: 'Velvety cottage cheese in rich cream and cardamom marinade', price: 279, halfPrice: 179, fullPrice: 279, category: 'cat-paneer', dietType: 'veg' as const, available: true },
        // Veg Kebabs & Platters
        { id: 'mn-7', name: 'Dahi Ke Sholay', description: 'Crispy fried bread rolls stuffed with spiced hung curd and herbs', price: 199, category: 'cat-kebabs', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'mn-8', name: 'Veg Seekh Kebab', description: 'Minced vegetable skewers grilled with aromatic tandoor spices', price: 219, category: 'cat-kebabs', dietType: 'veg' as const, available: true },
        { id: 'mn-9', name: 'Mannat Special Platter', description: 'Assorted tandoori chaaps, paneer tikka, dahi ke sholay & seekh kebabs', price: 449, category: 'cat-platters', dietType: 'veg' as const, available: true, isBestseller: true },
        // Rolls with Gravy
        { id: 'mn-10', name: 'Malai Chaap Roll With Gravy', description: 'Succulent malai chaap wrapped in roomali, served with rich makhani gravy', price: 299, variants: [{ name: '2 Pcs', price: 199 }, { name: '4 Pcs', price: 299 }], category: 'cat-rolls', dietType: 'veg' as const, available: true },
        // Crunch House & Soups & Salads
        { id: 'mn-11', name: 'Crunchy Soya Popcorn', description: 'Bite-sized golden crispy soya nuggets with peri-peri dip', price: 189, category: 'cat-crunch', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'mn-12', name: 'Greek Salad', description: 'Fresh crisp lettuce, cucumber, kalamata olives, cherry tomatoes and feta', price: 199, category: 'cat-salads', dietType: 'veg' as const, available: true },
        // Gravies
        { id: 'mn-13', name: 'Shahi Paneer', description: 'Soft cottage cheese simmered in smooth royal tomato-cashew velvet gravy', price: 289, halfPrice: 179, fullPrice: 289, category: 'cat-khazana', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'mn-14', name: 'Dal Makhani', description: 'Slow-simmered black lentils for 24 hours on tandoor embers with pure butter', price: 259, halfPrice: 159, fullPrice: 259, category: 'cat-dal', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'mn-15', name: 'Veg Hyderabadi Biryani', description: 'Fragrant basmati rice layered with seasoned vegetables, saffron and kewra', price: 239, category: 'cat-rice', dietType: 'veg' as const, available: true },
        // Soya Gravies & Breads
        { id: 'mn-16', name: 'Tawa Chaap Gravy', description: '100% pure soya chaap cooked in robust semi-dry spiced onion gravy', price: 279, halfPrice: 169, fullPrice: 279, category: 'cat-soya-gravy', dietType: 'veg' as const, available: true },
        { id: 'mn-17', name: 'Butter Naan', description: 'Clay oven baked leavened bread brushed with melted butter', price: 55, category: 'cat-breads', dietType: 'veg' as const, available: true },
        { id: 'mn-18', name: 'Garlic Naan', description: 'Hand-stretched naan garnished with minced garlic, coriander and butter', price: 65, category: 'cat-breads', dietType: 'veg' as const, available: true, isBestseller: true },
        // Thalis & Street
        { id: 'mn-19', name: 'Deluxe Thali', description: 'Dal Makhani, Shahi Paneer, Rice, 2 Butter Roti, Raita, Salad & Gulab Jamun', price: 269, category: 'cat-thalis', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'mn-20', name: 'Amritsari Chole Kulche', description: 'Tangy pindi chana served with 2 stuffed tandoori kulchas and pickle', price: 169, category: 'cat-street', dietType: 'veg' as const, available: true },
        // Momo Junction (3-Tier Matrix)
        { id: 'mn-21', name: 'Steamed Momos', description: 'Delicate hand-wrapped dumplings steamed with garden fresh filling', price: 149, category: 'cat-momos', dietType: 'veg' as const, available: true, variants: [{ name: 'Veg (6 Pcs)', price: 149 }, { name: 'Paneer (6 Pcs)', price: 169 }, { name: 'Corn N Cheese', price: 189 }] },
        { id: 'mn-22', name: 'Golden Fry Momos', description: 'Crispy deep-fried momos served with fiery red chutney and mayo', price: 159, category: 'cat-momos', dietType: 'veg' as const, available: true, variants: [{ name: 'Veg (6 Pcs)', price: 159 }, { name: 'Paneer (6 Pcs)', price: 179 }, { name: 'Corn N Cheese', price: 199 }] },
        { id: 'mn-23', name: 'Kurkure Momos', description: 'Crunchy battered momos crusted in crispy flakes', price: 179, category: 'cat-momos', dietType: 'veg' as const, available: true, isBestseller: true, variants: [{ name: 'Veg (6 Pcs)', price: 179 }, { name: 'Paneer (6 Pcs)', price: 199 }, { name: 'Corn N Cheese', price: 219 }] },
        { id: 'mn-24', name: 'Tandoori Momos', description: 'Clay oven charred momos tossed with butter and chaat masala', price: 189, category: 'cat-momos', dietType: 'veg' as const, available: true, isBestseller: true, variants: [{ name: 'Veg (6 Pcs)', price: 189 }, { name: 'Paneer (6 Pcs)', price: 209 }, { name: 'Corn N Cheese', price: 229 }] },
        { id: 'mn-25', name: 'Afghani Momos', description: 'Creamy grilled momos tossed in malai and black pepper dip', price: 199, category: 'cat-momos', dietType: 'veg' as const, available: true, variants: [{ name: 'Veg (6 Pcs)', price: 199 }, { name: 'Paneer (6 Pcs)', price: 219 }, { name: 'Corn N Cheese', price: 239 }] },
        // Indo-Chinese
        { id: 'mn-26', name: 'Veg Hakka Noodles', description: 'Wok tossed noodles with crunchy julienned vegetables and soy glaze', price: 189, category: 'cat-noodles', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'mn-27', name: 'Veg Manchurian Gravy', description: 'Fried vegetable rounds in garlic-ginger dark soy gravy', price: 219, category: 'cat-chinese', dietType: 'veg' as const, available: true },
        // Café & Quick Bites
        { id: 'mn-28', name: 'Peri Peri French Fries', description: 'Crispy potato fries dusted with piquant peri-peri seasoning', price: 139, category: 'cat-fries', dietType: 'veg' as const, available: true },
        { id: 'mn-29', name: 'Falafel Hummus Wrap', description: 'Crispy chickpea falafel patties with creamy garlic hummus in pita wrap', price: 199, category: 'cat-lebanese', dietType: 'veg' as const, available: true },
        { id: 'mn-30', name: 'Loaded Cheesy Nachos', description: 'Crispy corn tortilla chips topped with warm cheese sauce and jalapeños', price: 179, category: 'cat-mexican', dietType: 'veg' as const, available: true },
        // Pizzas & Burgers
        { id: 'mn-31', name: 'Margherita Pizza (10")', description: 'Classic stone-baked thin crust pizza with San Marzano tomato sauce and mozzarella', price: 279, category: 'cat-pizzas', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'mn-32', name: 'Brioche Paneer Burger', description: 'Spiced crispy paneer patty on toasted sesame brioche bun with creamy coleslaw', price: 169, category: 'cat-burgers', dietType: 'veg' as const, available: true },
        { id: 'mn-33', name: 'Cheesy Garlic Bread (4 Pcs)', description: 'Toasted baguette slices with garlic herb butter and melted mozzarella', price: 149, category: 'cat-garlic-bread', dietType: 'veg' as const, available: true },
        // Brews & Shakes
        { id: 'mn-34', name: 'Cold Brew Hazelnut Latte', description: 'Slow-steeped cold brew with velvety steamed milk and roasted hazelnut syrup', price: 169, category: 'cat-cold-brew', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'mn-35', name: 'Oreo Cookie Thick Shake', description: 'Rich chocolate and vanilla bean thick shake blended with crunchy Oreos', price: 189, category: 'cat-shakes', dietType: 'veg' as const, available: true },
        { id: 'mn-36', name: 'Fresh Mint Mojito', description: 'Muddled fresh mint leaves, lime wedges and sparkling soda with crushed ice', price: 139, category: 'cat-coolers', dietType: 'veg' as const, available: true },
        // Desserts
        { id: 'mn-37', name: 'Sizzling Hot Fudge Brownie', description: 'Warm Belgian chocolate walnut brownie served on a sizzler plate with vanilla ice cream', price: 199, category: 'cat-desserts', dietType: 'veg' as const, available: true, isBestseller: true },
      ];

      return {
        restaurant: {
          name: 'Mannat Tandoori Junction',
          tagline: 'Chaap Ka Asli Swad • 100% Pure Soya | Authentic Taste Since 2015',
          cuisine: 'North Indian • Indo Chinese • Continental',
          phone: '8591095483',
          address: 'Main Market Road, Near City Plaza, New Delhi',
          logo: '/uploads/mannat/assets/dish_malai_chaap.webp',
        },
        categories: mannatCategories,
        items: mannatItems,
      };
    }

    if (edgeCase === 'shobharam') {
      const shobharamCategories = [
        { id: 'cat-specials', name: 'Specials & Signatures', order: 0 },
        { id: 'cat-thali', name: 'Royal Thalis & Meals', order: 1 },
        { id: 'cat-starters', name: 'Crispy Starters & Tandoor', order: 2 },
        { id: 'cat-main', name: 'Main Course Curries', order: 3 },
        { id: 'cat-breads', name: 'Clay Oven Breads', order: 4 },
        { id: 'cat-south', name: 'South Indian & Crispy Dosas', order: 5 },
        { id: 'cat-chinese', name: 'Indo-Chinese Wok', order: 6 },
        { id: 'cat-chaat', name: 'Street Chaat & Snacks', order: 7 },
        { id: 'cat-sweets', name: 'Traditional Desi Ghee Sweets', order: 8 },
      ];

      const shobharamItems = [
        { id: 'sh-1', name: 'Special Paneer Tikka Masala', description: 'Charcoal charred cottage cheese simmered in royal creamy cashew gravy', price: 280, category: 'cat-specials', dietType: 'veg' as const, available: true, isBestseller: true, image: '/uploads/shobharam/cover_hero_dish_extracted.webp' },
        { id: 'sh-2', name: 'Dal Makhani Bukhara', description: 'Overnight slow-simmered black lentils with rich churned white butter and cream', price: 240, category: 'cat-main', dietType: 'veg' as const, available: true, isBestseller: true },
        { id: 'sh-3', name: 'Royal Maharaja Thali', description: 'Paneer butter masala, dal makhani, seasonal sabzi, 2 butter naan, jeera rice, raita & gulab jamun', price: 320, category: 'cat-thali', dietType: 'veg' as const, available: true, isBestseller: true, image: '/uploads/shobharam/cover_hero_dish_extracted.webp' },
        { id: 'sh-4', name: 'Masala Dosa Crispy', description: 'Golden crepe stuffed with tempered spiced potato masala, served with sambar & coconut chutneys', price: 160, category: 'cat-south', dietType: 'veg' as const, available: true },
        { id: 'sh-5', name: 'Amritsari Kulcha with Chole', description: 'Stuffed spiced potato onion tandoor kulcha served with tangy pindi chana and mint pickle', price: 180, category: 'cat-starters', dietType: 'veg' as const, available: true },
        { id: 'sh-6', name: 'Butter Tandoori Roti', description: 'Freshly baked whole wheat bread brushed with desi ghee', price: 25, category: 'cat-breads', dietType: 'veg' as const, available: true },
        { id: 'sh-7', name: 'Gulab Jamun Desi Ghee (2 Pcs)', description: 'Mawa dumplings soaked in cardamom and saffron infused warm sugar syrup', price: 90, category: 'cat-sweets', dietType: 'veg' as const, available: true, isBestseller: true },
      ];

      return {
        restaurant: {
          name: "Shobharam's",
          tagline: 'Traditional Recipes • 100% Pure Veg',
          cuisine: 'Pure Veg North Indian • Traditional Sweets',
          phone: '+91 98765 43210',
          address: 'Main Market Road, City Center',
          city: 'Jaipur',
          logo: '/uploads/shobharam/shobharam_logo_transparent.webp',
        },
        categories: shobharamCategories,
        items: shobharamItems,
      };
    }

    return {
      restaurant: DEMO_RESTAURANT,
      categories: DEMO_RESTAURANT.categories,
      items: DEMO_RESTAURANT.items,
    };
  }, [edgeCase]);

  return (
    <div className="min-h-screen bg-[#070b09] text-white flex flex-col items-center">
      {!hideNav && (
        <header className="w-full bg-[#0d1411] border-b border-white/10 p-4 sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/templates" className="text-xs font-mono text-[#D4AF37] hover:underline">
              ← Gallery
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm font-bold tracking-wider uppercase font-serif text-[#FAF3E0]">
              {customSpec ? `AI Spec: ${customSpec.composition.toUpperCase()}` : currentTemplate.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 overflow-x-auto max-w-md py-1">
              {menuTemplates.map((t, idx) => (
                <Link
                  key={t.id}
                  to={`/audit-preview/${t.id}${isCompact ? '?compact=true' : ''}`}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors ${
                    t.id === currentTemplate.id && !composition
                      ? 'bg-[#D4AF37] text-black font-bold'
                      : 'text-white/60 hover:text-white bg-white/5'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}. {t.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/audit-preview/${currentTemplate.id}?compact=${!isCompact}${edgeCase !== 'none' ? `&edge=${edgeCase}` : ''}${composition ? `&composition=${composition}` : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                isCompact
                  ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              {isCompact ? 'Phone Mockup [ON]' : 'Full Viewport'}
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?edge=${edgeCase === 'long-names' ? 'none' : 'long-names'}${isCompact ? '&compact=true' : ''}${composition ? `&composition=${composition}` : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                edgeCase === 'long-names'
                  ? 'border-purple-400 bg-purple-950/60 text-purple-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              {edgeCase === 'long-names' ? 'Edge: Long Names [ON]' : 'Long Names'}
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?edge=${edgeCase === 'missing-fields' ? 'none' : 'missing-fields'}${isCompact ? '&compact=true' : ''}${composition ? `&composition=${composition}` : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                edgeCase === 'missing-fields'
                  ? 'border-rose-400 bg-rose-950/60 text-rose-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              {edgeCase === 'missing-fields' ? 'Edge: Missing Fields [ON]' : 'Missing Fields'}
            </Link>

            <div className="h-4 w-px bg-white/20" />

            <Link
              to={`/audit-preview/${currentTemplate.id}?composition=editorial${isCompact ? '&compact=true' : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                composition === 'editorial'
                  ? 'border-amber-400 bg-amber-950/60 text-amber-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              Spec: Editorial
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?composition=image-showcase${isCompact ? '&compact=true' : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                composition === 'image-showcase'
                  ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              Spec: Image Showcase
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?composition=compact-bistro${isCompact ? '&compact=true' : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                composition === 'compact-bistro'
                  ? 'border-sky-400 bg-sky-950/60 text-sky-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              Spec: Compact Bistro
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?composition=heritage-artboard&edge=mannat${isCompact ? '&compact=true' : ''}`}
              className={`px-2.5 py-1 rounded font-mono text-[11px] border font-bold ${
                composition === 'heritage-artboard'
                  ? 'border-[#FAB700] bg-[#FAB700]/20 text-[#FAB700]'
                  : 'border-[#FAB700]/40 text-[#FAB700] hover:bg-[#FAB700]/10'
              }`}
            >
              ✦ Mannat PDF 1:1 Artboard
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?edge=shobharam${isCompact ? '&compact=true' : ''}`}
              className={`px-2.5 py-1 rounded font-mono text-[11px] border font-bold ${
                edgeCase === 'shobharam'
                  ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300'
                  : 'border-emerald-400/40 text-emerald-400 hover:bg-emerald-950/20'
              }`}
            >
              ✦ Shobharam Bespoke Cover
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?studio=true`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                showStudio
                  ? 'border-[#e8783c] bg-[#e8783c]/20 text-[#e8783c] font-bold'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              ✦ AI Studio Interactive
            </Link>
          </div>
        </header>
      )}

      {showStudio ? (
        <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-[#121815] border border-[#2a3832] rounded-2xl p-6 shadow-xl">
            <AIDesignStudio
              businessName={DEMO_RESTAURANT.name}
              tagline={DEMO_RESTAURANT.tagline}
              logoUrl={DEMO_RESTAURANT.logo}
              currentSpec={interactiveSpec || customSpec}
              onSpecChange={setInteractiveSpec}
              hasPhotography={true}
              itemCount={testData.items.length}
            />
          </div>
          <div className="lg:col-span-6 sticky top-8 flex justify-center">
            <PremiumIPhoneMockup
              className="!w-[340px] shadow-2xl"
              badgeText={(interactiveSpec || customSpec) ? `AI ${(interactiveSpec || customSpec)?.composition}` : 'Live Preview'}
              statusBarTheme={isTemplateDark(currentTemplate) ? 'light' : 'dark'}
              homeIndicatorTheme={isTemplateDark(currentTemplate) ? 'light' : 'dark'}
              screenStyle={{ backgroundColor: (interactiveSpec || customSpec) ? (interactiveSpec || customSpec)?.colors.bg : currentTemplate.colors.bg }}
            >
              <div data-audit-target={currentTemplate.id} className="h-full w-full overflow-y-auto">
                <MenuTemplateRenderer
                  templateId={currentTemplate.id}
                  accentConfiguration={(interactiveSpec || customSpec) || undefined}
                  restaurant={testData.restaurant}
                  categories={testData.categories}
                  items={testData.items}
                  compact={true}
                />
              </div>
            </PremiumIPhoneMockup>
          </div>
        </main>
      ) : (
        <main className="w-full flex justify-center">
          {isCompact ? (
            <div className="my-8 flex justify-center">
              <PremiumIPhoneMockup
                className="!w-[320px] sm:!w-[340px] shadow-2xl"
                badgeText={customSpec ? `AI ${customSpec.composition}` : 'Audit Canvas'}
                statusBarTheme={isTemplateDark(currentTemplate) ? 'light' : 'dark'}
                homeIndicatorTheme={isTemplateDark(currentTemplate) ? 'light' : 'dark'}
                screenStyle={{ backgroundColor: customSpec ? customSpec.colors.bg : currentTemplate.colors.bg }}
                screenClassName=""
              >
                <div data-audit-target={currentTemplate.id} className="h-full w-full overflow-y-auto">
                  <MenuTemplateRenderer
                    templateId={currentTemplate.id}
                    accentConfiguration={customSpec || undefined}
                    restaurant={testData.restaurant}
                    categories={testData.categories}
                    items={testData.items}
                    compact={true}
                  />
                </div>
              </PremiumIPhoneMockup>
            </div>
          ) : (
            <div data-audit-target={currentTemplate.id} className="w-full">
              <MenuTemplateRenderer
                templateId={currentTemplate.id}
                accentConfiguration={customSpec || undefined}
                restaurant={testData.restaurant}
                categories={testData.categories}
                items={testData.items}
                compact={false}
              />
            </div>
          )}
        </main>
      )}
    </div>
  );
}
