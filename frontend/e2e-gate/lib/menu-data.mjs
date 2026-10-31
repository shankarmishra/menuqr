// Deterministic synthetic menu data for the gate (QA-2). Synthetic only: no customer data of any kind.
// Shape calibrated on aggregate statistics of two real live menus (205 dishes / 19 categories with a 65-dish category
// and 47 half/full dishes; 137 dishes / 19 categories / 76 Half+Full variants / no photos), never on their content.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// "English|हिन्दी|diet(v=veg,n=non-veg,e=vegan)|price|halfFull(1 = half and full price)"
const CATALOGUE = [
  ['Soups', 'सूप', [
    'Tomato Shorba|टमाटर शोरबा|v|90|0', 'Hot & Sour Soup|हॉट एंड सॉवर सूप|v|110|0', 'Sweet Corn Soup|स्वीट कॉर्न सूप|v|100|0',
    'Chicken Clear Soup|चिकन क्लियर सूप|n|130|0', 'Lemon Coriander Soup|लेमन कोरिएंडर सूप|e|95|0', 'Manchow Soup|मंचाओ सूप|v|110|0',
    'Mushroom Cappuccino Soup|मशरूम कैपुचीनो सूप|v|140|0', 'Palak Soup|पालक सूप|v|105|0', 'Chicken Manchow Soup|चिकन मंचाओ सूप|n|135|0',
    'Dal Shorba|दाल शोरबा|v|85|0', 'Veg Clear Soup|वेज क्लियर सूप|e|90|0']],
  ['Veg Starters', 'वेज स्टार्टर', [
    'Paneer Tikka|पनीर टिक्का|v|240|1', 'Hara Bhara Kebab|हरा भरा कबाब|v|210|0', 'Veg Seekh Kebab|वेज सीख कबाब|v|220|0',
    'Crispy Corn|क्रिस्पी कॉर्न|v|190|0', 'Dahi Ke Kebab|दही के कबाब|v|230|0', 'Mushroom Galouti|मशरूम गलौटी|v|250|0',
    'Aloo Tikki Chaat Platter|आलू टिक्की चाट|v|150|0', 'Paneer Malai Tikka|पनीर मलाई टिक्का|v|260|1', 'Veg Spring Roll|वेज स्प्रिंग रोल|v|170|0',
    'Stuffed Mushroom|स्टफ्ड मशरूम|v|240|0', 'Cheese Corn Balls|चीज़ कॉर्न बॉल्स|v|200|0']],
  ['Non-Veg Starters', 'नॉन-वेज स्टार्टर', [
    'Chicken Tikka|चिकन टिक्का|n|290|1', 'Chicken Malai Tikka|चिकन मलाई टिक्का|n|310|1', 'Mutton Seekh Kebab|मटन सीख कबाब|n|360|0',
    'Fish Amritsari|फिश अमृतसरी|n|340|0', 'Chicken 65|चिकन 65|n|280|0', 'Afghani Chicken|अफगानी चिकन|n|320|1',
    'Tandoori Prawns|तंदूरी प्रॉन्स|n|420|0', 'Chicken Lollipop|चिकन लॉलीपॉप|n|290|0', 'Egg Bhurji Roll|एग भुर्जी रोल|n|140|0',
    'Chicken Hariyali Tikka|चिकन हरियाली टिक्का|n|300|1', 'Boti Kebab|बोटी कबाब|n|380|0']],
  ['Tandoor Se', 'तंदूर से', [
    'Tandoori Chicken|तंदूरी चिकन|n|340|1', 'Tandoori Aloo|तंदूरी आलू|v|180|0', 'Soya Chaap Tandoori|सोया चाप तंदूरी|v|220|1',
    'Tandoori Gobhi|तंदूरी गोभी|v|200|0', 'Paneer Achari Tikka|पनीर अचारी टिक्का|v|260|1', 'Tandoori Mushroom|तंदूरी मशरूम|v|240|0',
    'Reshmi Kebab|रेशमी कबाब|n|320|0', 'Tangdi Kebab|टंगड़ी कबाब|n|350|1', 'Malai Chaap|मलाई चाप|v|230|1',
    'Tandoori Pineapple|तंदूरी पाइनएपल|v|190|0', 'Stuffed Tandoori Aloo|स्टफ्ड तंदूरी आलू|v|210|0']],
  ['Paneer Specials', 'पनीर स्पेशल', [
    'Paneer Butter Masala|पनीर बटर मसाला|v|260|1', 'Shahi Paneer|शाही पनीर|v|270|1', 'Kadai Paneer|कड़ाही पनीर|v|260|1',
    'Palak Paneer|पालक पनीर|v|250|1', 'Paneer Lababdar|पनीर लबाबदार|v|280|1', 'Matar Paneer|मटर पनीर|v|240|1',
    'Paneer Bhurji|पनीर भुर्जी|v|250|1', 'Paneer Tikka Masala|पनीर टिक्का मसाला|v|280|1', 'Paneer Handi|पनीर हांडी|v|270|1',
    'Paneer Pasanda|पनीर पसंदा|v|290|1', 'Chilli Paneer Gravy|चिली पनीर ग्रेवी|v|260|1']],
  ['Dal & Kadhi', 'दाल और कढ़ी', [
    'Dal Makhani|दाल मखनी|v|240|1', 'Dal Tadka|दाल तड़का|v|180|1', 'Dal Fry|दाल फ्राई|v|170|1',
    'Punjabi Kadhi Pakoda|पंजाबी कढ़ी पकोड़ा|v|190|1', 'Rajma Masala|राजमा मसाला|v|200|1', 'Chole Masala|छोले मसाला|v|200|1',
    'Dal Palak|दाल पालक|v|190|1', 'Lasooni Dal Tadka|लहसुनी दाल तड़का|v|200|1', 'Moong Dal Tadka|मूंग दाल तड़का|v|180|1',
    'Kala Chana Masala|काला चना मसाला|v|190|1', 'Dhaba Dal|ढाबा दाल|v|175|1']],
  ['Seasonal Sabzi', 'मौसमी सब्ज़ी', [
    'Aloo Gobhi|आलू गोभी|v|170|1', 'Bhindi Masala|भिंडी मसाला|v|180|1', 'Baingan Bharta|बैंगन भर्ता|v|190|1',
    'Mix Veg|मिक्स वेज|v|190|1', 'Jeera Aloo|जीरा आलू|v|150|1', 'Methi Malai Matar|मेथी मलाई मटर|v|230|1',
    'Lauki Kofta|लौकी कोफ्ता|v|210|1', 'Malai Kofta|मलाई कोफ्ता|v|250|1', 'Sarson Ka Saag|सरसों का साग|v|220|1',
    'Gobhi Masala|गोभी मसाला|v|180|1', 'Tinda Masala|टिंडा मसाला|v|175|1']],
  ['Chicken Curries', 'चिकन करी', [
    'Butter Chicken|बटर चिकन|n|320|1', 'Chicken Tikka Masala|चिकन टिक्का मसाला|n|320|1', 'Kadai Chicken|कड़ाही चिकन|n|310|1',
    'Chicken Curry Dhaba Style|चिकन करी ढाबा स्टाइल|n|290|1', 'Chicken Handi|चिकन हांडी|n|330|1', 'Chicken Rara|चिकन रारा|n|340|1',
    'Murgh Musallam|मुर्ग मुसल्लम|n|560|0', 'Chicken Korma|चिकन कोरमा|n|330|1', 'Chicken Saagwala|चिकन सागवाला|n|320|1',
    'Egg Curry|एग करी|n|190|1', 'Chicken Lababdar|चिकन लबाबदार|n|330|1']],
  ['Mutton & Gosht', 'मटन और गोश्त', [
    'Mutton Rogan Josh|मटन रोगन जोश|n|480|1', 'Mutton Handi|मटन हांडी|n|490|1', 'Laal Maas|लाल मांस|n|520|1',
    'Mutton Keema Matar|मटन कीमा मटर|n|440|1', 'Mutton Korma|मटन कोरमा|n|490|1', 'Nalli Nihari|नल्ली निहारी|n|540|0',
    'Mutton Bhuna|मटन भुना|n|500|1', 'Gosht Do Pyaza|गोश्त दो प्याज़ा|n|480|1', 'Mutton Kadai|मटन कड़ाही|n|500|1',
    'Keema Pav|कीमा पाव|n|260|0', 'Mutton Saag Gosht|मटन साग गोश्त|n|490|1']],
  ['Biryani & Rice', 'बिरयानी और चावल', [
    'Veg Dum Biryani|वेज दम बिरयानी|v|240|1', 'Chicken Dum Biryani|चिकन दम बिरयानी|n|300|1', 'Mutton Dum Biryani|मटन दम बिरयानी|n|420|1',
    'Hyderabadi Egg Biryani|हैदराबादी एग बिरयानी|n|230|1', 'Paneer Tikka Biryani|पनीर टिक्का बिरयानी|v|270|1', 'Jeera Rice|जीरा राइस|v|140|1',
    'Steamed Rice|स्टीम्ड राइस|e|110|1', 'Veg Pulao|वेज पुलाव|v|180|1', 'Kashmiri Pulao|कश्मीरी पुलाव|v|210|1',
    'Dal Khichdi|दाल खिचड़ी|v|170|1', 'Curd Rice|दही चावल|v|150|0']],
  ['Roti & Naan', 'रोटी और नान', [
    'Tandoori Roti|तंदूरी रोटी|v|20|0', 'Butter Roti|बटर रोटी|v|25|0', 'Plain Naan|प्लेन नान|v|45|0',
    'Butter Naan|बटर नान|v|55|0', 'Garlic Naan|गार्लिक नान|v|65|0', 'Amritsari Kulcha|अमृतसरी कुलचा|v|85|0',
    'Laccha Paratha|लच्छा पराठा|v|55|0', 'Missi Roti|मिस्सी रोटी|v|40|0', 'Stuffed Aloo Paratha|आलू पराठा|v|80|0',
    'Cheese Naan|चीज़ नान|v|95|0', 'Rumali Roti|रुमाली रोटी|v|30|0']],
  ['Thali', 'थाली', [
    'Veg Thali|वेज थाली|v|260|0', 'Special Thali|स्पेशल थाली|v|340|0', 'Dal Baati Churma Thali|दाल बाटी चूरमा थाली|v|320|0',
    'Chicken Thali|चिकन थाली|n|360|0', 'Mutton Thali|मटन थाली|n|480|0', 'Mini Thali|मिनी थाली|v|190|0',
    'Paneer Thali|पनीर थाली|v|310|0', 'Rajma Chawal Thali|राजमा चावल थाली|v|220|0', 'Kadhi Chawal Thali|कढ़ी चावल थाली|v|210|0',
    'Chole Bhature Thali|छोले भटूरे थाली|v|230|0', 'Jain Thali|जैन थाली|v|290|0']],
  ['Indo-Chinese', 'इंडो-चाइनीज़', [
    'Veg Hakka Noodles|वेज हक्का नूडल्स|v|180|1', 'Chicken Hakka Noodles|चिकन हक्का नूडल्स|n|220|1', 'Veg Manchurian Gravy|वेज मंचूरियन ग्रेवी|v|200|1',
    'Chilli Chicken|चिली चिकन|n|260|1', 'Veg Fried Rice|वेज फ्राइड राइस|v|180|1', 'Schezwan Fried Rice|शेज़वान फ्राइड राइस|v|200|1',
    'Honey Chilli Potato|हनी चिली पोटैटो|v|190|0', 'Paneer Chilli Dry|पनीर चिली ड्राई|v|240|0', 'American Chopsuey|अमेरिकन चॉप्सी|v|230|0',
    'Chicken Schezwan Noodles|चिकन शेज़वान नूडल्स|n|230|1', 'Triple Schezwan Rice|ट्रिपल शेज़वान राइस|v|250|0']],
  ['Chaat & Snacks', 'चाट और नाश्ता', [
    'Pani Puri|पानी पूरी|v|60|0', 'Dahi Puri|दही पूरी|v|80|0', 'Samosa Chaat|समोसा चाट|v|90|0',
    'Raj Kachori|राज कचौरी|v|110|0', 'Papdi Chaat|पापड़ी चाट|v|90|0', 'Pav Bhaji|पाव भाजी|v|150|0',
    'Vada Pav|वड़ा पाव|v|45|0', 'Aloo Tikki|आलू टिक्की|v|70|0', 'Chole Bhature|छोले भटूरे|v|140|0',
    'Dahi Bhalla|दही भल्ला|v|90|0', 'Bread Pakoda|ब्रेड पकोड़ा|v|50|0']],
  ['South Indian', 'दक्षिण भारतीय', [
    'Plain Dosa|प्लेन डोसा|v|110|0', 'Masala Dosa|मसाला डोसा|v|140|0', 'Mysore Masala Dosa|मैसूर मसाला डोसा|v|160|0',
    'Idli Sambar|इडली सांभर|v|100|0', 'Medu Vada|मेदु वड़ा|v|110|0', 'Uttapam|उत्तपम|v|130|0',
    'Rava Dosa|रवा डोसा|v|150|0', 'Paneer Dosa|पनीर डोसा|v|170|0', 'Curd Rice South Style|दही राइस|v|130|0',
    'Lemon Rice|लेमन राइस|v|120|0', 'Podi Idli|पोडी इडली|v|120|0']],
  ['Desserts', 'मिठाई', [
    'Gulab Jamun|गुलाब जामुन|v|90|0', 'Rasmalai|रसमलाई|v|120|0', 'Gajar Ka Halwa|गाजर का हलवा|v|130|0',
    'Moong Dal Halwa|मूंग दाल हलवा|v|140|0', 'Kulfi Falooda|कुल्फी फालूदा|v|150|0', 'Jalebi With Rabri|जलेबी रबड़ी|v|130|0',
    'Shahi Tukda|शाही टुकड़ा|v|140|0', 'Kheer|खीर|v|100|0', 'Eggless Chocolate Brownie|एगलेस ब्राउनी|v|160|0',
    'Sizzling Brownie|सिज़लिंग ब्राउनी|v|220|0', 'Ice Cream Scoop|आइसक्रीम स्कूप|v|70|0']],
  ['Hot Beverages', 'गरम पेय', [
    'Masala Chai|मसाला चाय|v|30|0', 'Ginger Tea|अदरक चाय|v|30|0', 'Kulhad Chai|कुल्हड़ चाय|v|40|0',
    'Black Coffee|ब्लैक कॉफ़ी|e|60|0', 'Filter Coffee|फ़िल्टर कॉफ़ी|v|70|0', 'Cappuccino|कैपुचीनो|v|120|0',
    'Hot Chocolate|हॉट चॉकलेट|v|140|0', 'Kesar Doodh|केसर दूध|v|90|0', 'Haldi Doodh|हल्दी दूध|v|70|0',
    'Green Tea|ग्रीन टी|e|60|0', 'Kashmiri Kahwa|कश्मीरी कहवा|e|90|0']],
  ['Cold Drinks & Shakes', 'ठंडे पेय', [
    'Sweet Lassi|मीठी लस्सी|v|80|0', 'Salted Lassi|नमकीन लस्सी|v|70|0', 'Mango Lassi|मैंगो लस्सी|v|100|0',
    'Fresh Lime Soda|फ्रेश लाइम सोडा|e|70|0', 'Jaljeera|जलजीरा|e|60|0', 'Masala Chaas|मसाला छाछ|v|50|0',
    'Cold Coffee|कोल्ड कॉफ़ी|v|130|0', 'Oreo Shake|ओरियो शेक|v|160|0', 'Rose Sharbat|रोज़ शरबत|e|80|0',
    'Mineral Water 1L|मिनरल वॉटर|e|30|0', 'Fresh Orange Juice|ताज़ा संतरा जूस|e|110|0']],
  ['Combos', 'कॉम्बो', [
    'Dal Rice Combo|दाल राइस कॉम्बो|v|190|0', 'Rajma Rice Combo|राजमा राइस कॉम्बो|v|200|0', 'Chole Kulche Combo|छोले कुलचे कॉम्बो|v|180|0',
    'Paneer Roti Combo|पनीर रोटी कॉम्बो|v|260|0', 'Butter Chicken Naan Combo|बटर चिकन नान कॉम्बो|n|360|0', 'Biryani Raita Combo|बिरयानी रायता कॉम्बो|n|340|0',
    'Student Meal|स्टूडेंट मील|v|150|0', 'Family Feast For 4|फैमिली फीस्ट|v|1280|0', 'Non-Veg Family Feast For 4|नॉन-वेज फैमिली फीस्ट|n|1650|0',
    'Office Lunch Box|ऑफिस लंच बॉक्स|v|210|0', 'Party Platter For 50|पार्टी प्लैटर|v|12500|0']],
  ['Extras & Add-ons', 'एक्स्ट्रा', [
    'Boondi Raita|बूंदी रायता|v|70|0', 'Mixed Raita|मिक्स रायता|v|80|0', 'Green Salad|हरा सलाद|e|60|0',
    'Masala Papad|मसाला पापड़|v|40|0', 'Roasted Papad|भुना पापड़|e|20|0', 'Pickle Plate|अचार|e|20|0',
    'Extra Butter|एक्स्ट्रा बटर|v|15|0', 'Extra Gravy|एक्स्ट्रा ग्रेवी|v|40|0', 'Chutney Set|चटनी सेट|e|25|0',
    'Catering Tray For 100 Persons|कैटरिंग ट्रे|v|125000|0', 'Plain Curd|सादा दही|v|50|0']],
];

