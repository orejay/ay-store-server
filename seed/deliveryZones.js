import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryZone from "../models/DeliveryZone.js";

dotenv.config();

const zones = [
  {
    name: "Mainland",
    price: 3500,
    extraChargeAboveKg: 5,
    extraChargeNote: "Items above 5KG attract extra charges",
    areas: [
      "Ilupeju", "Onipanu", "Bariga", "Shomolu", "Anthony", "Gbagada",
      "Phase 1&2", "Oshodi", "Ajao Estate", "Ilasamaja", "Isolo", "Ogba",
      "Oyingbo", "Surulere", "Yaba", "Jibowu", "Ojuelegba",
      "Omole Phase 1&2", "Magodo Phase 1&2", "Ogudu", "Ojota", "Ketu",
      "Anthony", "Alapere", "Fadeyi", "Berger", "Maryland", "Amuwo Odofin",
      "Festac", "Ago",
    ],
  },
  {
    name: "Mainland Extreme",
    price: 4000,
    extraChargeAboveKg: 5,
    extraChargeNote: "Items above 5KG attract extra charges",
    areas: [
      "Abule Egba", "Iju Ishaga", "Ayobo", "Igando", "Fagba", "Command",
      "Obawole", "Meiran", "Ijegun", "Isheri Osun", "Isherin Olowora",
      "New Oko Oba", "Alagbado", "Ahmadiya", "Alakuko", "Lasu",
      "Ifako Ijaiye", "Alagbole", "Mile 12",
    ],
  },
  {
    name: "Island",
    price: 3500,
    extraChargeAboveKg: 5,
    extraChargeNote: "Items above 5KG attract extra charges",
    areas: [
      "Lagos Island", "Obalende", "VI", "Ikoyi", "Oniru", "Lekki",
      "Elegushi", "Igbo Efon", "Agungi", "Osapa London", "Jakande",
      "Badore", "Langbasa", "Lagos Business School", "VGC", "Ikota",
      "Ajah", "Chevron", "Eleganza",
    ],
  },
  {
    name: "Island Extreme",
    price: 4000,
    extraChargeAboveKg: 5,
    extraChargeNote: "Items above 5KG attract extra charges",
    areas: [
      "Awoyaya", "Epe", "Sangotedo (After Shoprite)", "Abijo",
      "Ibeju Lekki", "Trade Fair", "Abule Ado", "Igbo Elerin", "Ojo",
      "Navy Town", "Ikorodu",
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await DeliveryZone.deleteMany({});
    await DeliveryZone.insertMany(zones);
    console.log("Delivery zones seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
