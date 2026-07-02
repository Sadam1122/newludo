import { PrismaClient, EventTemplate } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const events = [
    {
      title: "Reguler Match",
      eventType: "REGULER_MATCH" as EventTemplate,
      eventDateLabel: "TBA",
      eventTimeLabel: "START 10 PM",
      description: "Standard regular match event with normal layout.",
      headlineLine1: "BIG SCREEN.",
      headlineHighlight1: "LOUD CROWD.",
      ctaLabel: "BOOK NOW",
      isActive: true,
      sortOrder: 0,
    },
    {
      title: "Nobar With Community",
      eventType: "NOBAR_COMMUNITY" as EventTemplate,
      eventDateLabel: "TBA",
      eventTimeLabel: "START 10 PM",
      description: "Nobar special event with community. Book per seat.",
      headlineLine1: "NOBAR",
      headlineHighlight1: "COMMUNITY.",
      ctaLabel: "BOOK SEAT",
      isActive: true,
      sortOrder: 1,
    },
    {
      title: "Big Match",
      eventType: "BIG_MATCH" as EventTemplate,
      eventDateLabel: "TBA",
      eventTimeLabel: "START 10 PM",
      description: "Big Match event with special pricing.",
      headlineLine1: "SUPER",
      headlineHighlight1: "BIG MATCH.",
      ctaLabel: "BOOK NOW",
      isActive: true,
      sortOrder: 2,
    },
    {
      title: "Super Big Match",
      eventType: "SUPER_BIG_MATCH" as EventTemplate,
      eventDateLabel: "TBA",
      eventTimeLabel: "START 10 PM",
      description: "Super Big Match event with premium tables.",
      headlineLine1: "EL CLASICO",
      headlineHighlight1: "NIGHT.",
      ctaLabel: "BOOK NOW",
      isActive: true,
      sortOrder: 3,
    },
    {
      title: "Iftar 2027",
      eventType: "IFTAR_2027" as EventTemplate,
      eventDateLabel: "RAMADHAN 2027",
      eventTimeLabel: "17:00 PM",
      description: "Special Iftar package.",
      headlineLine1: "IFTAR",
      headlineHighlight1: "SPECIAL.",
      ctaLabel: "BOOK IFTAR",
      isActive: true,
      sortOrder: 4,
    },
    {
      title: "Delivery Order",
      eventType: "DELIVERY_ORDER" as EventTemplate,
      eventDateLabel: "AVAILABLE DAILY",
      eventTimeLabel: "10 AM - 10 PM",
      description: "Order food and beverages directly.",
      headlineLine1: "LUDO",
      headlineHighlight1: "DELIVERY.",
      ctaLabel: "ORDER NOW",
      isActive: true,
      sortOrder: 5,
    },
  ];

  for (const e of events) {
    const existing = await prisma.bookingEvent.findFirst({
      where: { eventType: e.eventType },
    });

    if (!existing) {
      await prisma.bookingEvent.create({ data: e });
      console.log(`Created event: ${e.title}`);
    } else {
      console.log(`Event already exists: ${e.title}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
