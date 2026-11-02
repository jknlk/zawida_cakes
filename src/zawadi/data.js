// Zawadi page content. Colours follow the existing flavour wheel palette (src/data/flavors.js).
export const TORTES = [
  {
    id: 'kiwi',
    name: 'Kiwi',
    sw: 'Kiwi',
    desc: 'Chai-spiced vanilla custard under a crown of juicy kiwi and green grapes. Bright, tangy and impossibly fresh.',
    price: 3700,
    c1: '#6b8f1e',
    c2: '#8fb62f',
    tint: '#eef5dc',
    tint2: '#d9eaa9',
  },
  {
    id: 'lemon',
    name: 'Lemon',
    sw: 'Limau',
    desc: 'Sharp lemon curd, citrus slices, blueberries and clouds of whipped cream for a sunny, zesty bite.',
    price: 3600,
    c1: '#c98d0a',
    c2: '#e8ab1f',
    tint: '#fdf3d8',
    tint2: '#f9dc8f',
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    sw: 'Stroberi',
    desc: 'Silky strawberry cream swirled with raspberries, blueberries and fresh strawberries on a buttery crust.',
    price: 4200,
    c1: '#c21f3a',
    c2: '#e23a56',
    tint: '#fde6e8',
    tint2: '#f7b9c1',
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    sw: 'Chokoleti',
    desc: 'Dark cocoa ganache beneath a crescent of raspberries and blueberries. Deep, glossy and indulgent.',
    price: 4800,
    c1: '#4a2618',
    c2: '#6b3a26',
    tint: '#f3e7df',
    tint2: '#dcc0ad',
  },
  {
    id: 'mango',
    name: 'Mango',
    sw: 'Embe',
    desc: 'Coastal mango custard finished with fresh mango cubes, orange and berries for a sweet tropical lift.',
    price: 3900,
    c1: '#d9760f',
    c2: '#f2941f',
    tint: '#fdeedb',
    tint2: '#f9c98a',
  },
  {
    id: 'berry',
    name: 'Berry',
    sw: 'Beri',
    desc: 'Velvety hibiscus cream piled with strawberries, blueberries and blackberries on a crisp tart shell.',
    price: 4400,
    c1: '#5a1f66',
    c2: '#7c2e8a',
    tint: '#efe4f3',
    tint2: '#d5b5e0',
  },
].map((t) => ({
  ...t,
  img: `/zawadi/tarts/${t.id}.webp`,
  // 640px copy for phones, small cards and the sprinkle cut-outs (~75% lighter)
  img640: `/zawadi/tarts/${t.id}-640.webp`,
  srcSet: `/zawadi/tarts/${t.id}-640.webp 640w, /zawadi/tarts/${t.id}.webp 1024w`,
  thumb: `/zawadi/tarts/${t.id}-thumb.webp`,
  fruitTop: `/zawadi/fruit/${t.id}-tr.webp`,
  fruitBottom: `/zawadi/fruit/${t.id}-br.webp`,
}))

export const START_INDEX = 2

// `sizes` for the big hero cake; CakeFlight and the preload in index.html use the same
// value so all three share one download
export const HERO_TART_SIZES = '(max-width: 899px) 80vw, min(46vw, 80vh)'

export const formatPrice = (n) => `KSh ${n.toLocaleString('en-KE')}`

export const tortesById = Object.fromEntries(TORTES.map((t) => [t.id, t]))

// ---- Below-the-fold content ----
// Swap `photo` for a real photo of the baker or kitchen (e.g. /zawadi/about/baker.webp).
export const ABOUT = {
  photo: '/zawadi/tarts/chocolate.webp',
  photoAlt: 'A Zawadi chocolate torte fresh from the kitchen',
  points: [
    {
      title: 'Baked the morning you collect',
      text: 'No freezers, no day-old stock. Every torte is assembled at dawn and leaves the kitchen within hours.',
    },
    {
      title: 'Fruit from Kenyan farms',
      text: 'Limuru strawberries, coastal mangoes and Meru citrus, chosen by hand each week for colour and sweetness.',
    },
    {
      title: 'Made from scratch',
      text: 'Real butter crusts, slow-cooked custards and creams. No premixes and no artificial colours.',
    },
  ],
  stats: [
    { value: '2014', label: 'baking since' },
    { value: '6', label: 'signature flavours' },
    { value: '24h', label: 'notice for orders' },
  ],
}

export const MENU_CATEGORIES = [
  { id: 'all', label: 'All cakes' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'custom', label: 'Custom' },
]

