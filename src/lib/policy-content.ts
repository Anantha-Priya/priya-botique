export const shippingPolicy = {
  title: "Shipping & delivery",
  description:
    "Free shipping across India, subject to courier serviceability.",
  sections: [
    {
      heading: "Processing and dispatch",
      paragraphs: [
        "Orders placed before 12:00 PM are processed the same business day.",
        "Orders are dispatched within 1–2 business days after order confirmation. Saturday dispatch is available; orders are not dispatched on Sundays or public holidays.",
      ],
    },
    {
      heading: "Delivery estimates",
      paragraphs: [
        "Estimated delivery is within 3–7 business days.",
        "Delivery timelines may vary depending on the destination PIN code and courier availability.",
      ],
    },
    {
      heading: "Shipping charges",
      paragraphs: [
        "Shipping is free across India, subject to courier serviceability.",
      ],
    },
  ],
} as const;

export const productShippingSummary =
  "Free shipping across India, subject to courier serviceability. Estimated delivery within 3–7 business days; timing may vary by destination PIN code and courier availability.";
