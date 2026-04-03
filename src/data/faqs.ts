export type FAQ = { id: string; question: string; answer: string };

export const mockBookingFaqsPiercing: FAQ[] = [
  {
    id: "piercing-age-id",
    question: "Do I need ID for a piercing appointment?",
    answer:
      "Yes. Please bring government-issued photo ID. For minors, we follow studio policy and provincial requirements—contact us before booking if you are under 18.",
  },
  {
    id: "piercing-healing",
    question: "How long does healing take?",
    answer:
      "It depends on the placement. Many piercings need several weeks to months for initial healing. We will give you written aftercare and check-in guidance at your appointment.",
  },
  {
    id: "piercing-jewelry",
    question: "Can I bring my own jewelry?",
    answer:
      "Initial piercings use implant-grade jewelry we approve in-studio. Outside jewelry may not be suitable for fresh work; we are happy to discuss options when you arrive.",
  },
];

export const mockBookingFaqsTattoo: FAQ[] = [
  {
    id: "tattoo-consult",
    question: "Should I book a consult first?",
    answer:
      "For larger or custom work, a consultation helps align design, placement, and timing. Smaller pieces can often be booked directly—use the booking flow or email us a reference.",
  },
  {
    id: "tattoo-day-of",
    question: "What should I do the day of my tattoo?",
    answer:
      "Eat a solid meal, stay hydrated, avoid alcohol, and wear comfortable clothing that exposes the area. Arrive on time with clean skin—no numbing creams unless we have agreed otherwise.",
  },
  {
    id: "tattoo-aftercare",
    question: "How do I care for a new tattoo?",
    answer:
      "We provide aftercare instructions after your session. Keep it clean, avoid soaking and sun, and do not pick or scratch while it heals.",
  },
];
