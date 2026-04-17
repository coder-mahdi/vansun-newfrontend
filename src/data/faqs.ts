export type FAQ = { id: string; question: string; answer: string };

export const mockBookingFaqsPiercing: FAQ[] = [
  {
    id: "before-piercing",
    question: "What should I do before getting a piercing?",
    answer:
      "Make sure you're well-rested and hydrated. Avoid alcohol or blood thinners like aspirin 24 hours before your appointment.",
  },
  {
    id: "healing-time",
    question: "How long will it take for my piercing to heal?",
    answer:
      "Healing times vary depending on the type of piercing. Most piercings take between 6-12 weeks, but cartilage piercings can take up to a year.",
  },
  {
    id: "change-jewelry-after",
    question: "Can I change my jewelry right after getting pierced?",
    answer:
      "It's important to leave the original jewelry in place until it's fully healed. Changing jewelry too soon can lead to irritation or infection.",
  },
  {
    id: "infected-piercing",
    question: "What should I do if my piercing gets infected?",
    answer:
      "If you suspect an infection, clean the piercing with saline solution and consult a professional piercer or healthcare provider. Don't remove the jewelry until you're advised to.",
  },
  {
    id: "piercing-pain",
    question: "Does getting a piercing hurt?",
    answer:
      "Pain levels vary depending on the area of the body being pierced and individual pain tolerance. Some people find ear piercings to be relatively painless, while cartilage piercings may feel more intense. The pain is usually brief and fades quickly.",
  },
];

export const mockBookingFaqsTattoo: FAQ[] = [
  {
    id: "tattoo-consult",
    question: "Should I book a consult first?",
    answer:
      "For larger or custom work, a consultation helps align design, placement, and timing. Smaller pieces can often be booked directly; use the booking flow or email us a reference.",
  },
  {
    id: "tattoo-day-of",
    question: "What should I do the day of my tattoo?",
    answer:
      "Eat a solid meal, stay hydrated, avoid alcohol, and wear comfortable clothing that exposes the area. Arrive on time with clean skin; no numbing creams unless we have agreed otherwise.",
  },
  {
    id: "tattoo-aftercare",
    question: "How do I care for a new tattoo?",
    answer:
      "We provide aftercare instructions after your session. Keep it clean, avoid soaking and sun, and do not pick or scratch while it heals.",
  },
];
