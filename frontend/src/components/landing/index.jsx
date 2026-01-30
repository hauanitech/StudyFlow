export function Hero({ title, highlight, description, children }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-galaxy-900 via-primary-700/20 to-galaxy-900"></div>
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            {title} <span className="text-gradient">{highlight}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid({ title, highlight, children }) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          {title} <span className="text-gradient">{highlight}</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {children}
        </div>
      </div>
    </section>
  );
}

export function FeatureCard({ icon, title, description }) {
  return (
    <div className="card hover:border-primary-600/50 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

export function CTASection({ title, description, children }) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-xl text-gray-400 mb-8">{description}</p>
        {children}
      </div>
    </section>
  );
}

export function Testimonial({ quote, author, role }) {
  return (
    <div className="card">
      <p className="text-gray-300 italic mb-4">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="font-medium text-white">{author}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  );
}

export function Stats({ items }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {items.map((item, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl font-bold text-primary-400 mb-2">{item.value}</div>
          <div className="text-gray-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