export const CATEGORY_NAMES = CATALOGUE.map(([en]) => en);
export const CATEGORY_NAMES_HI = CATALOGUE.map(([, hi]) => hi);

const MISSING_PRICE = new Set([5, 37, 71, 104, 152, 199]);
const LONG_DESC = new Set([7, 61, 130, 173, 209]);
const EXTREME_DESC = 99;
const WEIRD_NAME_AT = { 12: "Chef's Special <Thali> & \"Combo\"", 44: 'Special Hyderabadi Dum Chicken Biryani With Mirchi Ka Salan And Boondi Raita (Serves Two Hungry People)' };
const HALF_VARIANT_NAME = { 150: 'Half (' }; // regression for the regex-crash fixed in HF-4 (variant name with a bracket)

const DESCRIPTION_BITS = [
  'Slow cooked with whole spices and finished with fresh coriander.', 'Made to order in our tandoor, served with mint chutney.',
  'A house favourite, mildly spiced and best with butter naan.', 'Tempered with cumin, garlic and dried red chilli.',
  'Cooked in a rich onion-tomato gravy with a hint of kasuri methi.', 'Served hot with sliced onion and lemon.',
  'Prepared fresh every day; ask for less spicy if you like.', 'Light, aromatic and traditionally prepared.',
];

