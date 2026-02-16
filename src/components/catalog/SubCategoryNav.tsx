import { CategoryPill } from "@/components/ui/CustomUi/CategoryPill";
import { categoryHref } from "@/service/CatalogService/catalog.constants";
import type { ICategory } from "@/types";

interface SubCategoryNavProps {
  category: ICategory;
  /** Undefined on the parent category page, where the "All" pill is active. */
  activeSubCategorySlug?: string;
  /** `t.catalog.allProducts`. */
  allLabel: string;
}

/**
 * The sibling strip shown on `/category/:categorySlug` and each of its
 * sub-category pages. Navigation, not filtering — every pill is a route.
 */
const SubCategoryNav = ({
  category,
  activeSubCategorySlug,
  allLabel,
}: SubCategoryNavProps) => {
  if (!category.hasSub || category.subCategories.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
      <CategoryPill
        label={allLabel}
        href={categoryHref(category.slug)}
        isActive={!activeSubCategorySlug}
        className="shrink-0"
      />
      {category.subCategories.map((sub) => (
        <CategoryPill
          key={sub._id}
          label={sub.name}
          href={categoryHref(category.slug, sub.slug)}
          isActive={sub.slug === activeSubCategorySlug}
          className="shrink-0"
        />
      ))}
    </div>
  );
};

export default SubCategoryNav;
