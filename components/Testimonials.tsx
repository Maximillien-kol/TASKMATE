
import React from 'react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "This app actually helped me clear my inbox for the first time in years. The interface is so clean I actually want to use it.",
    author: "Jane Cooper",
    role: "Product Designer",
    avatar: "https://picsum.photos/seed/jane/128/128"
  },
  {
    quote: "Simple, fast, and exactly what our team needed. We tried complex project management tools, but TaskMaster is the one that stuck.",
    author: "Mark S.",
    role: "CTO at TechFlow",
    avatar: "https://picsum.photos/seed/mark/128/128"
  },
  {
    quote: "The mobile sync is flawless. I can capture tasks on the go and they are waiting for me when I get to my desk. A lifesaver.",
    author: "Sarah L.",
    role: "Freelance Writer",
    avatar: "https://picsum.photos/seed/sarah/128/128"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Loved by productive teams
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="flex flex-col justify-between rounded-3xl bg-white p-8 border border-slate-100">
              <blockquote className="mb-8 text-lg text-slate-700 font-medium leading-relaxed italic">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.author} className="h-12 w-12 rounded-full border border-slate-100 object-cover" />
                <div>
                  <div className="font-bold text-slate-900 text-lg leading-none">{t.author}</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