function sentence(rand, count) {
  let s = '';
  for (let n = 0; n < count; n++) s += `${DESCRIPTION_BITS[Math.floor(rand() * DESCRIPTION_BITS.length)]} `;
  return s.trim();
}

/** Round to a believable menu price (multiple of 5 or 10). */
function tidy(value) {
  return value >= 100 ? Math.round(value / 10) * 10 : Math.round(value / 5) * 5;
}

/**
 * 220 dishes in 20 categories. Each item: { index, category (index), categoryName, name, nameEn, nameHi, description,
 * diet, price (null = missing), halfPrice, fullPrice, hasPhoto, photoSlot, variants, bestseller }.
 */
export function buildMenu(seed = 20261031) {
  const rand = mulberry32(seed);
  const items = [];
  CATALOGUE.forEach(([catEn, , dishes], categoryIndex) => {
    dishes.forEach((row) => {
      const [en, hi, diet, basePrice, split] = row.split('|');
      const index = items.length;
      const slot = index % 10; // 0-1 Hindi only, 2-3 "English (Hindi)", otherwise English only (40% of names carry Devanagari)
      let name = slot < 2 ? hi : slot < 4 ? `${en} (${hi})` : en;
      if (WEIRD_NAME_AT[index]) name = WEIRD_NAME_AT[index];
      let description = '';
      if (LONG_DESC.has(index)) description = sentence(rand, 12);
      else if (index === EXTREME_DESC) description = sentence(rand, 30);
      else if (rand() < 0.42) description = sentence(rand, 1 + Math.floor(rand() * 2));
      const base = Number(basePrice);
      const missing = MISSING_PRICE.has(index);
      const isSplit = split === '1' && !missing;
      const full = tidy(base);
      const half = tidy(base * 0.6);
      items.push({
        index,
        category: categoryIndex,
        categoryName: catEn,
        name,
        nameEn: en,
        nameHi: hi,
        description,
        diet: diet === 'n' ? 'non-veg' : diet === 'e' ? 'vegan' : 'veg',
        price: missing ? null : isSplit ? full : base,
        halfPrice: isSplit ? half : null,
        fullPrice: isSplit ? full : null,
        hasPhoto: index % 3 === 0,
        photoSlot: index % 12,
        variants: HALF_VARIANT_NAME[index] ? [{ name: 'Half (', price: half }, { name: 'Full', price: full }] : [],
        bestseller: index % 17 === 3,
      });
    });
  });
  return { categories: CATEGORY_NAMES.map((name, i) => ({ name, nameHi: CATEGORY_NAMES_HI[i], order: i })), items };
}

