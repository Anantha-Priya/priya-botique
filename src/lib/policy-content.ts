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

export const returnsPolicy = {
  title: "Returns \u0026 exchanges",
  description:
    "We want you to love everything you receive from PRIYA. If something is not right, we are here to help.",
  sections: [
    {
      heading: "Return window",
      paragraphs: [
        "You may request a return or exchange within 7 days of receiving your order.",
        "Requests submitted after 7 days from the delivery date will not be accepted.",
      ],
    },
    {
      heading: "Eligibility conditions",
      paragraphs: [
        "Items must be unworn and in their original condition with all original tags attached.",
        "Original packaging is not required.",
        "The following items are not eligible for return or exchange: items purchased on sale or at a discounted price, and items that have been worn, washed, or returned without their original tags.",
      ],
    },
    {
      heading: "How to request a return or exchange",
      paragraphs: [
        "To initiate a return or exchange, please use the contact form on our website and include your order number, the item or items you wish to return, and the reason for your request.",
        "Our team will review your request and respond within 2 business days with next steps.",
      ],
    },
    {
      heading: "Return shipping",
      paragraphs: [
        "If your item arrived damaged, defective, or is incorrect, we will cover the cost of return shipping.",
        "For all other returns or exchanges, return shipping costs are the responsibility of the customer.",
      ],
    },
    {
      heading: "Refunds",
      paragraphs: [
        "Once your returned item is received and inspected, we will process your refund to the original payment method used at checkout (UPI, card, or netbanking).",
        "Please allow 5–7 business days for the refund to appear in your account after we confirm receipt.",
      ],
    },
  ],
} as const;
