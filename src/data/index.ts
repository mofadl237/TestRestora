import { IDataNavBar, SlideMedia } from "../Interfaces";

// 1- Data NavBar
export const dataNavBarWebsite: IDataNavBar[] = [
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Contact",
    path: "/contact",
  },
  {
    label: "Menu",
    path: "/menu",
  },
  {
    label: "Cart",
    path: "/cart",
  },
  {
    label: "Track Order",
    path: "/track-order",
  },
];

// 2- Data Slider Hero Section
// Translated copy (subtitle/title/description) lives in messages/*.json under "hero.slides".
export const sliderData: SlideMedia[] = [
  {
    id: 1,
    image: "/images/pizza1.png",
    thumbnail: "/images/pizza1.png",
  },
  {
    id: 2,
    image: "/images/pizaa11.png",
    thumbnail: "/images/pizaa11.png",
  },
  {
    id: 3,
    image: "/images/pizza8.png",
    thumbnail: "/images/pizza8.png",
  },
  {
    id: 4,
    image: "/images/pizza10.png",
    thumbnail: "/images/pizza10.png",
  },
];