export const MENU = [
  { id: 'b1', cat: 'birthday', flavour: 'strawberry', name: 'Strawberry Celebration', desc: 'Strawberry cream, raspberries and blueberries. Serves 10 to 12.', price: 4200 },
  { id: 'b2', cat: 'birthday', flavour: 'chocolate', name: 'Double Chocolate', desc: 'Dark cocoa ganache with a crescent of fresh berries. Serves 10 to 12.', price: 4800 },
  { id: 'b3', cat: 'birthday', flavour: 'mango', name: 'Mango Sunshine', desc: 'Coastal mango custard, orange and berries. A party favourite. Serves 10.', price: 3900 },
  { id: 'w1', cat: 'wedding', flavour: 'lemon', name: 'Lemon & Blueberry Tier', desc: 'Two tiers of lemon curd and whipped cream. Serves 40.', price: 14500 },
  { id: 'w2', cat: 'wedding', flavour: 'berry', name: 'Hibiscus Berry Tier', desc: 'Velvety hibiscus cream crowned with forest berries. Serves 45.', price: 16000 },
  { id: 'w3', cat: 'wedding', flavour: 'kiwi', name: 'Kiwi Garden Tier', desc: 'Chai-spiced custard under kiwi and green grapes. Serves 40.', price: 13800 },
  { id: 'c1', cat: 'custom', flavour: 'berry', name: 'Design Your Own', desc: 'Pick a crust, cream and fruit, and we sketch it with you first.', price: 5000, from: true },
  { id: 'c2', cat: 'custom', flavour: 'chocolate', name: 'Message Torte', desc: 'Any torte finished with a hand-piped name or note in chocolate.', price: 5200 },
]

// Curved gallery reel (TiltedGridHero). Event photos fill their tile; the cut-out
// tortes sit whole ("contain") on their own flavour tint, so colours stay on-palette.
export const GALLERY = [
  { kind: 'photo', src: '/zawadi/occasions/birthday.webp', alt: 'A birthday cake with lit candles and piped flowers' },
  { kind: 'torte', flavour: 'strawberry' },
  { kind: 'photo', src: '/zawadi/occasions/wedding.webp', alt: 'A three tier white wedding cake with peonies and strawberries' },
  { kind: 'torte', flavour: 'lemon' },
  { kind: 'photo', src: '/zawadi/occasions/babyshower.webp', alt: 'Vanilla cupcakes with white frosting and pastel sprinkles' },
  { kind: 'torte', flavour: 'kiwi' },
  { kind: 'photo', src: '/zawadi/occasions/corporate.webp', alt: 'Slices of cream and cherry cake on white plates' },
  { kind: 'torte', flavour: 'chocolate' },
  { kind: 'photo', src: '/zawadi/occasions/festive.webp', alt: 'Festive panettone cakes in front of a lit Christmas tree' },
  { kind: 'torte', flavour: 'mango' },
  { kind: 'torte', flavour: 'berry' },
]

// ---- Occasions ----
// Photos: free Unsplash License (commercial use OK, no attribution required). Swap for your own event photos when you have them.
// `cat` is the Menu tab that clicking the card opens.
export const OCCASIONS = [
  { id: 'birthday', title: 'Birthdays', text: 'Candles, piped names and the flavour they ask for every year.', img: '/zawadi/occasions/birthday.webp', alt: 'A birthday cake with lit candles and piped flowers', cat: 'birthday', flavour: 'strawberry' },
  { id: 'wedding', title: 'Weddings', text: 'Tiered tortes dressed in fresh fruit and flowers, tasted with you first.', img: '/zawadi/occasions/wedding.webp', alt: 'A three tier white wedding cake with peonies and strawberries', cat: 'wedding', flavour: 'lemon' },
  { id: 'anniversary', title: 'Anniversaries', text: 'Pretty pastel tortes with macarons for the two of you, or for the whole family.', img: '/zawadi/occasions/anniversary.webp', alt: 'A pink and white striped drip cake topped with macarons', cat: 'custom', flavour: 'berry' },
  { id: 'babyshower', title: 'Baby showers', text: 'Soft pastel tortes and cupcakes for a gentle, happy welcome.', img: '/zawadi/occasions/babyshower.webp', alt: 'Vanilla cupcakes with white frosting and pastel sprinkles', cat: 'custom', flavour: 'kiwi' },
  { id: 'kids', title: "Kids' parties", text: 'Rainbow layers, sprinkles and stars. Bright on the outside, real fruit inside.', img: '/zawadi/occasions/kids.webp', alt: 'A rainbow layer cake covered in sprinkles with a slice cut out', cat: 'birthday', flavour: 'mango' },
  { id: 'corporate', title: 'Office & corporate', text: 'Sliced and boxed for launches, farewells and team Fridays. Invoices on request.', img: '/zawadi/occasions/corporate.webp', alt: 'Slices of cream and cherry cake on white plates', cat: 'all', flavour: 'chocolate' },
  { id: 'festive', title: 'Eid & Christmas', text: 'Seasonal bakes and gift boxes. Festive orders open a month ahead.', img: '/zawadi/occasions/festive.webp', alt: 'Festive panettone cakes in front of a lit Christmas tree', cat: 'custom', flavour: 'mango' },
].map((o) => ({ ...o, srcSet: `${o.img.replace('.webp', '-600.webp')} 600w, ${o.img} 900w` }))

