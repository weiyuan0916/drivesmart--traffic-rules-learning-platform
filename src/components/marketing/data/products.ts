export interface Product {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  price: string;
  unit: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  image: string;
  badge?: string;
}

export const products: Product[] = [
  {
    id: 'coffee',
    name: 'Specialty Coffee',
    category: 'Coffee',
    tagline: 'Bold. Rich. Highland Grown.',
    description:
      'Hand-picked Arabica beans from the Central Highlands of Vietnam. Sun-dried and roasted to perfection for a smooth, full-bodied cup.',
    price: '185,000',
    unit: '500g',
    bgColor: '#3D2B1F',
    textColor: '#F5E6D3',
    accentColor: '#C4956A',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&q=90',
    badge: 'Bestseller',
  },
  {
    id: 'macadamia',
    name: 'Macadamia Nuts',
    category: 'Nuts',
    tagline: 'Crunchy. Premium. Natural.',
    description:
      'Premium whole macadamia nuts from the cool highlands of Da Lat. Roasted lightly to preserve natural flavor and crunch.',
    price: '320,000',
    unit: '300g',
    bgColor: '#D8C3A5',
    textColor: '#2C2416',
    accentColor: '#8B7355',
    image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=1200&q=90',
  },
  {
    id: 'black-pepper',
    name: 'Black Pepper',
    category: 'Spices',
    tagline: 'Intense. Aromatic. Pungent.',
    description:
      'World-famous Kampot-style black pepper from the red soil of the highlands. Exceptionally aromatic with lasting heat.',
    price: '95,000',
    unit: '250g',
    bgColor: '#2E2E2E',
    textColor: '#F0EDE8',
    accentColor: '#A8A095',
    image: 'https://images.unsplash.com/photo-1599909533853-13f35e21b9fe?w=1200&q=90',
  },
  {
    id: 'durian',
    name: 'Durian',
    category: 'Fruits',
    tagline: 'King of Fruits. Creamy. Luxurious.',
    description:
      'Premium Monthong durian from the Mekong Delta. Creamy yellow flesh with a delicate sweetness and rich aroma.',
    price: '450,000',
    unit: '1kg',
    bgColor: '#F6D860',
    textColor: '#2C1F00',
    accentColor: '#C9A227',
    image: 'https://images.unsplash.com/photo-1573142977-e3b6da37ac7b?w=1200&q=90',
    badge: 'Seasonal',
  },
  {
    id: 'passion-fruit',
    name: 'Organic Passion Fruit',
    category: 'Fruits',
    tagline: 'Tropical. Tangy. Refreshing.',
    description:
      'Organically grown passion fruit from the highlands of Da Lat. Intensely fragrant with a perfect balance of sweet and tart.',
    price: '125,000',
    unit: '500g',
    bgColor: '#5C3D2E',
    textColor: '#F5E6D3',
    accentColor: '#C4956A',
    image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=1200&q=90',
  },
];

export const categories = [
  {
    id: 'coffee',
    name: 'Coffee',
    description: 'Arabica & Robusta beans from the highlands',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=85',
    color: '#3D2B1F',
  },
  {
    id: 'macadamia',
    name: 'Macadamia',
    description: 'Premium whole & roasted nuts',
    image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=85',
    color: '#D8C3A5',
  },
  {
    id: 'pepper',
    name: 'Black Pepper',
    description: 'Kampot-style aromatic pepper',
    image: 'https://images.unsplash.com/photo-1599909533853-13f35e21b9fe?w=800&q=85',
    color: '#2E2E2E',
  },
  {
    id: 'durian',
    name: 'Durian',
    description: 'Premium Monthong & common varieties',
    image: 'https://images.unsplash.com/photo-1573142977-e3b6da37ac7b?w=800&q=85',
    color: '#F6D860',
  },
];

export const stats = [
  { value: '1,000+', label: 'Partner Farmers' },
  { value: '500+', label: 'Hectares Farmed' },
  { value: '20+', label: 'Export Markets' },
  { value: '15+', label: 'Years Experience' },
];
