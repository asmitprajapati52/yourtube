import React from "react";

interface CategoryChipsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function CategoryChips({ activeCategory, setActiveCategory }: CategoryChipsProps) {
  const chips = ["All", "Trending", "Music", "Gaming", "Movies", "Live", "Tech", "News"];

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide select-none border-b border-gray-100">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => setActiveCategory(chip)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeCategory === chip
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}