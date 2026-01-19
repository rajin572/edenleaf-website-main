"use client";

import Image from "next/image";
import LocaleLink from "@/components/i18n/LocaleLink";
import { useDictionary } from "@/components/i18n/DictionaryProvider";
import { comboHref } from "@/service/CatalogService/catalog.constants";
import { formatPriceFromPoisha } from "@/utils/money";
import type { ICombo } from "@/types";

interface ComboCardProps {
  combo: ICombo;
}

/**
 * No quantity stepper or "Add to Cart" here on purpose — the backend has no
 * combo-aware cart/order line (only {variantId, quantity}), so a combo can't
 * actually be checked out at its bundled price yet. Browse/discovery only;
 * each component is bought individually from its own real product page.
 */
const ComboCard = ({ combo }: ComboCardProps) => {
  const { dict: t, locale } = useDictionary();
  const href = comboHref(combo.slug);
  const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden group hover:shadow-md transition-shadow relative flex flex-col h-full">
      {!combo.available && (
        <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm z-10 bg-destructive">
          {t.combo.unavailable}
        </span>
      )}

      <LocaleLink href={href} className="block relative aspect-square overflow-hidden bg-background">
        <Image
          src={combo.image}
          alt={combo.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${!combo.available ? "opacity-50 grayscale" : ""}`}
        />
      </LocaleLink>

      <div className="p-3 flex flex-col grow">
        <LocaleLink href={href} className="text-sm md:text-base font-medium text-foreground line-clamp-2 hover:text-primary transition-colors mb-1">
          {combo.name}
        </LocaleLink>

        <p className="text-[11px] text-text-secondary mb-2 line-clamp-1">
          {combo.components.map((c) => c.product.name).join(" + ")}
        </p>

        <div className="flex items-center gap-2 mb-3 mt-auto">
          <span className="text-base md:text-lg font-bold text-primary">{price(combo.comboPriceInPoisha)}</span>
          <span className="text-xs md:text-sm text-muted-foreground line-through">{price(combo.regularPriceInPoisha)}</span>
        </div>

        <LocaleLink
          href={href}
          className="w-full py-2 rounded-full font-semibold text-sm flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {t.combo.viewBundle}
        </LocaleLink>
      </div>
    </div>
  );
};

export default ComboCard;
