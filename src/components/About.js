export function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-5xl mb-4">🍜</p>
        <h1 className="text-3xl font-black text-gray-900">
          About <span className="text-orange-500">FoodRush</span>
        </h1>
        <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-md mx-auto">
          A personal food discovery tool built on top of real Swiggy data.
          Browse restaurants, explore menus, and find what you're craving — faster than the app.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { icon: "⚡", title: "Real Data", desc: "Live restaurants from Swiggy's API. No fake menus or placeholder content." },
          { icon: "🎯", title: "Built for You", desc: "No ads, no upsells, no dark patterns. Just restaurants and menus." },
          { icon: "🛠️", title: "Side Project", desc: "Built with React 19, Tailwind CSS, and an Express proxy. Open and hackable." },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-2xl shrink-0">{icon}</span>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-300 mt-12">
        Built by Lavish Tyagi · Not affiliated with Swiggy
      </p>
    </div>
  );
}
