import type { Metadata } from "next";
import Link from "next/link";

import { PiercingPriceListExplorer } from "@/components/piercing/PiercingPriceListExplorer";

export const metadata: Metadata = {
  title: "Piercing price list",
  description:
    "Browse piercing service fees by category—face & body, lip & mouth, and ear—with the same reference images as booking.",
};

export default function PiercingPriceListPage() {
  return (
    <div className="booking-page-container">
      <div className="booking-container">
        <h1 className="booking-page__title">Piercing price list</h1>
        <div className="booking-wizard__panel">
          <p className="booking-wizard__sub booking-wizard__sub--center">
            Pick a category to see the reference sheet and every placement we list with
            its studio service fee. Jewelry is chosen separately in booking.
          </p>
          <PiercingPriceListExplorer />
          <div className="piercing-price-list-page__cta">
            <Link
              href="/book/piercing"
              className="booking-wizard__btn booking-wizard__btn--primary"
            >
              Book piercing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