// ---- Flavours & ingredients ----
export const INGREDIENTS = {
  kiwi: { crust: 'Butter shortcrust', cream: 'Chai-spiced vanilla custard', fruit: 'Kiwi, green grapes', origin: 'Kiwi and grapes from small growers around Naivasha' },
  lemon: { crust: 'Almond sablé', cream: 'Lemon curd and whipped cream', fruit: 'Lemon, blueberries', origin: 'Lemons from Meru citrus farms' },
  strawberry: { crust: 'Butter shortcrust', cream: 'Strawberry cream', fruit: 'Strawberries, raspberries, blueberries', origin: 'Strawberries picked in Limuru the day before' },
  chocolate: { crust: 'Cocoa shortcrust', cream: 'Dark cocoa ganache', fruit: 'Raspberries, blueberries', origin: 'Single-origin cocoa from East Africa' },
  mango: { crust: 'Toasted coconut crust', cream: 'Mango custard', fruit: 'Mango, orange, mixed berries', origin: 'Apple mangoes from the Kilifi coast' },
  berry: { crust: 'Crisp tart shell', cream: 'Hibiscus (rosella) cream', fruit: 'Strawberries, blueberries, blackberries', origin: 'Dried hibiscus from Machakos farms' },
}

// ---- Sizes & servings ----  (d = diameter in inches, tiers = number of tiers)
// Photos: free Unsplash License (commercial use OK, no attribution required) by Uliana Kopanytsia,
// Anita Austvika, David Holifield, James Coleman and srosinger3997. Swap for photos of your own cakes.
// `pos` is the CSS object-position that keeps the cake centred in the card.
export const SIZES = [
  { id: 's6', label: '6"', name: 'Small', serves: [6, 10], price: 3000, d: 6, tiers: 1, img: '/zawadi/sizes/s6.webp', pos: '50% 45%', alt: 'A small chocolate torte topped with raspberries' },
  { id: 's8', label: '8"', name: 'Classic', serves: [12, 16], price: 3800, d: 8, tiers: 1, img: '/zawadi/sizes/s8.webp', pos: '50% 50%', alt: 'A berry torte with meringue kisses on a cake stand' },
  { id: 's10', label: '10"', name: 'Large', serves: [20, 25], price: 5800, d: 10, tiers: 1, img: '/zawadi/sizes/s10.webp', pos: '45% 50%', alt: 'A wide strawberry and blueberry layer cake' },
  { id: 't2', label: '2 tier', name: '8" + 6"', serves: [30, 45], price: 13500, d: 8, tiers: 2, img: '/zawadi/sizes/t2.webp', pos: '50% 55%', alt: 'A two tier naked cake with fresh flowers' },
  { id: 't3', label: '3 tier', name: '10" + 8" + 6"', serves: [60, 80], price: 22000, d: 10, tiers: 3, img: '/zawadi/sizes/t3.webp', pos: '50% 50%', alt: 'A three tier white cake with flowers' },
]

// ---- Cake of the month ---- (edit each month)
export const OFFER = {
  month: 'November',
  flavour: 'strawberry',
  title: 'Strawberry torte, 10% off',
  text: 'Limuru strawberries are at their sweetest. Order any whole strawberry torte before 30 November and save 10%. Christmas pre-orders open 1 December.',
  code: 'STROBERI10',
}

// ---- Delivery & pickup ----
export const DELIVERY = {
  zones: [
    { area: 'CBD, Kilimani, Hurlingham, Upper Hill', fee: 300 },
    { area: 'Westlands, Lavington, Kileleshwa, Parklands', fee: 450 },
    { area: 'Karen, Langata, South B & C', fee: 550 },
    { area: 'Runda, Ruaka, Kitisuru, Syokimau', fee: 750 },
  ],
  beyond: 'Further out? Call us for a quote.',
  pickup: 'Zawadi Kitchen, Ngong Road, Nairobi',
  mapQuery: 'Ngong Road, Nairobi',
  hours: [
    { days: 'Tue to Fri', time: '8am to 6pm' },
    { days: 'Saturday', time: '8am to 7pm' },
    { days: 'Sunday', time: '9am to 3pm' },
    { days: 'Monday', time: 'Closed' },
  ],
}