export const SOCIAL_VALUES = {
  instagram: {
    valid: ['@gate.dhaba', 'gate.dhaba', 'instagram.com/gate.dhaba', 'https://www.instagram.com/gate.dhaba/', 'https://instagram.com/gate_dhaba?igsh=abc123'],
    invalid: ['gate dhaba', 'https://evil.example/not-instagram', '@@@@', 'a'.repeat(60), 'javascript:alert(1)'],
  },
  facebook: {
    valid: ['facebook.com/gatedhaba', 'https://www.facebook.com/gatedhaba', 'fb.com/gatedhaba'],
    invalid: ['facebook dot com', 'https://notfacebook.example/x', 'javascript:alert(1)'],
  },
  website: {
    valid: ['gatedhaba.in', 'https://www.gatedhaba.in', 'http://gatedhaba.in/menu'],
    invalid: ['not a url', 'ftp://gatedhaba.in', 'javascript:alert(1)', 'http://'],
  },
  phone: {
    valid: ['9876543210', '+91 98765 43210', '098765 43210', '011 2345 6789', '1800 123 4567'],
    invalid: ['12345', '98765', 'abcdefghij', '+91 12345 678', '00000000000000000'],
    multi: ['+91 98765 43210, +91 91234 56780', '98765 43210 / 91234 56780'],
  },
  maps: {
    valid: ['https://maps.app.goo.gl/AbCdEf123456', 'https://www.google.com/maps/place/Gate+Dhaba/@28.6139,77.2090,17z', 'https://maps.google.com/?q=28.6139,77.2090'],
    invalid: ['maps please', 'https://notgoogle.example/maps', 'javascript:alert(1)'],
  },
};
