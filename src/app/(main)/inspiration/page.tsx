
"use client"; // Added "use client" as react-icons and event handlers likely need client-side rendering

import React from 'react';
// Header and Footer imports removed as they are handled by MainLayout
import PopularArticles from './PopularArticles'; // Assumed local component
// react-icons imports removed as they are not used in the current page content
import ExclusiveOffer from "./ExclusiveOffer"; // Assumed local component

const articles = [
  {
    title: "Disneyland Abu Dhabi: Everything We Know So Far",
    image: "https://www.holidify.com/images/bgImages/GREECE.jpg",
    hint: "greece landscape"
  },
  {
    title: "The Ultimate 5-Day Malta Itinerary for First-Time Visitors",
    image: "https://www.holidify.com/images/bgImages/SINGAPORE.jpg",
    hint: "singapore city"
  },
  {
    title: "5 Things We Love About Merusaka Nusa Dua Bali",
    image: "https://www.usatoday.com/gcdn/-mm-/b2b05a4ab25f4fca0316459e1c7404c537a89702/c=0-0-1365-768/local/-/media/2019/05/25/USATODAY/usatsports/247WallSt.com-247WS-549930-imageforentry1-pc0.jpg?width=1365&height=768&fit=crop&format=pjpg&auto=webp",
    hint: "bali resort"
  },
  {
    title: "The Seafood Frontier: an RV Road Trip Along the Untamed Eyre Peninsula",
    image: "https://www.holidify.com/images/bgImages/GREECE.jpg", // Duplicate image, consider changing
    hint: "greece landscape"
  },
];

const bottomArticles = [
  {
    title: "7 Things You Didn’t Know You Could Do in Hong Kong",
    image: "https://www.holidify.com/images/bgImages/MALDIVES.jpg",
    hint: "maldives beach"
  },
  {
    title: "You’ve Never Seen Europe Like This: Introducing Luxury Escapes’ Private Charter Tour",
    image: "https://www.holidify.com/images/bgImages/INDONESIA.jpg",
    hint: "indonesia landscape"
  },
  {
    title: "Ooh La Luxe: The Best Hotels in Paris",
    image: "https://www.holidify.com/images/bgImages/VIETNAM.jpg",
    hint: "vietnam scenery"
  },
    {
    title: "Ooh La Luxe: The Best Hotels in Paris", // Duplicate article, consider changing
    image: "https://www.holidify.com/images/bgImages/VIETNAM.jpg", // Duplicate image
    hint: "vietnam scenery"
  },
];

export default function InspirationPage() {
  return (
    <>
      {/* Header component removed from here */}

      <div className='bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63]' >
        <div className=" text-white font-sans p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl font-headline font-semibold mb-10 text-center md:text-left">Latest Articles</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Article */}
            <div className="lg:col-span-2">
              <img
                src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/bb/1d/60/mint-leaf.jpg?w=600&h=-1&s=1"
                alt="Main Article"
                className="w-full h-auto object-cover rounded-lg shadow-md mb-4 max-h-[400px]"
                data-ai-hint="kuala lumpur restaurant"
              />
              <div className="mb-2 space-x-2 text-sm">
                <span className="bg-card text-card-foreground px-2 py-1 rounded">Explore</span>
                <span className="bg-card text-card-foreground px-2 py-1 rounded">Malaysia</span>
              </div>
              <h2 className="text-2xl font-headline font-bold mb-2">The Best Kuala Lumpur Restaurants</h2>
              <a href="#" className="text-primary hover:underline">Read more</a>
            </div>

            {/* Sidebar Articles */}
            <div className="space-y-10">
              {articles.map((article, index) => (
                <div className="flex gap-4 items-start" key={index}>
                  <img
                    src={article.image}
                    alt={article.title}
                    className="rounded-md w-28 h-28 sm:w-36 sm:h-36 object-cover flex-shrink-0"
                    data-ai-hint={article.hint}
                  />
                  <div className="flex flex-col justify-between h-full">
                    <h3 className="font-semibold text-base mb-1 leading-tight">{article.title}</h3>
                    <a href="#" className="text-primary hover:underline text-sm mt-auto">Read more</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <h2 className="text-2xl font-headline font-semibold mt-16 mb-8 text-center md:text-left">More to Explore</h2>
          <div className="grid md:grid-cols-2 gap-10">
            {bottomArticles.map((article, index) => (
              <div className="flex gap-4 items-start" key={index}>
                <img
                  src={article.image}
                  alt={article.title}
                  className="rounded-md w-28 h-28 sm:w-36 sm:h-36 object-cover flex-shrink-0"
                  data-ai-hint={article.hint}
                />
                <div className="flex flex-col justify-between h-full">
                  <h3 className="font-semibold text-base mb-1 leading-tight">{article.title}</h3>
                  <a href="#" className="text-primary hover:underline text-sm mt-auto">Read more</a>
                </div>
              </div>
            ))}
          </div>
        </div>
        <PopularArticles />
        <ExclusiveOffer /> 
      </div>
      {/* Footer component removed from here */}
    </>
  );
}
